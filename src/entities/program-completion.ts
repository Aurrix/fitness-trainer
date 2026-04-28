import type { ProgramSource } from '../services/program-stats'
import { normalizeProgramDayLog, type ProgramDayLog } from './program-day-stats'

export type ProgramCompletionLog = {
  completedAt: string
  completedDayCount: number
  completedExerciseCount: number
  dayLogs: ProgramDayLog[]
  durationMinutes: number
  exerciseEntryCount: number
  id: string
  programId: string
  programName: string
  programSource: ProgramSource
  sessionDate: string
  startedAt: string
  totalDayCount: number
  totalExerciseCount: number
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

function toNumberValue(value: unknown, fallback = 0) {
  const parsedValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN

  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

function toProgramSource(value: unknown): ProgramSource {
  return value === 'custom' ? 'custom' : 'library'
}

export function normalizeProgramCompletionLog(value: unknown): ProgramCompletionLog | null {
  if (!isRecord(value)) {
    return null
  }

  const completedAt = toStringValue(value.completedAt) || new Date().toISOString()
  const dayLogs = Array.isArray(value.dayLogs)
    ? value.dayLogs
        .map((entry) => normalizeProgramDayLog(entry))
        .filter((entry): entry is ProgramDayLog => entry !== null)
    : []

  return {
    completedAt,
    completedDayCount: toNumberValue(value.completedDayCount, dayLogs.length),
    completedExerciseCount: toNumberValue(
      value.completedExerciseCount,
      dayLogs.reduce((total, dayLog) => total + dayLog.completedExerciseCount, 0),
    ),
    dayLogs,
    durationMinutes: toNumberValue(
      value.durationMinutes,
      dayLogs.reduce((total, dayLog) => total + dayLog.durationMinutes, 0),
    ),
    exerciseEntryCount: toNumberValue(
      value.exerciseEntryCount,
      dayLogs.reduce((total, dayLog) => total + dayLog.exerciseEntries.length, 0),
    ),
    id:
      toStringValue(value.id) ||
      `program-completion-${Math.random().toString(36).slice(2, 10)}`,
    programId: toStringValue(value.programId),
    programName: toStringValue(value.programName, 'Program'),
    programSource: toProgramSource(value.programSource),
    sessionDate: toStringValue(value.sessionDate) || completedAt.slice(0, 10),
    startedAt: toStringValue(value.startedAt) || dayLogs[0]?.startedAt || completedAt,
    totalDayCount: toNumberValue(value.totalDayCount, dayLogs.length),
    totalExerciseCount: toNumberValue(
      value.totalExerciseCount,
      dayLogs.reduce((total, dayLog) => total + dayLog.totalExerciseCount, 0),
    ),
  }
}

export function normalizeProgramCompletionLogs(value: unknown): ProgramCompletionLog[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => normalizeProgramCompletionLog(entry))
    .filter((entry): entry is ProgramCompletionLog => entry !== null)
    .sort((left, right) => right.completedAt.localeCompare(left.completedAt))
}
