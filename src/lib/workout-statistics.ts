import {
  appendExercisePerformanceSamples,
  replaceExercisePerformanceSamplesForWorkout,
  type ExercisePerformanceSample,
  type ExerciseSetPerformanceSample,
  type ExerciseStatsStore,
  type ExerciseTargetCoefficient,
} from '../entities/exercise-stats'
import {
  type ProgramDayExerciseStatsEntry,
  type ProgramDayLog,
  type ProgramDayMuscleStatsEntry,
} from '../entities/program-day-stats'
import type {
  ActiveWorkout,
  WorkoutExerciseLogEntry,
  WorkoutSetLogEntry,
} from '../entities/workout'

function parseNullableNumber(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

export function getSessionDateKey(dateValue: string) {
  const date = new Date(dateValue)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    .toISOString()
    .slice(0, 10)
}

function hasSetContent(setLog: WorkoutSetLogEntry) {
  return Boolean(
    setLog.duration.trim() ||
      setLog.weightKg.trim() ||
      setLog.reps.trim() ||
      setLog.effort.trim(),
  )
}

function buildTargetCoefficients(muscleGroups: string[]) {
  if (!muscleGroups.length) {
    return []
  }

  const coefficient = 1 / muscleGroups.length
  return muscleGroups.map<ExerciseTargetCoefficient>((muscleGroup) => ({
    coefficient,
    muscleGroup,
  }))
}

function summarizeSetLogs(setLogs: WorkoutSetLogEntry[]) {
  const sets: ExerciseSetPerformanceSample[] = []
  const difficultySamples: string[] = []
  let performedSetCount = 0
  let totalDurationMinutes = 0
  let hasDuration = false
  let totalReps = 0
  let hasReps = false
  let totalVolumeKg = 0
  let hasVolume = false
  let maxWeightKg: number | null = null

  setLogs.forEach((setLog, index) => {
    const durationMinutes = parseNullableNumber(setLog.duration)
    const reps = parseNullableNumber(setLog.reps)
    const weightKg = parseNullableNumber(setLog.weightKg)
    const difficulty = setLog.effort.trim()

    if (hasSetContent(setLog)) {
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

    if (difficulty) {
      difficultySamples.push(difficulty)
    }

    sets.push({
      durationMinutes,
      difficulty,
      recordedAt: setLog.loggedAt,
      reps,
      setIndex: index + 1,
      suboptimal: setLog.suboptimal,
      weightKg,
    })
  })

  return {
    difficultySamples,
    maxWeightKg,
    performedSetCount,
    sets,
    totalDurationMinutes: hasDuration ? totalDurationMinutes : null,
    totalReps: hasReps ? totalReps : null,
    totalVolumeKg: hasVolume ? totalVolumeKg : null,
  }
}

function toDayExerciseEntry(entry: WorkoutExerciseLogEntry): ProgramDayExerciseStatsEntry {
  const setSummary = summarizeSetLogs(entry.setLogs)

  return {
    completed: entry.completed,
    completedAt: entry.completedAt,
    difficultySamples: setSummary.difficultySamples,
    exerciseId: entry.exerciseId,
    exerciseName: entry.exerciseName,
    exerciseType: entry.type,
    logId: entry.logId,
    maxWeightKg: setSummary.maxWeightKg,
    muscleGroups: entry.muscleGroups,
    performedSetCount: setSummary.performedSetCount,
    setCount: entry.setLogs.length,
    sets: setSummary.sets,
    skipped: entry.skipped,
    targetCoefficients: buildTargetCoefficients(entry.muscleGroups),
    totalDurationMinutes: setSummary.totalDurationMinutes,
    totalReps: setSummary.totalReps,
    totalVolumeKg: setSummary.totalVolumeKg,
  }
}

function buildMuscleEntries(
  exerciseEntries: ProgramDayExerciseStatsEntry[],
): ProgramDayMuscleStatsEntry[] {
  const muscleMap = new Map<string, ProgramDayMuscleStatsEntry>()

  for (const exerciseEntry of exerciseEntries) {
    if (!exerciseEntry.targetCoefficients.length) {
      continue
    }

    for (const targetCoefficient of exerciseEntry.targetCoefficients) {
      const currentEntry = muscleMap.get(targetCoefficient.muscleGroup) ?? {
        difficultySamples: [],
        exerciseCount: 0,
        maxWeightKg: null,
        muscleGroup: targetCoefficient.muscleGroup,
        performedSetCount: 0,
        targetCoefficient: 0,
        totalDurationMinutes: null,
        totalReps: null,
        totalVolumeKg: null,
      }

      const nextDuration =
        exerciseEntry.totalDurationMinutes !== null
          ? (currentEntry.totalDurationMinutes ?? 0) + exerciseEntry.totalDurationMinutes
          : currentEntry.totalDurationMinutes
      const nextReps =
        exerciseEntry.totalReps !== null
          ? (currentEntry.totalReps ?? 0) + exerciseEntry.totalReps
          : currentEntry.totalReps
      const nextVolume =
        exerciseEntry.totalVolumeKg !== null
          ? (currentEntry.totalVolumeKg ?? 0) + exerciseEntry.totalVolumeKg
          : currentEntry.totalVolumeKg

      muscleMap.set(targetCoefficient.muscleGroup, {
        difficultySamples: [
          ...currentEntry.difficultySamples,
          ...exerciseEntry.difficultySamples,
        ],
        exerciseCount: currentEntry.exerciseCount + 1,
        maxWeightKg:
          exerciseEntry.maxWeightKg === null
            ? currentEntry.maxWeightKg
            : currentEntry.maxWeightKg === null
              ? exerciseEntry.maxWeightKg
              : Math.max(currentEntry.maxWeightKg, exerciseEntry.maxWeightKg),
        muscleGroup: targetCoefficient.muscleGroup,
        performedSetCount: currentEntry.performedSetCount + exerciseEntry.performedSetCount,
        targetCoefficient: currentEntry.targetCoefficient + targetCoefficient.coefficient,
        totalDurationMinutes: nextDuration,
        totalReps: nextReps,
        totalVolumeKg: nextVolume,
      })
    }
  }

  return [...muscleMap.values()].sort((left, right) =>
    right.targetCoefficient === left.targetCoefficient
      ? left.muscleGroup.localeCompare(right.muscleGroup)
      : right.targetCoefficient - left.targetCoefficient,
  )
}

export function buildExercisePerformanceSamples(
  workout: ActiveWorkout,
  orderedEntries: WorkoutExerciseLogEntry[],
  completedAt: string,
): ExercisePerformanceSample[] {
  const sessionDate = getSessionDateKey(completedAt)

  return orderedEntries
    .filter((entry) => {
      return (
        entry.completed ||
        entry.skipped ||
        entry.setLogs.some((setLog) => hasSetContent(setLog))
      )
    })
    .map((entry) => {
      const setSummary = summarizeSetLogs(entry.setLogs)

      return {
        completed: entry.completed,
        completedAt: entry.completedAt ?? completedAt,
        difficultySamples: setSummary.difficultySamples,
        exerciseId: entry.exerciseId,
        exerciseName: entry.exerciseName,
        exerciseType: entry.type,
        id: `${workout.sessionId}:${entry.logId}`,
        maxWeightKg: setSummary.maxWeightKg,
        muscleGroups: entry.muscleGroups,
        notes: entry.notes,
        performedSetCount: setSummary.performedSetCount,
        programId: workout.programId,
        programName: workout.programName,
        programSource: workout.programSource,
        recordedAt: entry.lastLoggedAt ?? entry.completedAt ?? completedAt,
        sectionId: workout.sectionId,
        sectionName: workout.sectionName,
        sessionDate,
        setCount: entry.setLogs.length,
        sets: setSummary.sets,
        skipped: entry.skipped,
        startedAt: workout.startedAt,
        targetCoefficients: buildTargetCoefficients(entry.muscleGroups),
        totalDurationMinutes: setSummary.totalDurationMinutes,
        totalReps: setSummary.totalReps,
        totalVolumeKg: setSummary.totalVolumeKg,
        workoutLogId: workout.sessionId,
      }
    })
}

export function buildProgramDayLog(
  workout: ActiveWorkout,
  orderedEntries: WorkoutExerciseLogEntry[],
  completedAt: string,
  durationMinutes: number,
  completedExerciseCount: number,
  totalExerciseCount: number,
): ProgramDayLog {
  const sessionDate = getSessionDateKey(completedAt)
  const exerciseEntries = orderedEntries.map((entry) => toDayExerciseEntry(entry))
  const muscleEntries = buildMuscleEntries(exerciseEntries)

  return {
    cardioEntryCount: orderedEntries.filter((entry) => entry.type === 'cardio').length,
    completedAt,
    completedExerciseCount,
    durationMinutes,
    exerciseEntries,
    id: `${workout.sessionId}:${workout.sectionId}`,
    notes: workout.notes.trim(),
    programId: workout.programId,
    programName: workout.programName,
    programSource: workout.programSource,
    recordedAt: completedAt,
    sectionId: workout.sectionId,
    sectionName: workout.sectionName,
    sessionDate,
    sessionId: workout.sessionId,
    startedAt: workout.startedAt,
    targetedMuscleGroups: muscleEntries.map((entry) => entry.muscleGroup),
    totalExerciseCount,
    muscleEntries,
  }
}

export function appendWorkoutStatistics(
  store: ExerciseStatsStore,
  workout: ActiveWorkout,
  orderedEntries: WorkoutExerciseLogEntry[],
  completedAt: string,
) {
  return appendExercisePerformanceSamples(
    store,
    buildExercisePerformanceSamples(workout, orderedEntries, completedAt),
  )
}

export function replaceWorkoutStatistics(
  store: ExerciseStatsStore,
  workout: ActiveWorkout,
  orderedEntries: WorkoutExerciseLogEntry[],
  completedAt: string,
) {
  return replaceExercisePerformanceSamplesForWorkout(
    store,
    workout.sessionId,
    buildExercisePerformanceSamples(workout, orderedEntries, completedAt),
  )
}
