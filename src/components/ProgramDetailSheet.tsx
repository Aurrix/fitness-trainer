import { useId, useRef, useState } from 'react'
import { Bookmark, BookmarkCheck, CopyPlus, MoreHorizontal, Pencil, Play, Target, Trash2, X } from 'lucide-react'
import ProgramDayOverview from './ProgramDayOverview'
import ProgramMuscleVisualizer from './ProgramMuscleVisualizer'
import type { Exercise } from '../lib/content'
import type { AppProgram } from '../lib/app-types'
import { getProgramExperience, getProgramSchedule, programFilterOptions } from '../lib/program-filters'

type ProgramDetailSheetProps = {
  initialView?: 'days' | 'muscles'
  exercises: Exercise[]
  gender: 'male' | 'female'
  isSaved: boolean
  onCloneProgram: (program: AppProgram) => void
  onClose: () => void
  onDeleteCustomProgram: (programId: string) => void
  onEditCustomProgram: (programId: string) => void
  onOpenExerciseDetails: (exercise: Exercise) => void
  onSelectProgramAsMain: (program: AppProgram) => void
  onStartWorkout: (program: AppProgram, sectionId: string) => void
  onToggleSavedProgram: (programId: string) => void
  program: AppProgram
  resolveExerciseForDisplay: (exercise: {
    exerciseId: string | null
    exerciseName: string
    resolvedExerciseId: string | null
  }) => Exercise | null
}

export default function ProgramDetailSheet({
  exercises,
  initialView = 'days',
  gender,
  isSaved,
  onCloneProgram,
  onClose,
  onDeleteCustomProgram,
  onEditCustomProgram,
  onOpenExerciseDetails,
  onSelectProgramAsMain,
  onStartWorkout,
  onToggleSavedProgram,
  program,
  resolveExerciseForDisplay,
}: ProgramDetailSheetProps) {
  const [view, setView] = useState<'days' | 'muscles'>(initialView)
  const actionsRef = useRef<HTMLDetailsElement>(null)
  const tabId = useId()
  const experience = getProgramExperience(program)
  const metadata = [
    getProgramSchedule(program).label,
    program.duration,
    experience !== 'other' ? programFilterOptions.experience.find(option => option[0] === experience)?.[1] : null,
  ].filter(Boolean)
  const firstDay = program.sections.find(section => !section.optional) ?? program.sections[0]
  function runAction(action: () => void) {
    if (actionsRef.current) actionsRef.current.open = false
    action()
  }
  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <aside
        className="overlay-sheet program-detail-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={program.name}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={event => {
          if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) actionsRef.current.open = false
        }}
        onKeyDown={event => {
          if (event.key === 'Escape' && actionsRef.current?.open) {
            event.stopPropagation()
            actionsRef.current.open = false
            actionsRef.current.querySelector('summary')?.focus()
          }
        }}
      >
        <header className="program-detail-header">
          <div className="program-detail-toolbar">
            <button type="button" className="program-detail-icon" aria-label="Close" onClick={onClose}><X size={21} aria-hidden="true" /></button>
            <details className="program-detail-menu" ref={actionsRef} onBlur={event => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false
            }}>
              <summary className="program-detail-icon" aria-label="More program actions" title="More program actions"><MoreHorizontal size={23} aria-hidden="true" /></summary>
              <div className="program-detail-menu__items">
                <button type="button" onClick={() => runAction(() => onSelectProgramAsMain(program))}><Target size={17} aria-hidden="true" />Make Main</button>
                <button type="button" onClick={() => runAction(() => onCloneProgram(program))}><CopyPlus size={17} aria-hidden="true" />Clone</button>
                {program.programSource === 'custom' ? <>
                  <button type="button" onClick={() => runAction(() => onEditCustomProgram(program.id))}><Pencil size={17} aria-hidden="true" />Edit</button>
                  <button type="button" className="program-detail-menu__delete" onClick={() => runAction(() => onDeleteCustomProgram(program.id))}><Trash2 size={17} aria-hidden="true" />Delete</button>
                </> : null}
              </div>
            </details>
          </div>
          <p className="program-detail-source">{program.programSource === 'custom' ? 'Your program' : 'Program library'}</p>
          <h2>{program.name}</h2>
          <p className="program-detail-meta">{metadata.join(' · ')}</p>
        </header>

        <div className="program-detail-tabs" role="tablist" aria-label="Program overview" onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
          event.preventDefault()
          const nextView = event.key === 'Home' ? 'days' : event.key === 'End' ? 'muscles' : view === 'days' ? 'muscles' : 'days'
          setView(nextView)
          document.getElementById(`${tabId}-${nextView}`)?.focus()
        }}>
          <button type="button" role="tab" id={`${tabId}-days`} aria-controls={`${tabId}-panel`} aria-selected={view === 'days'} tabIndex={view === 'days' ? 0 : -1} onClick={() => setView('days')}>Days & exercises</button>
          <button type="button" role="tab" id={`${tabId}-muscles`} aria-controls={`${tabId}-panel`} aria-selected={view === 'muscles'} tabIndex={view === 'muscles' ? 0 : -1} onClick={() => setView('muscles')}>Muscle coverage</button>
        </div>
        <div className="sheet-content program-detail-content" role="tabpanel" id={`${tabId}-panel`} aria-labelledby={`${tabId}-${view}`}>
          {view === 'days' ? <ProgramDayOverview key={program.id} gender={gender} program={program} exercises={exercises} onStart={id => onStartWorkout(program, id)} resolveExercise={resolveExerciseForDisplay} onOpenExercise={onOpenExerciseDetails} /> : <ProgramMuscleVisualizer key={program.id} exercises={exercises} gender={gender} program={program} />}
          <details className="program-about"><summary>About this program{program.engine ? ' & progression' : ''}</summary>
            {program.description ? <p>{program.description}</p> : null}
            {program.goal ? <p>Goal: {program.goal.replace(/_/g, ' ')}</p> : null}
            {program.engine ? <p>Targets adapt to completed work sets. Starting loads are learned from your first completed sets; subsequent changes include an explanation.</p> : null}
            {program.author ? <p>Author: {program.author}</p> : null}
            {program.sourceUrl ? <p><a href={program.sourceUrl} target="_blank" rel="noreferrer">Original program source</a></p> : null}
            {program.license ? <p>Program license: {program.license}</p> : null}
          </details>
        </div>
        <footer className="program-detail-footer">
          <button type="button" className="primary-button icon-button" onClick={() => firstDay && onStartWorkout(program, firstDay.id)} disabled={!firstDay}>
            <Play size={17} aria-hidden="true" /><span>Start first day</span>
          </button>
          <button type="button" className="program-detail-icon program-detail-save" aria-label={isSaved ? 'Remove saved program' : 'Save program'} aria-pressed={isSaved} title={isSaved ? 'Remove saved program' : 'Save program'} onClick={() => onToggleSavedProgram(program.id)}>
            {isSaved ? <BookmarkCheck size={22} aria-hidden="true" /> : <Bookmark size={22} aria-hidden="true" />}
          </button>
        </footer>
      </aside>
    </div>
  )
}
