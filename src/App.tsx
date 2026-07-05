import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { CirclePlay } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import './App.css'
import type {
  BodyStatEntryInput,
} from './entities/body-stats'
import type { ProgramCompletionLog } from './entities/program-completion'
import type { ProgramDayLog } from './entities/program-day-stats'
import {
  createExerciseStatsStoreKey,
  type ExerciseStatsRecord,
  type ExerciseStatsStore,
} from './entities/exercise-stats'
import { normalizeExerciseMuscleGroup } from './entities/exercise-muscles'
import {
  markProgramSectionCompleted,
  markProgramSectionStarted,
  resetProgramRun,
  selectProgramSection,
  type ProgramProgressRecord,
} from './entities/program-progression'
import Banner from './components/Banner'
import BottomNav from './components/BottomNav'
import ExerciseDetailSheet from './components/ExerciseDetailSheet'
import FinishWorkoutDialog from './components/FinishWorkoutDialog'
import ProgramDetailSheet from './components/ProgramDetailSheet'
import ReleaseNotesDialog from './components/ReleaseNotesDialog'
import StartWorkoutDialog from './components/StartWorkoutDialog'
import BodyCompositionPanel from './components/BodyCompositionPanel'
import ProgramProgressionPanel from './components/ProgramProgressionPanel'
import type {
  WorkoutExerciseDetailsOptions,
  WorkoutExerciseDetailSubstitutionTarget,
} from './components/WorkoutExerciseTable'
import { useAppRoute } from './hooks/useAppRoute'
import { getContentLibrary, type Exercise } from './lib/content'
import type {
  AppProgram,
  BannerTone,
  ExerciseFilter,
  InsightsView,
  LibraryView,
  ProgramFilter,
  WorkoutDayOption,
  WorkoutWeekGroup,
} from './lib/app-types'
import { countExercises, findOptionLabel } from './lib/app-utils'
import {
  fitnessActivityLevelOptions,
  fitnessEffortScaleOptions,
  fitnessExperienceOptions,
  fitnessGoalOptions,
  type FitnessProfile,
} from './lib/fitness-profile'
import {
  loadUnseenReleaseNotes,
  markReleaseNotesShown,
  type ReleaseNoteBundle,
} from './lib/release-notes'
import {
  slugify,
} from './lib/muscles'
import {
  buildProgramDayLog,
  getSessionDateKey,
  replaceWorkoutStatistics,
} from './lib/workout-statistics'
import {
  buildWorkoutExerciseOrder,
  createId,
  createExtraExerciseWorkoutLog,
  createEmptyDraft,
  createEmptyExercise,
  createEmptySection,
  ensureWorkoutSetLogs,
  createPlannedWorkoutLogs,
  customProgramToDraft,
  customProgramToProgram,
  createWorkoutExerciseLogEntry,
  createWorkoutSetLogEntry,
  draftToCustomProgram,
  programToDraft,
  type ActiveWorkout,
  type CustomProgram,
  type ProgramDraft,
  type WorkoutLog,
  type WorkoutSetLogEntry,
} from './lib/user-data'
import {
  getProgramStatsRecord,
  markProgramCompleted,
  markProgramDiscarded,
  markProgramSelected,
  markProgramStarted,
} from './services/program-stats'
import LibraryPage from './pages/LibraryPage'
import ProfilePage from './pages/ProfilePage'
import InsightsPage from './pages/InsightsPage'
import ProgressionPage from './pages/ProgressionPage'
import WorkoutPage from './pages/WorkoutPage'
import {
  getInsightsPath,
  getLibraryPath,
  getPrimaryRoutePath,
} from './routes'
import { pwaUpdateReadyEventName } from './pwa'
import { useAppStore } from './stores/useAppStore'

type ExerciseAlternativePreview = {
  canOpen: boolean
  description: string
  difficulty: string
  id: string
  matchKind: 'primary' | 'secondary'
  muscleGroups: string[]
  name: string
}

const contentLibrary = getContentLibrary()

function createAppPrograms(customPrograms: CustomProgram[]) {
  const libraryPrograms = contentLibrary.programs.map<AppProgram>((program) => ({
    ...program,
    programSource: 'library',
  }))

  const localPrograms = customPrograms.map<AppProgram>((program) => ({
    ...customProgramToProgram(program),
    programSource: 'custom',
  }))

  return [...localPrograms, ...libraryPrograms]
}

function createDefaultMainProgram(): AppProgram {
  return {
    id: 'default-main-program',
    name: 'No program selected',
    description: 'Choose a main program to start planning workouts and track progression here.',
    descriptionHtml: '',
    goal: '',
    level: '',
    duration: '',
    weekCount: 0,
    phaseNames: [],
    tags: [],
    sections: [],
    source: {
      id: 'default-main-program',
      label: 'Default Program',
      group: 'local',
      relativePath: 'default-main-program',
      sourceFile: 'generated',
    },
    details: [],
    programSource: 'custom',
  }
}

function getExercisePrimaryTargetGroups(exercise: Exercise) {
  const primaryGroups = exercise.primaryTargetMuscleGroups.flatMap((target) => {
    const muscleGroup = normalizeExerciseMuscleGroup(target.muscleGroup)
    return muscleGroup ? [muscleGroup] : []
  })

  if (primaryGroups.length) {
    return primaryGroups
  }

  return exercise.muscleGroups.flatMap((muscleGroup) => {
    const normalizedMuscleGroup = normalizeExerciseMuscleGroup(muscleGroup)
    return normalizedMuscleGroup ? [normalizedMuscleGroup] : []
  })
}

function getExerciseSecondaryTargetGroups(exercise: Exercise) {
  return exercise.secondaryTargetMuscleGroups.flatMap((target) => {
    const muscleGroup = normalizeExerciseMuscleGroup(target.muscleGroup)
    return muscleGroup ? [muscleGroup] : []
  })
}

function countTargetOverlap(targetGroups: string[], selectedTargetGroups: Set<string>) {
  return targetGroups.reduce((count, muscleGroup) => {
    return selectedTargetGroups.has(muscleGroup) ? count + 1 : count
  }, 0)
}

function buildExerciseTargetAlternatives(
  selectedExercise: Exercise | null,
  exercises: Exercise[],
) {
  if (!selectedExercise) {
    return [] as ExerciseAlternativePreview[]
  }

  const selectedTargetGroups = new Set(getExercisePrimaryTargetGroups(selectedExercise))

  if (!selectedTargetGroups.size) {
    return []
  }

  return exercises
    .flatMap<ExerciseAlternativePreview & { matchScore: number }>((exercise) => {
      if (exercise.id === selectedExercise.id) {
        return []
      }

      const primaryGroups = getExercisePrimaryTargetGroups(exercise)
      const secondaryGroups = getExerciseSecondaryTargetGroups(exercise)
      const primaryMatchScore = countTargetOverlap(primaryGroups, selectedTargetGroups)
      const secondaryMatchScore = countTargetOverlap(secondaryGroups, selectedTargetGroups)
      const matchKind =
        primaryMatchScore > 0 ? 'primary' : secondaryMatchScore > 0 ? 'secondary' : null

      if (!matchKind) {
        return []
      }

      return [
        {
          canOpen: true,
          description:
            exercise.description ||
            [exercise.category, exercise.equipment.slice(0, 2).join(', ')]
              .filter(Boolean)
              .join(' / '),
          difficulty: exercise.difficulty,
          id: exercise.id,
          matchKind,
          matchScore: matchKind === 'primary' ? primaryMatchScore : secondaryMatchScore,
          muscleGroups: matchKind === 'primary' ? primaryGroups : secondaryGroups,
          name: exercise.name,
        },
      ]
    })
    .sort((left, right) => {
      if (left.matchKind !== right.matchKind) {
        return left.matchKind === 'primary' ? -1 : 1
      }

      if (left.matchScore !== right.matchScore) {
        return right.matchScore - left.matchScore
      }

      return left.name.localeCompare(right.name)
    })
}

function sortDraftSections(sections: ProgramDraft['sections']) {
  return [...sections].sort((left, right) => {
    if (left.weekIndex !== right.weekIndex) {
      return left.weekIndex - right.weekIndex
    }

    if (left.dayIndex !== right.dayIndex) {
      return left.dayIndex - right.dayIndex
    }

    return left.name.localeCompare(right.name)
  })
}

function autoLabelDraftSections(sections: ProgramDraft['sections']) {
  const sortedSections = sortDraftSections(sections)
  const weekIndexes = [
    ...new Set(sortedSections.map((section) => section.weekIndex || 1)),
  ].sort((left, right) => left - right)

  return weekIndexes.flatMap((weekIndex, weekPosition) => {
    const nextWeekIndex = weekPosition + 1
    const weekSections = sortedSections.filter(
      (section) => (section.weekIndex || 1) === weekIndex,
    )

    return weekSections.map((section, dayPosition) => {
      const nextDayIndex = dayPosition + 1
      const nextDayLabel = `Day ${nextDayIndex}`

      return {
        ...section,
        dayIndex: nextDayIndex,
        dayLabel: nextDayLabel,
        name: nextDayLabel,
        weekIndex: nextWeekIndex,
        weekLabel: `Week ${nextWeekIndex}`,
      }
    })
  })
}

function createDraftExerciseFromLibraryExercise(exercise: Exercise) {
  return {
    ...createEmptyExercise(),
    duration: exercise.defaultTargets.duration,
    exerciseName: exercise.name,
    reps: exercise.defaultTargets.reps,
    rest: exercise.defaultTargets.rest,
    sets: exercise.defaultTargets.sets,
  }
}

function findProgramSection(programs: AppProgram[], activeWorkout: ActiveWorkout | null) {
  if (!activeWorkout) {
    return null
  }

  const program = programs.find((entry) => entry.id === activeWorkout.programId)
  const section = program?.sections.find((entry) => entry.id === activeWorkout.sectionId)

  if (!program || !section) {
    return null
  }

  return {
    program,
    section,
  }
}

function getEffortOptions(profile: FitnessProfile) {
  switch (profile.effortScale) {
    case 'rir':
      return ['4', '3', '2', '1', '0']
    case 'effort':
      return ['Easy', 'Medium', 'Hard', 'Failure']
    default:
      return ['6', '7', '8', '9', '10']
  }
}

function buildWorkoutWeeks(program: AppProgram | null) {
  if (!program) {
    return []
  }

  const grouped = new Map<number, WorkoutWeekGroup>()

  for (const section of program.sections) {
    const weekIndex = section.weekIndex || 1
    const existingGroup = grouped.get(weekIndex)
    const option: WorkoutDayOption = {
      dayIndex: section.dayIndex || (existingGroup?.dayOptions.length ?? 0) + 1,
      dayLabel: section.dayLabel || `Day ${section.dayIndex || 1}`,
      label: section.shortName || section.name,
      section,
      weekIndex,
      weekLabel: section.weekLabel || `Week ${weekIndex}`,
    }

    if (existingGroup) {
      existingGroup.dayOptions.push(option)
      continue
    }

    grouped.set(weekIndex, {
      dayOptions: [option],
      label: section.weekLabel || `Week ${weekIndex}`,
      weekIndex,
    })
  }

  return [...grouped.values()].sort((left, right) => left.weekIndex - right.weekIndex)
}

function getNextWorkoutDayOption(
  program: AppProgram | null,
  currentSectionId: string | null,
) {
  if (!program || !currentSectionId) {
    return null
  }

  const orderedDays = buildWorkoutWeeks(program).flatMap((week) => week.dayOptions)
  const currentIndex = orderedDays.findIndex((entry) => entry.section.id === currentSectionId)

  if (currentIndex === -1) {
    return null
  }

  return orderedDays[currentIndex + 1] ?? null
}

function isProgramProgressComplete(
  program: AppProgram | null,
  progressRecord: ProgramProgressRecord | null,
  programCompletionLogs: ProgramCompletionLog[],
) {
  if (!program || !progressRecord?.lastCompletedSectionId) {
    return false
  }

  const orderedDays = buildWorkoutWeeks(program).flatMap((week) => week.dayOptions)
  const lastWorkoutDay = orderedDays[orderedDays.length - 1] ?? null

  return (
    lastWorkoutDay?.section.id === progressRecord.lastCompletedSectionId &&
    programCompletionLogs.some(
      (entry) =>
        entry.programId === program.id &&
        (!progressRecord.currentRunStartedAt ||
          entry.completedAt.localeCompare(progressRecord.currentRunStartedAt) >= 0),
    )
  )
}

