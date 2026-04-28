import { useEffect, useMemo, useRef, useState } from 'react'
import type { Slug } from '@mjcdev/react-body-highlighter'
import { CalendarDays, CalendarRange, LibraryBig } from 'lucide-react'
import FloatingSessionBar from '../components/FloatingSessionBar'
import MuscleVisualizer from '../components/MuscleVisualizer'
import WorkoutDayPickerSheet from '../components/WorkoutDayPickerSheet'
import WorkoutExercisePickerSheet from '../components/WorkoutExercisePickerSheet'
import WorkoutExerciseTable from '../components/WorkoutExerciseTable'
import { muscleLabels } from '../lib/muscles'
import type { ExerciseStatsRecord } from '../entities/exercise-stats'
import {
  mapBodySlugToExerciseMuscleGroups,
  normalizeExerciseMuscleGroup,
} from '../entities/exercise-muscles'
import type {
  AppProgram,
  WorkoutDayPreview,
  WorkoutDayOption,
  WorkoutWeekGroup,
} from '../lib/app-types'
import type { Exercise } from '../lib/content'
import type { FitnessProfile } from '../lib/fitness-profile'
import type { MuscleProfile } from '../lib/muscles'
import type {
  ActiveWorkout,
  WorkoutExerciseLogEntry,
  WorkoutLog,
  WorkoutSetLogEntry,
} from '../lib/user-data'

type WorkoutPageProps = {
  activeWorkout: ActiveWorkout | null
  activeWorkoutExerciseLogs: Record<string, WorkoutExerciseLogEntry>
  activeWorkoutExtraEntries: WorkoutExerciseLogEntry[]
  completionRatio: number
  contentExercises: Exercise[]
  completedWorkoutMuscles: MuscleProfile
  exertionOptions: string[]
  fitnessProfile: FitnessProfile
  handledPlannedExerciseCount: number
  isSelectedWorkoutActive: boolean
  launchProgram: AppProgram | null
  onAddWorkoutExercise: (exercise: Exercise) => void
  onAddWorkoutExerciseSet: (exerciseId: string) => void
  onAddWorkoutExtraExerciseSet: (logId: string) => void
  onOpenExerciseDetails: (exercise: Exercise) => void
  onOpenLibrary: (view: 'home' | 'programs' | 'exercises') => void
  onReorderWorkoutExercise: (
    draggedLogId: string,
    targetLogId: string,
    position: 'before' | 'after',
  ) => void
  onRemoveWorkoutExtraExercise: (logId: string) => void
  onSetSelectedWorkoutSectionId: (sectionId: string | null) => void
  onStartWorkout: (program: AppProgram, sectionId: string) => void
  onSubstituteWorkoutExercise: (exerciseId: string, exercise: Exercise) => void
  onSubstituteWorkoutExtraExercise: (logId: string, exercise: Exercise) => void
  onToggleWorkoutExercise: (exerciseId: string) => void
  onToggleWorkoutExerciseSkipped: (exerciseId: string) => void
  onToggleWorkoutExtraExercise: (logId: string) => void
  onUpdateWorkoutExerciseSetLog: (
    exerciseId: string,
    setIndex: number,
    field: keyof WorkoutSetLogEntry,
    value: string,
  ) => void
  onUpdateWorkoutExtraExerciseSetLog: (
    logId: string,
    setIndex: number,
    field: keyof WorkoutSetLogEntry,
    value: string,
  ) => void
  previewExerciseOrder: string[]
  programDayLogs: { completedAt: string; programId: string; sectionId: string }[]
  resolveExerciseStatsRecord: (
    exerciseId: string | null,
    exerciseName: string,
  ) => ExerciseStatsRecord | null
  resolveExerciseForDisplay: (exercise: {
    exerciseId: string | null
    exerciseName: string
    resolvedExerciseId: string | null
  }) => Exercise | null
  selectedWorkoutDay: WorkoutDayOption | null
  selectedWorkoutSection: AppProgram['sections'][number] | null
  selectedWorkoutTargetProfile: MuscleProfile
  selectedWorkoutWeek: WorkoutWeekGroup | null
  workoutLogs: WorkoutLog[]
  workoutWeeks: WorkoutWeekGroup[]
}

