import type { ExercisePerformanceSample, ExerciseStatsRecord, ExerciseStatsStore } from '../entities/exercise-stats'
import { createExerciseStatsStoreKey } from '../entities/exercise-stats'

export function exerciseNumber(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function exerciseDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function exerciseHistory(record: ExerciseStatsRecord | null) {
  return [...(record?.progressionHistory ?? [])].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
}

export function exerciseSessionSummary(sample: ExercisePerformanceSample) {
  if (sample.skipped) return 'Skipped'
  const sets = sample.sets.filter(set => set.weightKg !== null || set.reps !== null || set.durationMinutes !== null)
  const weighted = sets.filter(set => set.weightKg !== null && set.weightKg > 0)
    .sort((a, b) => (b.weightKg ?? 0) - (a.weightKg ?? 0) || (b.reps ?? 0) - (a.reps ?? 0))[0]
  if (weighted) return `${exerciseNumber(weighted.weightKg!)} kg${weighted.reps !== null ? ` × ${exerciseNumber(weighted.reps)} reps` : ''}`
  const timed = sets.filter(set => set.durationMinutes !== null).sort((a, b) => (b.durationMinutes ?? 0) - (a.durationMinutes ?? 0))[0]
  if (timed) return `${exerciseNumber(timed.durationMinutes!)} min`
  const reps = sets.filter(set => set.reps !== null).sort((a, b) => (b.reps ?? 0) - (a.reps ?? 0))[0]
  if (reps) return `${exerciseNumber(reps.reps!)} reps`
  if (sample.maxWeightKg !== null) return `${exerciseNumber(sample.maxWeightKg)} kg top load`
  if (sample.totalDurationMinutes !== null) return `${exerciseNumber(sample.totalDurationMinutes)} min total`
  if (sample.totalReps !== null) return `${exerciseNumber(sample.totalReps)} reps total`
  return 'No set values logged'
}

export function findExercisePerformance(store: ExerciseStatsStore, id: string, name: string) {
  const normalize = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
  return store.byExerciseKey[createExerciseStatsStoreKey(id, name)] ?? Object.values(store.byExerciseKey).find(record => record.exerciseId === id || normalize(record.exerciseName) === normalize(name)) ?? null
}
