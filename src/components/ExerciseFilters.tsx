import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Dumbbell, PersonStanding, X } from 'lucide-react'
import { formatExerciseMuscleGroup } from '../entities/exercise-muscles'
import type { Exercise } from '../lib/content'
import { emptyExerciseFacets, equipmentGroups, exerciseFacetCount, muscleGroups, muscleInGroup, type ExerciseFacets } from '../lib/exercise-filters'

type Props = { value: ExerciseFacets; onChange: (value: ExerciseFacets) => void; exercises: Exercise[]; countMatches: (value: ExerciseFacets) => number }
export default function ExerciseFilters({ value, onChange, exercises, countMatches }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const titleId = useId()
  useEffect(() => {
    if (!open) return
    dialog.current?.showModal()
    const previous = document.body.style.overflow
    const opener = trigger.current
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous; opener?.focus() }
  }, [open])
  function close() { dialog.current?.close(); setOpen(false) }
  const muscleLabel = value.specificMuscle ? formatExerciseMuscleGroup(value.specificMuscle) : muscleGroups.find(([id]) => id === value.muscle)?.[1] ?? 'Any muscle'
  const equipmentLabel = value.equipment.startsWith('exact:') ? value.equipment.slice(6) : equipmentGroups.find(([id]) => id === value.equipment)?.[1] ?? 'Any equipment'
  const specifics = [...new Set(exercises.flatMap(exercise => exercise.muscleGroups))].filter(muscle => muscleInGroup(muscle, draft.muscle)).sort((a, b) => formatExerciseMuscleGroup(a).localeCompare(formatExerciseMuscleGroup(b)))
  const gear = [...new Set(exercises.flatMap(exercise => exercise.equipment))].sort()
  const count = countMatches(draft)
  return <div className="exercise-facets">
    <div className="exercise-facets__triggers">{[['Muscle', muscleLabel, Boolean(value.muscle || value.specificMuscle)], ['Equipment', equipmentLabel, Boolean(value.equipment)]].map(([label, selected, active]) => <button key={String(label)} type="button" className={active ? 'is-active' : ''} aria-haspopup="dialog" aria-expanded={open} onClick={event => { trigger.current = event.currentTarget; setDraft({ ...value }); setOpen(true) }}><span><small>{label}</small><strong>{selected}</strong></span><ChevronDown size={17} /></button>)}</div>
    {exerciseFacetCount(value) ? <button className="ghost-button exercise-facets__clear" type="button" onClick={() => onChange({ ...emptyExerciseFacets })}>Clear filters</button> : null}
    {open ? createPortal(<dialog ref={dialog} className="exercise-filter-dialog" aria-modal="true" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === event.currentTarget) close() }}>
      <div className="exercise-filter-panel"><header><div><h2 id={titleId}>Filter exercises</h2><p>Choose a muscle group and equipment.</p></div><button type="button" className="ghost-button" aria-label="Close filters" onClick={close}><X size={22} /></button></header>
        <div className="exercise-filter-body"><fieldset><legend>Muscle group</legend><button type="button" className="ghost-button exercise-filter-reset" onClick={() => setDraft({ ...draft, muscle: '', specificMuscle: '' })}>Any muscle</button><div className="exercise-filter-muscles">{muscleGroups.map(([id, label]) => <button type="button" key={id} aria-pressed={draft.muscle === id} onClick={() => setDraft({ ...draft, muscle: draft.muscle === id ? '' : id, specificMuscle: '' })}>{label}</button>)}</div><p>Matches primary or supporting muscle targets.</p><details open={draft.specificMuscle ? true : undefined}><summary>Specific muscle · {draft.specificMuscle ? formatExerciseMuscleGroup(draft.specificMuscle) : 'Any'}</summary><select aria-label="Specific muscle" value={draft.specificMuscle} onChange={event => setDraft({ ...draft, specificMuscle: event.target.value })}><option value="">Any specific muscle</option>{specifics.map(muscle => <option key={muscle} value={muscle}>{formatExerciseMuscleGroup(muscle)}</option>)}</select></details></fieldset>
        <fieldset><legend>Equipment</legend><button type="button" className="ghost-button exercise-filter-reset" onClick={() => setDraft({ ...draft, equipment: '' })}>Any equipment</button><div className="exercise-filter-equipment">{equipmentGroups.map(([id, label]) => <button type="button" key={id} aria-pressed={draft.equipment === id} onClick={() => setDraft({ ...draft, equipment: draft.equipment === id ? '' : id })}>{id === 'bodyweight' ? <PersonStanding size={21} /> : <Dumbbell size={21} />}{label}</button>)}</div><details open={draft.equipment.startsWith('exact:') ? true : undefined}><summary>Specific equipment</summary><select aria-label="Specific equipment" value={draft.equipment.startsWith('exact:') ? draft.equipment : ''} onChange={event => setDraft({ ...draft, equipment: event.target.value })}><option value="">Any equipment</option>{gear.map(item => <option key={item} value={`exact:${item}`}>{item}</option>)}</select></details></fieldset></div>
        <footer><div><span>{exerciseFacetCount(draft)} filters selected</span><button type="button" className="ghost-button" onClick={() => setDraft({ ...emptyExerciseFacets })}>Reset all</button></div><button type="button" className="primary-button" onClick={() => { onChange({ ...draft }); close() }}>Show {count} {count === 1 ? 'exercise' : 'exercises'}</button><p>Search and your current list stay as selected.</p></footer>
      </div>
    </dialog>, document.body) : null}
  </div>
}
