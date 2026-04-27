import {
  startTransition,
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
import {
  createExerciseStatsStoreKey,
  type ExerciseStatsRecord,
  type ExerciseStatsStore,
} from './entities/exercise-stats'
import {
  markProgramSectionCompleted,
  markProgramSectionStarted,
  selectProgramSection,
  type ProgramProgressRecord,
} from './entities/program-progression'
import Banner from './components/Banner'
import BottomNav from './components/BottomNav'
import ExerciseDetailSheet from './components/ExerciseDetailSheet'
import FinishWorkoutDialog from './components/FinishWorkoutDialog'
import ProgramDetailSheet from './components/ProgramDetailSheet'
import StartWorkoutDialog from './components/StartWorkoutDialog'
import BodyCompositionPanel from './components/BodyCompositionPanel'
import ProgramProgressionPanel from './components/ProgramProgressionPanel'
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
  buildSectionMuscleProfile,
  createMuscleProfile,
  slugify,
} from './lib/muscles'
import {
  appendWorkoutStatistics,
  buildProgramDayLog,
  getSessionDateKey,
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
import { useAppStore } from './stores/useAppStore'

type ExerciseAlternativePreview = {
  canOpen: boolean
  description: string
  difficulty: string
  id: string
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

  const latestLoggedSectionId =
    [...programDayLogs]
      .filter((entry) => entry.programId === program.id)
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
  const [selectedWorkoutSectionId, setSelectedWorkoutSectionId] = useState<string | null>(null)
  const [workoutDayExerciseOrders, setWorkoutDayExerciseOrders] = useState<
    Record<string, string[]>
  >({})
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [isFinishWorkoutDialogOpen, setIsFinishWorkoutDialogOpen] = useState(false)
  const [isStartWorkoutDialogOpen, setIsStartWorkoutDialogOpen] = useState(false)
  const [isWorkoutButtonHolding, setIsWorkoutButtonHolding] = useState(false)
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
  const persistedWorkoutSectionId = resolvePersistedWorkoutSectionId(
    launchProgram,
    launchProgram ? (programProgressStore.byProgramId[launchProgram.id] ?? null) : null,
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
    selectedWorkoutDayFromState ??
    activeWorkoutDay ??
    fallbackWorkoutDay
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
  const activeWorkoutExerciseLogs = activeWorkout?.exerciseLogs ?? {}
  const activeWorkoutExtraEntries = activeWorkout?.extraEntries ?? []
  const customAppPrograms = programs.filter((program) => program.programSource === 'custom')
  const selectedExerciseAlternatives =
    selectedExercise?.substitutions.reduce<ExerciseAlternativePreview[]>(
      (alternatives, reference) => {
        const resolvedExercise = findExerciseByReference(reference)
        const nextId = resolvedExercise?.id ?? slugify(reference)

        if (!nextId || alternatives.some((alternative) => alternative.id === nextId)) {
          return alternatives
        }

        return [
          ...alternatives,
          {
            canOpen: Boolean(resolvedExercise),
            description:
              resolvedExercise?.description ??
              'Alternative reference imported from the exercise data.',
            difficulty: resolvedExercise?.difficulty ?? '',
            id: nextId,
            muscleGroups: resolvedExercise?.muscleGroups ?? [],
            name: resolvedExercise?.name ?? reference,
          },
        ]
      },
      [],
    ) ?? []

  useEffect(() => {
    void hydrateAppStore()
  }, [hydrateAppStore])

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

  const completedPlannedExerciseCount = activeProgramSession
    ? activeProgramSession.section.exercises.filter((exercise) => {
        return (
          activeWorkoutExerciseLogs[exercise.id]?.completed ||
          activeWorkout?.completedExerciseIds.includes(exercise.id)
        )
      }).length
    : 0
  const handledPlannedExerciseCount = activeProgramSession
    ? activeProgramSession.section.exercises.filter((exercise) => {
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
          Math.max(activeProgramSession.section.exercises.length, 1)) *
          100,
      )
    : 0
  const activityLevelLabel = findOptionLabel(
    fitnessActivityLevelOptions,
    fitnessProfile.activityLevel,
  )
  const selectedWorkoutTargetProfile = buildSectionMuscleProfile(
    selectedWorkoutSection,
    contentLibrary.exercises,
  )
  const completedWorkoutMuscles = createMuscleProfile([
    ...(activeProgramSession && isSelectedWorkoutActive
      ? activeProgramSession.section.exercises.flatMap((exercise) => {
          return activeWorkoutExerciseLogs[exercise.id]?.completed ||
            activeWorkout?.completedExerciseIds.includes(exercise.id)
            ? (resolveExerciseForDisplay(exercise)?.muscleGroups ?? [])
            : []
        })
      : []),
    ...activeWorkoutExtraEntries.flatMap((entry) => {
      return entry.completed && entry.type !== 'cardio' ? entry.muscleGroups : []
    }),
  ])
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

  function selectProgramAsMain(program: AppProgram) {
    setMainProgramId(program.id)
    rememberProgram(program.id)
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
      navigate(getPrimaryRoutePath('insights'))
    })
  }

  function openLibrary(view: LibraryView = 'home') {
    startTransition(() => {
      navigate(getLibraryPath(view))
    })
  }

  function openMainProgramPicker() {
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

  function addSection() {
    setDraft((currentDraft) => ({
      ...currentDraft,
      sections: [
        ...currentDraft.sections,
        {
          ...createEmptySection(),
          name: `Session ${currentDraft.sections.length + 1}`,
        },
      ],
    }))
  }

  function removeSection(sectionId: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      sections:
        currentDraft.sections.length > 1
          ? currentDraft.sections.filter((section) => section.id !== sectionId)
          : currentDraft.sections,
    }))
  }

  function addExerciseToSection(sectionId: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      sections: currentDraft.sections.map((section) => {
        if (section.id !== sectionId) {
          return section
        }

        return {
          ...section,
          exercises: [...section.exercises, createEmptyExercise()],
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

            return {
              ...exercise,
              [field]: value,
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

    const savedProgram = draftToCustomProgram(draft, customPrograms)

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
    selectProgramAsMain(program)
    setSelectedProgramId(program.id)
  }

  function openWorkoutScreen() {
    startTransition(() => {
      if (activeWorkout?.sectionId) {
        selectWorkoutSection(activeWorkout.sectionId, activeProgramSession?.program ?? launchProgram)
      }
      setSelectedProgramId(null)
      navigate(getPrimaryRoutePath('workout'))
    })
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
        openWorkoutScreen()
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

    selectProgramAsMain(program)
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
    openWorkoutScreen()
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

  function addWorkoutExerciseSet(exerciseId: string) {
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
              Math.max(1, currentLog.setLogs.length) + 1,
            ),
            skipped: false,
            skippedAt: null,
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

  function substituteWorkoutExercise(exerciseId: string, exercise: Exercise) {
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
      !window.confirm(
        `Replace "${currentLog?.exerciseName ?? 'this exercise'}" with "${exercise.name}" and clear the logged responses for this row?`,
      )
    ) {
      return
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
              type: 'planned',
            }),
          },
        },
        completedExerciseIds: currentWorkout.completedExerciseIds.filter((id) => id !== exerciseId),
      }
    })
    showBanner('success', `Substituted with ${exercise.name}.`)
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

  function substituteWorkoutExtraExercise(logId: string, exercise: Exercise) {
    if (!activeWorkout) {
      return
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
      return
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
              type: 'extra-exercise',
            }),
          }
        }),
      }
    })
    showBanner('success', `Substituted with ${exercise.name}.`)
  }

  function addWorkoutExtraExerciseSet(logId: string) {
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
            firstLoggedAt: entry.firstLoggedAt ?? loggedAt,
            lastLoggedAt: loggedAt,
            setLogs: ensureWorkoutSetLogs(
              entry.setLogs,
              Math.max(1, entry.setLogs.length) + 1,
            ),
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
      totalExerciseCount: activeProgramSession.section.exercises.length,
      notes: activeWorkout.notes.trim(),
    }
    const programDayLog = buildProgramDayLog(
      activeWorkout,
      orderedWorkoutEntries,
      finishedAt,
      durationMinutes,
      completedPlannedExerciseCount,
      activeProgramSession.section.exercises.length,
    )

    setWorkoutLogs((currentWorkoutLogs) => [workoutLog, ...currentWorkoutLogs])
    setExerciseStatsStore((currentStore) =>
      appendWorkoutStatistics(currentStore, activeWorkout, orderedWorkoutEntries, finishedAt),
    )
    setProgramDayLogs((currentLogs) => [programDayLog, ...currentLogs])
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
    const nextWorkoutDay = getNextWorkoutDayOption(
      activeProgramSession.program,
      activeWorkout.sectionId,
    )
    setActiveWorkout(null)
    setIsFinishWorkoutDialogOpen(false)
    setProgramProgressStore((currentStore) =>
      markProgramSectionCompleted(currentStore, {
        at: finishedAt,
        completedSectionId: activeWorkout.sectionId,
        nextSectionId: nextWorkoutDay?.section.id ?? null,
        programId: activeWorkout.programId,
      }),
    )
    setSelectedWorkoutSectionId(nextWorkoutDay?.section.id ?? activeWorkout.sectionId)
    clearWorkoutButtonHold()
    showBanner(
      'success',
      nextWorkoutDay
        ? `Workout complete: ${activeWorkout.programName}. Next selected: ${nextWorkoutDay.section.shortName || nextWorkoutDay.section.name}.`
        : `Workout complete: ${activeWorkout.programName}.`,
    )
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

  function openExerciseDetails(exercise: Exercise | string) {
    const resolvedExercise =
      typeof exercise === 'string' ? findExerciseByReference(exercise) : exercise

    if (!resolvedExercise) {
      return
    }

    setSelectedProgramId(null)
    setSelectedExerciseId(resolvedExercise.id)
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
            completedWorkoutMuscles={completedWorkoutMuscles}
            exertionOptions={exertionOptions}
            fitnessProfile={fitnessProfile}
            handledPlannedExerciseCount={handledPlannedExerciseCount}
            isSelectedWorkoutActive={isSelectedWorkoutActive}
            onAddWorkoutExercise={addWorkoutExtraExercise}
            onAddWorkoutExerciseSet={addWorkoutExerciseSet}
            onAddWorkoutExtraExerciseSet={addWorkoutExtraExerciseSet}
            launchProgram={launchProgram}
            onOpenExerciseDetails={openExerciseDetails}
            onOpenLibrary={openLibrary}
            onReorderWorkoutExercise={reorderWorkoutExercise}
            onRemoveWorkoutExtraExercise={removeWorkoutExtraExercise}
            onSetSelectedWorkoutSectionId={selectWorkoutSection}
            onStartWorkout={startWorkout}
            onSubstituteWorkoutExercise={substituteWorkoutExercise}
            onSubstituteWorkoutExtraExercise={substituteWorkoutExtraExercise}
            onToggleWorkoutExercise={toggleWorkoutExercise}
            onToggleWorkoutExerciseSkipped={toggleWorkoutExerciseSkipped}
            onToggleWorkoutExtraExercise={toggleWorkoutExtraExercise}
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
            selectedWorkoutTargetProfile={selectedWorkoutTargetProfile}
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
            onAddSection={addSection}
            onCloseBuilder={() => setIsBuilderOpen(false)}
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
            programDayLogs={programDayLogs}
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
          gender={fitnessProfile.gender}
          isSaved={savedExerciseIdSet.has(selectedExercise.id)}
          onClose={() => setSelectedExerciseId(null)}
          onSelectAlternative={setSelectedExerciseId}
          onToggleSavedExercise={toggleSavedExercise}
          statsRecord={selectedExerciseStatsRecord}
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
