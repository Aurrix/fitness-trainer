import NextTimeButton from './NextTimeButton'
import WorkoutProgressionCoach from './WorkoutProgressionCoach'
import type { EngineSession, SetPrescription } from '../lib/training/types'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useDrag, useDrop } from 'react-dnd'
import {
  ArrowDownRight,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  GripVertical,
  Info,
  Minus,
  Pencil,
  Plus,
  SkipForward,
  Trash2,
} from 'lucide-react'
import type {
  ExercisePerformanceSample,
  ExerciseStatsRecord,
} from '../entities/exercise-stats'
import type { AppProgram } from '../lib/app-types'
import { getTargetSetCount } from '../lib/app-utils'
import { programNote } from '../lib/program-preview'
import type { Exercise } from '../lib/content'
import {
  compareSetToExerciseBenchmark,
  formatBenchmarkValue,
  getExerciseBenchmarkSummary,
  getSetBenchmarkInputStatus,
} from '../lib/exercise-benchmarks'
import type { FitnessProfile } from '../lib/fitness-profile'
import {
  buildWorkoutExerciseOrder,
  createWorkoutExerciseLogEntry,
  ensureWorkoutSetLogs,
  type ActiveWorkout,
  type WorkoutExerciseLogEntry,
  type WorkoutSetLogEntry,
} from '../lib/user-data'
import BottomSheet from './BottomSheet'
import WorkoutExercisePickerSheet from './WorkoutExercisePickerSheet'
import ProgramExercisePreview from './ProgramExercisePreview'
import WorkoutTargetBadge, {
  type WorkoutTargetBadgeInsight,
} from './WorkoutTargetBadge'

export type WorkoutExerciseDetailSubstitutionTarget = {
  actionKind: 'planned' | 'extra'
  currentExerciseId: string | null
  key: string
  title: string
}

export type WorkoutExerciseDetailsOptions = {
  substitutionTarget?: WorkoutExerciseDetailSubstitutionTarget | null
}

type WorkoutSetLogPrefill = Pick<
  WorkoutSetLogEntry,
  'duration' | 'effort' | 'reps' | 'weightKg'
>
type WorkoutSetLogField = keyof WorkoutSetLogEntry

type WorkoutSetHistorySample = {
  dateLabel: string
  detailLines: string[]
  id: string
  summary: string
  values: Partial<WorkoutSetLogPrefill>
}

type WorkoutSetHistoryRequest = {
  actionKind: WorkoutTableRow['actionKind']
  isContinuous: boolean
  key: string
  samples: WorkoutSetHistorySample[]
  setIndex: number
  title: string
}

type WorkoutSetNoteRequest = { actionKind: 'planned' | 'extra'; isContinuous: boolean; key: string; samples: WorkoutSetHistorySample[]; setIndex: number; title: string }
const setNoteTags = ['Drop set', 'To failure', 'Partial reps', 'Assisted reps', 'Paused reps']

type WorkoutExerciseTableProps = {
  activeWorkout: ActiveWorkout | null
  activeWorkoutExerciseLogs: Record<string, WorkoutExerciseLogEntry>
  activeWorkoutExtraEntries: WorkoutExerciseLogEntry[]
  contentExercises: Exercise[]
  fitnessProfile: FitnessProfile
  isEditingCompletedWorkout: boolean
  isSelectedWorkoutActive: boolean
  onAddWorkoutExercise: (exercise: Exercise) => void
  onAddWorkoutExerciseSet: (exerciseId: string, visibleSetCount?: number) => void
  onAddWorkoutExtraExerciseSet: (logId: string, visibleSetCount?: number) => void
  onCommitWorkoutSet: (setDetails: {
    actionKind: WorkoutTableRow['actionKind']
    exerciseName: string
    logId: string
    prefillNext?: boolean
    prefillNextSetLog?: WorkoutSetLogPrefill
    rest: string
    setIndex: number
    setLog: WorkoutSetLogEntry
  }) => void
  onOpenExerciseDetails: (exercise: Exercise, options?: WorkoutExerciseDetailsOptions) => void
  onReorderWorkoutExercise: (
    draggedLogId: string,
    targetLogId: string,
    position: 'before' | 'after',
  ) => void
  onRemoveWorkoutExercise: (
    exerciseId: string,
    options?: { skipConfirm?: boolean },
  ) => void
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
  onSetWorkoutExerciseProgression: (exerciseId: string, setIndex: number, value: string) => void
  onSetWorkoutExtraExerciseProgression: (logId: string, setIndex: number, value: string) => void
  onUpdateWorkoutExerciseSetLog: (
    exerciseId: string,
    setIndex: number,
    field: WorkoutSetLogField,
    value: string,
  ) => void
  onUpdateWorkoutExtraExerciseSetLog: (
    logId: string,
    setIndex: number,
    field: WorkoutSetLogField,
    value: string,
  ) => void
  onUpdateWorkoutSetTags: (actionKind: 'planned' | 'extra', logId: string, setIndex: number, tags: string[]) => void
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
  coach?: {engine: EngineSession; exercise: AppProgram['sections'][number]['exercises'][number]}
  instructions?: string
  prescriptions?: SetPrescription[]
  warmups?: SetPrescription[]
  superset?: string | null
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

type WorkoutRemoveRequest = Pick<WorkoutTableRow, 'actionKind' | 'key' | 'title'> & {
  hasExistingResponses: boolean
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
  canMoveDown: boolean
  canMoveUp: boolean
  isExpanded: boolean
  isReordering: boolean
  isUpNext: boolean
  onToggleExpansion: () => void
  fitnessProfile: FitnessProfile
  isEditingCompletedWorkout: boolean
  isSelectedWorkoutActive: boolean
  maxTargetSetCount: number
  onAddWorkoutExerciseSet: (exerciseId: string, visibleSetCount?: number) => void
  onAddWorkoutExtraExerciseSet: (logId: string, visibleSetCount?: number) => void
  onCommitWorkoutSet: (setDetails: {
    actionKind: WorkoutTableRow['actionKind']
    exerciseName: string
    logId: string
    prefillNext?: boolean
    prefillNextSetLog?: WorkoutSetLogPrefill
    rest: string
    setIndex: number
    setLog: WorkoutSetLogEntry
  }) => void
  onDragEnd: (draggedKey: string) => void
  onDragStart: (draggedKey: string) => void
  onMove: (direction: 'up' | 'down') => void
  onOpenExerciseDetails: (exercise: Exercise, options?: WorkoutExerciseDetailsOptions) => void
  onPreviewReorder: (
    draggedLogId: string,
    targetLogId: string,
    position: 'before' | 'after',
  ) => void
  onRequestSubstitute: (
    row: Pick<WorkoutTableRow, 'actionKind' | 'key' | 'resolvedExercise' | 'title'>,
  ) => void
  onRequestRemove: (row: WorkoutRemoveRequest) => void
  onOpenSetHistoryPicker: (request: WorkoutSetHistoryRequest) => void
  onOpenSetNoteEditor: (request: WorkoutSetNoteRequest) => void
  onToggleWorkoutExercise: (exerciseId: string) => void
  onToggleWorkoutExerciseSkipped: (exerciseId: string) => void
  onToggleWorkoutExtraExercise: (logId: string) => void
  onSetWorkoutExerciseProgression: (exerciseId: string, setIndex: number, value: string) => void
  onSetWorkoutExtraExerciseProgression: (logId: string, setIndex: number, value: string) => void
  onUpdateWorkoutExerciseSetLog: (
    exerciseId: string,
    setIndex: number,
    field: WorkoutSetLogField,
    value: string,
  ) => void
  onUpdateWorkoutExtraExerciseSetLog: (
    logId: string,
    setIndex: number,
    field: WorkoutSetLogField,
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
  const trimmedValue = value.trim().replace(',', '.')

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

function formatRoundedUpAverage(value: number | null, suffix = '') {
  if (value === null) {
    return ''
  }

  return formatNullableNumber(Math.ceil(value), suffix)
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
      description: 'Skipped.',
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
      description: 'No comparable previous performance yet.',
      tone: 'neutral',
    }
  }

  const relativeChange =
    (currentScore.score - previousScore.score) / Math.max(Math.abs(previousScore.score), 1)

  if (relativeChange >= 0.03) {
    return {
      Icon: ArrowUpRight,
      description: `Ahead of the previous ${currentScore.label} result.`,
      tone: 'positive',
    }
  }

  if (relativeChange <= -0.03) {
    return {
      Icon: ArrowDownRight,
      description: `Behind the previous ${currentScore.label} result.`,
      tone: 'negative',
    }
  }

  return {
    Icon: ArrowRight,
    description: `Holding near the previous ${currentScore.label} result.`,
    tone: 'neutral',
  }
}

function getPreviousSetSample(
  previousPerformance: ExercisePerformanceSample | null,
  setIndex: number,
) {
  return previousPerformance?.sets.find((entry) => entry.setIndex === setIndex + 1) ?? null
}

function formatSetPrefillNumber(value: number | null) {
  if (value === null) {
    return ''
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '')
}

function getSetSamplePrefill(
  setSample: ExercisePerformanceSample['sets'][number] | null,
) {
  if (!setSample) {
    return null
  }

  const prefill: WorkoutSetLogPrefill = {
    duration: formatSetPrefillNumber(setSample.durationMinutes),
    effort: setSample.difficulty.trim(),
    reps: formatSetPrefillNumber(setSample.reps),
    weightKg: formatSetPrefillNumber(setSample.weightKg),
  }
  const hasPrefillValue = Object.values(prefill).some((value) => value?.trim())

  return hasPrefillValue ? prefill : null
}

function formatSetHistoryDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}

