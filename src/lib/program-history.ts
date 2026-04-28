import type { ProgramCompletionLog } from '../entities/program-completion'
import type { ProgramDayLog } from '../entities/program-day-stats'
import type { AppProgram } from './app-types'

export function formatHistoryDate(value: string) {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value.slice(0, 10)
  }

  return parsedDate.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDurationMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function formatHistoryNumber(value: number | null, suffix = '') {
  if (value === null) {
    return null
  }

  const formattedValue = Number.isInteger(value) ? String(value) : value.toFixed(1)
  return suffix ? `${formattedValue} ${suffix}` : formattedValue
}

export function formatProgramSet(
  set: ProgramCompletionLog['dayLogs'][number]['exerciseEntries'][number]['sets'][number],
) {
  const parts = [
    formatHistoryNumber(set.durationMinutes, 'min'),
    formatHistoryNumber(set.weightKg, 'kg'),
    formatHistoryNumber(set.reps, 'reps'),
    set.difficulty || null,
  ].filter(Boolean)

  return parts.length ? parts.join(' / ') : '-'
}

export function describeProgramExerciseState(
  exercise: ProgramCompletionLog['dayLogs'][number]['exerciseEntries'][number],
) {
  if (exercise.skipped) {
    return 'Skipped'
  }

  if (exercise.performedSetCount > 0) {
    return `${exercise.performedSetCount} set${exercise.performedSetCount === 1 ? '' : 's'}`
  }

  if (exercise.completed) {
    return 'Done'
  }

  return 'No sets'
}

function createProgramCompletionFromDayLogs(
  program: AppProgram,
  dayLogs: ProgramDayLog[],
  completedAt: string,
): ProgramCompletionLog {
  const startedAt = dayLogs.reduce((earliestStartedAt, dayLog) => {
    return dayLog.startedAt.localeCompare(earliestStartedAt) < 0
      ? dayLog.startedAt
      : earliestStartedAt
  }, dayLogs[0]?.startedAt ?? completedAt)

  return {
    completedAt,
    completedDayCount: dayLogs.length,
    completedExerciseCount: dayLogs.reduce(
      (total, dayLog) => total + dayLog.completedExerciseCount,
      0,
    ),
    dayLogs,
    durationMinutes: dayLogs.reduce((total, dayLog) => total + dayLog.durationMinutes, 0),
    exerciseEntryCount: dayLogs.reduce(
      (total, dayLog) => total + dayLog.exerciseEntries.length,
      0,
    ),
    id: `derived-program-completion-${program.id}-${completedAt}`,
    programId: program.id,
    programName: program.name,
    programSource: program.programSource,
    sessionDate: completedAt.slice(0, 10),
    startedAt,
    totalDayCount: program.sections.length,
    totalExerciseCount: dayLogs.reduce((total, dayLog) => total + dayLog.totalExerciseCount, 0),
  }
}

function deriveProgramCompletionsFromDayLogs(
  programs: AppProgram[],
  programDayLogs: ProgramDayLog[],
) {
  return programs.flatMap((program) => {
    const sectionIds = program.sections.map((section) => section.id)
    const sectionIdSet = new Set(sectionIds)

    if (!sectionIds.length) {
      return []
    }

    const completions: ProgramCompletionLog[] = []
    const currentRunBySectionId: Record<string, ProgramDayLog> = {}
    const sortedDayLogs = programDayLogs
      .filter((dayLog) => dayLog.programId === program.id && sectionIdSet.has(dayLog.sectionId))
      .sort((left, right) => left.completedAt.localeCompare(right.completedAt))

    for (const dayLog of sortedDayLogs) {
      currentRunBySectionId[dayLog.sectionId] = dayLog

      if (sectionIds.some((sectionId) => !currentRunBySectionId[sectionId])) {
        continue
      }

      const dayLogs = sectionIds.map((sectionId) => currentRunBySectionId[sectionId])
      completions.push(createProgramCompletionFromDayLogs(program, dayLogs, dayLog.completedAt))

      for (const sectionId of sectionIds) {
        delete currentRunBySectionId[sectionId]
      }
    }

    return completions
  })
}

export function buildProgramHistoryRuns(
  programs: AppProgram[],
  programDayLogs: ProgramDayLog[],
  programCompletionLogs: ProgramCompletionLog[],
) {
  const completionKeys = new Set(
    programCompletionLogs.map((entry) => `${entry.programId}:${entry.completedAt}`),
  )
  const derivedCompletions = deriveProgramCompletionsFromDayLogs(programs, programDayLogs)
    .filter((entry) => !completionKeys.has(`${entry.programId}:${entry.completedAt}`))

  return [...programCompletionLogs, ...derivedCompletions].sort((left, right) =>
    right.completedAt.localeCompare(left.completedAt),
  )
}