function countPerformedSetLogs(setLogs: WorkoutSetLogEntry[]) {
  return setLogs.reduce((count, setLog) => {
    return setLog.duration.trim() ||
      setLog.weightKg.trim() ||
      setLog.reps.trim() ||
      setLog.effort.trim()
      ? count + 1
      : count
  }, 0)
}

function createReadOnlyWorkoutFromLog(workoutLog: WorkoutLog): ActiveWorkout {
  const exerciseLogs = workoutLog.exerciseLogs.reduce<
    Record<string, WorkoutExerciseLogEntry>
  >((logs, entry) => {
    if (entry.type !== 'planned') {
      return logs
    }

    const exerciseId = entry.plannedExerciseId ?? entry.logId

    if (exerciseId) {
      logs[exerciseId] = entry
    }

    return logs
  }, {})
  const extraEntries = workoutLog.exerciseLogs.filter((entry) => entry.type !== 'planned')
  const exerciseOrder = workoutLog.exerciseLogs
    .map((entry) => (entry.type === 'planned' ? entry.plannedExerciseId ?? entry.logId : entry.logId))
    .filter(Boolean)

  return {
    completedExerciseIds: Object.entries(exerciseLogs)
      .filter(([, entry]) => entry.completed)
      .map(([exerciseId]) => exerciseId),
    exerciseLogs,
    exerciseOrder,
    exertionScale: workoutLog.exertionScale,
    extraEntries,
    notes: workoutLog.notes,
    programId: workoutLog.programId,
    programName: workoutLog.programName,
    programSource: workoutLog.programSource,
    sectionId: workoutLog.sectionId,
    sectionName: workoutLog.sectionName,
    sessionId: workoutLog.id,
    startedAt: workoutLog.startedAt,
    updatedAt: workoutLog.completedAt,
  }
}

type RestTimerSession = {
  endsAt: number
  exerciseName: string
  id: string
  restLabel: string
  setNumber: number
  startedAt: number
  totalDurationMs: number
}

function formatCountdownLabel(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function parseRestLabelToSeconds(value: string) {
  const normalizedValue = value.trim().toLowerCase()

  if (!normalizedValue) {
    return null
  }

  const colonMatch = normalizedValue.match(/^(\d{1,2}):(\d{2})$/)

  if (colonMatch) {
    return Number(colonMatch[1]) * 60 + Number(colonMatch[2])
  }

  const rangeMatch = normalizedValue.match(
    /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)(?:\s*)(min|mins|minute|minutes|sec|secs|second|seconds|s|m)\b/,
  )

  if (rangeMatch) {
    const upperBound = Number(rangeMatch[2])
    const unit = rangeMatch[3]
    return /min|m\b/.test(unit) ? Math.round(upperBound * 60) : Math.round(upperBound)
  }

  const tokenMatches = [...normalizedValue.matchAll(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes|s|sec|secs|second|seconds)\b/g)]

  if (tokenMatches.length > 0) {
    const totalSeconds = tokenMatches.reduce((total, match) => {
      const amount = Number(match[1])
      const unit = match[2]

      if (/^h|hr/.test(unit)) {
        return total + amount * 3600
      }

      if (/^m|min/.test(unit)) {
        return total + amount * 60
      }

      return total + amount
    }, 0)

    return totalSeconds > 0 ? Math.round(totalSeconds) : null
  }

  return null
}