function buildSetHistorySummary(
  values: Partial<WorkoutSetLogPrefill>,
  isContinuous: boolean,
) {
  const summaryParts = isContinuous
    ? [
        values.duration?.trim() ? `${values.duration} min` : null,
        values.effort?.trim() ? values.effort : null,
      ]
    : [
        values.weightKg?.trim() ? `${values.weightKg} kg` : null,
        values.reps?.trim() ? `${values.reps} reps` : null,
        values.effort?.trim() ? values.effort : null,
      ]

  return summaryParts.filter(Boolean).join(' / ') || 'Logged set'
}

function buildSetHistoryDetailLines(
  values: Partial<WorkoutSetLogPrefill>,
  isContinuous: boolean,
) {
  return isContinuous
    ? [
        values.duration?.trim() ? `Duration ${values.duration} min` : null,
        values.effort?.trim() ? `Effort ${values.effort}` : null,
      ].filter((line): line is string => line !== null)
    : [
        values.weightKg?.trim() ? `Weight ${values.weightKg} kg` : null,
        values.reps?.trim() ? `Reps ${values.reps}` : null,
        values.effort?.trim() ? `Effort ${values.effort}` : null,
      ].filter((line): line is string => line !== null)
}

function buildSetHistorySamples({
  isContinuous,
  setIndex,
  statsRecord,
}: {
  isContinuous: boolean
  setIndex: number
  statsRecord: ExerciseStatsRecord | null
}) {
  return (
    statsRecord?.progressionHistory
      .filter((sample) => !sample.skipped && (sample.completed || sample.performedSetCount > 0))
      .flatMap<WorkoutSetHistorySample>((sample) => {
        const setSample =
          sample.sets.find((entry) => entry.setIndex === setIndex + 1) ??
          sample.sets[setIndex] ??
          null
        const values = getSetSamplePrefill(setSample)

        if (!values) {
          return []
        }

        return [
          {
            dateLabel: formatSetHistoryDate(sample.recordedAt),
            detailLines: buildSetHistoryDetailLines(values, isContinuous),
            id: `${sample.id}:${setSample?.setIndex ?? setIndex + 1}`,
            summary: buildSetHistorySummary(values, isContinuous),
            values,
          },
        ]
      })
      .slice(0, 8) ?? []
  )
}

function hasSetLogContent(setLog: WorkoutSetLogEntry) {
  return Boolean(
    setLog.duration.trim() ||
      setLog.weightKg.trim() ||
      setLog.reps.trim() ||
      setLog.effort.trim(),
  )
}

