import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Clock3,
  Flag,
  GripVertical,
  Info,
  Minus,
  Pencil,
  RefreshCcw,
  Plus,
  SkipForward,
  Trash2,
} from 'lucide-react'
import type {
  ExercisePerformanceSample,
  ExerciseStatsRecord,
} from '../entities/exercise-stats'
import type { AppProgram } from '../lib/app-types'
import { formatExerciseDifficultyTarget, getTargetSetCount } from '../lib/app-utils'
import type { Exercise } from '../lib/content'
import {
  compareSetToExerciseBenchmark,
  formatBenchmarkValue,
  getSetBenchmarkInputStatus,
} from '../lib/exercise-benchmarks'
import type { FitnessEffortScale, FitnessProfile } from '../lib/fitness-profile'
import {
  buildWorkoutExerciseOrder,
  createWorkoutExerciseLogEntry,
  ensureWorkoutSetLogs,
  type ActiveWorkout,
  type WorkoutExerciseLogEntry,
  type WorkoutSetLogEntry,
} from '../lib/user-data'
import WorkoutExercisePickerSheet from './WorkoutExercisePickerSheet'
import WorkoutTargetBadge from './WorkoutTargetBadge'

type WorkoutExerciseTableProps = {
  activeWorkout: ActiveWorkout | null
  activeWorkoutExerciseLogs: Record<string, WorkoutExerciseLogEntry>
  activeWorkoutExtraEntries: WorkoutExerciseLogEntry[]
  contentExercises: Exercise[]
  effortScale: FitnessEffortScale
  exertionOptions: string[]
  fitnessProfile: FitnessProfile
  isSelectedWorkoutActive: boolean
  onAddWorkoutExercise: (exercise: Exercise) => void
  onAddWorkoutExerciseSet: (exerciseId: string, visibleSetCount?: number) => void
  onAddWorkoutExtraExerciseSet: (logId: string, visibleSetCount?: number) => void
  onCommitWorkoutSet: (setDetails: {
    actionKind: WorkoutTableRow['actionKind']
    exerciseName: string
    logId: string
    prefillNext?: boolean
    rest: string
    setIndex: number
    setLog: WorkoutSetLogEntry
  }) => void
  onOpenExerciseDetails: (exercise: Exercise) => void
  onReorderWorkoutExercise: (
    draggedLogId: string,
    targetLogId: string,
    position: 'before' | 'after',
  ) => void
  onRemoveWorkoutExercise: (exerciseId: string) => void
  onRemoveWorkoutExtraExercise: (logId: string) => void
  onRemoveWorkoutExerciseSetLog: (
    exerciseId: string,
    setIndex: number,
    nextVisibleSetCount?: number,
  ) => void
  onRemoveWorkoutExtraExerciseSetLog: (
    logId: string,
    setIndex: number,
    nextVisibleSetCount?: number,
  ) => void
  onSubstituteWorkoutExercise: (exerciseId: string, exercise: Exercise) => void
  onSubstituteWorkoutExtraExercise: (logId: string, exercise: Exercise) => void
  onToggleWorkoutExercise: (exerciseId: string) => void
  onToggleWorkoutExerciseSkipped: (exerciseId: string) => void
  onToggleWorkoutExtraExercise: (logId: string) => void
  onToggleWorkoutExerciseSetSuboptimal: (exerciseId: string, setIndex: number) => void
  onToggleWorkoutExtraExerciseSetSuboptimal: (logId: string, setIndex: number) => void
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
  displayWorkoutExerciseLogs?: Record<string, WorkoutExerciseLogEntry>
  displayWorkoutExerciseOrder?: string[]
  displayWorkoutExtraEntries?: WorkoutExerciseLogEntry[]
  previewExerciseOrder: string[]
  resolveExerciseStatsRecord: (
    exerciseId: string | null,
    exerciseName: string,
  ) => ExerciseStatsRecord | null
  resolveExerciseForDisplay: (exercise: {
    exerciseId: string | null
    exerciseName: string
    resolvedExerciseId: string | null
  }) => Exercise | null
  section: AppProgram['sections'][number]
}

type WorkoutTableRow = {
  actionKind: 'planned' | 'extra'
  isContinuous: boolean
  key: string
  log: WorkoutExerciseLogEntry
  resolvedExercise: Exercise | null
  statsRecord: ExerciseStatsRecord | null
  targetDuration: string
  targetEffort: string
  targetReps: string
  targetRest: string
  targetSetCount: number
  title: string
  visibleSetCount: number
  previousPerformance: ExercisePerformanceSample | null
}

type WorkoutRowDragItem = {
  key: string
}

type WorkoutPerformanceIndicator = {
  Icon: typeof ArrowUpRight
  description: string
  tone: 'negative' | 'neutral' | 'positive'
}

type SortableWorkoutRowProps = {
  exertionOptions: string[]
  fitnessProfile: FitnessProfile
  isSelectedWorkoutActive: boolean
  maxTargetSetCount: number
  onAddWorkoutExerciseSet: (exerciseId: string, visibleSetCount?: number) => void
  onAddWorkoutExtraExerciseSet: (logId: string, visibleSetCount?: number) => void
  onCommitWorkoutSet: (setDetails: {
    actionKind: WorkoutTableRow['actionKind']
    exerciseName: string
    logId: string
    prefillNext?: boolean
    rest: string
    setIndex: number
    setLog: WorkoutSetLogEntry
  }) => void
  onDragEnd: (draggedKey: string) => void
  onDragStart: (draggedKey: string) => void
  onOpenExerciseDetails: (exercise: Exercise) => void
  onPreviewReorder: (
    draggedLogId: string,
    targetLogId: string,
    position: 'before' | 'after',
  ) => void
  onRemoveWorkoutExercise: (exerciseId: string) => void
  onRemoveWorkoutExtraExercise: (logId: string) => void
  onRemoveWorkoutExerciseSetLog: (
    exerciseId: string,
    setIndex: number,
    nextVisibleSetCount?: number,
  ) => void
  onRemoveWorkoutExtraExerciseSetLog: (
    logId: string,
    setIndex: number,
    nextVisibleSetCount?: number,
  ) => void
  onRequestSubstitute: (
    row: Pick<WorkoutTableRow, 'actionKind' | 'key' | 'resolvedExercise' | 'title'>,
  ) => void
  onToggleWorkoutExercise: (exerciseId: string) => void
  onToggleWorkoutExerciseSkipped: (exerciseId: string) => void
  onToggleWorkoutExtraExercise: (logId: string) => void
  onToggleWorkoutExerciseSetSuboptimal: (exerciseId: string, setIndex: number) => void
  onToggleWorkoutExtraExerciseSetSuboptimal: (logId: string, setIndex: number) => void
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
  row: WorkoutTableRow
}

const WORKOUT_ROW_DND_TYPE = 'WORKOUT_EXERCISE_ROW'