export default function WorkoutPage({
  activeWorkout,
  activeWorkoutExerciseLogs,
  activeWorkoutExtraEntries,
  completionRatio,
  contentExercises,
  completedWorkoutMuscles,
  exertionOptions,
  fitnessProfile,
  handledPlannedExerciseCount,
  isSelectedWorkoutActive,
  launchProgram,
  onAddWorkoutExercise,
  onAddWorkoutExerciseSet,
  onAddWorkoutExtraExerciseSet,
  onOpenExerciseDetails,
  onOpenLibrary,
  onReorderWorkoutExercise,
  onRemoveWorkoutExtraExercise,
  onSetSelectedWorkoutSectionId,
  onStartWorkout,
  onSubstituteWorkoutExercise,
  onSubstituteWorkoutExtraExercise,
  onToggleWorkoutExercise,
  onToggleWorkoutExerciseSkipped,
  onToggleWorkoutExtraExercise,
  onUpdateWorkoutExerciseSetLog,
  onUpdateWorkoutExtraExerciseSetLog,
  previewExerciseOrder,
  programDayLogs,
  resolveExerciseStatsRecord,
  resolveExerciseForDisplay,
  selectedWorkoutDay,
  selectedWorkoutSection,
  selectedWorkoutTargetProfile,
  selectedWorkoutWeek,
  workoutLogs,
  workoutWeeks,
}: WorkoutPageProps) {
  const [pickerMode, setPickerMode] = useState<'days' | 'weeks' | null>(null)
  const [selectedQuickAddMuscle, setSelectedQuickAddMuscle] = useState<Slug | null>(null)
  const [restTimerSession, setRestTimerSession] = useState<RestTimerSession | null>(null)
  const [restTimerNow, setRestTimerNow] = useState(() => Date.now())
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null)
  const restTimerAlertRef = useRef<{
    completionNotified: boolean
    warningNotified: boolean
    timerId: string | null
  }>({
    completionNotified: false,
    warningNotified: false,
    timerId: null,
  })
  const defaultMuscleView = isSelectedWorkoutActive ? 'completed' : 'planned'
  const muscleViewKey = `${selectedWorkoutSection?.id ?? 'none'}:${defaultMuscleView}`
  const [muscleViewState, setMuscleViewState] = useState<{
    key: string
    value: 'completed' | 'planned'
  }>({
    key: muscleViewKey,
    value: defaultMuscleView,
  })
  const muscleView =
    muscleViewState.key === muscleViewKey ? muscleViewState.value : defaultMuscleView
  const visibleMuscleView =
    isSelectedWorkoutActive && muscleView === 'completed' ? 'completed' : 'planned'
  const workoutDayLabel = useMemo(() => {
    if (!selectedWorkoutDay) {
      return null
    }

    return `${selectedWorkoutDay.weekLabel} / ${selectedWorkoutDay.dayLabel}`
  }, [selectedWorkoutDay])
  const startThisDayAction =
    launchProgram && selectedWorkoutSection && !isSelectedWorkoutActive
      ? () => onStartWorkout(launchProgram, selectedWorkoutSection.id)
      : null
  const quickAddExercises = useMemo(() => {
    if (!selectedQuickAddMuscle) {
      return []
    }

    const matchingMuscleGroups = new Set(mapBodySlugToExerciseMuscleGroups(selectedQuickAddMuscle))
    const matchesSelectedMuscle = (muscleGroups: string[]) =>
      muscleGroups.some((muscleGroup) => {
        const normalizedMuscleGroup = normalizeExerciseMuscleGroup(muscleGroup)
        return normalizedMuscleGroup ? matchingMuscleGroups.has(normalizedMuscleGroup) : false
      })

    return [...contentExercises]
      .filter((exercise) => matchesSelectedMuscle(exercise.muscleGroups))
      .sort((left, right) => {
        const leftPrimaryHit = matchesSelectedMuscle(
          left.primaryTargetMuscleGroups.map((entry) => entry.muscleGroup),
        )
        const rightPrimaryHit = matchesSelectedMuscle(
          right.primaryTargetMuscleGroups.map((entry) => entry.muscleGroup),
        )

        if (leftPrimaryHit !== rightPrimaryHit) {
          return leftPrimaryHit ? -1 : 1
        }

        return left.name.localeCompare(right.name)
      })
  }, [contentExercises, selectedQuickAddMuscle])
  const activeRestTimer =
    restTimerSession && restTimerNow < restTimerSession.endsAt
      ? restTimerSession
      : restTimerSession
  const remainingRestMs = activeRestTimer
    ? Math.max(0, activeRestTimer.endsAt - restTimerNow)
    : 0
  const restTimerView = activeRestTimer
    ? {
        exerciseName: activeRestTimer.exerciseName,
        isComplete: remainingRestMs <= 0,
        isWarning: remainingRestMs > 0 && remainingRestMs <= 10_000,
        remainingLabel:
          remainingRestMs <= 0
            ? 'Done'
            : formatCountdownLabel(Math.ceil(remainingRestMs / 1000)),
        setNumber: activeRestTimer.setNumber,
        totalProgressPercent:
          activeRestTimer.totalDurationMs > 0
            ? (remainingRestMs / activeRestTimer.totalDurationMs) * 100
            : 0,
      }
    : null

  useEffect(() => {
    if (!restTimerSession) {
      return
    }

    const tick = window.setInterval(() => {
      setRestTimerNow(Date.now())
    }, 250)

    return () => window.clearInterval(tick)
  }, [restTimerSession])

  useEffect(() => {
    if (!restTimerSession) {
      restTimerAlertRef.current = {
        completionNotified: false,
        warningNotified: false,
        timerId: null,
      }
      return
    }

    if (restTimerAlertRef.current.timerId !== restTimerSession.id) {
      restTimerAlertRef.current = {
        completionNotified: false,
        warningNotified: false,
        timerId: restTimerSession.id,
      }
    }

    if (
      restTimerView?.isWarning &&
      !restTimerAlertRef.current.warningNotified &&
      'vibrate' in navigator
    ) {
      navigator.vibrate?.(120)
      restTimerAlertRef.current.warningNotified = true
    }

    if (restTimerView?.isComplete && !restTimerAlertRef.current.completionNotified) {
      if ('vibrate' in navigator) {
        navigator.vibrate?.([160, 90, 160, 90, 220])
      }

      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted' &&
        document.visibilityState !== 'visible'
      ) {
        new Notification('Rest complete', {
          body: `${restTimerSession.exerciseName} • Set ${restTimerSession.setNumber}`,
          tag: restTimerSession.id,
        })
      }

      restTimerAlertRef.current.completionNotified = true
    }
  }, [restTimerSession, restTimerView])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const defaultTitle = 'Fitness Trainer'

    if (!restTimerView) {
      document.title = defaultTitle
      return
    }

    document.title = restTimerView.isComplete
      ? `Rest done • ${restTimerView.exerciseName}`
      : `${restTimerView.remainingLabel} • ${restTimerView.exerciseName}`

    return () => {
      document.title = defaultTitle
    }
  }, [restTimerView])

  useEffect(() => {
    const wakeLockApi = (navigator as Navigator & {
      wakeLock?: {
        request: (type: 'screen') => Promise<{ release: () => Promise<void> }>
      }
    }).wakeLock

    if (!restTimerSession || !wakeLockApi) {
      void wakeLockRef.current?.release?.()
      wakeLockRef.current = null
      return
    }

    let isCancelled = false

    void wakeLockApi
      .request('screen')
      .then((lock) => {
        if (isCancelled) {
          void lock.release()
          return
        }

        wakeLockRef.current = lock
      })
      .catch(() => undefined)

    return () => {
      isCancelled = true

      if (wakeLockRef.current) {
        void wakeLockRef.current.release()
        wakeLockRef.current = null
      }
    }
  }, [restTimerSession])
  const workoutDayPreviewBySectionId = useMemo<Record<string, WorkoutDayPreview>>(() => {
    if (!launchProgram) {
      return {}
    }

    const latestCompletionBySectionId = programDayLogs
      .filter((entry) => entry.programId === launchProgram.id)
      .reduce<Record<string, string>>((entries, entry) => {
        const currentCompletedAt = entries[entry.sectionId]

        if (!currentCompletedAt || currentCompletedAt.localeCompare(entry.completedAt) < 0) {
          entries[entry.sectionId] = entry.completedAt
        }

        return entries
      }, {})

    const latestWorkoutLogBySectionId = workoutLogs
      .filter((entry) => entry.programId === launchProgram.id)
      .reduce<Record<string, WorkoutLog>>((entries, entry) => {
        const currentEntry = entries[entry.sectionId]

        if (!currentEntry || currentEntry.completedAt.localeCompare(entry.completedAt) < 0) {
          entries[entry.sectionId] = entry
        }

        return entries
      }, {})

    return workoutWeeks
      .flatMap((week) => week.dayOptions)
      .reduce<Record<string, WorkoutDayPreview>>((previews, day) => {
        const section = day.section
        const currentActiveWorkout = activeWorkout
        const isActive =
          currentActiveWorkout !== null &&
          currentActiveWorkout.programId === launchProgram.id &&
          currentActiveWorkout.sectionId === section.id
        const latestWorkoutLog = latestWorkoutLogBySectionId[section.id] ?? null
        const latestCompletedAt = latestCompletionBySectionId[section.id] ?? null
        const latestPlannedLogByExerciseId = latestWorkoutLog
          ? latestWorkoutLog.exerciseLogs.reduce<Record<string, WorkoutExerciseLogEntry>>(
              (entries, log) => {
                if (log.type !== 'planned') {
                  return entries
                }

                const exerciseId = log.plannedExerciseId ?? log.logId

                if (exerciseId && !entries[exerciseId]) {
                  entries[exerciseId] = log
                }

                return entries
              },
              {},
            )
          : {}

        const plannedExercisePreviews = section.exercises.map((exercise) => {
          const log = isActive
            ? activeWorkoutExerciseLogs[exercise.id] ?? null
            : latestPlannedLogByExerciseId[exercise.id] ?? null
          const performedSetCount = countPerformedSetLogs(log?.setLogs ?? [])

          return {
            completed: log?.completed ?? false,
            exerciseId: exercise.id,
            hasLoggedSets: performedSetCount > 0,
            name: log?.exerciseName ?? exercise.exerciseName,
            performedSetCount,
            skipped: log?.skipped ?? false,
            type: 'planned' as const,
          }
        })

        const extraExercisePreviews = (isActive
          ? currentActiveWorkout?.extraEntries ?? activeWorkoutExtraEntries
          : latestWorkoutLog?.exerciseLogs.filter((entry) => entry.type !== 'planned') ?? []
        ).map((entry) => ({
          completed: entry.completed,
          exerciseId: entry.logId,
          hasLoggedSets: countPerformedSetLogs(entry.setLogs) > 0,
          name: entry.exerciseName,
          performedSetCount: countPerformedSetLogs(entry.setLogs),
          skipped: entry.skipped,
          type: entry.type,
        }))

        const completedExerciseCount = plannedExercisePreviews.filter(
          (entry) => entry.completed,
        ).length
        const skippedExerciseCount = plannedExercisePreviews.filter((entry) => entry.skipped).length
        const performedExerciseCount = plannedExercisePreviews.filter((entry) => {
          return entry.completed || entry.skipped || entry.hasLoggedSets
        }).length

        previews[section.id] = {
          completedAt: isActive ? null : latestCompletedAt ?? latestWorkoutLog?.completedAt ?? null,
          completedExerciseCount,
          exercisePreviews: [...plannedExercisePreviews, ...extraExercisePreviews],
          extraEntryCount: extraExercisePreviews.length,
          isActive,
          isComplete: isActive
            ? completedExerciseCount >= section.exercises.length && section.exercises.length > 0
            : Boolean(latestCompletedAt),
          performedExerciseCount,
          plannedExerciseCount: section.exercises.length,
          skippedExerciseCount,
        }

        return previews
      }, {})
  }, [
    activeWorkout,
    activeWorkoutExerciseLogs,
    activeWorkoutExtraEntries,
    launchProgram,
    programDayLogs,
    workoutLogs,
    workoutWeeks,
  ])
  const latestSelectedWorkoutLog = useMemo(() => {
    if (!launchProgram || !selectedWorkoutSection || isSelectedWorkoutActive) {
      return null
    }

    return (
      workoutLogs
        .filter((entry) => {
          return (
            entry.programId === launchProgram.id &&
            entry.sectionId === selectedWorkoutSection.id
          )
        })
        .sort((left, right) => right.completedAt.localeCompare(left.completedAt))[0] ?? null
    )
  }, [isSelectedWorkoutActive, launchProgram, selectedWorkoutSection, workoutLogs])
  const readOnlySelectedWorkout = useMemo(() => {
    return latestSelectedWorkoutLog
      ? createReadOnlyWorkoutFromLog(latestSelectedWorkoutLog)
      : null
  }, [latestSelectedWorkoutLog])
  const displayWorkout = isSelectedWorkoutActive ? activeWorkout : readOnlySelectedWorkout
  const displayWorkoutExerciseLogs = displayWorkout?.exerciseLogs ?? {}
  const displayWorkoutExtraEntries = displayWorkout?.extraEntries ?? []

  function dismissRestTimer() {
    setRestTimerSession(null)
    setRestTimerNow(Date.now())
  }

  function handleCommitWorkoutSet(setDetails: {
    exerciseName: string
    rest: string
    setIndex: number
    setLog: WorkoutSetLogEntry
  }) {
    const hasSetContent =
      setDetails.setLog.duration.trim() ||
      setDetails.setLog.weightKg.trim() ||
      setDetails.setLog.reps.trim() ||
      setDetails.setLog.effort.trim()

    if (!hasSetContent) {
      return
    }

    const restSeconds = parseRestLabelToSeconds(setDetails.rest)

    if (!restSeconds || restSeconds <= 0) {
      dismissRestTimer()
      return
    }

    const startedAt = Date.now()
    const totalDurationMs = restSeconds * 1000

    setRestTimerNow(startedAt)
    setRestTimerSession({
      endsAt: startedAt + totalDurationMs,
      exerciseName: setDetails.exerciseName,
      id: `${setDetails.exerciseName}-${setDetails.setIndex + 1}-${startedAt}`,
      restLabel: setDetails.rest,
      setNumber: setDetails.setIndex + 1,
      startedAt,
      totalDurationMs,
    })
  }

  if (!launchProgram || !selectedWorkoutSection || !selectedWorkoutWeek) {
    return (
      <section className="launchpad-card workout-empty-card">
        <div className="section-header launchpad-header">
          <div>
            <p className="kicker">Workout</p>
            <h2>No main program selected</h2>
            <p className="muted">
              Pick a program from the library to unlock the week and day workflow.
            </p>
          </div>
        </div>

        <div className="row-actions">
          <button
            type="button"
            className="primary-button icon-button"
            onClick={() => onOpenLibrary('programs')}
          >
            <LibraryBig size={16} />
            <span>Choose program</span>
          </button>
        </div>
      </section>
    )
  }

  return (
    <>
      <FloatingSessionBar
        completedExerciseCount={handledPlannedExerciseCount}
        completionRatio={completionRatio}
        isSelectedWorkoutActive={isSelectedWorkoutActive}
        launchProgram={launchProgram}
        onDismissRestTimer={dismissRestTimer}
        restTimer={restTimerView}
        selectedWorkoutSectionName={selectedWorkoutSection.shortName || selectedWorkoutSection.name}
        totalExerciseCount={selectedWorkoutSection.exercises.length}
      />

      {startThisDayAction ? (
        <button
          type="button"
          className="primary-button workout-start-day-button"
          onClick={startThisDayAction}
        >
          Start this day
        </button>
      ) : null}

      <MuscleVisualizer
        centerHeader
        compact
        className="workout-day-visualizer workout-day-visualizer--focused"
        detailSheetDescription={
          visibleMuscleView === 'completed'
            ? 'All muscle groups hit by exercises already completed during this day.'
            : 'All muscle groups this day is designed to target.'
        }
        detailsMode="sheet"
        gender={fitnessProfile.gender}
        headerLeading={
          <button
            type="button"
            className="chip-button icon-button workout-visualizer-toolbar__button workout-visualizer-toolbar__button--round"
            onClick={() => setPickerMode('weeks')}
            aria-label="Choose week"
            title="Choose week"
          >
            <CalendarRange size={15} />
          </button>
        }
        headerTrailing={
          <button
            type="button"
            className="chip-button icon-button workout-visualizer-toolbar__button workout-visualizer-toolbar__button--round"
            onClick={() => setPickerMode('days')}
            aria-label="Choose day"
            title="Choose day"
          >
            <CalendarDays size={15} />
          </button>
        }
        kicker={workoutDayLabel ?? 'Workout muscles'}
        intensityLegendLabel="Blue means lighter relative activation in this day view, while warm orange and gold highlight the most-hit muscle groups."
        onSelectMuscle={(slug) => {
          console.debug('[WorkoutPage] onSelectMuscle received', {
            isSelectedWorkoutActive,
            slug,
            workoutDayLabel,
          })

          if (!isSelectedWorkoutActive) {
            console.debug('[WorkoutPage] ignoring selected muscle because workout is not active', {
              slug,
              workoutDayLabel,
            })
            return
          }

          console.debug('[WorkoutPage] opening quick add sheet for muscle', {
            matchCount: quickAddExercises.length,
            slug,
            workoutDayLabel,
          })
          setSelectedQuickAddMuscle(slug)
        }}
        showIntensityLegend
        showSheetPreview={false}
        toolbar={
          <div className="workout-visualizer-toolbar">
            <div className="segmented-control segmented-control--two workout-coverage-toggle">
              <button
                type="button"
                className={visibleMuscleView === 'planned' ? 'is-active' : ''}
                onClick={() =>
                  setMuscleViewState({
                    key: muscleViewKey,
                    value: 'planned',
                  })
                }
              >
                All targeted
              </button>
              <button
                type="button"
                className={visibleMuscleView === 'completed' ? 'is-active' : ''}
                onClick={() =>
                  setMuscleViewState({
                    key: muscleViewKey,
                    value: 'completed',
                  })
                }
                disabled={!isSelectedWorkoutActive}
              >
                Covered so far
              </button>
            </div>
          </div>
        }
        profile={
          visibleMuscleView === 'completed'
            ? completedWorkoutMuscles
            : selectedWorkoutTargetProfile
        }
        title={visibleMuscleView === 'completed' ? 'Covered muscles' : 'Target muscles'}
      />

      <WorkoutExerciseTable
        activeWorkout={isSelectedWorkoutActive ? activeWorkout : null}
        activeWorkoutExerciseLogs={isSelectedWorkoutActive ? activeWorkoutExerciseLogs : {}}
        activeWorkoutExtraEntries={isSelectedWorkoutActive ? activeWorkoutExtraEntries : []}
        contentExercises={contentExercises}
        displayWorkoutExerciseLogs={displayWorkoutExerciseLogs}
        displayWorkoutExerciseOrder={displayWorkout?.exerciseOrder}
        displayWorkoutExtraEntries={displayWorkoutExtraEntries}
        effortScale={fitnessProfile.effortScale}
        exertionOptions={exertionOptions}
        isSelectedWorkoutActive={isSelectedWorkoutActive}
        onAddWorkoutExercise={onAddWorkoutExercise}
        onAddWorkoutExerciseSet={onAddWorkoutExerciseSet}
        onAddWorkoutExtraExerciseSet={onAddWorkoutExtraExerciseSet}
        onCommitWorkoutSet={handleCommitWorkoutSet}
        onOpenExerciseDetails={onOpenExerciseDetails}
        onReorderWorkoutExercise={onReorderWorkoutExercise}
        onRemoveWorkoutExtraExercise={onRemoveWorkoutExtraExercise}
        onSubstituteWorkoutExercise={onSubstituteWorkoutExercise}
        onSubstituteWorkoutExtraExercise={onSubstituteWorkoutExtraExercise}
        onToggleWorkoutExercise={onToggleWorkoutExercise}
        onToggleWorkoutExerciseSkipped={onToggleWorkoutExerciseSkipped}
        onToggleWorkoutExtraExercise={onToggleWorkoutExtraExercise}
        onUpdateWorkoutExerciseSetLog={onUpdateWorkoutExerciseSetLog}
        onUpdateWorkoutExtraExerciseSetLog={onUpdateWorkoutExtraExerciseSetLog}
        previewExerciseOrder={previewExerciseOrder}
        resolveExerciseStatsRecord={resolveExerciseStatsRecord}
        resolveExerciseForDisplay={resolveExerciseForDisplay}
        section={selectedWorkoutSection}
      />

      {pickerMode ? (
        <WorkoutDayPickerSheet
          mode={pickerMode}
          onClose={() => setPickerMode(null)}
          onSelectDay={onSetSelectedWorkoutSectionId}
          selectedWorkoutDayPreviewBySectionId={workoutDayPreviewBySectionId}
          selectedWorkoutDay={selectedWorkoutDay}
          selectedWorkoutWeek={selectedWorkoutWeek}
          workoutWeeks={workoutWeeks}
        />
      ) : null}

      {selectedQuickAddMuscle ? (
        <WorkoutExercisePickerSheet
          actionLabel="Add"
          description={`Quick add an exercise that targets ${muscleLabels[selectedQuickAddMuscle]}.`}
          exercises={quickAddExercises}
          onClose={() => {
            console.debug('[WorkoutPage] closing quick add sheet', {
              slug: selectedQuickAddMuscle,
              workoutDayLabel,
            })
            setSelectedQuickAddMuscle(null)
          }}
          onSelectExercise={(exercise) => {
            console.debug('[WorkoutPage] selecting quick add exercise', {
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              slug: selectedQuickAddMuscle,
              workoutDayLabel,
            })
            onAddWorkoutExercise(exercise)
            setSelectedQuickAddMuscle(null)
          }}
          title={`Add ${muscleLabels[selectedQuickAddMuscle]}`}
        />
      ) : null}
    </>
  )
}
