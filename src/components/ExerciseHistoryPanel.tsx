import { useState } from 'react'
import { ChevronRight, Dumbbell, Search } from 'lucide-react'
import type { ProgramDayLog } from '../entities/program-day-stats'
import type { WorkoutLog } from '../entities/workout'
import { buildHistorySessions, historyDayKey, historyExerciseKey, historyExerciseSummary } from '../lib/exercise-history'
import { formatDurationMinutes, formatProgramSet } from '../lib/program-history'

type Props = {
  programDayLogs: ProgramDayLog[]
  workoutLogs: WorkoutLog[]
  onOpenExercise: (reference: string) => void
  canOpenExercise: (reference: string) => boolean
  onOpenWorkout: () => void
}

function dayLabel(key: string) {
  const date = new Date(`${key}T12:00:00`)
  return Number.isNaN(date.getTime()) ? key : date.toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function ExerciseHistoryPanel({ programDayLogs, workoutLogs, onOpenExercise, canOpenExercise, onOpenWorkout }: Props) {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'sessions' | 'exercises'>('sessions')
  const sessions = buildHistorySessions(programDayLogs, workoutLogs)
  const search = query.trim().toLocaleLowerCase()
  const filtered = sessions.filter((session) => [session.programName, session.sectionName,
    dayLabel(historyDayKey(session)), ...session.exerciseEntries.map((entry) => entry.exerciseName)]
    .some((text) => text.toLocaleLowerCase().includes(search)))
  const days = new Map<string, ProgramDayLog[]>()
  for (const session of filtered) {
    const key = historyDayKey(session)
    days.set(key, [...(days.get(key) ?? []), session])
  }
  const exercises = new Map<string, { entry: ProgramDayLog['exerciseEntries'][number]; date: string; count: number }>()
  for (const session of sessions) {
    const counted = new Set<string>()
    for (const entry of session.exerciseEntries) {
      if (entry.skipped || (!entry.completed && !entry.performedSetCount)) continue
      const key = historyExerciseKey(entry)
      if (counted.has(key)) continue
      counted.add(key)
      const current = exercises.get(key)
      if (current) current.count += 1
      else exercises.set(key, { entry, date: historyDayKey(session), count: 1 })
    }
  }
  const visibleExercises = [...exercises.entries()].filter(([, { entry }]) => entry.exerciseName.toLocaleLowerCase().includes(search))

  function exerciseDetails(entry: ProgramDayLog['exerciseEntries'][number]) {
    const reference = entry.exerciseId || entry.exerciseName
    return <details className="exercise-history__exercise" key={entry.logId}>
      <summary><span className="exercise-history__exercise-icon"><Dumbbell size={18} /></span><span className="exercise-history__copy"><strong>{entry.exerciseName}</strong><span>{historyExerciseSummary(entry)}</span></span><ChevronRight size={18} /></summary>
      <div className="exercise-history__sets">
        {entry.sets.length ? <ol>{entry.sets.map((set) => <li key={set.setIndex}><span>Set {set.setIndex}</span><span>{formatProgramSet(set)}</span></li>)}</ol> : <p className="muted">No individual sets recorded.</p>}
        {canOpenExercise(reference) ? <button className="chip-button" type="button" onClick={() => onOpenExercise(reference)}>View exercise & progress <ChevronRight size={14} /></button> : <p className="muted">This exercise is no longer in the library. Your saved sets remain here.</p>}
      </div>
    </details>
  }

  return <section className="exercise-history" aria-labelledby="exercise-history-title">
    <div><h2 id="exercise-history-title">Exercise history</h2><p className="muted">Your workouts, day by day.</p></div>
    <label className="field"><span className="field-label">Search history</span><div className="input-with-icon"><Search size={18} /><input type="search" placeholder={view === 'sessions' ? 'Search sessions or exercises' : 'Search logged exercises'} value={query} onChange={(event) => setQuery(event.target.value)} /></div></label>
    <div className="segmented-control segmented-control--two" aria-label="History view">{(['sessions', 'exercises'] as const).map((value) => <button type="button" key={value} className={view === value ? 'is-active' : ''} aria-pressed={view === value} onClick={() => setView(value)}>{value === 'sessions' ? 'Sessions' : 'Exercises'}</button>)}</div>
    {!sessions.length ? <div className="section-card empty-state"><h3>No workout history yet</h3><p>Log exercises and finish a workout to see your sessions here.</p><button type="button" className="primary-button" onClick={onOpenWorkout}>Open workout</button></div> : view === 'sessions' ? <>
      {!filtered.length ? <div className="empty-state"><h3>No matching sessions</h3><p>Try another exercise or session name.</p></div> : null}
      <div className="exercise-history__timeline">{[...days.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([day, logs]) => <section key={day} className="exercise-history__day"><h3 className="exercise-history__date">{dayLabel(day)}</h3>{logs.map((session) => <details className="section-card exercise-history__session" key={session.sessionId || session.id} open={search ? true : session === sessions[0] ? true : undefined}>
        <summary><span className="exercise-history__session-icon"><Dumbbell size={22} /></span><span className="exercise-history__copy"><strong>{session.sectionName || 'Workout'}</strong><span>{[session.programName, !Number.isNaN(new Date(session.startedAt).getTime()) ? new Date(session.startedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : null, session.durationMinutes > 0 ? formatDurationMinutes(session.durationMinutes) : null].filter(Boolean).join(' · ')}</span><span>{session.exerciseEntries.length} {session.exerciseEntries.length === 1 ? 'exercise' : 'exercises'} · {session.exerciseEntries.reduce((total, entry) => total + (entry.skipped ? 0 : entry.performedSetCount), 0)} sets</span></span><ChevronRight size={20} /></summary>
        <div>{session.exerciseEntries.map(exerciseDetails)}{session.notes ? <p className="exercise-history__notes">{session.notes}</p> : null}</div>
      </details>)}</section>)}</div>
    </> : <div className="card-stack">{!visibleExercises.length ? <div className="empty-state"><h3>No matching exercises</h3><p>Try another name or check your sessions.</p></div> : visibleExercises.map(([key, { entry, date, count }]) => <article className="section-card" key={key}><p className="muted">Last trained {dayLabel(date)} · {count} {count === 1 ? 'session' : 'sessions'}</p>{exerciseDetails(entry)}</article>)}</div>}
  </section>
}
