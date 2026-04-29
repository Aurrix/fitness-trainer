import type { ProgramSource } from '../services/program-stats'
import type { WorkoutExerciseLogType } from './workout'

export type ExerciseTargetCoefficient = {
  coefficient: number
  muscleGroup: string
}

export type ExerciseSetPerformanceSample = {
  durationMinutes: number | null
  difficulty: string
  recordedAt: string | null
  reps: number | null
  setIndex: number
  suboptimal: boolean
  weightKg: number | null
}

export type ExercisePerformanceSample = {
  completed: boolean
  completedAt: string | null
  difficultySamples: string[]
  exerciseId: string | null
  exerciseName: string
  exerciseType: WorkoutExerciseLogType
  id: string
  maxWeightKg: number | null
  muscleGroups: string[]
  notes: string
  performedSetCount: number
  programId: string | null
  programName: string | null
  programSource: ProgramSource | null
  recordedAt: string
  sectionId: string | null
  sectionName: string | null
  sessionDate: string
  setCount: number
  sets: ExerciseSetPerformanceSample[]
  skipped: boolean
  startedAt: string | null
  targetCoefficients: ExerciseTargetCoefficient[]
  totalDurationMinutes: number | null
  totalReps: number | null
  totalVolumeKg: number | null
  workoutLogId: string | null
}

export type ExerciseStatsRecord = {
  exerciseId: string | null
  exerciseName: string
  exerciseType: WorkoutExerciseLogType
  lastRecordedAt: string | null
  muscleGroups: string[]
  progressionHistory: ExercisePerformanceSample[]
  totalLoggedSessions: number
}

export type ExerciseStatsStore = {
  byExerciseKey: Record<string, ExerciseStatsRecord>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toStringValue(value: unknown, fallback = '') {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return fallback
}

function toNullableStringValue(value: unknown) {
  const normalizedValue = toStringValue(value).trim()
  return normalizedValue || null
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsedValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN

  return Number.isFinite(parsedValue) ? parsedValue : null
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => toStringValue(entry).trim())
    .filter(Boolean)
}

function toExerciseType(value: unknown): WorkoutExerciseLogType {
  return value === 'extra-exercise' || value === 'cardio' ? value : 'planned'
}

function normalizeTargetCoefficient(value: unknown): ExerciseTargetCoefficient | null {
  if (!isRecord(value)) {
    return null
  }

  const muscleGroup = toStringValue(value.muscleGroup).trim()
  const coefficient = toNullableNumber(value.coefficient)

  if (!muscleGroup || coefficient === null) {
    return null
  }

  return {
    coefficient,
    muscleGroup,
  }
}

function normalizeSetPerformanceSample(value: unknown): ExerciseSetPerformanceSample | null {
  if (!isRecord(value)) {
    return null
  }

  const setIndex = toNullableNumber(value.setIndex)

  return {
    durationMinutes: toNullableNumber(value.durationMinutes),
    difficulty: toStringValue(value.difficulty),
    recordedAt: toNullableStringValue(value.recordedAt),
    reps: toNullableNumber(value.reps),
    setIndex: setIndex ?? 1,
    suboptimal: value.suboptimal === true,
    weightKg: toNullableNumber(value.weightKg),
  }
}

function normalizePerformanceSample(value: unknown): ExercisePerformanceSample | null {
  if (!isRecord(value)) {
    return null
  }

  const recordedAt =
    toNullableStringValue(value.recordedAt) ?? new Date().toISOString()
  const sessionDate =
    toNullableStringValue(value.sessionDate) ?? recordedAt.slice(0, 10)

  return {
    completed: value.completed === true,
    completedAt: toNullableStringValue(value.completedAt),
    difficultySamples: toStringArray(value.difficultySamples),
    exerciseId: toNullableStringValue(value.exerciseId),
    exerciseName: toStringValue(value.exerciseName, 'Exercise'),
    exerciseType: toExerciseType(value.exerciseType),
    id:
      toStringValue(value.id) ||
      `exercise-sample-${Math.random().toString(36).slice(2, 10)}`,
    maxWeightKg: toNullableNumber(value.maxWeightKg),
    muscleGroups: toStringArray(value.muscleGroups),
    notes: toStringValue(value.notes),
    performedSetCount: toNullableNumber(value.performedSetCount) ?? 0,
    programId: toNullableStringValue(value.programId),
    programName: toNullableStringValue(value.programName),
    programSource: value.programSource === 'custom' ? 'custom' : value.programSource === 'library' ? 'library' : null,
    recordedAt,
    sectionId: toNullableStringValue(value.sectionId),
    sectionName: toNullableStringValue(value.sectionName),
    sessionDate,
    setCount: toNullableNumber(value.setCount) ?? 0,
    sets: Array.isArray(value.sets)
      ? value.sets
          .map((entry) => normalizeSetPerformanceSample(entry))
          .filter((entry): entry is ExerciseSetPerformanceSample => entry !== null)
      : [],
    skipped: value.skipped === true,
    startedAt: toNullableStringValue(value.startedAt),
    targetCoefficients: Array.isArray(value.targetCoefficients)
      ? value.targetCoefficients
          .map((entry) => normalizeTargetCoefficient(entry))
          .filter((entry): entry is ExerciseTargetCoefficient => entry !== null)
      : [],
    totalDurationMinutes: toNullableNumber(value.totalDurationMinutes),
    totalReps: toNullableNumber(value.totalReps),
    totalVolumeKg: toNullableNumber(value.totalVolumeKg),
    workoutLogId: toNullableStringValue(value.workoutLogId),
  }
}