function resolvePersistedWorkoutSectionId(
  program: AppProgram | null,
  progressRecord: ProgramProgressRecord | null,
  programDayLogs: { completedAt: string; programId: string; sectionId: string }[],
) {
  if (!program) {
    return null
  }

  const orderedDays = buildWorkoutWeeks(program).flatMap((week) => week.dayOptions)
  const validSectionIds = new Set(orderedDays.map((entry) => entry.section.id))

  if (progressRecord?.selectedSectionId && validSectionIds.has(progressRecord.selectedSectionId)) {
    return progressRecord.selectedSectionId
  }

  const currentRunProgramDayLogs = programDayLogs.filter((entry) => {
    return (
      entry.programId === program.id &&
      (!progressRecord?.currentRunStartedAt ||
        entry.completedAt.localeCompare(progressRecord.currentRunStartedAt) >= 0)
    )
  })
  const latestLoggedSectionId =
    [...currentRunProgramDayLogs]
      .sort((left, right) => right.completedAt.localeCompare(left.completedAt))[0]?.sectionId ??
    null

  const lastCompletedSectionId =
    progressRecord?.lastCompletedSectionId ?? latestLoggedSectionId ?? null

  if (!lastCompletedSectionId) {
    return null
  }

  const nextWorkoutDay = getNextWorkoutDayOption(program, lastCompletedSectionId)
  return nextWorkoutDay?.section.id ?? lastCompletedSectionId
}

function buildProgramCompletionLog(
  program: AppProgram,
  programDayLogs: ProgramDayLog[],
  completedAt: string,
  previousCompletionAt: string | null,
): ProgramCompletionLog | null {
  const sectionIds = program.sections.map((section) => section.id)
  const sectionIdSet = new Set(sectionIds)

  if (!sectionIds.length) {
    return null
  }

  const latestLogBySectionId = programDayLogs
    .filter((dayLog) => {
      return (
        dayLog.programId === program.id &&
        sectionIdSet.has(dayLog.sectionId) &&
        dayLog.completedAt.localeCompare(completedAt) <= 0 &&
        (!previousCompletionAt || dayLog.completedAt.localeCompare(previousCompletionAt) > 0)
      )
    })
    .sort((left, right) => right.completedAt.localeCompare(left.completedAt))
    .reduce<Record<string, ProgramDayLog>>((logs, dayLog) => {
      if (!logs[dayLog.sectionId]) {
        logs[dayLog.sectionId] = dayLog
      }

      return logs
    }, {})

  if (sectionIds.some((sectionId) => !latestLogBySectionId[sectionId])) {
    return null
  }

  const dayLogs = sectionIds.map((sectionId) => latestLogBySectionId[sectionId])
  const startedAt = dayLogs.reduce((earliestStartedAt, dayLog) => {
    return dayLog.startedAt.localeCompare(earliestStartedAt) < 0
      ? dayLog.startedAt
      : earliestStartedAt
  }, dayLogs[0]?.startedAt ?? completedAt)

  return {
    completedAt,
    completedDayCount: dayLogs.length,
    completedExerciseCount: dayLogs.reduce(
      (total, dayLog) => total + dayLog.completedExerciseCount,
      0,
    ),
    dayLogs,
    durationMinutes: dayLogs.reduce((total, dayLog) => total + dayLog.durationMinutes, 0),
    exerciseEntryCount: dayLogs.reduce(
      (total, dayLog) => total + dayLog.exerciseEntries.length,
      0,
    ),
    id: createId('program-completion'),
    programId: program.id,
    programName: program.name,
    programSource: program.programSource,
    sessionDate: getSessionDateKey(completedAt),
    startedAt,
    totalDayCount: sectionIds.length,
    totalExerciseCount: dayLogs.reduce((total, dayLog) => total + dayLog.totalExerciseCount, 0),
  }
}

function buildProgramArchiveLog(
  program: AppProgram,
  programDayLogs: ProgramDayLog[],
  archivedAt: string,
  currentRunStartedAt: string | null,
): ProgramCompletionLog | null {
  const sectionIdSet = new Set(program.sections.map((section) => section.id))
  const latestLogBySectionId = programDayLogs
    .filter((dayLog) => {
      return (
        dayLog.programId === program.id &&
        sectionIdSet.has(dayLog.sectionId) &&
        (!currentRunStartedAt || dayLog.completedAt.localeCompare(currentRunStartedAt) >= 0)
      )
    })
    .sort((left, right) => right.completedAt.localeCompare(left.completedAt))
    .reduce<Record<string, ProgramDayLog>>((logs, dayLog) => {
      if (!logs[dayLog.sectionId]) {
        logs[dayLog.sectionId] = dayLog
      }

      return logs
    }, {})
  const dayLogs = program.sections
    .map((section) => latestLogBySectionId[section.id])
    .filter((dayLog): dayLog is ProgramDayLog => Boolean(dayLog))

  if (!dayLogs.length) {
    return null
  }

  const startedAt = dayLogs.reduce(
    (earliestStartedAt, dayLog) =>
      dayLog.startedAt.localeCompare(earliestStartedAt) < 0
        ? dayLog.startedAt
        : earliestStartedAt,
    dayLogs[0].startedAt,
  )

  return {
    completedAt: archivedAt,
    completedDayCount: dayLogs.length,
    completedExerciseCount: dayLogs.reduce(
      (total, dayLog) => total + dayLog.completedExerciseCount,
      0,
    ),
    dayLogs,
    durationMinutes: dayLogs.reduce((total, dayLog) => total + dayLog.durationMinutes, 0),
    exerciseEntryCount: dayLogs.reduce(
      (total, dayLog) => total + dayLog.exerciseEntries.length,
      0,
    ),
    id: createId('program-archive'),
    programId: program.id,
    programName: program.name,
    programSource: program.programSource,
    sessionDate: getSessionDateKey(archivedAt),
    startedAt,
    totalDayCount: program.sections.length,
    totalExerciseCount: program.sections.reduce(
      (total, section) => total + section.exercises.length,
      0,
    ),
  }
}

function upsertWorkoutLogById(workoutLogs: WorkoutLog[], workoutLog: WorkoutLog) {
  return [workoutLog, ...workoutLogs.filter((entry) => entry.id !== workoutLog.id)].sort(
    (left, right) => right.completedAt.localeCompare(left.completedAt),
  )
}

function upsertProgramDayLog(programDayLogs: ProgramDayLog[], programDayLog: ProgramDayLog) {
  return [
    programDayLog,
    ...programDayLogs.filter(
      (entry) => entry.sessionId !== programDayLog.sessionId && entry.id !== programDayLog.id,
    ),
  ].sort((left, right) => right.completedAt.localeCompare(left.completedAt))
}

function updateCompletionLogWithDayLog(
  completionLog: ProgramCompletionLog,
  programDayLog: ProgramDayLog,
): ProgramCompletionLog {
  if (!completionLog.dayLogs.some((dayLog) => dayLog.sessionId === programDayLog.sessionId)) {
    return completionLog
  }

  const dayLogs = completionLog.dayLogs.map((dayLog) =>
    dayLog.sessionId === programDayLog.sessionId ? programDayLog : dayLog,
  )
  const startedAt = dayLogs.reduce((earliestStartedAt, dayLog) => {
    return dayLog.startedAt.localeCompare(earliestStartedAt) < 0
      ? dayLog.startedAt
      : earliestStartedAt
  }, dayLogs[0]?.startedAt ?? completionLog.startedAt)

  return {
    ...completionLog,
    completedDayCount: dayLogs.length,
    completedExerciseCount: dayLogs.reduce(
      (total, dayLog) => total + dayLog.completedExerciseCount,
      0,
    ),
    dayLogs,
    durationMinutes: dayLogs.reduce((total, dayLog) => total + dayLog.durationMinutes, 0),
    exerciseEntryCount: dayLogs.reduce(
      (total, dayLog) => total + dayLog.exerciseEntries.length,
      0,
    ),
    startedAt,
    totalExerciseCount: dayLogs.reduce((total, dayLog) => total + dayLog.totalExerciseCount, 0),
  }
}

function upsertProgramCompletionLog(
  completionLogs: ProgramCompletionLog[],
  completionLog: ProgramCompletionLog,
) {
  return [
    completionLog,
    ...completionLogs.filter((entry) => entry.id !== completionLog.id),
  ].sort((left, right) => right.completedAt.localeCompare(left.completedAt))
}

function hasCompletionLogForSameSessions(
  completionLogs: ProgramCompletionLog[],
  completionLog: ProgramCompletionLog,
) {
  const sessionIds = new Set(completionLog.dayLogs.map((dayLog) => dayLog.sessionId))

  return completionLogs.some((entry) => {
    if (entry.programId !== completionLog.programId || entry.dayLogs.length !== sessionIds.size) {
      return false
    }

    return entry.dayLogs.every((dayLog) => sessionIds.has(dayLog.sessionId))
  })
}

function resolveExerciseStatsRecord(
  store: ExerciseStatsStore,
  exerciseId: string | null,
  exerciseName: string,
): ExerciseStatsRecord | null {
  return (
    store.byExerciseKey[createExerciseStatsStoreKey(exerciseId, exerciseName)] ??
    Object.values(store.byExerciseKey).find((record) => {
      return (
        (exerciseId !== null && record.exerciseId === exerciseId) ||
        slugify(record.exerciseName) === slugify(exerciseName)
      )
    }) ??
    null
  )
}

