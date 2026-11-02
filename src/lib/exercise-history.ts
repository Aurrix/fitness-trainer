import type { ProgramDayLog, ProgramDayExerciseStatsEntry } from '../entities/program-day-stats'
import type { WorkoutLog } from '../entities/workout'
import { buildProgramDayLog } from './workout-statistics'

export function buildHistorySessions(dayLogs: ProgramDayLog[], workouts: WorkoutLog[]) {
  const sessions = new Map(dayLogs.map((log) => [log.sessionId || log.id, log]))
  for (const workout of workouts) {
    if (sessions.has(workout.id)) continue
    sessions.set(workout.id, buildProgramDayLog({
      sessionId: workout.id, programId: workout.programId, programName: workout.programName,
      exertionScale: workout.exertionScale,
      programSource: workout.programSource, sectionId: workout.sectionId,
      sectionName: workout.sectionName, startedAt: workout.startedAt,
      updatedAt: workout.completedAt, notes: workout.notes, completedExerciseIds: [],
      exerciseLogs: {}, exerciseOrder: [], extraEntries: [],
    }, workout.exerciseLogs, workout.completedAt, workout.durationMinutes,
    workout.completedExerciseCount, workout.totalExerciseCount))
  }
  return [...sessions.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

// Derive calendar dates locally; older sessionDate values were generated via UTC
// conversion of local midnight and can consequently be one day early.
export function historyDayKey(session: ProgramDayLog) {
  const date = new Date(session.startedAt || session.completedAt)
  if (Number.isNaN(date.getTime())) return session.sessionDate
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function historyExerciseKey(entry: ProgramDayExerciseStatsEntry) {
  return entry.exerciseId || entry.exerciseName.trim().toLocaleLowerCase()
}

export function historyExerciseSummary(entry: ProgramDayExerciseStatsEntry) {
  if (entry.skipped) return 'Skipped'
  const parts = entry.performedSetCount ? [`${entry.performedSetCount} ${entry.performedSetCount === 1 ? 'set' : 'sets'}`] : []
  if (entry.totalDurationMinutes !== null) parts.push(`${entry.totalDurationMinutes} min`)
  const topSet = entry.sets.filter((set) => set.weightKg !== null)
    .sort((a, b) => (b.weightKg ?? 0) - (a.weightKg ?? 0) || (b.reps ?? 0) - (a.reps ?? 0))[0]
  if (topSet) parts.push(`Top set ${topSet.weightKg} kg${topSet.reps !== null ? ` × ${topSet.reps}` : ''}`)
  else if (entry.totalReps !== null) parts.push(`${entry.totalReps} reps`)
  return parts.join(' · ') || (entry.completed ? 'Completed' : 'No sets logged')
}