export function createExerciseStatsStoreKey(
  exerciseId: string | null,
  exerciseName: string,
) {
  return exerciseId?.trim() || `name:${slugify(exerciseName || 'exercise')}`
}

export function createEmptyExerciseStatsStore(): ExerciseStatsStore {
  return {
    byExerciseKey: {},
  }
}

export function normalizeExerciseStatsStore(value: unknown): ExerciseStatsStore {
  if (!isRecord(value) || !isRecord(value.byExerciseKey)) {
    return createEmptyExerciseStatsStore()
  }

  return {
    byExerciseKey: Object.entries(value.byExerciseKey).reduce<
      Record<string, ExerciseStatsRecord>
    >((records, [exerciseKey, rawRecord]) => {
      if (!isRecord(rawRecord)) {
        return records
      }

      const progressionHistory = Array.isArray(rawRecord.progressionHistory)
        ? rawRecord.progressionHistory
            .map((entry) => normalizePerformanceSample(entry))
            .filter((entry): entry is ExercisePerformanceSample => entry !== null)
            .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt))
        : []

      records[exerciseKey] = {
        exerciseId: toNullableStringValue(rawRecord.exerciseId),
        exerciseName: toStringValue(rawRecord.exerciseName, 'Exercise'),
        exerciseType: toExerciseType(rawRecord.exerciseType),
        lastRecordedAt:
          toNullableStringValue(rawRecord.lastRecordedAt) ??
          progressionHistory[0]?.recordedAt ??
          null,
        muscleGroups: toStringArray(rawRecord.muscleGroups),
        progressionHistory,
        totalLoggedSessions:
          toNullableNumber(rawRecord.totalLoggedSessions) ?? progressionHistory.length,
      }

      return records
    }, {}),
  }
}

export function appendExercisePerformanceSamples(
  store: ExerciseStatsStore,
  entries: ExercisePerformanceSample[],
) {
  if (!entries.length) {
    return store
  }

  const nextStore: ExerciseStatsStore = {
    byExerciseKey: {
      ...store.byExerciseKey,
    },
  }

  for (const entry of entries) {
    const exerciseKey = createExerciseStatsStoreKey(entry.exerciseId, entry.exerciseName)
    const currentRecord =
      nextStore.byExerciseKey[exerciseKey] ??
      {
        exerciseId: entry.exerciseId,
        exerciseName: entry.exerciseName,
        exerciseType: entry.exerciseType,
        lastRecordedAt: null,
        muscleGroups: entry.muscleGroups,
        progressionHistory: [],
        totalLoggedSessions: 0,
      }

    const progressionHistory = [entry, ...currentRecord.progressionHistory].sort((left, right) =>
      right.recordedAt.localeCompare(left.recordedAt),
    )

    nextStore.byExerciseKey[exerciseKey] = {
      ...currentRecord,
      exerciseId: entry.exerciseId,
      exerciseName: entry.exerciseName,
      exerciseType: entry.exerciseType,
      lastRecordedAt: progressionHistory[0]?.recordedAt ?? entry.recordedAt,
      muscleGroups: entry.muscleGroups.length ? entry.muscleGroups : currentRecord.muscleGroups,
      progressionHistory,
      totalLoggedSessions: progressionHistory.length,
    }
  }

  return nextStore
}
