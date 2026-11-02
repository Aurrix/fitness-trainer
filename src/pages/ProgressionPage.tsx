import { useState, type ReactNode } from 'react'
import ExerciseHistoryPanel from '../components/ExerciseHistoryPanel'
import type { ProgramDayLog } from '../entities/program-day-stats'
import type { WorkoutLog } from '../entities/workout'
import type { AppProgram } from '../lib/app-types'
import type { ProgramStatsRecord } from '../services/program-stats'

type ProgressionPageProps = {
  programDayLogs: ProgramDayLog[]
  workoutLogs: WorkoutLog[]
  onOpenExercise: (reference: string) => void
  canOpenExercise: (reference: string) => boolean
  onOpenWorkout: () => void
  bodyCompositionContent: ReactNode
  bodyStatsEntries: Array<{ id: string }>
  mainProgram: AppProgram | null
  mainProgramStats: ProgramStatsRecord | null
  programProgression: ReactNode
}

export default function ProgressionPage({
  bodyCompositionContent,
  programProgression,
  programDayLogs,
  workoutLogs,
  onOpenExercise,
  canOpenExercise,
  onOpenWorkout,
}: ProgressionPageProps) {
  const [view, setView] = useState<'overview' | 'history'>('overview')
  return (
    <>
      <div className="segmented-control segmented-control--two stats-page-tabs" aria-label="Stats view">
        <button type="button" className={view === 'overview' ? 'is-active' : ''} aria-pressed={view === 'overview'} onClick={() => setView('overview')}>Overview</button>
        <button type="button" className={view === 'history' ? 'is-active' : ''} aria-pressed={view === 'history'} onClick={() => setView('history')}>Exercise history</button>
      </div>
      {view === 'overview' ? <>{programProgression}{bodyCompositionContent}</> : <ExerciseHistoryPanel programDayLogs={programDayLogs} workoutLogs={workoutLogs} onOpenExercise={onOpenExercise} canOpenExercise={canOpenExercise} onOpenWorkout={onOpenWorkout} />}
    </>
  )
}
