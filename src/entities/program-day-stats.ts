import type { ProgramSource } from '../services/program-stats'
import type {
  ExerciseSetPerformanceSample,
  ExerciseTargetCoefficient,
} from './exercise-stats'
import type { WorkoutExerciseLogType } from './workout'

export type ProgramDayExerciseStatsEntry = {
  completed: boolean
  completedAt: string | null
  difficultySamples: string[]
  exerciseId: string | null
  exerciseName: string
  exerciseType: WorkoutExerciseLogType
  logId: string
  maxWeightKg: number | null
  muscleGroups: string[]
  performedSetCount: number
  setCount: number
  sets: ExerciseSetPerformanceSample[]
  skipped: boolean
  targetCoefficients: ExerciseTargetCoefficient[]
  totalDurationMinutes: number | null
  totalReps: number | null
  totalVolumeKg: number | null
}

export type ProgramDayMuscleStatsEntry = {
  difficultySamples: string[]
  exerciseCount: number
  maxWeightKg: number | null
  muscleGroup: string
  performedSetCount: number
  targetCoefficient: number
  totalDurationMinutes: number | null
  totalReps: number | null
  totalVolumeKg: number | null
}

export type ProgramDayLog = {
  cardioEntryCount: number
  completedAt: string
  completedExerciseCount: number
  durationMinutes: number
  exerciseEntries: ProgramDayExerciseStatsEntry[]
  id: string
  notes: string
  programId: string
  programName: string
  programSource: ProgramSource
  recordedAt: string
  sectionId: string
  sectionName: string
  sessionDate: string
  sessionId: string
  startedAt: string
  targetedMuscleGroups: string[]
  totalExerciseCount: number
  muscleEntries: ProgramDayMuscleStatsEntry[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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

function toExerciseType(value: unknown): WorkoutExerciseLogType {
  return value === 'extra-exercise' || value === 'cardio' ? value : 'planned'
}

function normalizeProgramDayExerciseStatsEntry(
  value: unknown,
): ProgramDayExerciseStatsEntry | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    completed: value.completed === true,
    completedAt: toNullableStringValue(value.completedAt),
    difficultySamples: toStringArray(value.difficultySamples),
    exerciseId: toNullableStringValue(value.exerciseId),
    exerciseName: toStringValue(value.exerciseName, 'Exercise'),
    exerciseType: toExerciseType(value.exerciseType),
    logId:
      toStringValue(value.logId) || `day-exercise-${Math.random().toString(36).slice(2, 10)}`,
    maxWeightKg: toNullableNumber(value.maxWeightKg),
    muscleGroups: toStringArray(value.muscleGroups),
    performedSetCount: toNullableNumber(value.performedSetCount) ?? 0,
    setCount: toNullableNumber(value.setCount) ?? 0,
    sets: Array.isArray(value.sets)
      ? value.sets
          .map((entry) => normalizeSetPerformanceSample(entry))
          .filter((entry): entry is ExerciseSetPerformanceSample => entry !== null)
      : [],
    skipped: value.skipped === true,
    targetCoefficients: Array.isArray(value.targetCoefficients)
      ? value.targetCoefficients
          .map((entry) => normalizeTargetCoefficient(entry))
          .filter((entry): entry is ExerciseTargetCoefficient => entry !== null)
      : [],
    totalDurationMinutes: toNullableNumber(value.totalDurationMinutes),
    totalReps: toNullableNumber(value.totalReps),
    totalVolumeKg: toNullableNumber(value.totalVolumeKg),
  }
}

function normalizeProgramDayMuscleStatsEntry(
  value: unknown,
): ProgramDayMuscleStatsEntry | null {
  if (!isRecord(value)) {
    return null
  }

  const muscleGroup = toStringValue(value.muscleGroup).trim()

  if (!muscleGroup) {
    return null
  }

  return {
    difficultySamples: toStringArray(value.difficultySamples),
    exerciseCount: toNullableNumber(value.exerciseCount) ?? 0,
    maxWeightKg: toNullableNumber(value.maxWeightKg),
    muscleGroup,
    performedSetCount: toNullableNumber(value.performedSetCount) ?? 0,
    targetCoefficient: toNullableNumber(value.targetCoefficient) ?? 0,
    totalDurationMinutes: toNullableNumber(value.totalDurationMinutes),
    totalReps: toNullableNumber(value.totalReps),
    totalVolumeKg: toNullableNumber(value.totalVolumeKg),
  }
}

export function normalizeProgramDayLog(value: unknown): ProgramDayLog | null {
  if (!isRecord(value)) {
    return null
  }

  const completedAt =
    toNullableStringValue(value.completedAt) ?? new Date().toISOString()

  return {
    cardioEntryCount: toNullableNumber(value.cardioEntryCount) ?? 0,
    completedAt,
    completedExerciseCount: toNullableNumber(value.completedExerciseCount) ?? 0,
    durationMinutes: toNullableNumber(value.durationMinutes) ?? 0,
    exerciseEntries: Array.isArray(value.exerciseEntries)
      ? value.exerciseEntries
          .map((entry) => normalizeProgramDayExerciseStatsEntry(entry))
          .filter((entry): entry is ProgramDayExerciseStatsEntry => entry !== null)
      : [],
    id: toStringValue(value.id) || `program-day-${Math.random().toString(36).slice(2, 10)}`,
    notes: toStringValue(value.notes),
    programId: toStringValue(value.programId),
    programName: toStringValue(value.programName, 'Workout'),
    programSource: value.programSource === 'custom' ? 'custom' : 'library',
    recordedAt: toNullableStringValue(value.recordedAt) ?? completedAt,
    sectionId: toStringValue(value.sectionId),
    sectionName: toStringValue(value.sectionName, 'Workout Day'),
    sessionDate: toNullableStringValue(value.sessionDate) ?? completedAt.slice(0, 10),
    sessionId: toStringValue(value.sessionId),
    startedAt: toNullableStringValue(value.startedAt) ?? completedAt,
    targetedMuscleGroups: toStringArray(value.targetedMuscleGroups),
    totalExerciseCount: toNullableNumber(value.totalExerciseCount) ?? 0,
    muscleEntries: Array.isArray(value.muscleEntries)
      ? value.muscleEntries
          .map((entry) => normalizeProgramDayMuscleStatsEntry(entry))
          .filter((entry): entry is ProgramDayMuscleStatsEntry => entry !== null)
      : [],
  }
}

export function normalizeProgramDayLogs(value: unknown): ProgramDayLog[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => normalizeProgramDayLog(entry))
    .filter((entry): entry is ProgramDayLog => entry !== null)
    .sort((left, right) => right.completedAt.localeCompare(left.completedAt))
}
