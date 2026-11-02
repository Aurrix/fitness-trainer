import { useId, useRef, useState } from 'react'
import { ArrowRight, ChevronDown, Star } from 'lucide-react'
import type { ExerciseStatsRecord } from '../entities/exercise-stats'
import { formatExerciseMuscleGroup, formatExerciseMuscleTargetFactor } from '../entities/exercise-muscles'
import type { Exercise } from '../lib/content'
import type { FitnessProfile } from '../lib/fitness-profile'
import { exerciseDate, exerciseHistory, exerciseSessionSummary } from '../lib/exercise-performance'
import ExerciseBenchmarkPanel from './ExerciseBenchmarkPanel'
import ExerciseStatsPanel from './ExerciseStatsPanel'
import ExerciseGallery from './ExerciseGallery'
import ExerciseSheet from './ExerciseSheet'

export type ExerciseAlternative = { canOpen: boolean; description: string; difficulty: string; id: string; matchKind: 'primary' | 'secondary'; muscleGroups: string[]; name: string }
export type ExerciseDetailViewProps = {
  alternatives?: ExerciseAlternative[]
  exercise: Exercise
  fitnessProfile: FitnessProfile
  isSaved: boolean
  onClose: () => void
  onSelectAlternative?: (exerciseId: string) => void
  onToggleSavedExercise: (exerciseId: string) => void
  statsRecord: ExerciseStatsRecord | null
  onRequestReplace?: () => void
  backLabel?: string
  confirmLabel?: string
  onConfirm?: () => void
  confirmDescription?: string
}

