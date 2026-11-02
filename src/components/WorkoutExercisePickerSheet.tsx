import { useDeferredValue, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronRight, Search } from 'lucide-react'
import { formatExerciseMuscleGroup } from '../entities/exercise-muscles'
import type { Exercise } from '../lib/content'
import { matchesExerciseSearch } from '../lib/exercise-search'
import { exerciseHistory, exerciseSessionSummary, findExercisePerformance } from '../lib/exercise-performance'
import { useAppStore } from '../stores/useAppStore'
import ExerciseFilters from './ExerciseFilters'
import { emptyExerciseFacets, matchesExerciseFacets } from '../lib/exercise-filters'
import ExerciseSheet from './ExerciseSheet'
import ExerciseDetailView from './ExerciseDetailView'
import ExerciseMuscleMaps from './ExerciseMuscleMaps'

type Props = {
  actionLabel?: string
  description?: string
  excludeExerciseIds?: string[]
  exercises: Exercise[]
  preferredReferences?: string[]
  onClose: () => void
  onSelectExercise: (exercise: Exercise) => void
  title?: string
}

function normalizeReference(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') }

export default function WorkoutExercisePickerSheet({ actionLabel = 'Add', description = 'Add an extra exercise to this training day.', excludeExerciseIds = [], exercises, preferredReferences = [], onClose, onSelectExercise, title = 'Add exercise' }: Props) {
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState<Exercise | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [limit, setLimit] = useState(12)
  const [scope, setScope] = useState<'similar' | 'all'>('similar')
  const [facets, setFacets] = useState({ ...emptyExerciseFacets })
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollTop = useRef(0)
  const fitnessProfile = useAppStore(state => state.fitnessProfile)
  const statsStore = useAppStore(state => state.exerciseStatsStore)
  const savedIds = useAppStore(state => state.savedExerciseIds)
  const setSavedIds = useAppStore(state => state.setSavedExerciseIds)
  const deferredQuery = useDeferredValue(query.trim())
  const excluded = useMemo(() => new Set(excludeExerciseIds), [excludeExerciseIds])
  const preferred = useMemo(() => new Set(preferredReferences.map(normalizeReference)), [preferredReferences])
  const isSubstitute = actionLabel.toLowerCase() === 'substitute'
  const matchesPreferred = (exercise: Exercise) => [exercise.id, exercise.exerciseKey, exercise.name, ...exercise.aliases].some(value => preferred.has(normalizeReference(value)))
  // A typed search spans the library, even when the suggested list is empty.
  const scopeExercises = exercises.filter(exercise => !excluded.has(exercise.id) && (!deferredQuery || matchesExerciseSearch(exercise, deferredQuery)))
    .filter(exercise => !isSubstitute || !preferred.size || scope === 'all' || deferredQuery || matchesPreferred(exercise))
    .sort((a, b) => Number(matchesPreferred(b)) - Number(matchesPreferred(a)) || a.name.localeCompare(b.name))
  const filtered = scopeExercises.filter(exercise => matchesExerciseFacets(exercise, facets))
  const selected = exercises.find(exercise => exercise.id === selectedId && !excluded.has(exercise.id))

  const confirm = (exercise: Exercise) => { onSelectExercise(exercise); onClose() }
  const toggleSaved = (id: string) => setSavedIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])
  useLayoutEffect(() => { if (!preview && contentRef.current) contentRef.current.scrollTop = scrollTop.current }, [preview])

  if (preview) return <ExerciseDetailView key={preview.id} exercise={preview} fitnessProfile={fitnessProfile} statsRecord={findExercisePerformance(statsStore, preview.id, preview.name)} isSaved={savedIds.includes(preview.id)} onToggleSavedExercise={toggleSaved} onClose={() => setPreview(null)} backLabel={isSubstitute ? 'Replacements' : 'Exercises'} onConfirm={() => confirm(preview)} confirmLabel={isSubstitute ? 'Use this exercise' : actionLabel === 'Select' ? 'Select this exercise' : 'Add this exercise'} confirmDescription={isSubstitute ? `${description} · This workout only` : undefined} />

  return <ExerciseSheet title={isSubstitute ? 'Replace exercise' : title} subtitle={description} backLabel="Workout" onClose={onClose} contentRef={contentRef}
    footer={<><button type="button" className="primary-button" disabled={!selected} onClick={() => { if (selected) confirm(selected) }}>{selected ? `${isSubstitute ? 'Replace with' : actionLabel} ${selected.name}` : 'Choose an exercise'}</button>{isSubstitute ? <p>This workout only · Your original history stays saved</p> : null}</>}>
    <label className="exercise-picker-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search exercises</span><input type="search" value={query} onChange={event => { setQuery(event.target.value); setLimit(12); scrollTop.current = 0 }} placeholder="Search exercises" /></label>
    <div className="exercise-picker-filters">{isSubstitute && preferred.size ? <div role="group" aria-label="Replacement scope"><button type="button" aria-pressed={scope === 'similar'} onClick={() => { setScope('similar'); setLimit(12) }}>Similar</button><button type="button" aria-pressed={scope === 'all'} onClick={() => { setScope('all'); setLimit(12) }}>All exercises</button></div> : null}</div>
    <ExerciseFilters value={facets} onChange={value => { setFacets(value); setLimit(12); scrollTop.current = 0 }} exercises={exercises} countMatches={value => scopeExercises.filter(exercise => matchesExerciseFacets(exercise, value)).length} />
    <p className="exercise-detail-label" role="status">{filtered.length} {isSubstitute && scope === 'similar' && preferred.size && !deferredQuery ? 'suggested alternatives' : 'exercises'}</p>
    <div className="exercise-picker-results">{filtered.slice(0, limit).map(exercise => {
      const latest = exerciseHistory(findExercisePerformance(statsStore, exercise.id, exercise.name)).find(sample => !sample.skipped)
      return <article key={exercise.id} className={`exercise-picker-candidate${selectedId === exercise.id ? ' is-selected' : ''}`}>
        <button type="button" className="exercise-picker-candidate__preview" aria-label={`View ${exercise.name} details and performance`} onClick={() => { scrollTop.current = contentRef.current?.scrollTop ?? 0; setPreview(exercise) }}><strong>{exercise.name}<ChevronRight size={16} aria-hidden="true" /></strong><small>{[exercise.equipment.slice(0, 2).join(', '), exercise.muscleGroups.slice(0, 1).map(formatExerciseMuscleGroup).join(', ')].filter(Boolean).join(' · ')}</small><small>{latest ? `Last: ${exerciseSessionSummary(latest)}` : 'Not logged yet'}</small></button>
        <ExerciseMuscleMaps exercise={exercise} gender={fitnessProfile.gender} miniature />
        <button type="button" className="exercise-picker-candidate__select" aria-label={`Select ${exercise.name}`} aria-pressed={selectedId === exercise.id} onClick={() => setSelectedId(current => current === exercise.id ? null : exercise.id)}><span>{selectedId === exercise.id ? <Check size={13} /> : null}</span></button>
      </article>
    })}</div>
    {!filtered.length ? <div className="exercise-performance-empty"><p>No exercises match these filters.</p>{scope === 'similar' && preferred.size && !deferredQuery ? <button type="button" className="ghost-button" onClick={() => setScope('all')}>Browse all exercises</button> : null}</div> : null}
    {filtered.length > limit ? <button type="button" className="ghost-button" onClick={() => setLimit(current => current + 12)}>Load more exercises</button> : null}
    <p className="exercise-picker-hint">Tap an exercise name to see its guide and your past performance.</p>
  </ExerciseSheet>
}