function moveWorkoutRowKey(
  currentOrder: string[],
  draggedKey: string,
  targetKey: string,
  position: 'before' | 'after',
) {
  if (draggedKey === targetKey) {
    return currentOrder
  }

  const draggedIndex = currentOrder.indexOf(draggedKey)
  const targetIndex = currentOrder.indexOf(targetKey)

  if (draggedIndex === -1 || targetIndex === -1) {
    return currentOrder
  }

  const nextOrder = currentOrder.filter((entryKey) => entryKey !== draggedKey)
  const adjustedTargetIndex = nextOrder.indexOf(targetKey)
  const insertIndex = position === 'before' ? adjustedTargetIndex : adjustedTargetIndex + 1

  nextOrder.splice(insertIndex, 0, draggedKey)
  return nextOrder
}

function parseNullableNumber(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

function formatNullableNumber(value: number | null, suffix = '') {
  if (value === null) {
    return ''
  }

  const formattedValue = Number.isInteger(value) ? String(value) : value.toFixed(1)
  return suffix ? `${formattedValue} ${suffix}` : formattedValue
}

function calculateSetStrengthScore(
  sets: Array<{ reps: number | null; weightKg: number | null }>,
) {
  return sets.reduce<number | null>((bestScore, set) => {
    if (set.weightKg === null || set.reps === null) {
      return bestScore
    }

    const estimatedOneRepMax = set.weightKg * (1 + set.reps / 30)
    return bestScore === null ? estimatedOneRepMax : Math.max(bestScore, estimatedOneRepMax)
  }, null)
}

function summarizeSetLogs(setLogs: WorkoutSetLogEntry[]) {
  let performedSetCount = 0
  let totalDurationMinutes = 0
  let hasDuration = false
  let totalReps = 0
  let hasReps = false
  let totalVolumeKg = 0
  let hasVolume = false
  let maxWeightKg: number | null = null

  for (const setLog of setLogs) {
    const durationMinutes = parseNullableNumber(setLog.duration)
    const reps = parseNullableNumber(setLog.reps)
    const weightKg = parseNullableNumber(setLog.weightKg)

    if (
      setLog.duration.trim() ||
      setLog.weightKg.trim() ||
      setLog.reps.trim() ||
      setLog.effort.trim()
    ) {
      performedSetCount += 1
    }

    if (durationMinutes !== null) {
      totalDurationMinutes += durationMinutes
      hasDuration = true
    }

    if (reps !== null) {
      totalReps += reps
      hasReps = true
    }

    if (weightKg !== null) {
      maxWeightKg = maxWeightKg === null ? weightKg : Math.max(maxWeightKg, weightKg)
    }

    if (weightKg !== null && reps !== null) {
      totalVolumeKg += weightKg * reps
      hasVolume = true
    } else if (weightKg !== null) {
      totalVolumeKg += weightKg
      hasVolume = true
    }
  }

  return {
    maxWeightKg,
    performedSetCount,
    totalDurationMinutes: hasDuration ? totalDurationMinutes : null,
    totalReps: hasReps ? totalReps : null,
    totalVolumeKg: hasVolume ? totalVolumeKg : null,
  }
}

function getPerformanceScore(sample: {
  sets: Array<{ reps: number | null; weightKg: number | null }>
  totalDurationMinutes: number | null
  totalReps: number | null
  totalVolumeKg: number | null
}) {
  const strengthScore = calculateSetStrengthScore(sample.sets)

  if (strengthScore !== null) {
    return {
      label: 'e1RM',
      score: strengthScore,
    }
  }

  if (sample.totalVolumeKg !== null) {
    return {
      label: 'volume',
      score: sample.totalVolumeKg,
    }
  }

  if (sample.totalReps !== null) {
    return {
      label: 'reps',
      score: sample.totalReps,
    }
  }

  if (sample.totalDurationMinutes !== null) {
    return {
      label: 'duration',
      score: sample.totalDurationMinutes,
    }
  }

  return null
}

function getPreviousPerformanceSample(statsRecord: ExerciseStatsRecord | null) {
  return (
    statsRecord?.progressionHistory.find((sample) => {
      return !sample.skipped && (sample.completed || sample.performedSetCount > 0)
    }) ?? null
  )
}

function getPerformanceIndicator(
  log: WorkoutExerciseLogEntry,
  previousPerformance: ExercisePerformanceSample | null,
): WorkoutPerformanceIndicator {
  if (log.skipped) {
    return {
      Icon: SkipForward,
      description: 'Skipped. Hold to unlock editing.',
      tone: 'neutral',
    }
  }

  const currentSummary = summarizeSetLogs(log.setLogs)
  const currentScore = getPerformanceScore({
    sets: log.setLogs.map((setLog) => ({
      reps: parseNullableNumber(setLog.reps),
      weightKg: parseNullableNumber(setLog.weightKg),
    })),
    totalDurationMinutes: currentSummary.totalDurationMinutes,
    totalReps: currentSummary.totalReps,
    totalVolumeKg: currentSummary.totalVolumeKg,
  })

  const previousScore = previousPerformance
    ? getPerformanceScore({
        sets: previousPerformance.sets.map((setLog) => ({
          reps: setLog.reps,
          weightKg: setLog.weightKg,
        })),
        totalDurationMinutes: previousPerformance.totalDurationMinutes,
        totalReps: previousPerformance.totalReps,
        totalVolumeKg: previousPerformance.totalVolumeKg,
      })
    : null

  if (!currentScore || !previousScore || currentScore.label !== previousScore.label) {
    return {
      Icon: Minus,
      description: 'No comparable previous performance yet. Hold to unlock editing.',
      tone: 'neutral',
    }
  }

  const relativeChange =
    (currentScore.score - previousScore.score) / Math.max(Math.abs(previousScore.score), 1)

  if (relativeChange >= 0.03) {
    return {
      Icon: ArrowUpRight,
      description: `Ahead of the previous ${currentScore.label} result. Hold to unlock editing.`,
      tone: 'positive',
    }
  }

  if (relativeChange <= -0.03) {
    return {
      Icon: ArrowDownRight,
      description: `Behind the previous ${currentScore.label} result. Hold to unlock editing.`,
      tone: 'negative',
    }
  }

  return {
    Icon: ArrowRight,
    description: `Holding near the previous ${currentScore.label} result. Hold to unlock editing.`,
    tone: 'neutral',
  }
}

function getPreviousSetSample(
  previousPerformance: ExercisePerformanceSample | null,
  setIndex: number,
) {
  return previousPerformance?.sets.find((entry) => entry.setIndex === setIndex + 1) ?? null
}

function hasSetLogContent(setLog: WorkoutSetLogEntry) {
  return Boolean(
    setLog.duration.trim() ||
      setLog.weightKg.trim() ||
      setLog.reps.trim() ||
      setLog.effort.trim(),
  )
}

function getRecentPerformanceSamples(statsRecord: ExerciseStatsRecord | null) {
  return (
    statsRecord?.progressionHistory
      .filter((sample) => !sample.skipped && (sample.completed || sample.performedSetCount > 0))
      .slice(0, 3) ?? []
  )
}

function averageNullableNumbers(values: Array<number | null>) {
  const parsedValues = values.filter((value): value is number => value !== null)

  if (!parsedValues.length) {
    return null
  }

  return parsedValues.reduce((total, value) => total + value, 0) / parsedValues.length
}

function getRecentSetAverageComparisons({
  isContinuous,
  lowerWeightIsBetter,
  setIndex,
  setLog,
  statsRecord,
}: {
  isContinuous: boolean
  lowerWeightIsBetter: boolean
  setIndex: number
  setLog: WorkoutSetLogEntry
  statsRecord: ExerciseStatsRecord | null
}) {
  const recentSamples = getRecentPerformanceSamples(statsRecord)

  if (!recentSamples.length) {
    return [] as Array<{ average: number; label: string; unit: string }>
  }

  const recentSetSamples = recentSamples
    .map((sample) => {
      return (
        sample.sets.find((setSample) => setSample.setIndex === setIndex + 1) ??
        sample.sets[setIndex] ??
        null
      )
    })
    .filter((setSample): setSample is NonNullable<typeof setSample> => setSample !== null)

  if (!recentSetSamples.length) {
    return []
  }

  const comparisons: Array<{ average: number; label: string; unit: string }> = []
  const duration = parseNullableNumber(setLog.duration)
  const reps = parseNullableNumber(setLog.reps)
  const weightKg = parseNullableNumber(setLog.weightKg)
  const averageDuration = averageNullableNumbers(
    recentSetSamples.map((setSample) => setSample.durationMinutes),
  )
  const averageReps = averageNullableNumbers(recentSetSamples.map((setSample) => setSample.reps))
  const averageWeightKg = averageNullableNumbers(
    recentSetSamples.map((setSample) => setSample.weightKg),
  )

  if (isContinuous && duration !== null && averageDuration !== null && duration < averageDuration) {
    comparisons.push({ average: averageDuration, label: 'Duration', unit: 'min' })
  }

  if (!isContinuous && reps !== null && averageReps !== null && reps < averageReps) {
    comparisons.push({ average: averageReps, label: 'Reps', unit: 'reps' })
  }

  if (!isContinuous && weightKg !== null && averageWeightKg !== null) {
    const isBelowWeightAverage = lowerWeightIsBetter
      ? weightKg > averageWeightKg
      : weightKg < averageWeightKg

    if (isBelowWeightAverage) {
      comparisons.push({ average: averageWeightKg, label: 'Load', unit: 'kg' })
    }
  }

  return comparisons
}

function SortableWorkoutRow({
  exertionOptions,
  fitnessProfile,
  isSelectedWorkoutActive,
  maxTargetSetCount,
  onAddWorkoutExerciseSet,
  onAddWorkoutExtraExerciseSet,
  onCommitWorkoutSet,
  onDragEnd,
  onDragStart,
  onOpenExerciseDetails,
  onPreviewReorder,
  onRemoveWorkoutExercise,
  onRemoveWorkoutExtraExercise,
  onRemoveWorkoutExerciseSetLog,
  onRemoveWorkoutExtraExerciseSetLog,
  onRequestSubstitute,
  onToggleWorkoutExercise,
  onToggleWorkoutExerciseSkipped,
  onToggleWorkoutExtraExercise,
  onToggleWorkoutExerciseSetSuboptimal,
  onToggleWorkoutExtraExerciseSetSuboptimal,
  onUpdateWorkoutExerciseSetLog,
  onUpdateWorkoutExtraExerciseSetLog,
  row,
}: SortableWorkoutRowProps) {
  const rowRef = useRef<HTMLTableRowElement | null>(null)
  const resolveHoldTimeoutRef = useRef<number | null>(null)
  const shouldIgnoreResolveClickRef = useRef(false)
  const setLogs = ensureWorkoutSetLogs(row.log.setLogs, row.visibleSetCount)
  const isInputDisabled = !isSelectedWorkoutActive || row.log.skipped
  const isCompactResolvedRow = row.log.completed || row.log.skipped
  const [isResolveHolding, setIsResolveHolding] = useState(false)
  const [expandedSetIndexes, setExpandedSetIndexes] = useState<number[]>([])
  const performanceIndicator = getPerformanceIndicator(row.log, row.previousPerformance)
  const PerformanceIndicatorIcon = performanceIndicator.Icon

  useEffect(() => {
    return () => {
      if (resolveHoldTimeoutRef.current !== null) {
        window.clearTimeout(resolveHoldTimeoutRef.current)
      }
    }
  }, [])

  const clearResolveHold = useCallback(() => {
    if (resolveHoldTimeoutRef.current !== null) {
      window.clearTimeout(resolveHoldTimeoutRef.current)
      resolveHoldTimeoutRef.current = null
    }
    setIsResolveHolding(false)
  }, [])

  const unlockResolvedRow = useCallback(() => {
    if (!isSelectedWorkoutActive || !isCompactResolvedRow) {
      return
    }

    if (row.log.skipped) {
      onToggleWorkoutExerciseSkipped(row.key)
      return
    }

    if (row.actionKind === 'planned') {
      onToggleWorkoutExercise(row.key)
      return
    }

    onToggleWorkoutExtraExercise(row.key)
  }, [
    isCompactResolvedRow,
    isSelectedWorkoutActive,
    onToggleWorkoutExercise,
    onToggleWorkoutExerciseSkipped,
    onToggleWorkoutExtraExercise,
    row.actionKind,
    row.key,
    row.log.skipped,
  ])

  const startResolveHold = useCallback(() => {
    if (!isSelectedWorkoutActive || !isCompactResolvedRow) {
      return
    }

    clearResolveHold()
    setIsResolveHolding(true)
    resolveHoldTimeoutRef.current = window.setTimeout(() => {
      resolveHoldTimeoutRef.current = null
      setIsResolveHolding(false)
      shouldIgnoreResolveClickRef.current = true
      unlockResolvedRow()
    }, 520)
  }, [clearResolveHold, isCompactResolvedRow, isSelectedWorkoutActive, unlockResolvedRow])

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        onDragEnd(row.key)
      },
      item: () => {
        onDragStart(row.key)
        return {
          key: row.key,
        }
      },
      type: WORKOUT_ROW_DND_TYPE,
    }),
    [onDragEnd, onDragStart, row.key],
  )

  const [, drop] = useDrop<WorkoutRowDragItem>(
    () => ({
      accept: WORKOUT_ROW_DND_TYPE,
      hover(item, monitor) {
        if (!rowRef.current || item.key === row.key) {
          return
        }

        const clientOffset = monitor.getClientOffset()

        if (!clientOffset) {
          return
        }

        const rowRect = rowRef.current.getBoundingClientRect()
        const position = clientOffset.y < rowRect.top + rowRect.height / 2 ? 'before' : 'after'
        onPreviewReorder(item.key, row.key, position)
      },
    }),
    [onPreviewReorder, row.key],
  )

  const attachRowRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      rowRef.current = node
      preview(drop(node))
    },
    [drop, preview],
  )

  const attachHandleRef = useCallback(
    (node: HTMLButtonElement | null) => {
      drag(node)
    },
    [drag],
  )

  const updateSetLog = useCallback(
    (setIndex: number, field: keyof WorkoutSetLogEntry, value: string) => {
      if (row.actionKind === 'planned') {
        onUpdateWorkoutExerciseSetLog(row.key, setIndex, field, value)
        return
      }

      onUpdateWorkoutExtraExerciseSetLog(row.key, setIndex, field, value)
    },
    [
      onUpdateWorkoutExerciseSetLog,
      onUpdateWorkoutExtraExerciseSetLog,
      row.actionKind,
      row.key,
    ],
  )

  const closeSetEditor = useCallback((setIndex: number) => {
    setExpandedSetIndexes((currentIndexes) =>
      currentIndexes.filter((currentIndex) => currentIndex !== setIndex),
    )
  }, [])

  const commitSet = useCallback(
    (setIndex: number, setLog: WorkoutSetLogEntry, prefillNext = false) => {
      onCommitWorkoutSet({
        actionKind: row.actionKind,
        exerciseName: row.title,
        logId: row.key,
        prefillNext,
        rest: row.targetRest,
        setIndex,
        setLog,
      })
      closeSetEditor(setIndex)
    },
    [closeSetEditor, onCommitWorkoutSet, row.actionKind, row.key, row.targetRest, row.title],
  )

  const removeSetLog = useCallback(
    (setIndex: number) => {
      const nextVisibleSetCount = Math.max(1, row.visibleSetCount - 1)

      if (row.actionKind === 'planned') {
        onRemoveWorkoutExerciseSetLog(row.key, setIndex, nextVisibleSetCount)
        return
      }

      onRemoveWorkoutExtraExerciseSetLog(row.key, setIndex, nextVisibleSetCount)
    },
    [
      onRemoveWorkoutExerciseSetLog,
      onRemoveWorkoutExtraExerciseSetLog,
      row.actionKind,
      row.key,
      row.visibleSetCount,
    ],
  )

  const toggleSetSuboptimal = useCallback(
    (setIndex: number) => {
      if (row.actionKind === 'planned') {
        onToggleWorkoutExerciseSetSuboptimal(row.key, setIndex)
        return
      }

      onToggleWorkoutExtraExerciseSetSuboptimal(row.key, setIndex)
    },
    [
      onToggleWorkoutExerciseSetSuboptimal,
      onToggleWorkoutExtraExerciseSetSuboptimal,
      row.actionKind,
      row.key,
    ],
  )

  return (
    <tr
      ref={attachRowRef}
      data-workout-row-key={row.key}
      className={[
        row.log.completed ? 'is-complete' : '',
        row.log.skipped ? 'is-skipped' : '',
        row.actionKind === 'extra' ? 'is-custom' : '',
        isDragging ? 'is-drag-source' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <td className="workout-table__exercise-cell">
        <div className="workout-table__exercise-header">
          <div className="workout-table__title-row">
            <button
              ref={attachHandleRef}
              type="button"
              className={`chip-button workout-table__icon-button workout-table__drag-handle ${
                isDragging ? 'is-active' : ''
              }`}
              aria-label={`Drag to reorder ${row.title}`}
              title="Drag to reorder"
            >
              <GripVertical size={14} />
            </button>

            <button
              type="button"
              className={`workout-table__title-button ${isResolveHolding ? 'is-holding' : ''}`}
              onClick={(event) => {
                if (shouldIgnoreResolveClickRef.current) {
                  shouldIgnoreResolveClickRef.current = false
                  event.preventDefault()
                  return
                }

                if (row.resolvedExercise) {
                  onOpenExerciseDetails(row.resolvedExercise)
                }
              }}
              onContextMenu={(event) => event.preventDefault()}
              onPointerCancel={clearResolveHold}
              onPointerDown={(event) => {
                if (!isCompactResolvedRow || !isSelectedWorkoutActive) {
                  return
                }

                event.preventDefault()
                startResolveHold()
              }}
              onPointerLeave={clearResolveHold}
              onPointerUp={clearResolveHold}
              aria-label={
                isCompactResolvedRow && isSelectedWorkoutActive
                  ? `${row.title}. ${performanceIndicator.description}`
                  : row.resolvedExercise
                    ? `Open details for ${row.title}`
                    : row.title
              }
              title={
                isCompactResolvedRow && isSelectedWorkoutActive
                  ? performanceIndicator.description
                  : row.resolvedExercise
                    ? `Open details for ${row.title}`
                    : row.title
              }
            >
              <span>{row.title}</span>
              {row.resolvedExercise ? <Info size={12} aria-hidden="true" /> : null}
            </button>

            {isSelectedWorkoutActive && isCompactResolvedRow ? (
              <span
                className={`workout-table__resolved-status workout-table__resolved-status--${performanceIndicator.tone}`}
                title={performanceIndicator.description}
                aria-hidden="true"
              >
                <PerformanceIndicatorIcon size={14} />
              </span>
            ) : null}
          </div>

          <div className="workout-table__action-row">
            {isSelectedWorkoutActive && !isCompactResolvedRow ? (
              <>
                <button
                  type="button"
                  className="chip-button workout-table__action-button workout-table__substitute-button"
                  onClick={() =>
                    onRequestSubstitute({
                      actionKind: row.actionKind,
                      key: row.key,
                      resolvedExercise: row.resolvedExercise,
                      title: row.title,
                    })
                  }
                  aria-label={`Substitute ${row.title}`}
                  title="Substitute"
                >
                  <RefreshCcw size={13} />
                  <span>Substitute</span>
                </button>

                {row.actionKind === 'planned' ? (
                  <>
                    <button
                      type="button"
                      className={`chip-button workout-table__action-button workout-table__done-button ${
                        row.log.completed ? 'is-complete' : ''
                      }`}
                      onClick={() => onToggleWorkoutExercise(row.key)}
                      aria-label={
                        row.log.completed
                          ? `Mark ${row.title} not done`
                          : `Mark ${row.title} done`
                      }
                      title={row.log.completed ? 'Marked done' : 'Mark done'}
                    >
                      {row.log.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                      <span>Done</span>
                    </button>
                    <button
                      type="button"
                      className={`chip-button workout-table__action-button workout-table__skip-button ${
                        row.log.skipped ? 'is-active' : ''
                      }`}
                      onClick={() => onToggleWorkoutExerciseSkipped(row.key)}
                      aria-label={row.log.skipped ? `Unskip ${row.title}` : `Skip ${row.title}`}
                      title={row.log.skipped ? 'Skipped' : 'Skip'}
                    >
                      <SkipForward size={13} />
                      <span>Skip</span>
                    </button>
                    <button
                      type="button"
                      className="chip-button workout-table__action-button workout-table__remove-button"
                      onClick={() => onRemoveWorkoutExercise(row.key)}
                      aria-label={`Remove ${row.title}`}
                      title="Remove from this workout"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`chip-button workout-table__action-button workout-table__done-button ${
                        row.log.completed ? 'is-complete' : ''
                      }`}
                      onClick={() => onToggleWorkoutExtraExercise(row.key)}
                      aria-label={
                        row.log.completed
                          ? `Mark ${row.title} not done`
                          : `Mark ${row.title} done`
                      }
                      title={row.log.completed ? 'Marked done' : 'Mark done'}
                    >
                      {row.log.completed ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                      <span>Done</span>
                    </button>
                    <button
                      type="button"
                      className="chip-button workout-table__action-button workout-table__remove-button"
                      onClick={() => onRemoveWorkoutExtraExercise(row.key)}
                      aria-label={`Remove ${row.title}`}
                      title="Remove"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </>
                )}
              </>
            ) : null}
          </div>
        </div>
      </td>

      <td className="workout-table__target-cell">
        <WorkoutTargetBadge
          duration={row.targetDuration}
          effort={row.targetEffort}
          mode={isCompactResolvedRow ? 'horizontal' : 'vertical'}
          reps={row.targetReps}
          rest={row.targetRest}
          sets={row.isContinuous ? undefined : row.visibleSetCount}
          title={row.title}
          type={row.isContinuous ? 'continues' : row.resolvedExercise?.type}
        />
      </td>

      {Array.from({ length: maxTargetSetCount }, (_, setIndex) => {
        if (setIndex >= row.visibleSetCount) {
          return (
            <td
              key={`${row.key}-empty-${setIndex}`}
              className="workout-table__set-cell workout-table__set-cell--empty"
            >
              <span>-</span>
            </td>
          )
        }

        const setLog = setLogs[setIndex]
        const previousSetSample = getPreviousSetSample(row.previousPerformance, setIndex)
        const benchmarkComparisons = compareSetToExerciseBenchmark(
          row.resolvedExercise,
          fitnessProfile,
          setLog,
        )
        const belowAverageComparisons = benchmarkComparisons.filter(
          (comparison) => comparison.status === 'below',
        )
        const weightBenchmarkStatus = getSetBenchmarkInputStatus(
          benchmarkComparisons,
          'weightKg',
        )
        const repsBenchmarkStatus = getSetBenchmarkInputStatus(
          benchmarkComparisons,
          'reps',
        )
        const durationBenchmarkStatus = getSetBenchmarkInputStatus(
          benchmarkComparisons,
          'duration',
        )
        const recentAverageComparisons = getRecentSetAverageComparisons({
          isContinuous: row.isContinuous,
          lowerWeightIsBetter: row.resolvedExercise?.strengthBenchmarks?.kind === 'assistanceKg',
          setIndex,
          setLog,
          statsRecord: row.statsRecord,
        })
        const previousSetWasSuboptimal = previousSetSample?.suboptimal ?? false
        const isSetCommitted = Boolean(setLog.completedAt)
        const isSetEditorOpen =
          !isSetCommitted || expandedSetIndexes.includes(setIndex)
        const canRemoveSet =
          row.visibleSetCount > 1 ||
          hasSetLogContent(setLog) ||
          isSetCommitted ||
          setLog.suboptimal
        const setSummary = row.isContinuous
          ? [
              setLog.duration.trim() ? setLog.duration : null,
              setLog.effort.trim() ? setLog.effort : null,
            ]
              .filter(Boolean)
              .join(' / ')
          : [
              setLog.weightKg.trim() ? `${setLog.weightKg} kg` : null,
              setLog.reps.trim() ? `${setLog.reps} reps` : null,
              setLog.effort.trim() ? setLog.effort : null,
            ]
              .filter(Boolean)
              .join(' / ')
        const benchmarkTitle = belowAverageComparisons
          .map(
            (comparison) =>
              `${comparison.metric.label} average ${formatBenchmarkValue(
                comparison.metric.average,
                comparison.metric.unit,
              )}`,
          )
          .join(' / ')
        const shouldShowSetSummary =
          isCompactResolvedRow || (isSetCommitted && !isSetEditorOpen)

        return (
          <td
            key={`${row.key}-set-${setIndex}`}
            className={[
              'workout-table__set-cell',
              isSetCommitted ? 'is-set-logged' : '',
              setLog.suboptimal ? 'is-suboptimal' : '',
              previousSetWasSuboptimal ? 'is-previous-suboptimal' : '',
              belowAverageComparisons.length ? 'is-below-average' : '',
              recentAverageComparisons.length ? 'is-below-recent-average' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            title={benchmarkTitle || undefined}
          >
            {shouldShowSetSummary ? (
              <div className="workout-table__set-summary">
                <strong>{setSummary || '-'}</strong>
                {belowAverageComparisons.length ||
                recentAverageComparisons.length ||
                setLog.suboptimal ||
                previousSetWasSuboptimal ? (
                  <div className="workout-table__set-badges">
                    {belowAverageComparisons.length ? (
                      <span className="workout-table__set-badge is-below-average">
                        Below avg
                      </span>
                    ) : null}
                    {recentAverageComparisons.length ? (
                      <span className="workout-table__set-badge is-below-recent-average">
                        Below your 3
                      </span>
                    ) : null}
                    {setLog.suboptimal ? (
                      <span className="workout-table__set-badge is-suboptimal">
                        Suboptimal
                      </span>
                    ) : null}
                    {previousSetWasSuboptimal ? (
                      <span className="workout-table__set-badge is-warning">
                        Last hard
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {!isCompactResolvedRow && isSelectedWorkoutActive ? (
                  <div className="workout-table__set-summary-actions">
                    <button
                      type="button"
                      className="chip-button workout-table__set-icon-action"
                      onClick={() =>
                        setExpandedSetIndexes((currentIndexes) =>
                          currentIndexes.includes(setIndex)
                            ? currentIndexes
                            : [...currentIndexes, setIndex],
                        )
                      }
                      aria-label={`Edit set ${setIndex + 1} for ${row.title}`}
                      title="Edit set"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      className={`chip-button workout-table__set-icon-action ${
                        setLog.suboptimal ? 'is-active' : ''
                      }`}
                      onClick={() => toggleSetSuboptimal(setIndex)}
                      aria-label={`Mark set ${setIndex + 1} suboptimal for ${row.title}`}
                      title="Mark suboptimal"
                    >
                      <Flag size={12} />
                    </button>
                    <button
                      type="button"
                      className="chip-button workout-table__set-icon-action workout-table__set-remove-button"
                      onClick={() => removeSetLog(setIndex)}
                      aria-label={`Remove set ${setIndex + 1} for ${row.title}`}
                      title="Remove set"
                      disabled={!canRemoveSet}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="workout-table__set-editor">
                <div className="workout-table__set-inputs">
                  {row.isContinuous ? (
                    <input
                      type="text"
                      inputMode="text"
                      className={durationBenchmarkStatus === 'below' ? 'is-below-average' : ''}
                      value={setLog.duration}
                      onChange={(event) => updateSetLog(setIndex, 'duration', event.target.value)}
                      placeholder={
                        formatNullableNumber(previousSetSample?.durationMinutes ?? null, 'min') ||
                        'duration'
                      }
                      disabled={isInputDisabled}
                    />
                  ) : (
                    <div className="workout-table__set-load-row">
                      <input
                        type="text"
                        inputMode="decimal"
                        className={weightBenchmarkStatus === 'below' ? 'is-below-average' : ''}
                        value={setLog.weightKg}
                        onChange={(event) =>
                          updateSetLog(setIndex, 'weightKg', event.target.value)
                        }
                        placeholder={
                          formatNullableNumber(previousSetSample?.weightKg ?? null, 'kg') || 'kg'
                        }
                        disabled={isInputDisabled}
                      />
                      <span aria-hidden="true">x</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={repsBenchmarkStatus === 'below' ? 'is-below-average' : ''}
                        value={setLog.reps}
                        onChange={(event) => updateSetLog(setIndex, 'reps', event.target.value)}
                        placeholder={
                          formatNullableNumber(previousSetSample?.reps ?? null, 'reps') || 'reps'
                        }
                        disabled={isInputDisabled}
                      />
                    </div>
                  )}
                  <select
                    value={setLog.effort}
                    onChange={(event) => updateSetLog(setIndex, 'effort', event.target.value)}
                    disabled={isInputDisabled}
                  >
                    <option value="">
                      {previousSetSample?.difficulty
                        ? `Last ${previousSetSample.difficulty}`
                        : row.targetEffort
                          ? `Target ${row.targetEffort}`
                          : 'Effort'}
                    </option>
                    {exertionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <div className="workout-table__set-control-row">
                    <button
                      type="button"
                      className="chip-button workout-table__set-icon-action workout-table__set-remove-button"
                      onClick={() => removeSetLog(setIndex)}
                      disabled={isInputDisabled || !canRemoveSet}
                      aria-label={`Remove set ${setIndex + 1} for ${row.title}`}
                      title="Remove set"
                    >
                      <Trash2 size={12} />
                    </button>
                    <button
                      type="button"
                      className="chip-button workout-table__set-timer-button"
                      onClick={() => commitSet(setIndex, setLog)}
                      disabled={isInputDisabled || !setSummary}
                      title={
                        row.targetRest
                          ? `Finish set and start ${row.targetRest} timer`
                          : 'Finish set'
                      }
                      aria-label={
                        row.targetRest
                          ? `Finish set ${setIndex + 1} and start timer`
                          : `Finish set ${setIndex + 1}`
                      }
                    >
                      <Clock3 size={12} />
                    </button>
                  </div>

                  {belowAverageComparisons.length ||
                  recentAverageComparisons.length ||
                  previousSetWasSuboptimal ? (
                    <div className="workout-table__set-note">
                      {belowAverageComparisons.length ? (
                        <span>
                          Below avg:{' '}
                          {belowAverageComparisons
                            .map((comparison) => comparison.metric.label)
                            .join(', ')}
                        </span>
                      ) : null}
                      {recentAverageComparisons.length ? (
                        <span>
                          Below your last 3:{' '}
                          {recentAverageComparisons
                            .map((comparison) => comparison.label)
                            .join(', ')}
                        </span>
                      ) : null}
                      {previousSetWasSuboptimal ? <span>Last time this set was hard.</span> : null}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  className="chip-button workout-table__set-next-button"
                  onClick={() => commitSet(setIndex, setLog, true)}
                  disabled={isInputDisabled || !setSummary}
                  title={
                    row.targetRest
                      ? `Finish set, copy values to the next set, and start ${row.targetRest} timer`
                      : 'Finish set and copy values to the next set'
                  }
                  aria-label={
                    row.targetRest
                      ? `Finish set ${setIndex + 1}, copy values to next set, and start timer`
                      : `Finish set ${setIndex + 1} and copy values to next set`
                  }
                >
                  <Plus size={12} />
                  <span>Next</span>
                </button>
              </div>
            )}
          </td>
        )
      })}

      <td className="workout-table__append-cell">
        {isSelectedWorkoutActive && !isCompactResolvedRow ? (
          <button
            type="button"
            className="chip-button workout-table__append-button"
            onClick={() =>
              row.actionKind === 'planned'
                ? onAddWorkoutExerciseSet(row.key, row.visibleSetCount)
                : onAddWorkoutExtraExerciseSet(row.key, row.visibleSetCount)
            }
            aria-label={`Add set for ${row.title}`}
            title="Add set"
          >
            <Plus size={12} />
            <span>Add set</span>
          </button>
        ) : (
          <span className="workout-table__append-placeholder" aria-hidden="true" />
        )}
      </td>
    </tr>
  )
}

export default function WorkoutExerciseTable({
  activeWorkout,
  activeWorkoutExerciseLogs,
  activeWorkoutExtraEntries,
  contentExercises,
  effortScale,
  exertionOptions,
  fitnessProfile,
  isSelectedWorkoutActive,
  onAddWorkoutExercise,
  onAddWorkoutExerciseSet,
  onAddWorkoutExtraExerciseSet,
  onCommitWorkoutSet,
  onOpenExerciseDetails,
  onReorderWorkoutExercise,
  onRemoveWorkoutExercise,
  onRemoveWorkoutExtraExercise,
  onRemoveWorkoutExerciseSetLog,
  onRemoveWorkoutExtraExerciseSetLog,
  onSubstituteWorkoutExercise,
  onSubstituteWorkoutExtraExercise,
  onToggleWorkoutExercise,
  onToggleWorkoutExerciseSkipped,
  onToggleWorkoutExtraExercise,
  onToggleWorkoutExerciseSetSuboptimal,
  onToggleWorkoutExtraExerciseSetSuboptimal,
  onUpdateWorkoutExerciseSetLog,
  onUpdateWorkoutExtraExerciseSetLog,
  displayWorkoutExerciseLogs,
  displayWorkoutExerciseOrder,
  displayWorkoutExtraEntries,
  previewExerciseOrder,
  resolveExerciseStatsRecord,
  resolveExerciseForDisplay,
  section,
}: WorkoutExerciseTableProps) {
  const [pickerState, setPickerState] = useState<
    | null
    | {
        excludedExerciseIds: string[]
        mode: 'add' | 'substitute'
        preferredReferences: string[]
        rowActionKind: WorkoutTableRow['actionKind'] | null
        rowKey: string | null
        rowTitle: string
      }
  >(null)
  const [draggedKey, setDraggedKey] = useState<string | null>(null)
  const [orderedKeys, setOrderedKeys] = useState<string[]>([])
  const [orderedKeysBaseSignature, setOrderedKeysBaseSignature] = useState('')
  const orderedKeysRef = useRef<string[]>([])
  const dragBaseOrderRef = useRef<string[]>([])
  const workoutExerciseLogs = displayWorkoutExerciseLogs ?? activeWorkoutExerciseLogs
  const workoutExtraEntries = displayWorkoutExtraEntries ?? activeWorkoutExtraEntries
  const explicitWorkoutOrder = displayWorkoutExerciseOrder
    ? displayWorkoutExerciseOrder
    : activeWorkout
      ? buildWorkoutExerciseOrder(
          activeWorkout.exerciseOrder,
          activeWorkout.exerciseLogs ?? {},
          activeWorkout.extraEntries ?? [],
        )
      : null

  const rows = useMemo<WorkoutTableRow[]>(() => {
    const plannedRows = section.exercises
      .filter((exercise) => {
        return (
          !explicitWorkoutOrder ||
          explicitWorkoutOrder.includes(exercise.id) ||
          Boolean(workoutExerciseLogs[exercise.id])
        )
      })
      .map<WorkoutTableRow>((exercise) => {
        const workoutLog =
          workoutExerciseLogs[exercise.id] ??
          createWorkoutExerciseLogEntry(exercise.exerciseName, {
            completed: activeWorkout?.completedExerciseIds.includes(exercise.id) ?? false,
            exerciseId: exercise.resolvedExerciseId,
            logId: exercise.id,
            muscleGroups: [],
            plannedExerciseId: exercise.id,
            type: 'planned',
          })
        const resolvedExercise = resolveExerciseForDisplay({
          exerciseId: workoutLog.exerciseId,
          exerciseName: workoutLog.exerciseName,
          resolvedExerciseId: workoutLog.exerciseId ?? exercise.resolvedExerciseId,
        })
        const isContinuous = resolvedExercise?.type === 'continues'
        const targetSetCount = isContinuous ? 1 : getTargetSetCount(exercise.sets)
        const statsRecord = resolveExerciseStatsRecord(
          resolvedExercise?.id ?? workoutLog.exerciseId ?? exercise.resolvedExerciseId ?? null,
          exercise.exerciseName,
        )
        const previousPerformance = getPreviousPerformanceSample(statsRecord)
        const visibleSetCount = Math.max(
          1,
          workoutLog.targetSetCountOverride ?? targetSetCount,
          workoutLog.setLogs.length,
        )

        return {
          actionKind: 'planned',
          isContinuous,
          key: exercise.id,
          log: workoutLog,
          previousPerformance,
          resolvedExercise,
          statsRecord,
          targetDuration: exercise.duration || '',
          targetEffort: formatExerciseDifficultyTarget(
            resolvedExercise?.difficulty ?? '',
            effortScale,
          ),
          targetReps: exercise.reps || exercise.duration || 'Open',
          targetRest: exercise.rest || '',
          targetSetCount,
          title: workoutLog.exerciseName || exercise.exerciseName,
          visibleSetCount,
        }
      })

    const extraRows = workoutExtraEntries
      .filter((entry) => entry.type !== 'cardio')
      .map<WorkoutTableRow>((entry) => {
        const resolvedExercise = resolveExerciseForDisplay({
          exerciseId: entry.exerciseId,
          exerciseName: entry.exerciseName,
          resolvedExerciseId: entry.exerciseId,
        })
        const isContinuous = resolvedExercise?.type === 'continues'
        const statsRecord = resolveExerciseStatsRecord(
          entry.exerciseId ?? resolvedExercise?.id ?? null,
          entry.exerciseName,
        )
        const previousPerformance = getPreviousPerformanceSample(statsRecord)

        return {
          actionKind: 'extra',
          isContinuous,
          key: entry.logId,
          log: entry,
          previousPerformance,
          resolvedExercise,
          statsRecord,
          targetDuration: entry.duration || '',
          targetEffort: formatExerciseDifficultyTarget(
            resolvedExercise?.difficulty ?? '',
            effortScale,
          ),
          targetReps: 'Open',
          targetRest: '',
          targetSetCount: 1,
          title: entry.exerciseName,
          visibleSetCount: Math.max(
            1,
            entry.targetSetCountOverride ?? 1,
            entry.setLogs.length,
          ),
        }
      })

    const rowMap = new Map(
      [...plannedRows, ...extraRows].map((row) => [row.key, row] as const),
    )
    const persistedOrder = explicitWorkoutOrder
      ? explicitWorkoutOrder
      : previewExerciseOrder.length
        ? previewExerciseOrder
        : plannedRows.map((row) => row.key)
    const baseRows = persistedOrder
      .map((entryId) => rowMap.get(entryId) ?? null)
      .filter((row): row is WorkoutTableRow => row !== null)

    return [
      ...baseRows,
      ...[...rowMap.values()].filter((row) => !persistedOrder.includes(row.key)),
    ]
  }, [
    activeWorkout,
    displayWorkoutExerciseOrder,
    effortScale,
    explicitWorkoutOrder,
    previewExerciseOrder,
    resolveExerciseStatsRecord,
    resolveExerciseForDisplay,
    section.exercises,
    workoutExerciseLogs,
    workoutExtraEntries,
  ])

  const baseOrder = useMemo(() => rows.map((row) => row.key), [rows])
  const baseOrderSignature = useMemo(() => baseOrder.join('::'), [baseOrder])
  const currentOrder = useMemo(() => {
    if (draggedKey || orderedKeysBaseSignature === baseOrderSignature) {
      return orderedKeys.length ? orderedKeys : baseOrder
    }

    return baseOrder
  }, [baseOrder, baseOrderSignature, draggedKey, orderedKeys, orderedKeysBaseSignature])

  useEffect(() => {
    orderedKeysRef.current = currentOrder
  }, [currentOrder])

  const orderedRows = useMemo(() => {
    const rowMap = new Map(rows.map((row) => [row.key, row] as const))

    return [
      ...currentOrder
        .map((entryKey) => rowMap.get(entryKey) ?? null)
        .filter((row): row is WorkoutTableRow => row !== null),
      ...rows.filter((row) => !currentOrder.includes(row.key)),
    ]
  }, [currentOrder, rows])

  const maxTargetSetCount = Math.max(1, ...orderedRows.map((row) => row.visibleSetCount))

  const previewReorder = useCallback(
    (draggedLogId: string, targetLogId: string, position: 'before' | 'after') => {
      setOrderedKeys((currentOrder) => {
        const sourceOrder = currentOrder.length ? currentOrder : baseOrder
        const nextOrder = moveWorkoutRowKey(sourceOrder, draggedLogId, targetLogId, position)

        if (nextOrder.every((entryKey, index) => entryKey === sourceOrder[index])) {
          return sourceOrder
        }

        return nextOrder
      })
    },
    [baseOrder],
  )

  const startDrag = useCallback(
    (currentDraggedKey: string) => {
      dragBaseOrderRef.current = baseOrder
      setOrderedKeysBaseSignature(baseOrderSignature)
      setDraggedKey(currentDraggedKey)
      setOrderedKeys(currentOrder)
    },
    [baseOrder, baseOrderSignature, currentOrder],
  )

  const endDrag = useCallback(
    (currentDraggedKey: string) => {
      const initialOrder = dragBaseOrderRef.current.length ? dragBaseOrderRef.current : baseOrder
      const finalOrder = orderedKeysRef.current.length ? orderedKeysRef.current : initialOrder
      const hasChanged =
        finalOrder.length !== initialOrder.length ||
        finalOrder.some((entryKey, index) => entryKey !== initialOrder[index])

      if (hasChanged) {
        const draggedIndex = finalOrder.indexOf(currentDraggedKey)

        if (draggedIndex > 0) {
          onReorderWorkoutExercise(currentDraggedKey, finalOrder[draggedIndex - 1], 'after')
        } else if (draggedIndex === 0 && finalOrder.length > 1) {
          onReorderWorkoutExercise(currentDraggedKey, finalOrder[1], 'before')
        }
      }

      setDraggedKey(null)
    },
    [baseOrder, onReorderWorkoutExercise],
  )

  return (
    <>
      <section className="section-card workout-table-card">
        <div className="section-header workout-table-card__header">
          <h2>Exercises</h2>
          <span className="pill pill--subtle">{orderedRows.length} exercises</span>
        </div>

        <div className="workout-table-scroll">
          <table className="workout-table">
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Target</th>
                {Array.from({ length: maxTargetSetCount }, (_, setIndex) => (
                  <th key={`set-${setIndex + 1}`}>{`Set ${setIndex + 1}`}</th>
                ))}
                <th className="workout-table__append-header" aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {orderedRows.map((row) => (
                <SortableWorkoutRow
                  key={`${row.actionKind}-${row.key}`}
                  exertionOptions={exertionOptions}
                  fitnessProfile={fitnessProfile}
                  isSelectedWorkoutActive={isSelectedWorkoutActive}
                  maxTargetSetCount={maxTargetSetCount}
                  onAddWorkoutExerciseSet={onAddWorkoutExerciseSet}
                  onAddWorkoutExtraExerciseSet={onAddWorkoutExtraExerciseSet}
                  onCommitWorkoutSet={onCommitWorkoutSet}
                  onDragEnd={endDrag}
                  onDragStart={startDrag}
                  onOpenExerciseDetails={onOpenExerciseDetails}
                  onPreviewReorder={previewReorder}
                  onRemoveWorkoutExercise={onRemoveWorkoutExercise}
                  onRemoveWorkoutExtraExercise={onRemoveWorkoutExtraExercise}
                  onRemoveWorkoutExerciseSetLog={onRemoveWorkoutExerciseSetLog}
                  onRemoveWorkoutExtraExerciseSetLog={onRemoveWorkoutExtraExerciseSetLog}
                  onRequestSubstitute={(selectedRow) =>
                    setPickerState({
                      excludedExerciseIds: selectedRow.resolvedExercise?.id
                        ? [selectedRow.resolvedExercise.id]
                        : [],
                      mode: 'substitute',
                      preferredReferences: selectedRow.resolvedExercise?.substitutions ?? [],
                      rowActionKind: selectedRow.actionKind,
                      rowKey: selectedRow.key,
                      rowTitle: selectedRow.title,
                    })
                  }
                  onToggleWorkoutExercise={onToggleWorkoutExercise}
                  onToggleWorkoutExerciseSkipped={onToggleWorkoutExerciseSkipped}
                  onToggleWorkoutExtraExercise={onToggleWorkoutExtraExercise}
                  onToggleWorkoutExerciseSetSuboptimal={onToggleWorkoutExerciseSetSuboptimal}
                  onToggleWorkoutExtraExerciseSetSuboptimal={
                    onToggleWorkoutExtraExerciseSetSuboptimal
                  }
                  onUpdateWorkoutExerciseSetLog={onUpdateWorkoutExerciseSetLog}
                  onUpdateWorkoutExtraExerciseSetLog={onUpdateWorkoutExtraExerciseSetLog}
                  row={row}
                />
              ))}
            </tbody>
          </table>
        </div>

        {isSelectedWorkoutActive ? (
          <div className="workout-table-card__footer">
            <button
              type="button"
              className="chip-button icon-button workout-table-card__add-button"
              onClick={() =>
                setPickerState({
                  excludedExerciseIds: [],
                  mode: 'add',
                  preferredReferences: [],
                  rowActionKind: null,
                  rowKey: null,
                  rowTitle: '',
                })
              }
            >
              <Plus size={15} />
              <span>Add exercise</span>
            </button>
          </div>
        ) : null}
      </section>

      {pickerState ? (
        <WorkoutExercisePickerSheet
          actionLabel={pickerState.mode === 'substitute' ? 'Substitute' : 'Add'}
          description={
            pickerState.mode === 'substitute'
              ? `Replace ${pickerState.rowTitle} with another exercise from your library for this workout day.`
              : 'Add an extra exercise from your library to this training day.'
          }
          excludeExerciseIds={pickerState.excludedExerciseIds}
          exercises={contentExercises}
          preferredReferences={pickerState.preferredReferences}
          onSelectExercise={(exercise: Exercise) => {
            if (
              pickerState.mode === 'substitute' &&
              pickerState.rowKey &&
              pickerState.rowActionKind
            ) {
              if (pickerState.rowActionKind === 'planned') {
                onSubstituteWorkoutExercise(pickerState.rowKey, exercise)
              } else {
                onSubstituteWorkoutExtraExercise(pickerState.rowKey, exercise)
              }
            } else {
              onAddWorkoutExercise(exercise)
            }
            setPickerState(null)
          }}
          onClose={() => setPickerState(null)}
          title={
            pickerState.mode === 'substitute'
              ? `Substitute ${pickerState.rowTitle}`
              : 'Add exercise'
          }
        />
      ) : null}
    </>
  )
}