function App() {
  const { activeTab, navigate, route } = useAppRoute()
  const [programFilter, setProgramFilter] = useState<ProgramFilter>('all')
  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>('all')
  const [programQuery, setProgramQuery] = useState('')
  const [exerciseQuery, setExerciseQuery] = useState('')
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const [selectedExerciseSubstitutionTarget, setSelectedExerciseSubstitutionTarget] =
    useState<WorkoutExerciseDetailSubstitutionTarget | null>(null)
  const [selectedWorkoutSectionId, setSelectedWorkoutSectionId] = useState<string | null>(null)
  const [workoutDayExerciseOrders, setWorkoutDayExerciseOrders] = useState<
    Record<string, string[]>
  >({})
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [isFinishWorkoutDialogOpen, setIsFinishWorkoutDialogOpen] = useState(false)
  const [isStartWorkoutDialogOpen, setIsStartWorkoutDialogOpen] = useState(false)
  const [isWorkoutButtonHolding, setIsWorkoutButtonHolding] = useState(false)
  const [releaseNoteBundle, setReleaseNoteBundle] = useState<ReleaseNoteBundle | null>(null)
  const [banner, setBanner] = useState<{ id: string; tone: BannerTone; text: string } | null>(
    null,
  )
  const workoutButtonHoldTimeoutRef = useRef<number | null>(null)
  const shouldIgnoreWorkoutButtonClickRef = useRef(false)
  const {
    activeWorkout,
    bodyCompositionEntries,
    customPrograms,
    exerciseStatsStore,
    fitnessProfile,
    hydrateAppStore,
    isAppReady,
    mainProgramId,
    programCompletionLogs,
    programProgressStore,
    programDayLogs,
    programStatsStore,
    resetPersistedAppState,
    resetProgressionStateInStore,
    savedExerciseIds,
    savedProgramIds,
    setActiveWorkout,
    setBodyCompositionEntries,
    setCustomPrograms,
    setExerciseStatsStore,
    setFitnessProfile,
    setMainProgramId,
    setProgramCompletionLogs,
    setProgramProgressStore,
    setProgramDayLogs,
    setProgramStatsStore,
    setSavedExerciseIds,
    setSavedProgramIds,
    setStatsPreferences,
    setWorkoutLogs,
    statsPreferences,
    workoutLogs,
  } = useAppStore(
    useShallow((state) => ({
      activeWorkout: state.activeWorkout,
      bodyCompositionEntries: state.bodyCompositionEntries,
      customPrograms: state.customPrograms,
      exerciseStatsStore: state.exerciseStatsStore,
      fitnessProfile: state.fitnessProfile,
      hydrateAppStore: state.hydrate,
      isAppReady: state.isHydrated,
      mainProgramId: state.mainProgramId,
      programCompletionLogs: state.programCompletionLogs,
      programProgressStore: state.programProgressStore,
      programDayLogs: state.programDayLogs,
      programStatsStore: state.programStatsStore,
      resetPersistedAppState: state.resetPersistedState,
      resetProgressionStateInStore: state.resetProgressionState,
      savedExerciseIds: state.savedExerciseIds,
      savedProgramIds: state.savedProgramIds,
      setActiveWorkout: state.setActiveWorkout,
      setBodyCompositionEntries: state.setBodyCompositionEntries,
      setCustomPrograms: state.setCustomPrograms,
      setExerciseStatsStore: state.setExerciseStatsStore,
      setFitnessProfile: state.setFitnessProfile,
      setMainProgramId: state.setMainProgramId,
      setProgramCompletionLogs: state.setProgramCompletionLogs,
      setProgramProgressStore: state.setProgramProgressStore,
      setProgramDayLogs: state.setProgramDayLogs,
      setProgramStatsStore: state.setProgramStatsStore,
      setSavedExerciseIds: state.setSavedExerciseIds,
      setSavedProgramIds: state.setSavedProgramIds,
      setStatsPreferences: state.setStatsPreferences,
      setWorkoutLogs: state.setWorkoutLogs,
      statsPreferences: state.statsPreferences,
      workoutLogs: state.workoutLogs,
    })),
  )
  const [draft, setDraft] = useState<ProgramDraft>(() => createEmptyDraft())
  const libraryView = route.libraryView ?? 'home'
  const insightsView = route.insightsView ?? 'home'

  const deferredProgramQuery = useDeferredValue(programQuery.trim().toLowerCase())
  const deferredExerciseQuery = useDeferredValue(exerciseQuery.trim().toLowerCase())

  const programs = createAppPrograms(customPrograms)
  const savedExerciseIdSet = new Set(savedExerciseIds)
  const savedProgramIdSet = new Set(savedProgramIds)
  const selectedProgram =
    programs.find((program) => program.id === selectedProgramId) ?? null
  const selectedExercise =
    contentLibrary.exercises.find((exercise) => exercise.id === selectedExerciseId) ?? null
  const activeProgramSession = findProgramSection(programs, activeWorkout)
  const selectedMainProgram =
    programs.find((program) => program.id === mainProgramId) ?? null
  const isMainProgramEmpty = selectedMainProgram === null
  const mainProgram = selectedMainProgram ?? createDefaultMainProgram()
  const launchProgram = activeProgramSession?.program ?? mainProgram
  const mainProgramStats = getProgramStatsRecord(programStatsStore, mainProgram?.id ?? null)
  const workoutWeeks = buildWorkoutWeeks(launchProgram)
  const fallbackWorkoutDay = workoutWeeks[0]?.dayOptions[0] ?? null
  const launchProgramProgressRecord = launchProgram
    ? (programProgressStore.byProgramId[launchProgram.id] ?? null)
    : null
  const currentProgramRunStartedAt = launchProgramProgressRecord?.currentRunStartedAt ?? null
  const persistedWorkoutSectionId = resolvePersistedWorkoutSectionId(
    launchProgram,
    launchProgramProgressRecord,
    programDayLogs,
  )
  const selectedWorkoutDayFromState =
    workoutWeeks
      .flatMap((week) => week.dayOptions)
      .find(
        (entry) =>
          entry.section.id === (selectedWorkoutSectionId ?? persistedWorkoutSectionId),
      ) ??
    null
  const activeWorkoutDay = activeProgramSession
    ? workoutWeeks
        .flatMap((week) => week.dayOptions)
        .find((entry) => entry.section.id === activeProgramSession.section.id) ??
      null
    : null
  const selectedWorkoutDay =
    activeWorkout && activeWorkoutDay
      ? activeWorkoutDay
      : selectedWorkoutDayFromState ?? activeWorkoutDay ?? fallbackWorkoutDay
  const selectedWorkoutSection = selectedWorkoutDay?.section ?? null
  const selectedWorkoutPreviewOrder = selectedWorkoutSection
    ? buildWorkoutExerciseOrder(
        workoutDayExerciseOrders[selectedWorkoutSection.id] ??
          selectedWorkoutSection.exercises.map((exercise) => exercise.id),
        selectedWorkoutSection.exercises.reduce<Record<string, ReturnType<typeof createWorkoutExerciseLogEntry>>>(
          (logs, exercise) => {
            logs[exercise.id] = createWorkoutExerciseLogEntry(exercise.exerciseName, {
              logId: exercise.id,
              plannedExerciseId: exercise.id,
              type: 'planned',
            })

            return logs
          },
          {},
        ),
        [],
      )
    : []
  const selectedWorkoutWeek =
    workoutWeeks.find((week) => week.weekIndex === selectedWorkoutDay?.weekIndex) ??
    workoutWeeks[0] ??
    null
  const isSelectedWorkoutActive =
    Boolean(activeWorkout) &&
    activeWorkout?.programId === launchProgram?.id &&
    activeWorkout.sectionId === selectedWorkoutSection?.id
  const isEditingCompletedWorkout = Boolean(
    activeWorkout && workoutLogs.some((entry) => entry.id === activeWorkout.sessionId),
  )
  const isLaunchProgramComplete = Boolean(
    !activeWorkout &&
      isProgramProgressComplete(
        launchProgram,
        launchProgramProgressRecord,
        programCompletionLogs,
      ),
  )
  const activeWorkoutExerciseLogs = activeWorkout?.exerciseLogs ?? {}
  const activeWorkoutExtraEntries = activeWorkout?.extraEntries ?? []
  const customAppPrograms = programs.filter((program) => program.programSource === 'custom')
  const selectedExerciseAlternatives = buildExerciseTargetAlternatives(
    selectedExercise,
    contentLibrary.exercises,
  )

  useEffect(() => {
    void hydrateAppStore()
  }, [hydrateAppStore])

  const checkReleaseNotes = useCallback(() => {
    let isCancelled = false

    void loadUnseenReleaseNotes()
      .then((bundle) => {
        if (!isCancelled && bundle) {
          setReleaseNoteBundle(bundle)
        }
      })
      .catch(() => undefined)

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isAppReady) {
      return
    }

    return checkReleaseNotes()
  }, [checkReleaseNotes, isAppReady])

  useEffect(() => {
    if (!isAppReady) {
      return
    }

    window.addEventListener(pwaUpdateReadyEventName, checkReleaseNotes)

    return () => {
      window.removeEventListener(pwaUpdateReadyEventName, checkReleaseNotes)
    }
  }, [checkReleaseNotes, isAppReady])

  useEffect(() => {
    return () => {
      if (workoutButtonHoldTimeoutRef.current !== null) {
        window.clearTimeout(workoutButtonHoldTimeoutRef.current)
      }
    }
  }, [])

  const filteredPrograms = programs.filter((program) => {
    if (programFilter === 'favorites' && !savedProgramIdSet.has(program.id)) {
      return false
    }

    if (
      programFilter !== 'all' &&
      programFilter !== 'favorites' &&
      program.programSource !== programFilter
    ) {
      return false
    }

    if (!deferredProgramQuery) {
      return true
    }

    const searchableText = [
      program.name,
      program.description,
      program.goal,
      program.level,
      program.tags.join(' '),
      program.sections.map((section) => section.name).join(' '),
    ]
      .join(' ')
      .toLowerCase()

    return searchableText.includes(deferredProgramQuery)
  })

  const filteredExercises = contentLibrary.exercises.filter((exercise) => {
    if (exerciseFilter === 'favorites' && !savedExerciseIdSet.has(exercise.id)) {
      return false
    }

    if (!deferredExerciseQuery) {
      return true
    }

    const searchableText = [
      exercise.name,
      exercise.description,
      exercise.category,
      exercise.difficulty,
      exercise.tags.join(' '),
      exercise.muscleGroups.join(' '),
      exercise.equipment.join(' '),
    ]
      .join(' ')
      .toLowerCase()

    return searchableText.includes(deferredExerciseQuery)
  })
  const selectedExerciseStatsRecord = selectedExercise
    ? resolveExerciseStatsRecord(
        exerciseStatsStore,
        selectedExercise.id,
        selectedExercise.name,
      )
    : null

  const activeWorkoutPlannedExerciseIds =
    activeProgramSession && activeWorkout
      ? buildWorkoutExerciseOrder(
          activeWorkout.exerciseOrder,
          activeWorkout.exerciseLogs ?? {},
          activeWorkout.extraEntries ?? [],
        ).filter((entryId) => activeWorkout.exerciseLogs[entryId]?.type === 'planned')
      : (activeProgramSession?.section.exercises.map((exercise) => exercise.id) ?? [])
  const activeWorkoutPlannedExerciseCount = activeWorkoutPlannedExerciseIds.length
  const activeWorkoutPlannedExerciseIdSet = new Set(activeWorkoutPlannedExerciseIds)
  const completedPlannedExerciseCount = activeProgramSession
    ? activeProgramSession.section.exercises.filter((exercise) => {
        if (!activeWorkoutPlannedExerciseIdSet.has(exercise.id)) {
          return false
        }

        return (
          activeWorkoutExerciseLogs[exercise.id]?.completed ||
          activeWorkout?.completedExerciseIds.includes(exercise.id)
        )
      }).length
    : 0
  const handledPlannedExerciseCount = activeProgramSession
    ? activeProgramSession.section.exercises.filter((exercise) => {
        if (!activeWorkoutPlannedExerciseIdSet.has(exercise.id)) {
          return false
        }

        const workoutLog = activeWorkoutExerciseLogs[exercise.id]
        return (
          workoutLog?.completed ||
          workoutLog?.skipped ||
          activeWorkout?.completedExerciseIds.includes(exercise.id)
        )
      }).length
    : 0
  const completionRatio = activeProgramSession
    ? Math.round(
        (handledPlannedExerciseCount /
          Math.max(activeWorkoutPlannedExerciseCount, 1)) *
          100,
      )
    : 0
  const activityLevelLabel = findOptionLabel(
    fitnessActivityLevelOptions,
    fitnessProfile.activityLevel,
  )
  const exertionOptions = getEffortOptions(fitnessProfile)
  const workoutNavStyle = {
    '--workout-progress': `${completionRatio}%`,
  } as CSSProperties
  const canStartSelectedWorkout = Boolean(
    !activeWorkout && launchProgram && selectedWorkoutSection,
  )
  const workoutButtonMode = activeWorkout
    ? activeTab === 'workout'
      ? 'stop'
      : 'resume'
    : 'start'

  function clearBanner() {
    setBanner(null)
  }

  function showBanner(tone: BannerTone, text: string) {
    setBanner({
      id: createId('banner'),
      text,
      tone,
    })
  }

  function closeReleaseNotes() {
    const bundle = releaseNoteBundle

    setReleaseNoteBundle(null)

    if (bundle) {
      void markReleaseNotesShown(bundle.latestReleaseId)
    }
  }

  function selectWorkoutSection(sectionId: string | null, program = launchProgram) {
    setSelectedWorkoutSectionId(sectionId)

    if (!program) {
      return
    }

    setProgramProgressStore((currentStore) =>
      selectProgramSection(currentStore, {
        programId: program.id,
        sectionId,
      }),
    )
  }

  function hasLoggedSetResponse(setLog: WorkoutSetLogEntry) {
    return Boolean(
      setLog.duration.trim() ||
        setLog.weightKg.trim() ||
        setLog.reps.trim() ||
        setLog.effort.trim(),
    )
  }

  function countLoggedSetResponses(setLogs: WorkoutSetLogEntry[]) {
    return setLogs.filter((setLog) => hasLoggedSetResponse(setLog)).length
  }

  function shouldKeepExistingSetLog(setLog: WorkoutSetLogEntry) {
    return Boolean(
      hasLoggedSetResponse(setLog) || setLog.completedAt || setLog.suboptimal,
    )
  }

  function createNextSetLogFrom(setLog: WorkoutSetLogEntry) {
    return createWorkoutSetLogEntry({
      duration: setLog.duration,
      effort: setLog.effort,
      reps: setLog.reps,
      weightKg: setLog.weightKg,
    })
  }

  function createNextSetLogFromPrefill(
    prefill: Partial<
      Pick<WorkoutSetLogEntry, 'duration' | 'effort' | 'reps' | 'weightKg'>
    >,
  ) {
    return createWorkoutSetLogEntry({
      duration: prefill.duration ?? '',
      effort: prefill.effort ?? '',
      reps: prefill.reps ?? '',
      weightKg: prefill.weightKg ?? '',
    })
  }

  function updateFitnessProfile<K extends keyof FitnessProfile>(
    field: K,
    value: FitnessProfile[K],
  ) {
    setFitnessProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }))
  }

  function updateNumericFitnessProfileField(
    field:
      | 'age'
      | 'heightCm'
      | 'weightKg'
      | 'bodyFatPercentage'
      | 'weeklyWorkoutTarget',
    rawValue: string,
  ) {
    const trimmedValue = rawValue.trim()

    if (!trimmedValue) {
      updateFitnessProfile(field, null)
      return
    }

    const parsedValue = Number(trimmedValue)

    if (!Number.isFinite(parsedValue)) {
      return
    }

    updateFitnessProfile(field, parsedValue)
  }

  function rememberProgram(programId: string) {
    setSavedProgramIds((currentIds) => {
      return currentIds.includes(programId) ? currentIds : [programId, ...currentIds]
    })
  }

  function addBodyCompositionEntry(entry: BodyStatEntryInput) {
    setBodyCompositionEntries((currentEntries) => [
      {
        ...entry,
        id: createId('body-stat'),
      },
      ...currentEntries,
    ])
    showBanner('success', 'Body stats entry saved.')
  }

  function removeBodyCompositionEntry(entryId: string) {
    if (!window.confirm('Delete this body stats entry?')) {
      return
    }

    setBodyCompositionEntries((currentEntries) => {
      return currentEntries.filter((entry) => entry.id !== entryId)
    })
  }

  function toggleSavedProgram(programId: string) {
    setSavedProgramIds((currentIds) => {
      return currentIds.includes(programId)
        ? currentIds.filter((entry) => entry !== programId)
        : [programId, ...currentIds]
    })
  }

  function toggleSavedExercise(exerciseId: string) {
    setSavedExerciseIds((currentIds) => {
      return currentIds.includes(exerciseId)
        ? currentIds.filter((entry) => entry !== exerciseId)
        : [exerciseId, ...currentIds]
    })
  }

  function selectProgramAsMain(
    program: AppProgram,
    options: { resetRun?: boolean } = {},
  ) {
    const shouldResetRun = options.resetRun ?? true
    const selectedAt = new Date().toISOString()
    const previousProgram = programs.find((entry) => entry.id === mainProgramId) ?? null

    if (shouldResetRun && previousProgram) {
      const archive = buildProgramArchiveLog(
        previousProgram,
        programDayLogs,
        selectedAt,
        programProgressStore.byProgramId[previousProgram.id]?.currentRunStartedAt ?? null,
      )

      if (archive && !hasCompletionLogForSameSessions(programCompletionLogs, archive)) {
        setProgramCompletionLogs((currentLogs) => upsertProgramCompletionLog(currentLogs, archive))
      }
    }

    setMainProgramId(program.id)
    rememberProgram(program.id)
    if (shouldResetRun) {
      setSelectedWorkoutSectionId(null)
      setProgramProgressStore((currentStore) =>
        resetProgramRun(currentStore, { at: selectedAt, programId: program.id }),
      )
    }
    setProgramStatsStore((currentStore) => {
      return markProgramSelected(currentStore, {
        programId: program.id,
        programSource: program.programSource,
        meta: {
          sections: program.sections.length,
          exercises: countExercises(program),
        },
      })
    })
  }

  function openManualBuilder() {
    clearBanner()
    setIsBuilderOpen(true)
    setDraft(createEmptyDraft())
    startTransition(() => {
      setSelectedProgramId(null)
      setSelectedExerciseId(null)
      setSelectedExerciseSubstitutionTarget(null)
      navigate(getPrimaryRoutePath('insights'))
    })
  }

  function openLibrary(view: LibraryView = 'home') {
    startTransition(() => {
      navigate(getLibraryPath(view))
    })
  }

  function openMainProgramPicker() {
    if (
      !activeWorkout &&
      !isMainProgramEmpty &&
      isProgramProgressComplete(
        mainProgram,
        programProgressStore.byProgramId[mainProgram.id] ?? null,
        programCompletionLogs,
      )
    ) {
      selectProgramAsMain(mainProgram)
    }

    startTransition(() => {
      navigate(getLibraryPath('programs'))
    })
  }

  function cloneProgram(program: AppProgram) {
    selectProgramAsMain(program)
    setIsBuilderOpen(true)
    showBanner('success', `Draft created from ${program.name}.`)
    setDraft(programToDraft(program))
    startTransition(() => {
      setSelectedProgramId(null)
      navigate(getPrimaryRoutePath('insights'))
    })
  }

  function editCustomProgram(programId: string) {
    const customProgram = customPrograms.find((program) => program.id === programId)

    if (!customProgram) {
      return
    }

    clearBanner()
    setIsBuilderOpen(true)
    setDraft(customProgramToDraft(customProgram))
    startTransition(() => {
      setSelectedProgramId(null)
      navigate(getPrimaryRoutePath('insights'))
    })
  }

  function deleteCustomProgram(programId: string) {
    const program = customPrograms.find((entry) => entry.id === programId)

    if (!program) {
      return
    }

    if (!window.confirm(`Delete "${program.name}"?`)) {
      return
    }

    if (activeWorkout?.programId === programId) {
      setProgramStatsStore((currentStore) =>
        markProgramDiscarded(currentStore, {
          programId,
          programSource: 'custom',
          sessionId: activeWorkout.sessionId,
          sectionId: activeWorkout.sectionId,
          meta: {
            reason: 'deleted-program',
          },
        }),
      )
      setActiveWorkout(null)
    }

    setCustomPrograms((currentPrograms) => {
      return currentPrograms.filter((entry) => entry.id !== programId)
    })

    if (selectedProgramId === programId) {
      setSelectedProgramId(null)
    }

    if (mainProgramId === programId) {
      setMainProgramId(null)
    }

    setSavedProgramIds((currentIds) => {
      return currentIds.filter((entry) => entry !== programId)
    })
  }

  function updateDraftField<K extends keyof ProgramDraft>(
    field: K,
    value: ProgramDraft[K],
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }))
  }

  function updateSectionField(
    sectionId: string,
    field: 'name' | 'notes',
    value: string,
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      sections: currentDraft.sections.map((section) => {
        if (section.id !== sectionId) {
          return section
        }

        return {
          ...section,
          [field]: value,
        }
      }),
    }))
  }

  function addWeek() {
    setDraft((currentDraft) => {
      const nextWeekIndex =
        Math.max(0, ...currentDraft.sections.map((section) => section.weekIndex || 0)) + 1

      return {
        ...currentDraft,
        sections: autoLabelDraftSections([
          ...currentDraft.sections,
          createEmptySection({
            dayIndex: 1,
            dayLabel: 'Day 1',
            name: 'Day 1',
            weekIndex: nextWeekIndex,
            weekLabel: `Week ${nextWeekIndex}`,
          }),
        ]),
      }
    })
  }

  function addSectionToWeek(weekIndex: number) {
    setDraft((currentDraft) => {
      const weekSections = currentDraft.sections.filter(
        (section) => section.weekIndex === weekIndex,
      )
      const nextDayIndex =
        Math.max(0, ...weekSections.map((section) => section.dayIndex || 0)) + 1

      return {
        ...currentDraft,
        sections: autoLabelDraftSections([
          ...currentDraft.sections,
          createEmptySection({
            dayIndex: nextDayIndex,
            dayLabel: `Day ${nextDayIndex}`,
            name: `Day ${nextDayIndex}`,
            weekIndex,
            weekLabel: weekSections[0]?.weekLabel ?? `Week ${weekIndex}`,
          }),
        ]),
      }
    })
  }

  function removeSection(sectionId: string) {
    setDraft((currentDraft) => {
      if (currentDraft.sections.length <= 1) {
        return currentDraft
      }

      return {
        ...currentDraft,
        sections: autoLabelDraftSections(
          currentDraft.sections.filter((section) => section.id !== sectionId),
        ),
      }
    })
  }

  function removeWeek(weekIndex: number) {
    setDraft((currentDraft) => {
      const weekIndexes = new Set(
        currentDraft.sections.map((section) => section.weekIndex || 1),
      )

      if (weekIndexes.size <= 1) {
        return currentDraft
      }

      const nextSections = currentDraft.sections.filter(
        (section) => (section.weekIndex || 1) !== weekIndex,
      )

      if (!nextSections.length) {
        return currentDraft
      }

      return {
        ...currentDraft,
        sections: autoLabelDraftSections(nextSections),
      }
    })
  }

  function reorderWeek(draggedWeekIndex: number, targetWeekIndex: number) {
    setDraft((currentDraft) => {
      if (draggedWeekIndex === targetWeekIndex) {
        return currentDraft
      }

      const weekIndexes = [
        ...new Set(currentDraft.sections.map((section) => section.weekIndex || 1)),
      ].sort((left, right) => left - right)
      const draggedIndex = weekIndexes.indexOf(draggedWeekIndex)
      const targetIndex = weekIndexes.indexOf(targetWeekIndex)

      if (draggedIndex === -1 || targetIndex === -1) {
        return currentDraft
      }

      const nextWeekIndexes = [...weekIndexes]
      const [movedWeekIndex] = nextWeekIndexes.splice(draggedIndex, 1)
      nextWeekIndexes.splice(targetIndex, 0, movedWeekIndex)
      const nextWeekIndexByCurrentIndex = new Map(
        nextWeekIndexes.map((currentWeekIndex, index) => [currentWeekIndex, index + 1]),
      )

      return {
        ...currentDraft,
        sections: autoLabelDraftSections(currentDraft.sections.map((section) => {
          const nextWeekIndex = nextWeekIndexByCurrentIndex.get(section.weekIndex || 1)

          if (!nextWeekIndex) {
            return section
          }

          return {
            ...section,
            weekIndex: nextWeekIndex,
            weekLabel: `Week ${nextWeekIndex}`,
          }
        })),
      }
    })
  }

  function reorderSection(draggedSectionId: string, targetSectionId: string) {
    setDraft((currentDraft) => {
      if (draggedSectionId === targetSectionId) {
        return currentDraft
      }

      const draggedSection = currentDraft.sections.find((entry) => entry.id === draggedSectionId)
      const targetSection = currentDraft.sections.find((entry) => entry.id === targetSectionId)

      if (
        !draggedSection ||
        !targetSection ||
        draggedSection.weekIndex !== targetSection.weekIndex
      ) {
        return currentDraft
      }

      const weekSections = sortDraftSections(
        currentDraft.sections.filter((entry) => entry.weekIndex === targetSection.weekIndex),
      )
      const draggedIndex = weekSections.findIndex((entry) => entry.id === draggedSectionId)
      const targetIndex = weekSections.findIndex((entry) => entry.id === targetSectionId)

      if (draggedIndex === -1 || targetIndex === -1) {
        return currentDraft
      }

      const reorderedWeekSections = [...weekSections]
      const [movedSection] = reorderedWeekSections.splice(draggedIndex, 1)
      reorderedWeekSections.splice(targetIndex, 0, movedSection)
      const renumberedWeekSections = reorderedWeekSections.map((entry, index) => ({
        ...entry,
        dayIndex: index + 1,
        dayLabel: `Day ${index + 1}`,
        name: `Day ${index + 1}`,
      }))
      const renumberedSectionById = new Map(
        renumberedWeekSections.map((entry) => [entry.id, entry] as const),
      )

      return {
        ...currentDraft,
        sections: autoLabelDraftSections(
          currentDraft.sections.map((entry) => renumberedSectionById.get(entry.id) ?? entry),
        ),
      }
    })
  }

  function addExerciseToSection(sectionId: string, exercise?: Exercise) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      sections: currentDraft.sections.map((section) => {
        if (section.id !== sectionId) {
          return section
        }

        return {
          ...section,
          exercises:
            exercise &&
            section.exercises.length === 1 &&
            !section.exercises[0].exerciseName.trim()
              ? [createDraftExerciseFromLibraryExercise(exercise)]
              : [
                  ...section.exercises,
                  exercise
                    ? createDraftExerciseFromLibraryExercise(exercise)
                    : createEmptyExercise(),
                ],
        }
      }),
    }))
  }

  function removeExerciseFromSection(sectionId: string, exerciseId: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      sections: currentDraft.sections.map((section) => {
        if (section.id !== sectionId) {
          return section
        }

        return {
          ...section,
          exercises:
            section.exercises.length > 1
              ? section.exercises.filter((exercise) => exercise.id !== exerciseId)
              : section.exercises,
        }
      }),
    }))
  }

  function moveDraftExercise(
    sectionId: string,
    exerciseId: string,
    direction: 'down' | 'up',
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      sections: currentDraft.sections.map((section) => {
        if (section.id !== sectionId) {
          return section
        }

        const currentIndex = section.exercises.findIndex((exercise) => exercise.id === exerciseId)
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

        if (currentIndex === -1 || targetIndex < 0 || targetIndex >= section.exercises.length) {
          return section
        }

        const nextExercises = [...section.exercises]
        const [movedExercise] = nextExercises.splice(currentIndex, 1)
        nextExercises.splice(targetIndex, 0, movedExercise)

        return {
          ...section,
          exercises: nextExercises,
        }
      }),
    }))
  }

  function updateDraftExercise(
    sectionId: string,
    exerciseId: string,
    field: 'exerciseName' | 'sets' | 'reps' | 'duration' | 'rest' | 'notes',
    value: string,
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      sections: currentDraft.sections.map((section) => {
        if (section.id !== sectionId) {
          return section
        }

        return {
          ...section,
          exercises: section.exercises.map((exercise) => {
            if (exercise.id !== exerciseId) {
              return exercise
            }

            const selectedExercise =
              field === 'exerciseName' ? findExerciseByReference(value) : null
            const defaultTargets = selectedExercise?.defaultTargets

            return {
              ...exercise,
              [field]: value,
              ...(defaultTargets
                ? {
                    duration: exercise.duration.trim()
                      ? exercise.duration
                      : defaultTargets.duration,
                    reps: exercise.reps.trim() ? exercise.reps : defaultTargets.reps,
                    rest: exercise.rest.trim() ? exercise.rest : defaultTargets.rest,
                    sets: exercise.sets.trim() ? exercise.sets : defaultTargets.sets,
                  }
                : {}),
            }
          }),
        }
      }),
    }))
  }

  function saveDraft() {
    const hasName = draft.name.trim().length > 0
    const hasExercises = draft.sections.some((section) => {
      return section.exercises.some((exercise) => exercise.exerciseName.trim())
    })

    if (!hasName) {
      showBanner('error', 'Give your program a name before saving it.')
      return
    }

    if (!hasExercises) {
      showBanner('error', 'Add at least one exercise to your custom program.')
      return
    }

    const savedProgram = draftToCustomProgram(
      {
        ...draft,
        sections: autoLabelDraftSections(draft.sections),
      },
      customPrograms,
    )

    setCustomPrograms((currentPrograms) => {
      const existingIndex = currentPrograms.findIndex((program) => {
        return program.id === savedProgram.id
      })

      if (existingIndex === -1) {
        return [savedProgram, ...currentPrograms]
      }

      return currentPrograms.map((program) => {
        return program.id === savedProgram.id ? savedProgram : program
      })
    })

    setMainProgramId(savedProgram.id)
    rememberProgram(savedProgram.id)
    setIsBuilderOpen(false)
    showBanner('success', `${savedProgram.name} saved to your device.`)
    setDraft(createEmptyDraft())
    startTransition(() => {
      setSelectedProgramId(savedProgram.id)
      navigate(getPrimaryRoutePath('insights'))
    })
  }

  function openProgram(program: AppProgram) {
    const shouldResetCompletedMainProgram =
      program.id === mainProgramId &&
      !activeWorkout &&
      isProgramProgressComplete(
        program,
        programProgressStore.byProgramId[program.id] ?? null,
        programCompletionLogs,
      )

    if (program.id !== mainProgramId || shouldResetCompletedMainProgram) {
      selectProgramAsMain(program)
    }
    setSelectedProgramId(program.id)
  }

  function openWorkoutScreen(options?: { program?: AppProgram; sectionId?: string }) {
    startTransition(() => {
      const sectionId = options?.sectionId ?? activeWorkout?.sectionId

      if (sectionId) {
        selectWorkoutSection(
          sectionId,
          options?.program ?? activeProgramSession?.program ?? launchProgram,
        )
      }
      setSelectedProgramId(null)
      navigate(getPrimaryRoutePath('workout'))
    })
  }

  function createCustomWorkoutDay() {
    if (!launchProgram || !selectedWorkoutDay) {
      return
    }

    const now = new Date().toISOString()
    const targetWeekIndex = selectedWorkoutDay.weekIndex || 1
    const targetWeekLabel = selectedWorkoutDay.weekLabel || `Week ${targetWeekIndex}`
    const existingCustomProgram =
      launchProgram.programSource === 'custom'
        ? customPrograms.find((program) => program.id === launchProgram.id) ?? null
        : null

    if (existingCustomProgram) {
      const weekSections = existingCustomProgram.sections.filter(
        (section) => (section.weekIndex || 1) === targetWeekIndex,
      )
      const nextDayIndex =
        Math.max(0, ...weekSections.map((section) => section.dayIndex || 0)) + 1
      const customDaySection = {
        ...createEmptySection({
          dayIndex: nextDayIndex,
          dayLabel: `Day ${nextDayIndex}`,
          name: `Custom Day ${nextDayIndex}`,
          weekIndex: targetWeekIndex,
          weekLabel: targetWeekLabel,
        }),
        exercises: [],
      }
      const savedProgram: CustomProgram = {
        ...existingCustomProgram,
        sections: [...existingCustomProgram.sections, customDaySection],
        updatedAt: now,
      }
      const appProgram: AppProgram = {
        ...customProgramToProgram(savedProgram),
        programSource: 'custom',
      }

      setCustomPrograms((currentPrograms) =>
        currentPrograms.map((program) =>
          program.id === savedProgram.id ? savedProgram : program,
        ),
      )
      selectProgramAsMain(appProgram)
      selectWorkoutSection(customDaySection.id, appProgram)
      showBanner('success', `${customDaySection.name} added to ${savedProgram.name}.`)
      return
    }

    const baseDraft = programToDraft(launchProgram)
    const weekSections = baseDraft.sections.filter(
      (section) => (section.weekIndex || 1) === targetWeekIndex,
    )
    const nextDayIndex =
      Math.max(0, ...weekSections.map((section) => section.dayIndex || 0)) + 1
    const customDaySection = {
      ...createEmptySection({
        dayIndex: nextDayIndex,
        dayLabel: `Day ${nextDayIndex}`,
        name: `Custom Day ${nextDayIndex}`,
        weekIndex: targetWeekIndex,
        weekLabel: targetWeekLabel,
      }),
      exercises: [],
    }
    const savedProgram = draftToCustomProgram(
      {
        ...baseDraft,
        editingId: null,
        name: `${launchProgram.name} Custom`,
        sections: sortDraftSections([...baseDraft.sections, customDaySection]),
      },
      customPrograms,
    )
    const appProgram: AppProgram = {
      ...customProgramToProgram(savedProgram),
      programSource: 'custom',
    }

    setCustomPrograms((currentPrograms) => [savedProgram, ...currentPrograms])
    selectProgramAsMain(appProgram)
    selectWorkoutSection(customDaySection.id, appProgram)
    showBanner('success', `${customDaySection.name} added to ${savedProgram.name}.`)
  }

  function startWorkout(program: AppProgram, sectionId: string) {
    const section = program.sections.find((entry) => entry.id === sectionId)

    if (!section) {
      return
    }

    if (activeWorkout) {
      const isSameWorkout =
        activeWorkout.programId === program.id && activeWorkout.sectionId === section.id

      if (isSameWorkout) {
        selectWorkoutSection(section.id, program)
        openWorkoutScreen({ program, sectionId: section.id })
        return
      }

      if (
        !window.confirm(
          `Replace "${activeWorkout.programName} / ${activeWorkout.sectionName}" with "${program.name} / ${section.name}"?`,
        )
      ) {
        return
      }

      setProgramStatsStore((currentStore) =>
        markProgramDiscarded(currentStore, {
          programId: activeWorkout.programId,
          programSource: activeWorkout.programSource,
          sessionId: activeWorkout.sessionId,
          sectionId: activeWorkout.sectionId,
          meta: {
            reason: 'replaced-session',
          },
        }),
      )
    }

    const sessionId = createId('session')
    const startedAt = new Date().toISOString()
    const plannedWorkoutLogs = createPlannedWorkoutLogs(
      program,
      section.id,
      findExerciseByReference,
    )
    const initialExerciseOrder = buildWorkoutExerciseOrder(
      workoutDayExerciseOrders[section.id] ?? section.exercises.map((exercise) => exercise.id),
      plannedWorkoutLogs,
      [],
    )

    const shouldResetProgramRun =
      mainProgramId !== program.id ||
      isProgramProgressComplete(
        program,
        programProgressStore.byProgramId[program.id] ?? null,
        programCompletionLogs,
      )

    selectProgramAsMain(program, { resetRun: shouldResetProgramRun })
    setIsStartWorkoutDialogOpen(false)
    setIsFinishWorkoutDialogOpen(false)
    setSelectedWorkoutSectionId(section.id)
    setProgramProgressStore((currentStore) =>
      markProgramSectionStarted(currentStore, {
        at: startedAt,
        programId: program.id,
        sectionId: section.id,
      }),
    )
    setActiveWorkout({
      exerciseLogs: plannedWorkoutLogs,
      exerciseOrder: initialExerciseOrder,
      exertionScale: fitnessProfile.effortScale,
      extraEntries: [],
      sessionId,
      programId: program.id,
      programName: program.name,
      programSource: program.programSource,
      sectionId: section.id,
      sectionName: section.name,
      startedAt,
      updatedAt: startedAt,
      completedExerciseIds: [],
      notes: '',
    })
    setProgramStatsStore((currentStore) =>
      markProgramStarted(currentStore, {
        programId: program.id,
        programSource: program.programSource,
        at: startedAt,
        sessionId,
        sectionId: section.id,
        meta: {
          sectionName: section.name,
        },
      }),
    )
    showBanner('success', `Started ${program.name} / ${section.name}.`)
    openWorkoutScreen({ program, sectionId: section.id })
  }

  function toggleWorkoutExercise(exerciseId: string) {
    if (!activeWorkout) {
      return
    }

    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      const isCompleted = currentWorkout.completedExerciseIds.includes(exerciseId)
      const currentLog =
        currentWorkout.exerciseLogs?.[exerciseId] ??
        createWorkoutExerciseLogEntry('Exercise', {
          completed: isCompleted,
          plannedExerciseId: exerciseId,
          type: 'planned',
        })

      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        exerciseLogs: {
          ...(currentWorkout.exerciseLogs ?? {}),
          [exerciseId]: {
            ...currentLog,
            completedAt: !isCompleted ? loggedAt : null,
            firstLoggedAt: currentLog.firstLoggedAt ?? loggedAt,
            lastLoggedAt: loggedAt,
            skipped: false,
            skippedAt: null,
            completed: !isCompleted,
          },
        },
        completedExerciseIds: isCompleted
          ? currentWorkout.completedExerciseIds.filter((id) => id !== exerciseId)
          : [...currentWorkout.completedExerciseIds, exerciseId],
      }
    })
  }

  function toggleWorkoutExerciseSkipped(exerciseId: string) {
    if (!activeWorkout) {
      return
    }

    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      const isCompleted = currentWorkout.completedExerciseIds.includes(exerciseId)
      const currentLog =
        currentWorkout.exerciseLogs?.[exerciseId] ??
        createWorkoutExerciseLogEntry('Exercise', {
          completed: isCompleted,
          logId: exerciseId,
          plannedExerciseId: exerciseId,
          type: 'planned',
        })
      const nextSkipped = !currentLog.skipped

      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        exerciseLogs: {
          ...(currentWorkout.exerciseLogs ?? {}),
          [exerciseId]: {
            ...currentLog,
            completed: false,
            completedAt: null,
            firstLoggedAt: currentLog.firstLoggedAt ?? loggedAt,
            lastLoggedAt: loggedAt,
            skipped: nextSkipped,
            skippedAt: nextSkipped ? loggedAt : null,
          },
        },
        completedExerciseIds: currentWorkout.completedExerciseIds.filter(
          (id) => id !== exerciseId,
        ),
      }
    })
  }

  function updateWorkoutExerciseSetLog(
    exerciseId: string,
    setIndex: number,
    field: keyof WorkoutSetLogEntry,
    value: string,
  ) {
    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      const currentLog =
        currentWorkout.exerciseLogs?.[exerciseId] ??
        createWorkoutExerciseLogEntry('Exercise', {
          logId: exerciseId,
          plannedExerciseId: exerciseId,
          type: 'planned',
        })
      const nextSetLogs = ensureWorkoutSetLogs(currentLog.setLogs, setIndex + 1).map(
        (setLog, index) => {
          if (index !== setIndex) {
            return setLog
          }

          return {
            ...setLog,
            [field]: value,
            loggedAt,
          }
        },
      )
      const completedSets = countLoggedSetResponses(nextSetLogs)

      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        exerciseLogs: {
          ...(currentWorkout.exerciseLogs ?? {}),
          [exerciseId]: {
            ...currentLog,
            completedSets: completedSets ? String(completedSets) : '',
            firstLoggedAt: currentLog.firstLoggedAt ?? loggedAt,
            lastLoggedAt: loggedAt,
            setLogs: nextSetLogs,
            skipped: false,
            skippedAt: null,
          },
        },
      }
    })
  }

  function commitWorkoutExerciseSet(
    exerciseId: string,
    setIndex: number,
    options?: {
      prefillNext?: boolean
      prefillNextSetLog?: Pick<
        WorkoutSetLogEntry,
        'duration' | 'effort' | 'reps' | 'weightKg'
      >
    },
  ) {
    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      const currentLog =
        currentWorkout.exerciseLogs?.[exerciseId] ??
        createWorkoutExerciseLogEntry('Exercise', {
          logId: exerciseId,
          plannedExerciseId: exerciseId,
          type: 'planned',
        })
      const requiredSetCount = setIndex + 1 + (options?.prefillNext ? 1 : 0)
      const sourceSetLogs = ensureWorkoutSetLogs(currentLog.setLogs, requiredSetCount)
      const sourceSetLog = sourceSetLogs[setIndex] ?? createWorkoutSetLogEntry()
      const nextSetLogs = sourceSetLogs.map((setLog, index) => {
        if (index === setIndex) {
          return {
            ...setLog,
            completedAt: loggedAt,
            loggedAt,
          }
        }

        if (
          options?.prefillNext &&
            index === setIndex + 1 &&
            !shouldKeepExistingSetLog(setLog)
          ) {
            return options.prefillNextSetLog
              ? createNextSetLogFromPrefill(options.prefillNextSetLog)
              : createNextSetLogFrom(sourceSetLog)
          }

        return setLog
      })
      const completedSets = countLoggedSetResponses(nextSetLogs)

      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        exerciseLogs: {
          ...(currentWorkout.exerciseLogs ?? {}),
          [exerciseId]: {
            ...currentLog,
            completedSets: completedSets ? String(completedSets) : '',
            firstLoggedAt: currentLog.firstLoggedAt ?? loggedAt,
            lastLoggedAt: loggedAt,
            setLogs: nextSetLogs,
            skipped: false,
            skippedAt: null,
          },
        },
      }
    })
  }

  function removeWorkoutExerciseSetLog(
    exerciseId: string,
    setIndex: number,
    nextVisibleSetCount?: number,
  ) {
    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      if (setIndex < 0) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      const currentLog =
        currentWorkout.exerciseLogs?.[exerciseId] ??
        createWorkoutExerciseLogEntry('Exercise', {
          logId: exerciseId,
          plannedExerciseId: exerciseId,
          type: 'planned',
        })
      const nextSetLogs =
        setIndex < currentLog.setLogs.length
          ? currentLog.setLogs.filter((_, index) => index !== setIndex)
          : currentLog.setLogs
      const completedSets = countLoggedSetResponses(nextSetLogs)
      const targetSetCountOverride =
        typeof nextVisibleSetCount === 'number'
          ? Math.max(1, nextVisibleSetCount)
          : Math.max(
              1,
              Math.max(
                currentLog.targetSetCountOverride ?? 1,
                currentLog.setLogs.length,
              ) - 1,
            )

      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        exerciseLogs: {
          ...(currentWorkout.exerciseLogs ?? {}),
          [exerciseId]: {
            ...currentLog,
            completedSets: completedSets ? String(completedSets) : '',
            firstLoggedAt: currentLog.firstLoggedAt ?? loggedAt,
            lastLoggedAt: loggedAt,
            setLogs: nextSetLogs,
            targetSetCountOverride,
          },
        },
      }
    })
  }

  function toggleWorkoutExerciseSetSuboptimal(exerciseId: string, setIndex: number) {
    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      const currentLog = currentWorkout.exerciseLogs?.[exerciseId]
      const currentSetLog = currentLog?.setLogs[setIndex]

      if (!currentLog || !currentSetLog?.completedAt) {
        return currentWorkout
      }

      const nextSetLogs = currentLog.setLogs.map((setLog, index) => {
        if (index !== setIndex) {
          return setLog
        }

        return {
          ...setLog,
          loggedAt,
          suboptimal: !setLog.suboptimal,
        }
      })

      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        exerciseLogs: {
          ...(currentWorkout.exerciseLogs ?? {}),
          [exerciseId]: {
            ...currentLog,
            lastLoggedAt: loggedAt,
            setLogs: nextSetLogs,
          },
        },
      }
    })
  }

  function addWorkoutExerciseSet(exerciseId: string, visibleSetCount?: number) {
    if (!activeWorkout) {
      return
    }

    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      const currentLog =
        currentWorkout.exerciseLogs?.[exerciseId] ??
        createWorkoutExerciseLogEntry('Exercise', {
          logId: exerciseId,
          plannedExerciseId: exerciseId,
          type: 'planned',
        })
      const nextVisibleSetCount = Math.max(
        1,
        (visibleSetCount ??
          currentLog.targetSetCountOverride ??
          Math.max(1, currentLog.setLogs.length)) + 1,
      )

      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        exerciseLogs: {
          ...(currentWorkout.exerciseLogs ?? {}),
          [exerciseId]: {
            ...currentLog,
            firstLoggedAt: currentLog.firstLoggedAt ?? loggedAt,
            lastLoggedAt: loggedAt,
            setLogs: ensureWorkoutSetLogs(
              currentLog.setLogs,
              nextVisibleSetCount,
            ),
            skipped: false,
            skippedAt: null,
            targetSetCountOverride: nextVisibleSetCount,
          },
        },
      }
    })
  }

  function addWorkoutExtraExercise(exercise: Exercise) {
    if (!activeWorkout) {
      return
    }

    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      const nextEntry = createExtraExerciseWorkoutLog(exercise)

      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        exerciseOrder: [
          ...buildWorkoutExerciseOrder(
            currentWorkout.exerciseOrder,
            currentWorkout.exerciseLogs ?? {},
            currentWorkout.extraEntries ?? [],
          ),
          nextEntry.logId,
        ],
        extraEntries: [...(currentWorkout.extraEntries ?? []), nextEntry],
      }
    })
  }

  function removeWorkoutExercise(
    exerciseId: string,
    options?: { skipConfirm?: boolean },
  ) {
    if (!activeWorkout) {
      return
    }

    const currentLog = activeWorkout.exerciseLogs?.[exerciseId]
    const hasExistingResponses = Boolean(
      currentLog?.completed ||
        currentLog?.skipped ||
        currentLog?.setLogs.some((setLog) => hasLoggedSetResponse(setLog)),
    )

    if (
      hasExistingResponses &&
      !options?.skipConfirm &&
      !window.confirm(
        `Remove "${currentLog?.exerciseName ?? 'this exercise'}" from this workout and clear its logged responses?`,
      )
    ) {
      return
    }

    const removedExerciseName = currentLog?.exerciseName ?? 'Exercise'

    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      const nextExerciseLogs = { ...(currentWorkout.exerciseLogs ?? {}) }
      delete nextExerciseLogs[exerciseId]

      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        completedExerciseIds: currentWorkout.completedExerciseIds.filter(
          (id) => id !== exerciseId,
        ),
        exerciseLogs: nextExerciseLogs,
        exerciseOrder: buildWorkoutExerciseOrder(
          currentWorkout.exerciseOrder,
          nextExerciseLogs,
          currentWorkout.extraEntries ?? [],
        ).filter((entryId) => entryId !== exerciseId),
      }
    })
    showBanner('success', `Removed ${removedExerciseName} from this workout.`)
  }

  function substituteWorkoutExercise(exerciseId: string, exercise: Exercise) {
    if (!activeWorkout) {
      return false
    }

    const currentLog = activeWorkout.exerciseLogs?.[exerciseId]
    const hasExistingResponses = Boolean(
      currentLog?.completed ||
        currentLog?.skipped ||
        currentLog?.setLogs.some((setLog) => hasLoggedSetResponse(setLog)),
    )

    if (
      hasExistingResponses &&
      !window.confirm(
        `Replace "${currentLog?.exerciseName ?? 'this exercise'}" with "${exercise.name}" and clear the logged responses for this row?`,
      )
    ) {
      return false
    }

    const loggedAt = new Date().toISOString()
    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const entry =
        currentWorkout.exerciseLogs?.[exerciseId] ??
        createWorkoutExerciseLogEntry(exercise.name, {
          logId: exerciseId,
          plannedExerciseId: exerciseId,
          type: 'planned',
        })

      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        exerciseLogs: {
          ...(currentWorkout.exerciseLogs ?? {}),
          [exerciseId]: {
            ...createWorkoutExerciseLogEntry(exercise.name, {
              exerciseId: exercise.id,
              logId: exerciseId,
              muscleGroups: exercise.muscleGroups,
              plannedExerciseId: exerciseId,
              setLogs: ensureWorkoutSetLogs([], entry.setLogs.length),
              targetSetCountOverride: entry.targetSetCountOverride,
              type: 'planned',
            }),
          },
        },
        completedExerciseIds: currentWorkout.completedExerciseIds.filter((id) => id !== exerciseId),
      }
    })
    showBanner('success', `Substituted with ${exercise.name}.`)
    return true
  }

  function updateWorkoutExtraExerciseSetLog(
    logId: string,
    setIndex: number,
    field: keyof WorkoutSetLogEntry,
    value: string,
  ) {
    if (!activeWorkout) {
      return
    }

    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        extraEntries: (currentWorkout.extraEntries ?? []).map((entry) => {
          if (entry.logId !== logId) {
            return entry
          }

          const nextSetLogs = ensureWorkoutSetLogs(entry.setLogs, setIndex + 1).map(
            (setLog, index) => {
              if (index !== setIndex) {
                return setLog
              }

              return {
                ...setLog,
                [field]: value,
                loggedAt,
              }
            },
          )
          const completedSets = countLoggedSetResponses(nextSetLogs)

          return {
            ...entry,
            completedSets: completedSets ? String(completedSets) : '',
            firstLoggedAt: entry.firstLoggedAt ?? loggedAt,
            lastLoggedAt: loggedAt,
            setLogs: nextSetLogs,
          }
        }),
      }
    })
  }

  function commitWorkoutExtraExerciseSet(
    logId: string,
    setIndex: number,
    options?: {
      prefillNext?: boolean
      prefillNextSetLog?: Pick<
        WorkoutSetLogEntry,
        'duration' | 'effort' | 'reps' | 'weightKg'
      >
    },
  ) {
    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        extraEntries: (currentWorkout.extraEntries ?? []).map((entry) => {
          if (entry.logId !== logId) {
            return entry
          }

          const requiredSetCount = setIndex + 1 + (options?.prefillNext ? 1 : 0)
          const sourceSetLogs = ensureWorkoutSetLogs(entry.setLogs, requiredSetCount)
          const sourceSetLog = sourceSetLogs[setIndex] ?? createWorkoutSetLogEntry()
          const nextSetLogs = sourceSetLogs.map((setLog, index) => {
            if (index === setIndex) {
              return {
                ...setLog,
                completedAt: loggedAt,
                loggedAt,
              }
            }

            if (
              options?.prefillNext &&
              index === setIndex + 1 &&
              !shouldKeepExistingSetLog(setLog)
            ) {
              return options.prefillNextSetLog
                ? createNextSetLogFromPrefill(options.prefillNextSetLog)
                : createNextSetLogFrom(sourceSetLog)
            }

            return setLog
          })
          const completedSets = countLoggedSetResponses(nextSetLogs)

          return {
            ...entry,
            completedSets: completedSets ? String(completedSets) : '',
            firstLoggedAt: entry.firstLoggedAt ?? loggedAt,
            lastLoggedAt: loggedAt,
            setLogs: nextSetLogs,
            skipped: false,
            skippedAt: null,
          }
        }),
      }
    })
  }

  function removeWorkoutExtraExerciseSetLog(
    logId: string,
    setIndex: number,
    nextVisibleSetCount?: number,
  ) {
    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        extraEntries: (currentWorkout.extraEntries ?? []).map((entry) => {
          if (entry.logId !== logId || setIndex < 0) {
            return entry
          }

          const nextSetLogs =
            setIndex < entry.setLogs.length
              ? entry.setLogs.filter((_, index) => index !== setIndex)
              : entry.setLogs
          const completedSets = countLoggedSetResponses(nextSetLogs)
          const targetSetCountOverride =
            typeof nextVisibleSetCount === 'number'
              ? Math.max(1, nextVisibleSetCount)
              : Math.max(
                  1,
                  Math.max(entry.targetSetCountOverride ?? 1, entry.setLogs.length) - 1,
                )

          return {
            ...entry,
            completedSets: completedSets ? String(completedSets) : '',
            lastLoggedAt: loggedAt,
            setLogs: nextSetLogs,
            targetSetCountOverride,
          }
        }),
      }
    })
  }

  function toggleWorkoutExtraExerciseSetSuboptimal(logId: string, setIndex: number) {
    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        extraEntries: (currentWorkout.extraEntries ?? []).map((entry) => {
          if (entry.logId !== logId) {
            return entry
          }

          const currentSetLog = entry.setLogs[setIndex]

          if (!currentSetLog?.completedAt) {
            return entry
          }

          const nextSetLogs = entry.setLogs.map((setLog, index) => {
            if (index !== setIndex) {
              return setLog
            }

            return {
              ...setLog,
              loggedAt,
              suboptimal: !setLog.suboptimal,
            }
          })

          return {
            ...entry,
            lastLoggedAt: loggedAt,
            setLogs: nextSetLogs,
          }
        }),
      }
    })
  }

  function substituteWorkoutExtraExercise(logId: string, exercise: Exercise) {
    if (!activeWorkout) {
      return false
    }

    const currentEntry = activeWorkout.extraEntries.find((entry) => entry.logId === logId) ?? null
    const hasExistingResponses = Boolean(
      currentEntry?.completed ||
        currentEntry?.skipped ||
        currentEntry?.setLogs.some((setLog) => hasLoggedSetResponse(setLog)),
    )

    if (
      hasExistingResponses &&
      !window.confirm(
        `Replace "${currentEntry?.exerciseName ?? 'this exercise'}" with "${exercise.name}" and clear the logged responses for this row?`,
      )
    ) {
      return false
    }

    const loggedAt = new Date().toISOString()
    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        extraEntries: (currentWorkout.extraEntries ?? []).map((entry) => {
          if (entry.logId !== logId) {
            return entry
          }

          return {
            ...createWorkoutExerciseLogEntry(exercise.name, {
              exerciseId: exercise.id,
              logId,
              muscleGroups: exercise.muscleGroups,
              plannedExerciseId: null,
              setLogs: ensureWorkoutSetLogs([], entry.setLogs.length),
              targetSetCountOverride: entry.targetSetCountOverride,
              type: 'extra-exercise',
            }),
          }
        }),
      }
    })
    showBanner('success', `Substituted with ${exercise.name}.`)
    return true
  }

  function addWorkoutExtraExerciseSet(logId: string, visibleSetCount?: number) {
    if (!activeWorkout) {
      return
    }

    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        extraEntries: (currentWorkout.extraEntries ?? []).map((entry) => {
          if (entry.logId !== logId) {
            return entry
          }

          const nextVisibleSetCount = Math.max(
            1,
            (visibleSetCount ??
              entry.targetSetCountOverride ??
              Math.max(1, entry.setLogs.length)) + 1,
          )

          return {
            ...entry,
            firstLoggedAt: entry.firstLoggedAt ?? loggedAt,
            lastLoggedAt: loggedAt,
            setLogs: ensureWorkoutSetLogs(entry.setLogs, nextVisibleSetCount),
            targetSetCountOverride: nextVisibleSetCount,
          }
        }),
      }
    })
  }

  function toggleWorkoutExtraExercise(logId: string) {
    if (!activeWorkout) {
      return
    }

    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        extraEntries: (currentWorkout.extraEntries ?? []).map((entry) => {
          if (entry.logId !== logId) {
            return entry
          }

          return {
            ...entry,
            completedAt: !entry.completed ? loggedAt : null,
            completed: !entry.completed,
            firstLoggedAt: entry.firstLoggedAt ?? loggedAt,
            lastLoggedAt: loggedAt,
            skippedAt: null,
          }
        }),
      }
    })
  }

  function removeWorkoutExtraExercise(logId: string) {
    if (!activeWorkout) {
      return
    }

    setActiveWorkout((currentWorkout) => {
      if (!currentWorkout) {
        return currentWorkout
      }

      const loggedAt = new Date().toISOString()
      return {
        ...currentWorkout,
        updatedAt: loggedAt,
        exerciseOrder: buildWorkoutExerciseOrder(
          currentWorkout.exerciseOrder,
          currentWorkout.exerciseLogs ?? {},
          (currentWorkout.extraEntries ?? []).filter((entry) => entry.logId !== logId),
        ),
        extraEntries: (currentWorkout.extraEntries ?? []).filter((entry) => entry.logId !== logId),
      }
    })
  }

  function reorderWorkoutExercise(
    draggedLogId: string,
    targetLogId: string,
    position: 'before' | 'after',
  ) {
    if (!selectedWorkoutSection) {
      return
    }

    const reorderInOrder = (currentOrder: string[]) => {
      const currentIndex = currentOrder.indexOf(draggedLogId)
      const targetIndex = currentOrder.indexOf(targetLogId)

      if (currentIndex === -1 || targetIndex === -1 || currentIndex === targetIndex) {
        return currentOrder
      }

      const nextOrder = [...currentOrder]
      const [draggedEntry] = nextOrder.splice(currentIndex, 1)
      let insertIndex = targetIndex

      if (currentIndex < targetIndex) {
        insertIndex -= 1
      }

      if (position === 'after') {
        insertIndex += 1
      }

      nextOrder.splice(Math.max(0, Math.min(insertIndex, nextOrder.length)), 0, draggedEntry)

      return nextOrder
    }

    if (activeWorkout?.sectionId === selectedWorkoutSection.id) {
      setActiveWorkout((currentWorkout) => {
        if (!currentWorkout) {
          return currentWorkout
        }

        const loggedAt = new Date().toISOString()
        return {
          ...currentWorkout,
          updatedAt: loggedAt,
          exerciseOrder: reorderInOrder(
            buildWorkoutExerciseOrder(
              currentWorkout.exerciseOrder,
              currentWorkout.exerciseLogs ?? {},
              currentWorkout.extraEntries ?? [],
            ),
          ),
        }
      })
      return
    }

    setWorkoutDayExerciseOrders((currentOrders) => {
      const baseOrder =
        currentOrders[selectedWorkoutSection.id] ??
        selectedWorkoutSection.exercises.map((exercise) => exercise.id)

      return {
        ...currentOrders,
        [selectedWorkoutSection.id]: reorderInOrder(baseOrder),
      }
    })
  }

  function clearWorkoutButtonHold() {
    if (workoutButtonHoldTimeoutRef.current !== null) {
      window.clearTimeout(workoutButtonHoldTimeoutRef.current)
      workoutButtonHoldTimeoutRef.current = null
    }

    setIsWorkoutButtonHolding(false)
  }

  function handleWorkoutButtonPressStart(
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    event.preventDefault()

    if (!activeWorkout && !canStartSelectedWorkout) {
      return
    }

    clearWorkoutButtonHold()
    shouldIgnoreWorkoutButtonClickRef.current = false
    setIsWorkoutButtonHolding(true)
    workoutButtonHoldTimeoutRef.current = window.setTimeout(() => {
      setIsWorkoutButtonHolding(false)
      workoutButtonHoldTimeoutRef.current = null
      shouldIgnoreWorkoutButtonClickRef.current = true
      if (activeWorkout) {
        setIsFinishWorkoutDialogOpen(true)
        return
      }

      if (launchProgram && selectedWorkoutSection) {
        startWorkout(launchProgram, selectedWorkoutSection.id)
      }
    }, 900)
  }

  function handleWorkoutButtonClick() {
    if (shouldIgnoreWorkoutButtonClickRef.current) {
      shouldIgnoreWorkoutButtonClickRef.current = false
      return
    }

    if (activeWorkout && activeTab === 'workout') {
      setIsFinishWorkoutDialogOpen(true)
      return
    }

    if (!activeWorkout && activeTab === 'workout' && launchProgram && selectedWorkoutSection) {
      setIsStartWorkoutDialogOpen(true)
      return
    }

    openWorkoutScreen()
  }

  function finishWorkout() {
    if (!activeWorkout || !activeProgramSession) {
      return
    }

    const finishedAt = new Date().toISOString()
    const sessionDate = getSessionDateKey(finishedAt)
    const durationMinutes = Math.max(
      1,
      Math.round(
        (new Date(finishedAt).getTime() - new Date(activeWorkout.startedAt).getTime()) /
          60_000,
      ),
    )

    const orderedWorkoutEntries = buildWorkoutExerciseOrder(
      activeWorkout.exerciseOrder,
      activeWorkout.exerciseLogs ?? {},
      activeWorkout.extraEntries ?? [],
    ).flatMap((entryId) => {
      const plannedEntry = activeWorkout.exerciseLogs?.[entryId]

      if (plannedEntry) {
        return [plannedEntry]
      }

      const extraEntry = (activeWorkout.extraEntries ?? []).find(
        (entry) => entry.logId === entryId,
      )

      return extraEntry ? [extraEntry] : []
    })

    const workoutLog: WorkoutLog = {
      id: activeWorkout.sessionId,
      cardioEntryCount: (activeWorkout.extraEntries ?? []).filter((entry) => entry.type === 'cardio')
        .length,
      exerciseLogs: orderedWorkoutEntries,
      exertionScale: activeWorkout.exertionScale ?? fitnessProfile.effortScale,
      programId: activeWorkout.programId,
      programName: activeWorkout.programName,
      programSource: activeWorkout.programSource,
      sessionDate,
      sectionId: activeWorkout.sectionId,
      sectionName: activeWorkout.sectionName,
      startedAt: activeWorkout.startedAt,
      completedAt: finishedAt,
      durationMinutes,
      completedExerciseCount: completedPlannedExerciseCount,
      totalExerciseCount: activeWorkoutPlannedExerciseCount,
      notes: activeWorkout.notes.trim(),
    }
    const programDayLog = buildProgramDayLog(
      activeWorkout,
      orderedWorkoutEntries,
      finishedAt,
      durationMinutes,
      completedPlannedExerciseCount,
      activeWorkoutPlannedExerciseCount,
    )
    const isEditingExistingWorkoutLog = workoutLogs.some(
      (entry) => entry.id === activeWorkout.sessionId,
    )
    const nextWorkoutDay = getNextWorkoutDayOption(
      activeProgramSession.program,
      activeWorkout.sectionId,
    )
    const selectedSectionIdAfterFinish = isEditingExistingWorkoutLog
      ? activeWorkout.sectionId
      : nextWorkoutDay?.section.id ?? activeWorkout.sectionId
    const latestProgramCompletionAt =
      programCompletionLogs
        .filter((entry) => entry.programId === activeWorkout.programId)
        .sort((left, right) => right.completedAt.localeCompare(left.completedAt))[0]
        ?.completedAt ?? null
    const programCompletionLog = !nextWorkoutDay
      ? buildProgramCompletionLog(
          activeProgramSession.program,
          [programDayLog, ...programDayLogs],
          finishedAt,
          latestProgramCompletionAt,
        )
      : null
    const finishMessage = isEditingExistingWorkoutLog
      ? `Saved edits to ${activeWorkout.programName} / ${activeWorkout.sectionName}.`
      : nextWorkoutDay
        ? `Workout complete: ${activeWorkout.programName}. Next selected: ${nextWorkoutDay.section.shortName || nextWorkoutDay.section.name}.`
        : `Workout complete: ${activeWorkout.programName}.`

    setWorkoutLogs((currentWorkoutLogs) => upsertWorkoutLogById(currentWorkoutLogs, workoutLog))
    setExerciseStatsStore((currentStore) =>
      replaceWorkoutStatistics(currentStore, activeWorkout, orderedWorkoutEntries, finishedAt),
    )
    setProgramDayLogs((currentLogs) => upsertProgramDayLog(currentLogs, programDayLog))
    if (programCompletionLog || isEditingExistingWorkoutLog) {
      setProgramCompletionLogs((currentLogs) => {
        const refreshedLogs = currentLogs.map((completionLog) =>
          updateCompletionLogWithDayLog(completionLog, programDayLog),
        )
        const hasExistingCompletionForSession = refreshedLogs.some((completionLog) =>
          completionLog.dayLogs.some((dayLog) => dayLog.sessionId === programDayLog.sessionId),
        )

        return programCompletionLog && !hasExistingCompletionForSession
          ? upsertProgramCompletionLog(refreshedLogs, programCompletionLog)
          : refreshedLogs
      })
    }
    if (!isEditingExistingWorkoutLog) {
      setProgramStatsStore((currentStore) =>
        markProgramCompleted(currentStore, {
          programId: activeWorkout.programId,
          programSource: activeWorkout.programSource,
          at: finishedAt,
          sessionId: activeWorkout.sessionId,
          sectionId: activeWorkout.sectionId,
          durationMinutes,
          completedExercises: activeWorkout.completedExerciseIds.length,
          meta: {
            sectionName: activeWorkout.sectionName,
          },
        }),
      )
    }
    setActiveWorkout(null)
    setIsFinishWorkoutDialogOpen(false)
    setProgramProgressStore((currentStore) =>
      markProgramSectionCompleted(currentStore, {
        at: finishedAt,
        completedSectionId: activeWorkout.sectionId,
        nextSectionId: selectedSectionIdAfterFinish,
        programId: activeWorkout.programId,
      }),
    )
    setSelectedWorkoutSectionId(selectedSectionIdAfterFinish)
    clearWorkoutButtonHold()
    showBanner('success', finishMessage)
    startTransition(() => navigate(getPrimaryRoutePath('workout')))
  }

  async function resetStoredData() {
    if (!window.confirm('Reset saved programs, workout history, and local state?')) {
      return
    }

    await resetPersistedAppState()
    setDraft(createEmptyDraft())
    setIsBuilderOpen(false)
    setIsFinishWorkoutDialogOpen(false)
    setIsStartWorkoutDialogOpen(false)
    setSelectedExerciseId(null)
    setSelectedExerciseSubstitutionTarget(null)
    setSelectedProgramId(null)
    setSelectedWorkoutSectionId(null)
    clearWorkoutButtonHold()
    showBanner('success', 'Local Dexie data reset on this device.')
  }

  async function resetProgressionData() {
    if (
      !window.confirm(
        'Reset workout history, active workout state, and progression stats on this device?',
      )
    ) {
      return
    }

    await resetProgressionStateInStore()
    setIsFinishWorkoutDialogOpen(false)
    setIsStartWorkoutDialogOpen(false)
    setSelectedWorkoutSectionId(null)
    clearWorkoutButtonHold()
    showBanner('success', 'Progression data reset on this device.')
  }

  function findExerciseByReference(reference: string | null | undefined) {
    if (!reference) {
      return null
    }

    const normalizedReference = slugify(reference)

    return (
      contentLibrary.exercises.find((exercise) => {
        return [exercise.id, exercise.exerciseKey, exercise.name, ...exercise.aliases].some(
          (candidate) => slugify(candidate) === normalizedReference,
        )
      }) ?? null
    )
  }

  function closeExerciseDetails() {
    setSelectedExerciseId(null)
    setSelectedExerciseSubstitutionTarget(null)
  }

  function openExerciseDetails(
    exercise: Exercise | string,
    options?: WorkoutExerciseDetailsOptions,
  ) {
    const resolvedExercise =
      typeof exercise === 'string' ? findExerciseByReference(exercise) : exercise

    if (!resolvedExercise) {
      return
    }

    setSelectedProgramId(null)
    setSelectedExerciseId(resolvedExercise.id)
    setSelectedExerciseSubstitutionTarget(options?.substitutionTarget ?? null)
  }

  function substituteExerciseFromDetails(exerciseId: string) {
    if (!selectedExerciseSubstitutionTarget) {
      return
    }

    const replacementExercise = findExerciseByReference(exerciseId)

    if (!replacementExercise) {
      return
    }

    const didSubstitute =
      selectedExerciseSubstitutionTarget.actionKind === 'planned'
        ? substituteWorkoutExercise(selectedExerciseSubstitutionTarget.key, replacementExercise)
        : substituteWorkoutExtraExercise(
            selectedExerciseSubstitutionTarget.key,
            replacementExercise,
          )

    if (didSubstitute) {
      closeExerciseDetails()
    }
  }

  function isCustomExercise(exercise: Exercise) {
    return /custom/i.test(`${exercise.source.label} ${exercise.source.group}`)
  }

  function resolveExerciseForDisplay(exercise: {
    exerciseId: string | null
    exerciseName: string
    resolvedExerciseId: string | null
  }) {
    return (
      findExerciseByReference(exercise.resolvedExerciseId) ??
      findExerciseByReference(exercise.exerciseId) ??
      findExerciseByReference(exercise.exerciseName)
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <CirclePlay size={22} />
          </span>
          <div>
            <p className="kicker">Mobile Fitness Coach</p>
            <h1>Fitness Trainer</h1>
          </div>
        </div>
      </header>

      <main className="screen">
        {banner ? (
          <Banner
            durationMs={3200}
            key={banner.id}
            onDismiss={clearBanner}
            text={banner.text}
            tone={banner.tone}
          />
        ) : null}

        {!isAppReady ? (
          <section className="section-card">
            <div className="empty-state">
              <h3>Loading your data</h3>
              <p>Restoring programs, workout history, and local Dexie storage.</p>
            </div>
          </section>
        ) : null}

        {isAppReady && activeTab === 'progression' ? (
          <ProgressionPage
            bodyStatsEntries={bodyCompositionEntries}
            mainProgram={mainProgram}
            mainProgramStats={mainProgramStats}
            programProgression={
              <ProgramProgressionPanel
                exerciseStatsStore={exerciseStatsStore}
                fitnessProfile={fitnessProfile}
                mainProgram={mainProgram}
                mainProgramStats={mainProgramStats}
                onUpdateStatsPreferences={setStatsPreferences}
                programDayLogs={programDayLogs}
                statsPreferences={statsPreferences}
                workoutLogs={workoutLogs}
              />
            }
            bodyCompositionContent={
              <BodyCompositionPanel
                bodyStatsEntries={bodyCompositionEntries}
                fitnessProfile={fitnessProfile}
                onAddBodyStatsEntry={addBodyCompositionEntry}
                onRemoveBodyStatsEntry={removeBodyCompositionEntry}
                onUpdateStatsPreferences={setStatsPreferences}
                statsPreferences={statsPreferences}
              />
            }
          />
        ) : null}

        {isAppReady && activeTab === 'library' ? (
          <LibraryPage
            contentExercises={contentLibrary.exercises}
            customProgramCount={customAppPrograms.length}
            exerciseFilter={exerciseFilter}
            exerciseQuery={exerciseQuery}
            favoriteExerciseCount={savedExerciseIds.length}
            favoriteExerciseIdSet={savedExerciseIdSet}
            favoriteProgramCount={savedProgramIds.length}
            filteredExercises={filteredExercises}
            filteredPrograms={filteredPrograms}
            fitnessGender={fitnessProfile.gender}
            isCustomExercise={isCustomExercise}
            libraryView={libraryView}
            onCloneProgram={cloneProgram}
            onEditCustomProgram={editCustomProgram}
            onOpenExerciseDetails={openExerciseDetails}
            onOpenManualBuilder={openManualBuilder}
            onOpenProgram={openProgram}
            onSetExerciseFilter={setExerciseFilter}
            onSetExerciseQuery={setExerciseQuery}
            onSetLibraryView={(view) => navigate(getLibraryPath(view))}
            onSetProgramFilter={setProgramFilter}
            onSetProgramQuery={setProgramQuery}
            onStartWorkout={startWorkout}
            onToggleSavedExercise={toggleSavedExercise}
            onToggleSavedProgram={toggleSavedProgram}
            programFilter={programFilter}
            programQuery={programQuery}
            savedProgramIdSet={savedProgramIdSet}
          />
        ) : null}

        {isAppReady && activeTab === 'workout' ? (
          <WorkoutPage
            activeWorkout={activeWorkout}
            activeWorkoutExerciseLogs={activeWorkoutExerciseLogs}
            activeWorkoutExtraEntries={activeWorkoutExtraEntries}
            completionRatio={completionRatio}
            contentExercises={contentLibrary.exercises}
            exertionOptions={exertionOptions}
            fitnessProfile={fitnessProfile}
            handledPlannedExerciseCount={handledPlannedExerciseCount}
            isLaunchProgramComplete={isLaunchProgramComplete}
            isSelectedWorkoutActive={isSelectedWorkoutActive}
            isEditingCompletedWorkout={isEditingCompletedWorkout}
            onAddWorkoutExercise={addWorkoutExtraExercise}
            currentProgramRunStartedAt={currentProgramRunStartedAt}
            onAddWorkoutExerciseSet={addWorkoutExerciseSet}
            onAddWorkoutExtraExerciseSet={addWorkoutExtraExerciseSet}
            onCommitWorkoutExerciseSet={commitWorkoutExerciseSet}
            onCommitWorkoutExtraExerciseSet={commitWorkoutExtraExerciseSet}
            launchProgram={launchProgram}
            onCreateCustomWorkoutDay={createCustomWorkoutDay}
            onOpenExerciseDetails={openExerciseDetails}
            onOpenLibrary={openLibrary}
            onReorderWorkoutExercise={reorderWorkoutExercise}
            onRemoveWorkoutExercise={removeWorkoutExercise}
            onRemoveWorkoutExtraExercise={removeWorkoutExtraExercise}
            onRemoveWorkoutExerciseSetLog={removeWorkoutExerciseSetLog}
            onRemoveWorkoutExtraExerciseSetLog={removeWorkoutExtraExerciseSetLog}
            onSetSelectedWorkoutSectionId={selectWorkoutSection}
            onStartWorkout={startWorkout}
            onSubstituteWorkoutExercise={substituteWorkoutExercise}
            onSubstituteWorkoutExtraExercise={substituteWorkoutExtraExercise}
            onToggleWorkoutExercise={toggleWorkoutExercise}
            onToggleWorkoutExerciseSkipped={toggleWorkoutExerciseSkipped}
            onToggleWorkoutExtraExercise={toggleWorkoutExtraExercise}
            onToggleWorkoutExerciseSetSuboptimal={toggleWorkoutExerciseSetSuboptimal}
            onToggleWorkoutExtraExerciseSetSuboptimal={toggleWorkoutExtraExerciseSetSuboptimal}
            onUpdateWorkoutExerciseSetLog={updateWorkoutExerciseSetLog}
            onUpdateWorkoutExtraExerciseSetLog={updateWorkoutExtraExerciseSetLog}
            previewExerciseOrder={selectedWorkoutPreviewOrder}
            programDayLogs={programDayLogs}
            resolveExerciseStatsRecord={(exerciseId, exerciseName) =>
              resolveExerciseStatsRecord(exerciseStatsStore, exerciseId, exerciseName)
            }
            resolveExerciseForDisplay={resolveExerciseForDisplay}
            selectedWorkoutDay={selectedWorkoutDay}
            selectedWorkoutSection={selectedWorkoutSection}
            selectedWorkoutWeek={selectedWorkoutWeek}
            workoutLogs={workoutLogs}
            workoutWeeks={workoutWeeks}
          />
        ) : null}

        {isAppReady && activeTab === 'insights' ? (
          <InsightsPage
            bodyStatsEntries={bodyCompositionEntries}
            contentExercises={contentLibrary.exercises}
            draft={draft}
            exerciseStatsStore={exerciseStatsStore}
            fitnessProfile={fitnessProfile}
            insightsView={insightsView}
            isBuilderOpen={isBuilderOpen}
            mainProgram={mainProgram}
            onAddExerciseToSection={addExerciseToSection}
            onAddSectionToWeek={addSectionToWeek}
            onAddWeek={addWeek}
            onCloseBuilder={() => setIsBuilderOpen(false)}
            onMoveDraftExercise={moveDraftExercise}
            onReorderSection={reorderSection}
            onReorderWeek={reorderWeek}
            onRemoveWeek={removeWeek}
            onRemoveExerciseFromSection={removeExerciseFromSection}
            onRemoveSection={removeSection}
            onResetBuilder={() => {
              clearBanner()
              setDraft(createEmptyDraft())
            }}
            onSaveDraft={saveDraft}
            onSetInsightsView={(view: InsightsView) => navigate(getInsightsPath(view))}
            onUpdateDraftExercise={updateDraftExercise}
            onUpdateDraftField={updateDraftField}
            onUpdateSectionField={updateSectionField}
            programCompletionLogs={programCompletionLogs}
            programDayLogs={programDayLogs}
            programs={programs}
            workoutLogs={workoutLogs}
          />
        ) : null}

        {isAppReady && activeTab === 'settings' ? (
          <ProfilePage
            activityLevelLabel={activityLevelLabel}
            fitnessActivityLevelOptions={fitnessActivityLevelOptions}
            fitnessEffortScaleOptions={fitnessEffortScaleOptions}
            fitnessExperienceOptions={fitnessExperienceOptions}
            fitnessGoalOptions={fitnessGoalOptions}
            fitnessProfile={fitnessProfile}
            isMainProgramEmpty={isMainProgramEmpty}
            mainProgram={mainProgram}
            onChangeMainProgram={openMainProgramPicker}
            onOpenMainProgram={() => openProgram(mainProgram)}
            onResetProgressionData={() => {
              void resetProgressionData()
            }}
            onResetStoredData={() => {
              void resetStoredData()
            }}
            onUpdateFitnessProfile={updateFitnessProfile}
            onUpdateNumericFitnessProfileField={updateNumericFitnessProfileField}
            programCompletionLogs={programCompletionLogs}
            programDayLogs={programDayLogs}
            programs={programs}
          />
        ) : null}
      </main>

      {selectedProgram ? (
        <ProgramDetailSheet
          exercises={contentLibrary.exercises}
          gender={fitnessProfile.gender}
          isSaved={savedProgramIdSet.has(selectedProgram.id)}
          onCloneProgram={cloneProgram}
          onClose={() => setSelectedProgramId(null)}
          onDeleteCustomProgram={deleteCustomProgram}
          onEditCustomProgram={editCustomProgram}
          onOpenExerciseDetails={openExerciseDetails}
          onSelectProgramAsMain={selectProgramAsMain}
          onStartWorkout={startWorkout}
          onToggleSavedProgram={toggleSavedProgram}
          program={selectedProgram}
          resolveExerciseForDisplay={resolveExerciseForDisplay}
        />
      ) : null}

      {selectedExercise ? (
        <ExerciseDetailSheet
          alternatives={selectedExerciseAlternatives}
          exercise={selectedExercise}
          fitnessProfile={fitnessProfile}
          isSaved={savedExerciseIdSet.has(selectedExercise.id)}
          onClose={closeExerciseDetails}
          onSelectAlternative={setSelectedExerciseId}
          onSubstituteExercise={
            selectedExerciseSubstitutionTarget ? substituteExerciseFromDetails : undefined
          }
          onToggleSavedExercise={toggleSavedExercise}
          statsRecord={selectedExerciseStatsRecord}
          substitutionContext={
            selectedExerciseSubstitutionTarget
              ? {
                  currentExerciseId: selectedExerciseSubstitutionTarget.currentExerciseId,
                  targetLabel: selectedExerciseSubstitutionTarget.title,
                }
              : undefined
          }
        />
      ) : null}

      {isFinishWorkoutDialogOpen && activeWorkout ? (
        <FinishWorkoutDialog
          dayName={activeWorkout.sectionName}
          onClose={() => setIsFinishWorkoutDialogOpen(false)}
          onConfirm={finishWorkout}
          programName={activeWorkout.programName}
        />
      ) : null}

      {isStartWorkoutDialogOpen && !activeWorkout && launchProgram && selectedWorkoutSection ? (
        <StartWorkoutDialog
          dayName={selectedWorkoutSection.shortName || selectedWorkoutSection.name}
          onClose={() => setIsStartWorkoutDialogOpen(false)}
          onConfirm={() => startWorkout(launchProgram, selectedWorkoutSection.id)}
          programName={launchProgram.name}
        />
      ) : null}

      {releaseNoteBundle ? (
        <ReleaseNotesDialog bundle={releaseNoteBundle} onClose={closeReleaseNotes} />
      ) : null}

      <BottomNav
        activeTab={activeTab}
        canStartSelectedWorkout={canStartSelectedWorkout}
        hasActiveWorkout={Boolean(activeWorkout)}
        isWorkoutButtonHolding={isWorkoutButtonHolding}
        onOpenWorkout={handleWorkoutButtonClick}
        onSetActiveTab={(tab) => navigate(getPrimaryRoutePath(tab))}
        onWorkoutButtonContextMenu={(event) => event.preventDefault()}
        onWorkoutButtonPointerCancel={clearWorkoutButtonHold}
        onWorkoutButtonPointerDown={handleWorkoutButtonPressStart}
        onWorkoutButtonPointerLeave={clearWorkoutButtonHold}
        onWorkoutButtonPointerUp={clearWorkoutButtonHold}
        workoutNavStyle={workoutNavStyle}
        workoutButtonMode={workoutButtonMode}
      />
    </div>
  )
}

export default App