export default function ExerciseDetailView({ alternatives = [], exercise, fitnessProfile, isSaved, onClose, onSelectAlternative, onToggleSavedExercise, statsRecord, onRequestReplace, backLabel = 'Back', confirmLabel, onConfirm, confirmDescription }: ExerciseDetailViewProps) {
  const [tab, setTab] = useState<'overview' | 'performance'>('overview')
  const contentRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const latest = exerciseHistory(statsRecord).find(sample => !sample.skipped)
  const changeTab = (next: typeof tab) => { setTab(next); contentRef.current?.scrollTo({ top: 0 }) }
  const detailsSummary = (title: string, subtitle?: string) => <summary><span>{title}{subtitle ? <small>{subtitle}</small> : null}</span><ChevronDown size={17} aria-hidden="true" /></summary>
  return <ExerciseSheet title={exercise.name} subtitle={[exercise.equipment.slice(0, 2).join(', '), exercise.primaryTargetMuscleGroups.slice(0, 2).map(target => formatExerciseMuscleGroup(target.muscleGroup)).join(', ') || exercise.muscleGroups.slice(0, 2).map(formatExerciseMuscleGroup).join(', ')].filter(Boolean).join(' · ')} backLabel={backLabel} onClose={onClose} contentRef={contentRef}
    headerAction={<button type="button" className="exercise-sheet__favorite" aria-label={isSaved ? `Remove ${exercise.name} from favorites` : `Save ${exercise.name} as favorite`} aria-pressed={isSaved} onClick={() => onToggleSavedExercise(exercise.id)}><Star size={20} fill={isSaved ? 'currentColor' : 'none'} /></button>}
    navigation={<div className="exercise-detail-tabs" role="tablist" aria-label="Exercise view">{(['overview', 'performance'] as const).map(value => <button key={value} id={`${id}-${value}`} type="button" role="tab" aria-selected={tab === value} aria-controls={`${id}-panel`} tabIndex={tab === value ? 0 : -1} onClick={() => changeTab(value)} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 'overview' : event.key === 'End' ? 'performance' : tab === 'overview' ? 'performance' : 'overview'; changeTab(next); document.getElementById(`${id}-${next}`)?.focus() } }}>{value === 'overview' ? 'Overview' : 'Performance'}</button>)}</div>}
    footer={<><button type="button" className={onConfirm ? 'primary-button' : 'secondary-button'} onClick={onConfirm ?? onClose}>{confirmLabel ?? (backLabel === 'Back' ? 'Close' : `Back to ${backLabel.toLowerCase()}`)}</button>{confirmDescription ? <p>{confirmDescription}</p> : null}</>}>
    <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${tab}`}>
      {tab === 'overview' ? <>
        <ExerciseGallery key={exercise.id} exercise={exercise} gender={fitnessProfile.gender} />
        <section className="exercise-last-session" aria-label="Your last session"><span className="exercise-detail-label">{latest ? 'Your last session' : 'Your history'}</span><strong>{latest ? exerciseSessionSummary(latest) : 'No sessions yet'}</strong><p>{latest ? `${latest.performedSetCount} ${latest.performedSetCount === 1 ? 'set' : 'sets'} logged · ${exerciseDate(latest.recordedAt)}` : 'Your logged sessions will appear here.'}</p><button type="button" onClick={() => changeTab('performance')}>View your performance <ArrowRight size={16} /></button></section>
        <h3 className="exercise-detail-label">About this exercise</h3>
        <details className="exercise-detail-disclosure">{detailsSummary('Movement guide', 'Technique & instructions')}<div>{exercise.descriptionHtml ? <div className="rich-text" dangerouslySetInnerHTML={{ __html: exercise.descriptionHtml }} /> : <p>{exercise.description || 'No additional description available.'}</p>}{exercise.instructions.length ? <ol>{exercise.instructions.map((instruction, index) => <li key={index}>{instruction}</li>)}</ol> : null}</div></details>
        <details className="exercise-detail-disclosure">{detailsSummary('Muscle targets', 'Primary & supporting groups')}<div>{([{ label: 'Primary', targets: exercise.primaryTargetMuscleGroups }, { label: 'Supporting', targets: exercise.secondaryTargetMuscleGroups }]).map(({ label, targets }) => <div key={String(label)}><h4>{String(label)}</h4><p>{targets.filter(target => target.factor > 0).map(target => `${formatExerciseMuscleGroup(target.muscleGroup)} (${formatExerciseMuscleTargetFactor(target.factor)})`).join(' · ') || 'No explicit targets mapped'}</p></div>)}</div></details>
        <details className="exercise-detail-disclosure">{detailsSummary('More details', 'Equipment, notes & source')}<div><p>Equipment: {exercise.equipment.join(', ') || 'Not specified'}</p>{exercise.difficulty ? <p>Difficulty: {exercise.difficulty}</p> : null}{exercise.category ? <p>Category: {exercise.category}</p> : null}{exercise.notes ? <p>{exercise.notes}</p> : null}{exercise.aliases.length ? <p>Also listed as: {exercise.aliases.join(', ')}</p> : null}<p>Source: {exercise.source.label} / {exercise.source.group}</p></div></details>
        {onRequestReplace ? <button type="button" className="exercise-detail-replace" onClick={onRequestReplace}>Replace this exercise <ArrowRight size={17} /></button> : null}
        {alternatives.length && onSelectAlternative ? <details className="exercise-detail-disclosure">{detailsSummary('Exercise options', `${alternatives.length} alternatives`)}<div>{(['primary', 'secondary'] as const).map(group => <section key={group}><h4>{group === 'primary' ? 'Same primary target' : 'Other target matches'}</h4>{alternatives.filter(alternative => alternative.matchKind === group).map(alternative => <div className="exercise-detail-alternative" key={alternative.id}><span><strong>{alternative.name}</strong><small>{alternative.muscleGroups.slice(0, 2).map(formatExerciseMuscleGroup).join(' · ') || alternative.description}</small></span>{alternative.canOpen ? <button type="button" className="ghost-button" aria-label={`View ${alternative.name}`} onClick={() => onSelectAlternative(alternative.id)}><ArrowRight size={16} /></button> : <small>Reference</small>}</div>)}</section>)}</div></details> : null}
      </> : <><ExerciseStatsPanel key={exercise.id} exercise={exercise} statsRecord={statsRecord} /><details className="exercise-detail-disclosure">{detailsSummary('Reference benchmarks', 'Profile averages, separate from your history')}<ExerciseBenchmarkPanel exercise={exercise} fitnessProfile={fitnessProfile} /></details></>}
    </div>
  </ExerciseSheet>
}