function hasWorkoutLogResponses(log: WorkoutExerciseLogEntry) {
  return Boolean(
    log.completed ||
      log.skipped ||
      log.setLogs.some(
        (setLog) => hasSetLogContent(setLog) || setLog.completedAt || setLog.note || setLog.tags.length > 0 || setLog.progression,
      ),
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

function averageRecentSetNumbers(
  samples: ExercisePerformanceSample[],
  selector: (setSample: ExercisePerformanceSample['sets'][number]) => number | null,
) {
  return averageNullableNumbers(samples.flatMap((sample) => sample.sets.map(selector)))
}

function buildPersonalAverageTokens(
  statsRecord: ExerciseStatsRecord | null,
  isContinuous: boolean,
) {
  const recentSamples = getRecentPerformanceSamples(statsRecord)

  if (!recentSamples.length) {
    return [] as WorkoutTargetBadgeInsight[]
  }

  const averageDuration = averageNullableNumbers(
    recentSamples.map((sample) => sample.totalDurationMinutes),
  )
  const averageSetCount = averageNullableNumbers(
    recentSamples.map((sample) => sample.performedSetCount),
  )
  const averageReps = averageRecentSetNumbers(recentSamples, (setSample) => setSample.reps)
  const averageWeightKg = averageNullableNumbers(
    recentSamples.map((sample) => sample.maxWeightKg),
  )
  const tokens: WorkoutTargetBadgeInsight[] = []

  if (isContinuous && averageDuration !== null) {
    tokens.push({
      detailLabel: 'Your recent average duration',
      detailValue: formatRoundedUpAverage(averageDuration, 'min'),
      key: 'duration',
      shortLabel: 'You time',
    })
  }

  if (!isContinuous && averageSetCount !== null) {
    tokens.push({
      detailLabel: 'Your recent average logged sets',
      detailValue: formatRoundedUpAverage(averageSetCount, 'sets'),
      key: 'sets',
      shortLabel: 'You sets',
    })
  }

  if (!isContinuous && averageWeightKg !== null) {
    tokens.push({
      detailLabel: 'Your recent average top weight',
      detailValue: formatRoundedUpAverage(averageWeightKg, 'kg'),
      key: 'weight',
      shortLabel: 'You kg',
    })
  }

  if (!isContinuous && averageReps !== null) {
    tokens.push({
      detailLabel: 'Your recent average reps per set',
      detailValue: formatRoundedUpAverage(averageReps, 'reps'),
      key: 'reps',
      shortLabel: 'You reps',
    })
  }

  return tokens
}

function buildBenchmarkAverageTokens(
  exercise: Exercise | null,
  fitnessProfile: FitnessProfile,
  isContinuous: boolean,
) {
  const benchmarkSummary = getExerciseBenchmarkSummary(exercise, fitnessProfile)

  if (!benchmarkSummary) {
    return [] as WorkoutTargetBadgeInsight[]
  }

  const relevantMetrics = benchmarkSummary.metrics.filter((metric) =>
    isContinuous ? metric.inputKind === 'duration' : metric.inputKind !== 'duration',
  )
  const visibleMetrics = (relevantMetrics.length ? relevantMetrics : benchmarkSummary.metrics).slice(
    0,
    2,
  )

  return visibleMetrics.map<WorkoutTargetBadgeInsight>((metric) => ({
    detailLabel: `Profile average ${metric.label.toLowerCase()}`,
    detailValue: formatBenchmarkValue(Math.ceil(metric.average), metric.unit),
    key: metric.key,
    shortLabel:
      metric.inputKind === 'weightKg'
        ? 'Meta kg'
        : metric.inputKind === 'duration'
          ? 'Meta time'
          : 'Meta reps',
  }))
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

function WorkoutSetTarget({ prescription, setIndex, superset }: { prescription: SetPrescription; setIndex: number; superset?: string | null }) {
  return <div className="training-target"><strong>Target · {prescription.label || `Set ${setIndex + 1}`}</strong><span>{prescription.durationSeconds !== null ? `${prescription.durationSeconds} sec` : `${prescription.minReps ? `${prescription.minReps}–` : ''}${prescription.reps ?? ''}${prescription.amrap ? '+' : ''} reps`}{prescription.weightKg !== null ? ` · ${formatNullableNumber(prescription.weightKg)} kg` : ''}</span>{prescription.unilateral ? <span>Targets and logged reps/duration are per side, for both sides.</span> : null}{prescription.formula ? <span>{prescription.formula}</span> : null}{prescription.effort !== null ? <span>RPE {prescription.effort}</span> : prescription.logEffort ? <span>Log actual RPE</span> : null}{prescription.restSeconds ? <span>Rest {prescription.restSeconds} sec</span> : null}{superset ? <span>Superset {superset}</span> : null}</div>
}

function SortableWorkoutRow({
  canMoveDown,
  canMoveUp,
  isExpanded,
  isReordering,
  isUpNext,
  onToggleExpansion,
  fitnessProfile,
  isEditingCompletedWorkout,
  isSelectedWorkoutActive,
  maxTargetSetCount,
  onAddWorkoutExerciseSet,
  onAddWorkoutExtraExerciseSet,
  onCommitWorkoutSet,
  onDragEnd,
  onDragStart,
  onMove,
  onOpenExerciseDetails,
  onPreviewReorder,
  onOpenSetHistoryPicker,
  onOpenSetNoteEditor,
  onRequestRemove,
  onRequestSubstitute,
  onToggleWorkoutExercise,
  onToggleWorkoutExerciseSkipped,
  onToggleWorkoutExtraExercise,
  onSetWorkoutExerciseProgression,
  onSetWorkoutExtraExerciseProgression,
  onUpdateWorkoutExerciseSetLog,
  onUpdateWorkoutExtraExerciseSetLog,
  row,
}: SortableWorkoutRowProps) {
  const cardId = useId()
  const controlledIds = [
    `${cardId}-target`,
    ...Array.from({ length: row.visibleSetCount }, (_, index) => `${cardId}-set-${index}`),
    `${cardId}-actions`,
  ].join(' ')
  const rowRef = useRef<HTMLTableRowElement | null>(null)
  const resolveHoldTimeoutRef = useRef<number | null>(null)
  const titleHoldTimeoutRef = useRef<number | null>(null)
  const setHoldTimeoutRef = useRef<number | null>(null)
  const shouldIgnoreTitleClickRef = useRef(false)
  const titleHoldStartRef = useRef<{
    pointerId: number
    startX: number
    startY: number
  } | null>(null)
  const setHoldStartRef = useRef<{
    pointerId: number
    samples: WorkoutSetHistorySample[]
    setIndex: number
    startX: number
    startY: number
  } | null>(null)
  const setInputTapRef = useRef<{ at: number; target: HTMLInputElement } | null>(null)
  const setLogs = ensureWorkoutSetLogs(row.log.setLogs, row.visibleSetCount)
  const loggedSetCount = setLogs.filter(setLog => Boolean(setLog.completedAt)).length
  const prescribedReps = row.prescriptions?.map(prescription => `${prescription.minReps && prescription.minReps !== prescription.reps ? `${prescription.minReps}–` : ''}${prescription.reps ?? ''}${prescription.amrap ? '+' : ''}`)
  const repParts = row.targetReps.split('/').map(value => value.trim())
  const repSummary = prescribedReps?.length ? (new Set(prescribedReps).size === 1 ? prescribedReps[0] : 'varied') : new Set(repParts).size === 1 ? repParts[0] : row.targetReps
  const cardSummary = [
    row.isContinuous ? `${row.visibleSetCount} ${row.visibleSetCount === 1 ? 'set' : 'sets'}${row.targetDuration ? ` · ${row.targetDuration}` : ''}` : repSummary && repSummary !== 'varied' ? `${row.visibleSetCount} × ${repSummary} reps` : `${row.visibleSetCount} sets${repSummary === 'varied' ? ' · Set-specific targets' : ''}`,
    row.log.skipped ? 'Skipped' : row.log.completed ? 'Complete' : row.targetRest || null,
  ].filter(Boolean).join(' · ')
  const isInputDisabled = !isSelectedWorkoutActive || row.log.skipped
  const isCompactResolvedRow = row.log.completed || row.log.skipped
  const [isResolveHolding, setIsResolveHolding] = useState(false)
  const [isTitleHolding, setIsTitleHolding] = useState(false)
  const [holdingSetIndex, setHoldingSetIndex] = useState<number | null>(null)
  const [showAdviceHelp, setShowAdviceHelp] = useState(false)
  const performanceIndicator = getPerformanceIndicator(row.log, row.previousPerformance)
  const PerformanceIndicatorIcon = performanceIndicator.Icon
  const personalAverageTokens = buildPersonalAverageTokens(row.statsRecord, row.isContinuous)
  const benchmarkAverageTokens = buildBenchmarkAverageTokens(
    row.resolvedExercise,
    fitnessProfile,
    row.isContinuous,
  )
  const isExerciseEmpty = !setLogs.some((setLog) => {
    return hasSetLogContent(setLog) || setLog.completedAt || setLog.note || setLog.tags.length > 0 || setLog.progression
  })

  useEffect(() => {
    return () => {
      if (resolveHoldTimeoutRef.current !== null) {
        window.clearTimeout(resolveHoldTimeoutRef.current)
      }
      if (titleHoldTimeoutRef.current !== null) {
        window.clearTimeout(titleHoldTimeoutRef.current)
      }
      if (setHoldTimeoutRef.current !== null) {
        window.clearTimeout(setHoldTimeoutRef.current)
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

  const clearTitleHold = useCallback(() => {
    if (titleHoldTimeoutRef.current !== null) {
      window.clearTimeout(titleHoldTimeoutRef.current)
      titleHoldTimeoutRef.current = null
    }
    titleHoldStartRef.current = null
    setIsTitleHolding(false)
  }, [])

  const clearSetHold = useCallback(() => {
    if (setHoldTimeoutRef.current !== null) {
      window.clearTimeout(setHoldTimeoutRef.current)
      setHoldTimeoutRef.current = null
    }
    setHoldStartRef.current = null
    setHoldingSetIndex(null)
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
      shouldIgnoreTitleClickRef.current = true
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
    (setIndex: number, field: WorkoutSetLogField, value: string) => {
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

  const commitSet = useCallback(
    (
      setIndex: number,
      setLog: WorkoutSetLogEntry,
      options?: {
        prefillNext?: boolean
        prefillNextSetLog?: WorkoutSetLogPrefill | null
        startRest?: boolean
      },
    ) => {
      onCommitWorkoutSet({
        actionKind: row.actionKind,
        exerciseName: row.title,
        logId: row.key,
        prefillNext: options?.prefillNext,
        prefillNextSetLog: options?.prefillNextSetLog ?? undefined,
        rest: options?.startRest === false ? '' : row.prescriptions?.[setIndex]?.restSeconds ? `${row.prescriptions[setIndex].restSeconds} sec` : row.targetRest,
        setIndex,
        setLog,
      })
    },
    [onCommitWorkoutSet, row.actionKind, row.key, row.targetRest, row.title, row.prescriptions],
  )

  const finishExercise = useCallback(() => {
    if (isEditingCompletedWorkout && row.log.completed) {
      return
    }

    if (row.actionKind === 'planned') {
      onToggleWorkoutExercise(row.key)
      return
    }

    onToggleWorkoutExtraExercise(row.key)
  }, [
    isEditingCompletedWorkout,
    onToggleWorkoutExercise,
    onToggleWorkoutExtraExercise,
    row.actionKind,
    row.key,
    row.log.completed,
  ])

  const openRowExerciseDetails = useCallback(
    (exercise: Exercise) => {
      onOpenExerciseDetails(
        exercise,
        isSelectedWorkoutActive
          ? {
              substitutionTarget: {
                actionKind: row.actionKind,
                currentExerciseId: row.resolvedExercise?.id ?? null,
                key: row.key,
                title: row.title,
              },
            }
          : undefined,
      )
    },
    [
      isSelectedWorkoutActive,
      onOpenExerciseDetails,
      row.actionKind,
      row.key,
      row.resolvedExercise?.id,
      row.title,
    ],
  )

  const requestSubstitution = useCallback(() => {
    if (!isSelectedWorkoutActive || isCompactResolvedRow) {
      return
    }

    onRequestSubstitute({
      actionKind: row.actionKind,
      key: row.key,
      resolvedExercise: row.resolvedExercise,
      title: row.title,
    })
  }, [
    isCompactResolvedRow,
    isSelectedWorkoutActive,
    onRequestSubstitute,
    row.actionKind,
    row.key,
    row.resolvedExercise,
    row.title,
  ])

  const startTitleHold = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (
        !isSelectedWorkoutActive ||
        isCompactResolvedRow ||
        (event.pointerType === 'mouse' && event.button !== 0)
      ) {
        return
      }

      clearTitleHold()
      titleHoldStartRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
      }
      setIsTitleHolding(true)
      titleHoldTimeoutRef.current = window.setTimeout(() => {
        titleHoldTimeoutRef.current = null
        titleHoldStartRef.current = null
        setIsTitleHolding(false)
        shouldIgnoreTitleClickRef.current = true
        requestSubstitution()
      }, 560)
    },
    [clearTitleHold, isCompactResolvedRow, isSelectedWorkoutActive, requestSubstitution],
  )

  const handleTitlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const holdStart = titleHoldStartRef.current

      if (!holdStart || holdStart.pointerId !== event.pointerId) {
        return
      }

      const deltaX = Math.abs(event.clientX - holdStart.startX)
      const deltaY = Math.abs(event.clientY - holdStart.startY)

      if (deltaX > 8 || deltaY > 8) {
        clearTitleHold()
        clearResolveHold()
      }
    },
    [clearResolveHold, clearTitleHold],
  )

  const startSetHistoryHold = useCallback(
    (
      event: ReactPointerEvent<HTMLElement>,
      setIndex: number,
      samples: WorkoutSetHistorySample[],
    ) => {
      if (
        !isSelectedWorkoutActive ||
        isCompactResolvedRow ||
        isInputDisabled ||
        (event.pointerType === 'mouse' && event.button !== 0)
      ) {
        return
      }

      const targetElement = event.target instanceof Element ? event.target : null

      if (targetElement?.closest('input, select, button, textarea, a')) {
        return
      }

      clearSetHold()
      setHoldStartRef.current = {
        pointerId: event.pointerId,
        samples,
        setIndex,
        startX: event.clientX,
        startY: event.clientY,
      }
      setHoldingSetIndex(setIndex)
      setHoldTimeoutRef.current = window.setTimeout(() => {
        const holdStart = setHoldStartRef.current

        setHoldTimeoutRef.current = null
        setHoldStartRef.current = null
        setHoldingSetIndex(null)

        if (!holdStart) {
          return
        }

        onOpenSetNoteEditor({ actionKind: row.actionKind, isContinuous: row.isContinuous, key: row.key, samples: holdStart.samples, setIndex: holdStart.setIndex, title: row.title })
      }, 560)
    },
    [
      clearSetHold,
      isCompactResolvedRow,
      isInputDisabled,
      isSelectedWorkoutActive,
      onOpenSetNoteEditor,
      row.actionKind,
      row.isContinuous,
      row.key,
      row.title,
    ],
  )

  const handleSetHistoryPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLTableCellElement>) => {
      const holdStart = setHoldStartRef.current

      if (!holdStart || holdStart.pointerId !== event.pointerId) {
        return
      }

      const deltaX = Math.abs(event.clientX - holdStart.startX)
      const deltaY = Math.abs(event.clientY - holdStart.startY)

      if (deltaX > 8 || deltaY > 8) {
        clearSetHold()
      }
    },
    [clearSetHold],
  )

  const openSetHistoryFromInput = useCallback((
    event: ReactMouseEvent<HTMLInputElement>,
    setIndex: number,
    samples: WorkoutSetHistorySample[],
  ) => {
    if (!isSelectedWorkoutActive || isCompactResolvedRow || isInputDisabled) return
    const now = Date.now()
    const previousTap = setInputTapRef.current
    if (!previousTap || previousTap.target !== event.currentTarget || now - previousTap.at > 450) {
      setInputTapRef.current = { at: now, target: event.currentTarget }
      return
    }
    setInputTapRef.current = null
    onOpenSetHistoryPicker({
      actionKind: row.actionKind,
      isContinuous: row.isContinuous,
      key: row.key,
      samples,
      setIndex,
      title: row.title,
    })
  }, [isCompactResolvedRow, isInputDisabled, isSelectedWorkoutActive, onOpenSetHistoryPicker, row.actionKind, row.isContinuous, row.key, row.title])

  const requestRemove = useCallback(() => {
    if (!isSelectedWorkoutActive) {
      return
    }

    onRequestRemove({
      actionKind: row.actionKind,
      hasExistingResponses: hasWorkoutLogResponses(row.log),
      key: row.key,
      title: row.title,
    })
  }, [
    isSelectedWorkoutActive,
    onRequestRemove,
    row.actionKind,
    row.key,
    row.log,
    row.title,
  ])

  return (
    <tr
      ref={attachRowRef}
      role="row"
      aria-label={row.title}
      data-workout-row-key={row.key}
      className={[
        row.log.completed ? 'is-complete' : '',
        row.log.skipped ? 'is-skipped' : '',
        row.actionKind === 'extra' ? 'is-custom' : '',
        isCompactResolvedRow ? 'is-compact-resolved' : '',
        isDragging ? 'is-drag-source' : '',
        isExpanded ? 'is-expanded' : 'is-collapsed',
        isUpNext ? 'is-up-next' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onPointerCancel={() => {
        clearResolveHold()
        clearTitleHold()
        clearSetHold()
      }}
      onPointerUp={() => {
        clearResolveHold()
        clearTitleHold()
        clearSetHold()
      }}
    >
      <td className="workout-table__exercise-cell">
        <div className="workout-table__exercise-header">
          <div className="workout-table__title-row">
            <button
              ref={attachHandleRef}
              type="button"
              className={`workout-table__icon-button workout-table__drag-handle ${isDragging ? 'is-active' : ''}`}
              aria-label={`Drag to reorder ${row.title}`}
              title="Drag to reorder"
            >
              <GripVertical size={16} />
            </button>

            {row.resolvedExercise ? <ProgramExercisePreview key={row.resolvedExercise.id} exercise={row.resolvedExercise} gender={fitnessProfile.gender} videoOnly enabled={!isReordering} onOpen={() => { if (row.resolvedExercise) openRowExerciseDetails(row.resolvedExercise) }} /> : null}
            <button
              type="button"
              className={`workout-table__title-button ${
                isResolveHolding || isTitleHolding ? 'is-holding' : ''
              }`}
              onClick={(event) => {
                if (shouldIgnoreTitleClickRef.current) {
                  shouldIgnoreTitleClickRef.current = false
                  event.preventDefault()
                  return
                }

                if (!isReordering) onToggleExpansion()
              }}
              aria-expanded={isExpanded}
              aria-controls={controlledIds}
              onContextMenu={(event) => event.preventDefault()}
              onPointerDown={(event) => {
                if (isCompactResolvedRow && isSelectedWorkoutActive) {
                  titleHoldStartRef.current = {
                    pointerId: event.pointerId,
                    startX: event.clientX,
                    startY: event.clientY,
                  }
                  startResolveHold()
                  return
                }

                startTitleHold(event)
              }}
              onPointerMove={handleTitlePointerMove}
              onPointerLeave={() => {
                clearResolveHold()
                clearTitleHold()
              }}
              onPointerCancel={() => {
                clearResolveHold()
                clearTitleHold()
              }}
              onPointerUp={() => {
                clearResolveHold()
                clearTitleHold()
              }}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${row.title}`}
              title={isCompactResolvedRow && isSelectedWorkoutActive
                ? `${performanceIndicator.description}. Hold to edit exercise.`
                : 'Tap to expand or collapse. Hold to substitute.'}
            >
              <span className="workout-card__copy">
                {isUpNext ? <span className="workout-card__up-next">Up next</span> : null}
                <span className="workout-table__title-label">{row.title}</span>
                <span className="workout-card__meta">{cardSummary}</span>
                <span className="workout-card__progress" aria-hidden="true">
                  {setLogs.map((setLog, index) => (
                    <span key={index} className={setLog.completedAt ? 'is-logged' : ''} />
                  ))}
                </span>
              </span>
              <span className="workout-card__count" aria-label={`${loggedSetCount} of ${row.visibleSetCount} sets logged`}>
                {loggedSetCount}/{row.visibleSetCount}
              </span>
              <ChevronDown size={16} className="workout-card__chevron" aria-hidden="true" />
            </button>

            <div className="workout-table__row-controls">
              {isSelectedWorkoutActive ? <>
                <button type="button" className="workout-table__icon-button" aria-label={`Move ${row.title} up`} title="Move up" disabled={!canMoveUp} onClick={() => onMove('up')}><ArrowUp size={15} /></button>
                <button type="button" className="workout-table__icon-button" aria-label={`Move ${row.title} down`} title="Move down" disabled={!canMoveDown} onClick={() => onMove('down')}><ArrowDown size={15} /></button>
                <button type="button" className="workout-table__icon-button workout-table__remove-icon" aria-label={`Remove ${row.title}`} title="Remove exercise" onClick={requestRemove}><Minus size={16} /></button>
              </> : null}
              {row.resolvedExercise ? <button type="button" className="workout-table__icon-button workout-table__info-button" onClick={() => row.resolvedExercise && openRowExerciseDetails(row.resolvedExercise)} aria-label={`Open details for ${row.title}`} title={`Open details for ${row.title}`}><Info size={14} /></button> : null}
            </div>

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

        </div>
      </td>

      <td id={`${cardId}-target`} className="workout-table__target-cell" hidden={!isExpanded}>
        {row.coach ? <WorkoutProgressionCoach engine={row.coach.engine} exercise={row.coach.exercise} log={row.log} /> : null}
        <div className="workout-compact-toolbar">
          <details className="workout-compact-reference">
            <summary>Warm-up & program notes</summary>
            <div>
              {row.instructions ? <p>{row.instructions}</p> : null}
              {row.warmups?.length ? <div className="training-target"><strong>Warm-up guidance</strong>{row.warmups.map((set, index) => <span key={index}>{set.reps} reps · {set.weightKg} kg</span>)}<span>Warm-ups are separate from logged work sets.</span></div> : null}
              <WorkoutTargetBadge benchmarkAverages={row.prescriptions ? [] : benchmarkAverageTokens} duration={row.targetDuration} effort={row.targetEffort} mode="vertical" personalAverages={row.prescriptions ? [] : personalAverageTokens} reps={row.targetReps} rest={row.targetRest} sets={row.isContinuous ? undefined : row.visibleSetCount} title={row.title} type={row.isContinuous ? 'continues' : row.resolvedExercise?.type} />
              {row.prescriptions?.map((prescription, index) => <WorkoutSetTarget key={index} prescription={prescription} setIndex={index} superset={row.superset} />)}
            </div>
          </details>
          <button type="button" className="workout-compact-help-button" aria-label={`Explain next-time advice for ${row.title}`} aria-expanded={showAdviceHelp} aria-controls={`${cardId}-advice-help`} onClick={() => setShowAdviceHelp(current => !current)}><Info size={14} /></button>
        </div>
        {showAdviceHelp ? <p className="workout-compact-help" id={`${cardId}-advice-help`}>Tap the next-time weight icon for challenging: keep this weight; tap again to clear. Hold it, slide up for easy (increase) or down for too hard (decrease), then release to select. Slide away to cancel. These are personal notes; program targets stay the same. A dashed icon shows the last workout’s advice. Tap a set number for targets, effort, notes, history, or removal.</p> : null}
        <div className={`workout-compact-columns${row.isContinuous ? ' is-timed' : ''}`} aria-hidden="true"><span>Set</span>{row.isContinuous ? <span className="workout-compact-time-label">{row.prescriptions?.some(prescription => prescription.durationSeconds !== null) ? 'Seconds' : 'Minutes'}</span> : <><span>kg</span><span>Reps</span></>}<span>Next time</span><span>✓</span></div>
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
        const prescription = row.prescriptions?.[setIndex]
        const previousSetSample = getPreviousSetSample(row.previousPerformance, setIndex)
        const setHistorySamples = buildSetHistorySamples({
          isContinuous: row.isContinuous,
          setIndex,
          statsRecord: row.statsRecord,
        })
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
        const isSetCommitted = Boolean(setLog.completedAt)
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
        const isLastVisibleSet = setIndex === row.visibleSetCount - 1
        const primarySetActionLabel = isLastVisibleSet ? 'Finish' : 'Next'
        const canUsePrimarySetAction =
          !isInputDisabled && !isCompactResolvedRow && (isLastVisibleSet || Boolean(setSummary))
        const handlePrimarySetAction = () => {
          if (isLastVisibleSet) {
            if (setSummary) {
              commitSet(setIndex, setLog, { startRest: false })
            }

            finishExercise()
            return
          }

          commitSet(setIndex, setLog, {
            prefillNext: true,
            prefillNextSetLog: getSetSamplePrefill(
              getPreviousSetSample(row.previousPerformance, setIndex + 1),
            ),
          })
        }
        const benchmarkTitle = belowAverageComparisons
          .map(
            (comparison) =>
              `${comparison.metric.label} average ${formatBenchmarkValue(
                comparison.metric.average,
                comparison.metric.unit,
              )}`,
          )
          .join(' / ')

        return (
          <td
            key={`${row.key}-set-${setIndex}`}
            id={`${cardId}-set-${setIndex}`}
            hidden={!isExpanded}
            className={[
              'workout-table__set-cell',
              isSetCommitted ? 'is-set-logged' : '',
              belowAverageComparisons.length ? 'is-below-average' : '',
              recentAverageComparisons.length ? 'is-below-recent-average' : '',
              holdingSetIndex === setIndex ? 'is-history-holding' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onContextMenu={(event) => {
              if (setHistorySamples.length && isSelectedWorkoutActive && !isCompactResolvedRow) {
                event.preventDefault()
              }
            }}
            onPointerCancel={clearSetHold}
            onPointerDown={(event) =>
              startSetHistoryHold(event, setIndex, setHistorySamples)
            }
            onPointerLeave={clearSetHold}
            onPointerMove={handleSetHistoryPointerMove}
            onPointerUp={clearSetHold}
            title={benchmarkTitle || undefined}
          >
            <div className={`workout-compact-set${row.isContinuous ? ' is-timed' : ''}`}>
              <button type="button" className={`workout-compact-set-number${setLog.note || setLog.tags.length || setLog.effort ? ' has-details' : ''}`} aria-label={`Set ${setIndex + 1} options for ${row.title}`} title={`Set ${setIndex + 1}: targets, effort, notes, history and removal`} onClick={() => onOpenSetNoteEditor({ actionKind: row.actionKind, isContinuous: row.isContinuous, key: row.key, samples: setHistorySamples, setIndex, title: row.title })}>{setIndex + 1}</button>
              {row.isContinuous ? <input className={`workout-compact-duration${durationBenchmarkStatus === 'below' ? ' is-below-average' : ''}`} type="text" inputMode="decimal" aria-label={`${row.title} set ${setIndex + 1} duration${prescription?.durationSeconds != null ? ' in seconds' : ' in minutes'}`} value={prescription?.durationSeconds != null ? (setLog.duration ? String(Number(setLog.duration) * 60) : '') : setLog.duration} onChange={event => updateSetLog(setIndex, 'duration', prescription?.durationSeconds != null && event.target.value ? String(Number(event.target.value) / 60) : event.target.value)} onClick={event => openSetHistoryFromInput(event, setIndex, setHistorySamples)} placeholder={prescription?.durationSeconds != null ? String(prescription.durationSeconds) : formatNullableNumber(previousSetSample?.durationMinutes ?? null) || 'min'} disabled={isInputDisabled || isCompactResolvedRow} /> : <>
                <input className={weightBenchmarkStatus === 'below' ? 'is-below-average' : ''} type="text" inputMode="decimal" aria-label={`${row.title} set ${setIndex + 1} weight in kg`} value={setLog.weightKg} onChange={event => updateSetLog(setIndex, 'weightKg', event.target.value)} onClick={event => openSetHistoryFromInput(event, setIndex, setHistorySamples)} placeholder={formatNullableNumber(previousSetSample?.weightKg ?? null) || 'kg'} disabled={isInputDisabled || isCompactResolvedRow} />
                <input className={repsBenchmarkStatus === 'below' ? 'is-below-average' : ''} type="text" inputMode="numeric" aria-label={`${row.title} set ${setIndex + 1} reps`} value={setLog.reps} onChange={event => updateSetLog(setIndex, 'reps', event.target.value)} onClick={event => openSetHistoryFromInput(event, setIndex, setHistorySamples)} placeholder={formatNullableNumber(previousSetSample?.reps ?? null) || (prescription?.reps != null ? String(prescription.reps) : 'reps')} disabled={isInputDisabled || isCompactResolvedRow} />
              </>}
              <NextTimeButton value={setLog.progression} inherited={previousSetSample?.progression} disabled={isInputDisabled} label={`${row.title} set ${setIndex + 1}`} onChange={value => row.actionKind === 'planned' ? onSetWorkoutExerciseProgression(row.key, setIndex, value) : onSetWorkoutExtraExerciseProgression(row.key, setIndex, value)} />
              <button type="button" className={`workout-compact-commit${isSetCommitted ? ' is-logged' : ''}`} onClick={handlePrimarySetAction} disabled={!canUsePrimarySetAction} aria-label={isSetCommitted ? `Update set ${setIndex + 1} for ${row.title}` : `${primarySetActionLabel} ${row.title}`} aria-pressed={isSetCommitted} title={isSetCommitted ? 'Update this logged set' : isLastVisibleSet ? 'Finish exercise' : row.targetRest ? `Log set and start ${row.targetRest} rest` : 'Log set and continue'}><CheckCircle2 size={17} /><span className="sr-only">{isSetCommitted ? '✓ Logged' : 'Log set'}</span></button>
            </div>

          </td>
        )
      })}

      <td id={`${cardId}-actions`} className="workout-table__append-cell" hidden={!isExpanded}>
        {isSelectedWorkoutActive ? <div className="workout-compact-footer">
          {isCompactResolvedRow ? <button type="button" className="workout-compact-text-button" onClick={unlockResolvedRow} aria-label={`Edit ${row.title}`}><Pencil size={13} />Edit exercise</button> : <button type="button" className="workout-compact-text-button" onClick={() => row.actionKind === 'planned' ? onAddWorkoutExerciseSet(row.key, row.visibleSetCount) : onAddWorkoutExtraExerciseSet(row.key, row.visibleSetCount)} aria-label={`Add set for ${row.title}`}><Plus size={13} />Set</button>}
          <details className="workout-compact-actions-menu"><summary>Exercise options</summary><div>
            {row.actionKind === 'planned' && !isCompactResolvedRow && isExerciseEmpty ? <button type="button" className="workout-compact-text-button" onClick={() => onToggleWorkoutExerciseSkipped(row.key)} aria-label={`Skip ${row.title}`}><SkipForward size={13} />Skip exercise</button> : null}
            <button type="button" className="workout-compact-text-button" onClick={requestRemove} aria-label={`Remove ${row.title}`}><Trash2 size={13} />Remove exercise</button>
          </div></details>
        </div> : null}
      </td>
    </tr>
  )
}

export default function WorkoutExerciseTable({
  activeWorkout,
  activeWorkoutExerciseLogs,
  activeWorkoutExtraEntries,
  contentExercises,
  fitnessProfile,
  isEditingCompletedWorkout,
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
  onSetWorkoutExerciseProgression,
  onSetWorkoutExtraExerciseProgression,
  onUpdateWorkoutExerciseSetLog,
  onUpdateWorkoutExtraExerciseSetLog,
  onUpdateWorkoutSetTags,
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
  const [removeState, setRemoveState] = useState<WorkoutRemoveRequest | null>(null)
  const [setHistoryState, setSetHistoryState] =
    useState<WorkoutSetHistoryRequest | null>(null)
  const [setNoteState, setSetNoteState] = useState<WorkoutSetNoteRequest | null>(null)
  const expansionContext = `${section.id}:${activeWorkout?.sessionId ?? 'preview'}:${isEditingCompletedWorkout}`
  const [expandedExercise, setExpandedExercise] = useState<{ context: string; key: string | null }>({ context: expansionContext, key: null })
  if (expandedExercise.context !== expansionContext) {
    setExpandedExercise({ context: expansionContext, key: null })
  }
  const [draggedKey, setDraggedKey] = useState<string | null>(null)
  const [orderedKeys, setOrderedKeys] = useState<string[]>([])
  const [orderedKeysBaseSignature, setOrderedKeysBaseSignature] = useState('')
  const orderedKeysRef = useRef<string[]>([])
  const dragBaseOrderRef = useRef<string[]>([])
  const dragRestoreExpansionRef = useRef<{ context: string; key: string | null } | null>(null)
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
        const isContinuous = resolvedExercise?.type === 'continues' || Boolean(exercise.prescriptions?.some(p=>p.durationSeconds !== null))
        const targetSets = exercise.sets || resolvedExercise?.defaultTargets.sets || ''
        const targetDuration =
          exercise.duration || resolvedExercise?.defaultTargets.duration || ''
        const targetReps =
          exercise.reps ||
          targetDuration ||
          resolvedExercise?.defaultTargets.reps ||
          'Open'
        const targetRest = exercise.rest || resolvedExercise?.defaultTargets.rest || ''
        const targetSetCount = exercise.prescriptions?.length ?? (isContinuous ? 1 : getTargetSetCount(targetSets))
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
          instructions: programNote(exercise.notes),
          coach: activeWorkout?.engine ? {engine: activeWorkout.engine, exercise} : undefined,
          prescriptions: exercise.prescriptions,
          warmups: exercise.warmups,
          superset: exercise.superset,
          isContinuous,
          key: exercise.id,
          log: workoutLog,
          previousPerformance,
          resolvedExercise,
          statsRecord,
          targetDuration,
          targetEffort: '',
          targetReps,
          targetRest,
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
        const targetDuration = entry.duration || resolvedExercise?.defaultTargets.duration || ''
        const targetSetCount =
          isContinuous || !resolvedExercise
            ? 1
            : getTargetSetCount(resolvedExercise.defaultTargets.sets)

        return {
          actionKind: 'extra',
          isContinuous,
          key: entry.logId,
          log: entry,
          previousPerformance,
          resolvedExercise,
          statsRecord,
          targetDuration,
          targetEffort: '',
          targetReps:
            resolvedExercise?.defaultTargets.reps || targetDuration || 'Open',
          targetRest: resolvedExercise?.defaultTargets.rest || '',
          targetSetCount,
          title: entry.exerciseName,
          visibleSetCount: Math.max(
            1,
            entry.targetSetCountOverride ?? targetSetCount,
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

  const upNextKey = isSelectedWorkoutActive
    ? orderedRows.find(row => !row.log.completed && !row.log.skipped)?.key
    : undefined
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
      dragRestoreExpansionRef.current = expandedExercise
      setExpandedExercise({ context: expansionContext, key: null })
      setOrderedKeysBaseSignature(baseOrderSignature)
      setDraggedKey(currentDraggedKey)
      setOrderedKeys(currentOrder)
    },
    [baseOrder, baseOrderSignature, currentOrder, expandedExercise, expansionContext],
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

      const restoreExpansion = dragRestoreExpansionRef.current
      dragRestoreExpansionRef.current = null
      if (restoreExpansion?.context === expansionContext) setExpandedExercise(restoreExpansion)
      setDraggedKey(null)
    },
    [baseOrder, expansionContext, onReorderWorkoutExercise],
  )

  const confirmRemoveExercise = useCallback(() => {
    if (!removeState) {
      return
    }

    if (removeState.actionKind === 'planned') {
      onRemoveWorkoutExercise(removeState.key, { skipConfirm: true })
    } else {
      onRemoveWorkoutExtraExercise(removeState.key)
    }

    setRemoveState(null)
  }, [onRemoveWorkoutExercise, onRemoveWorkoutExtraExercise, removeState])

  const applySetHistorySample = useCallback(
    (sample: WorkoutSetHistorySample) => {
      if (!setHistoryState) {
        return
      }

      const updateSetLog =
        setHistoryState.actionKind === 'planned'
          ? onUpdateWorkoutExerciseSetLog
          : onUpdateWorkoutExtraExerciseSetLog
      const fields: Array<keyof WorkoutSetLogPrefill> = setHistoryState.isContinuous
        ? ['duration', 'effort']
        : ['weightKg', 'reps', 'effort']

      fields.forEach((field) => {
        const value = sample.values[field]

        if (value !== undefined) {
          updateSetLog(setHistoryState.key, setHistoryState.setIndex, field, value)
        }
      })

      setSetHistoryState(null)
    },
    [
      onUpdateWorkoutExerciseSetLog,
      onUpdateWorkoutExtraExerciseSetLog,
      setHistoryState,
    ],
  )

  const updateNoteField = (field: 'note' | 'tags' | 'effort', value: string | string[]) => {
    if (!setNoteState) return
    const updateSetLog = setNoteState.actionKind === 'planned' ? onUpdateWorkoutExerciseSetLog : onUpdateWorkoutExtraExerciseSetLog
    if (field !== 'tags') updateSetLog(setNoteState.key, setNoteState.setIndex, field, String(value))
    else onUpdateWorkoutSetTags(setNoteState.actionKind, setNoteState.key, setNoteState.setIndex, value as string[])
  }

  const currentNoteRow = setNoteState ? rows.find(row => row.key === setNoteState.key && row.actionKind === setNoteState.actionKind) : null
  const notePrescription = currentNoteRow && setNoteState ? currentNoteRow.prescriptions?.[setNoteState.setIndex] : null
  const requiresNoteEffort = Boolean(notePrescription && (notePrescription.effort != null || notePrescription.logEffort))
  const currentNoteSet = currentNoteRow && setNoteState ? ensureWorkoutSetLogs(currentNoteRow.log.setLogs, currentNoteRow.visibleSetCount)[setNoteState.setIndex] : null
  const canEditNote = Boolean(isSelectedWorkoutActive && currentNoteRow && !currentNoteRow.log.skipped)
  const canRemoveNoteSet = Boolean(canEditNote && currentNoteRow && currentNoteSet && (currentNoteRow.visibleSetCount > 1 || hasSetLogContent(currentNoteSet) || currentNoteSet.completedAt || currentNoteSet.note || currentNoteSet.tags.length || currentNoteSet.progression))
  const noteComparisons = currentNoteRow && currentNoteSet ? compareSetToExerciseBenchmark(currentNoteRow.resolvedExercise, fitnessProfile, currentNoteSet) : []
  const recentNoteComparisons = currentNoteRow && currentNoteSet && setNoteState ? getRecentSetAverageComparisons({ isContinuous: currentNoteRow.isContinuous, lowerWeightIsBetter: currentNoteRow.resolvedExercise?.strengthBenchmarks?.kind === 'assistanceKg', setIndex: setNoteState.setIndex, setLog: currentNoteSet, statsRecord: currentNoteRow.statsRecord }) : []


  return (
    <>
      <section className={`section-card workout-table-card workout-exercise-cards workout-compact${draggedKey ? ' is-reordering' : ''}`}>
        <div className="section-header workout-table-card__header">
          <h2>Exercises</h2>
          <span className="pill pill--subtle">{orderedRows.length} exercises</span>
        </div>

        <p className="workout-card__hint" role="status">
          {draggedKey ? 'Reordering exercises — drop to place it.' : 'Tap an exercise to log sets. Use arrows or drag to reorder; use minus to remove.'}
        </p>
        <div className="workout-table-scroll">
          <table className="workout-table" role="table" aria-label="Workout exercises and sets">
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
            <tbody role="rowgroup">
              {orderedRows.map((row, rowIndex) => (
                <SortableWorkoutRow
                  key={`${row.actionKind}-${row.key}`}
                  canMoveUp={rowIndex > 0}
                  canMoveDown={rowIndex < orderedRows.length - 1}
                  isExpanded={expandedExercise.context === expansionContext && expandedExercise.key === row.key}
                  isReordering={Boolean(draggedKey)}
                  isUpNext={row.key === upNextKey}
                  onToggleExpansion={() => {
                    if (!draggedKey) setExpandedExercise(current => ({ context: expansionContext, key: current.context === expansionContext && current.key === row.key ? null : row.key }))
                  }}
                  fitnessProfile={fitnessProfile}
                  isEditingCompletedWorkout={isEditingCompletedWorkout}
                  isSelectedWorkoutActive={isSelectedWorkoutActive}
                  maxTargetSetCount={maxTargetSetCount}
                  onAddWorkoutExerciseSet={onAddWorkoutExerciseSet}
                  onAddWorkoutExtraExerciseSet={onAddWorkoutExtraExerciseSet}
                  onCommitWorkoutSet={onCommitWorkoutSet}
                  onDragEnd={endDrag}
                  onDragStart={startDrag}
                  onMove={(direction) => {
                    const target = orderedRows[rowIndex + (direction === 'up' ? -1 : 1)]
                    if (target) onReorderWorkoutExercise(row.key, target.key, direction === 'up' ? 'before' : 'after')
                  }}
                  onOpenExerciseDetails={onOpenExerciseDetails}
                  onPreviewReorder={previewReorder}
                  onOpenSetHistoryPicker={setSetHistoryState}
                  onOpenSetNoteEditor={setSetNoteState}
                  onRequestRemove={(selectedRow) => setRemoveState(selectedRow)}
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
                  onSetWorkoutExerciseProgression={onSetWorkoutExerciseProgression}
                  onSetWorkoutExtraExerciseProgression={onSetWorkoutExtraExerciseProgression}
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

      {removeState ? (
        <BottomSheet
          className="finish-workout-dialog workout-remove-dialog"
          description={
            removeState.hasExistingResponses
              ? 'This will remove the exercise from this workout and clear its logged responses.'
              : 'This will remove the exercise from this workout.'
          }
          kicker="Remove Exercise"
          onClose={() => setRemoveState(null)}
          title={`Remove ${removeState.title}?`}
        >
          <div className="row-actions finish-workout-dialog__actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setRemoveState(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="primary-button workout-table__remove-confirm-button"
              onClick={confirmRemoveExercise}
            >
              Remove
            </button>
          </div>
        </BottomSheet>
      ) : null}

      {setHistoryState ? (
        <BottomSheet
          className="workout-set-history-sheet"
          description="Pick a previous logged value to fill this set. Existing values in matching fields will be replaced."
          kicker="Set History"
          onClose={() => setSetHistoryState(null)}
          title={`${setHistoryState.title} / Set ${setHistoryState.setIndex + 1}`}
        >
          <div className="workout-set-history-list">
            {setHistoryState.samples.length ? setHistoryState.samples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                className="workout-set-history-option"
                onClick={() => applySetHistorySample(sample)}
              >
                <span>
                  <strong>{sample.summary}</strong>
                  <span>{sample.dateLabel}</span>
                </span>
                <span className="workout-set-history-option__details">
                  {sample.detailLines.join(' / ')}
                </span>
              </button>
            )) : <p className="muted">No saved history for this set yet.</p>}
          </div>
        </BottomSheet>
      ) : null}

      {setNoteState ? (
        <BottomSheet className="workout-set-options-sheet" kicker="Set details" title={`${setNoteState.title} / Set ${setNoteState.setIndex + 1}`} description="Targets, personal effort, notes, and history for this set." onClose={() => setSetNoteState(null)}>
          {currentNoteRow?.prescriptions?.[setNoteState.setIndex] ? <WorkoutSetTarget prescription={currentNoteRow.prescriptions[setNoteState.setIndex]} setIndex={setNoteState.setIndex} superset={currentNoteRow.superset} /> : null}
          <label className="field"><span>{fitnessProfile.effortScale === 'rpe' ? 'RPE' : fitnessProfile.effortScale === 'rir' ? 'Reps in reserve (RIR)' : 'Effort'} ({requiresNoteEffort ? 'required' : 'optional'})</span><input required={requiresNoteEffort} type="text" inputMode="decimal" aria-label="Set effort" value={currentNoteSet?.effort ?? ''} onChange={event => updateNoteField('effort', event.target.value)} disabled={!canEditNote} placeholder={fitnessProfile.effortScale === 'rpe' ? 'e.g. 8' : fitnessProfile.effortScale === 'rir' ? 'e.g. 2' : 'How hard was this set?'} /></label>
          <label className="field"><span>Note</span><textarea value={currentNoteSet?.note ?? ''} onChange={event => updateNoteField('note', event.target.value)} disabled={!canEditNote} placeholder="What happened in this set?" /></label>
          <div className="photo-timeline__tag-list">{setNoteTags.map(tag => { const checked = currentNoteSet?.tags.includes(tag) ?? false; return <button type="button" key={tag} className={`chip-button ${checked ? 'is-active' : ''}`} aria-pressed={checked} disabled={!canEditNote} onClick={() => updateNoteField('tags', checked ? (currentNoteSet?.tags ?? []).filter(entry => entry !== tag) : [...(currentNoteSet?.tags ?? []), tag])}>{tag}</button> })}</div>
          {noteComparisons.length || recentNoteComparisons.length ? <details className="workout-set-comparisons"><summary>Benchmarks & recent averages</summary>{noteComparisons.map(comparison => <p key={comparison.metric.key}>{comparison.metric.label}: reference average {formatBenchmarkValue(comparison.metric.average, comparison.metric.unit)}{comparison.status === 'below' ? ' · Below average' : ''}</p>)}{recentNoteComparisons.length ? <p>Below your last 3: {recentNoteComparisons.map(comparison => comparison.label).join(', ')}</p> : null}</details> : null}
          <button type="button" className="ghost-button" onClick={() => { setSetHistoryState({ actionKind: setNoteState.actionKind, isContinuous: setNoteState.isContinuous, key: setNoteState.key, samples: setNoteState.samples, setIndex: setNoteState.setIndex, title: setNoteState.title }); setSetNoteState(null) }}>Use a previous set</button>
          <div className="row-actions finish-workout-dialog__actions">
            <button type="button" className="secondary-button workout-table__set-remove-button" disabled={!canRemoveNoteSet} onClick={() => { if (!currentNoteRow || !canRemoveNoteSet) return; const count = Math.max(1, currentNoteRow.visibleSetCount - 1); if (setNoteState.actionKind === 'planned') onRemoveWorkoutExerciseSetLog(setNoteState.key, setNoteState.setIndex, count); else onRemoveWorkoutExtraExerciseSetLog(setNoteState.key, setNoteState.setIndex, count); setSetNoteState(null) }}><Trash2 size={14} /> Remove set</button>
            <button type="button" className="primary-button" onClick={() => setSetNoteState(null)}>Done</button>
          </div>
        </BottomSheet>
      ) : null}

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
