import { useState } from 'react'
import ProgramExercisePreview from './ProgramExercisePreview'
import { ArrowRight, Play } from 'lucide-react'
import type { Exercise, Program, ProgramExerciseRef } from '../lib/content'
import { buildProgramCoverage, muscleLabels } from '../lib/muscles'
import { programExerciseTarget, programNote } from '../lib/program-preview'

type Props = { gender?: 'male' | 'female'; program: Program; exercises: Exercise[]; onStart: (id: string) => void; resolveExercise: (slot: ProgramExerciseRef) => Exercise | null; onOpenExercise: (exercise: Exercise) => void }
export default function ProgramDayOverview({ program, exercises, onStart, resolveExercise, onOpenExercise, gender = 'male' }: Props) {
  const weeks = [...new Set(program.sections.map(section => section.weekIndex || 1))].sort((a, b) => a - b)
  const [selectedWeek, setSelectedWeek] = useState(weeks[0])
  const week = weeks.includes(selectedWeek) ? selectedWeek : weeks[0]
  const sections = program.sections.filter(section => (section.weekIndex || 1) === week)
  return <section className="program-days" aria-label="Day by day overview">
    <div className="section-header"><h3>Day by day</h3>{weeks.length > 1 ? <label className="program-days__week">Week<select aria-label="Program week" value={week} onChange={event => setSelectedWeek(Number(event.target.value))}>{weeks.map(value => <option value={value} key={value}>Week {value}</option>)}</select></label> : <span className="muted">Week {week}</span>}</div>
    <p className="muted program-days__intro">{sections.filter(section => !section.optional).length} scheduled sessions{sections.some(section => section.optional) ? ' + optional work' : ''}. Tap an exercise for instructions.</p>
    {sections.map(section => {
      const coverage = buildProgramCoverage([section], exercises)
      const mainMuscles = [...coverage.rows].sort((a, b) => b.setsMax - a.setsMax).slice(0, 3)
      return <article key={section.id} className="program-day-card">
        <header className="program-day-card__header"><div><p className="kicker">Day {section.dayIndex}{section.optional ? ' · Optional' : ''}</p><h4>{section.shortName || section.name}</h4><p>{section.exercises.length} exercises{mainMuscles.length ? ` · ${mainMuscles.map(row => muscleLabels[row.slug]).join(', ')}` : ''}</p></div><button type="button" className="chip-button icon-button" aria-label={`Start ${section.shortName || section.name}`} disabled={!section.exercises.length} onClick={() => onStart(section.id)}><Play size={14} />Start</button></header>
        {programNote(section.notes) ? <details className="program-day-notes"><summary>Session notes</summary><p>{programNote(section.notes)}</p></details> : null}
        <ol className="program-day-card__exercises">{section.exercises.map((slot, index) => {
          const exercise = resolveExercise(slot)
          const notes = programNote(slot.notes)
          return <li key={slot.id}>
            {exercise ? <ProgramExercisePreview key={exercise.id} exercise={exercise} gender={gender} onOpen={() => onOpenExercise(exercise)} /> : null}<span className="program-day-card__number">{index + 1}</span>
            <div className="program-day-card__exercise-copy">
              {exercise ? <button type="button" className="program-day-card__exercise-link" onClick={() => onOpenExercise(exercise)}>{slot.exerciseName}<ArrowRight size={13} /></button> : <strong>{slot.exerciseName}</strong>}
              <p>{programExerciseTarget(slot)}{slot.rest ? ` · ${slot.rest} rest` : ''}{slot.unilateral ? ' · per side' : ''}{slot.superset ? ` · Superset ${slot.superset}` : ''}</p>
              {!exercise ? <span className="pill pill--warning">Needs mapping</span> : null}
              {notes ? <details className="program-day-notes"><summary>Exercise notes</summary><p>{notes}</p></details> : null}
            </div>
          </li>
        })}</ol>
      </article>
    })}
    {!sections.length ? <p className="muted">No sessions available in this week.</p> : null}
  </section>
}
