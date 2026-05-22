import { ArrowRight, Gauge, Layers3, RefreshCcw, Star, StarOff, Target } from 'lucide-react'
import type { ExerciseStatsRecord } from '../entities/exercise-stats'
import {
  formatExerciseMuscleGroup,
  formatExerciseMuscleTargetFactor,
} from '../entities/exercise-muscles'
import type { Exercise } from '../lib/content'
import type { FitnessProfile } from '../lib/fitness-profile'
import { buildExerciseMuscleProfile } from '../lib/muscles'
import ExerciseBenchmarkPanel from './ExerciseBenchmarkPanel'
import ExerciseStatsPanel from './ExerciseStatsPanel'
import MuscleVisualizer from './MuscleVisualizer'

type ExerciseAlternative = {
  canOpen: boolean
  description: string
  difficulty: string
  id: string
  matchKind: 'primary' | 'secondary'
  muscleGroups: string[]
  name: string
}

type ExerciseDetailSheetProps = {
  alternatives: ExerciseAlternative[]
  exercise: Exercise
  fitnessProfile: FitnessProfile
  isSaved: boolean
  onClose: () => void
  onSelectAlternative: (exerciseId: string) => void
  onSubstituteExercise?: (exerciseId: string) => void
  onToggleSavedExercise: (exerciseId: string) => void
  statsRecord: ExerciseStatsRecord | null
  substitutionContext?: {
    currentExerciseId: string | null
    targetLabel: string
  }
}

export default function ExerciseDetailSheet({
  alternatives,
  exercise,
  fitnessProfile,
  isSaved,
  onClose,
  onSelectAlternative,
  onSubstituteExercise,
  onToggleSavedExercise,
  statsRecord,
  substitutionContext,
}: ExerciseDetailSheetProps) {
  const canSubstituteExercise = (exerciseId: string) => {
    return Boolean(
      onSubstituteExercise &&
        (!substitutionContext?.currentExerciseId ||
          substitutionContext.currentExerciseId !== exerciseId),
    )
  }
  const primaryAlternatives = alternatives.filter(
    (alternative) => alternative.matchKind === 'primary',
  )
  const secondaryAlternatives = alternatives.filter(
    (alternative) => alternative.matchKind === 'secondary',
  )
  const renderAlternativeRows = (rows: ExerciseAlternative[]) =>
    rows.map((alternative) => (
      <div key={alternative.id} className="exercise-alt-row">
        <div className="exercise-alt-row__copy">
          <strong>{alternative.name}</strong>
          <span>
            {[
              alternative.difficulty,
              alternative.muscleGroups
                .slice(0, 2)
                .map((muscleGroup) => formatExerciseMuscleGroup(muscleGroup))
                .join(' / '),
            ]
              .filter(Boolean)
              .join(' / ') || alternative.description}
          </span>
        </div>
        <div className="exercise-alt-row__actions">
          {alternative.canOpen ? (
            <button
              type="button"
              className="chip-button icon-button"
              onClick={() => onSelectAlternative(alternative.id)}
              title={`View ${alternative.name}`}
              aria-label={`View ${alternative.name}`}
            >
              <ArrowRight size={14} />
            </button>
          ) : (
            <span className="pill pill--subtle">Reference</span>
          )}
          {alternative.canOpen && canSubstituteExercise(alternative.id) ? (
            <button
              type="button"
              className="secondary-button icon-button exercise-alt-row__substitute"
              onClick={() => onSubstituteExercise?.(alternative.id)}
              title={
                substitutionContext
                  ? `Substitute ${substitutionContext.targetLabel} with ${alternative.name}`
                  : `Substitute with ${alternative.name}`
              }
              aria-label={`Substitute with ${alternative.name}`}
            >
              <RefreshCcw size={14} />
            </button>
          ) : null}
        </div>
      </div>
    ))

  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <aside
        className="overlay-sheet exercise-detail-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="overlay-header">
          <div>
            <span className="pill">Exercise</span>
            <h2 id="exercise-detail-title">{exercise.name}</h2>
            <div className="exercise-detail-subtitle">
              <p className="muted">
                {exercise.source.label} / {exercise.source.group}
              </p>
              <div className="exercise-detail-meta exercise-detail-meta--header">
                {exercise.difficulty ? (
                  <span className="pill">
                    <Gauge size={14} />
                    <span>{exercise.difficulty}</span>
                  </span>
                ) : null}
                {exercise.category ? (
                  <span className="pill pill--subtle">{exercise.category}</span>
                ) : null}
                {exercise.equipment.slice(0, 3).map((equipment) => (
                  <span key={equipment} className="pill pill--subtle">
                    {equipment}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="sheet-content">
          <div className="row-actions">
            <button
              type="button"
              className="secondary-button icon-button"
              onClick={() => onToggleSavedExercise(exercise.id)}
            >
              {isSaved ? <StarOff size={16} /> : <Star size={16} />}
              <span>{isSaved ? 'Remove Favorite' : 'Save Favorite'}</span>
            </button>
            {canSubstituteExercise(exercise.id) ? (
              <button
                type="button"
                className="primary-button icon-button"
                onClick={() => onSubstituteExercise?.(exercise.id)}
                title={
                  substitutionContext
                    ? `Substitute ${substitutionContext.targetLabel} with ${exercise.name}`
                    : `Substitute with ${exercise.name}`
                }
              >
                <RefreshCcw size={16} />
                <span>Substitute</span>
              </button>
            ) : null}
          </div>

          <MuscleVisualizer
            className="exercise-detail-visualizer"
            description="Primary coverage for this exercise."
            gender={fitnessProfile.gender}
            profile={buildExerciseMuscleProfile(exercise)}
            title={exercise.name}
          />

          <ExerciseBenchmarkPanel exercise={exercise} fitnessProfile={fitnessProfile} />

          <ExerciseStatsPanel exercise={exercise} statsRecord={statsRecord} />

          <section className="section-card exercise-detail-section">
            <div className="section-header">
              <div>
                <p className="kicker">Target Areas</p>
                <h3>Muscle targets</h3>
              </div>
              <span className="pill pill--subtle">
                <Target size={14} />
                <span>{exercise.muscleGroups.length || 0}</span>
              </span>
            </div>

            <p className="kicker">Primary</p>
            <div className="tag-row">
              {exercise.primaryTargetMuscleGroups.length ? (
                exercise.primaryTargetMuscleGroups.map((target) => (
                  <span key={target.muscleGroup} className="pill pill--subtle">
                    {`${formatExerciseMuscleGroup(target.muscleGroup)} (${formatExerciseMuscleTargetFactor(
                      target.factor,
                    )})`}
                  </span>
                ))
              ) : (
                <span className="pill pill--subtle">No primary targets mapped</span>
              )}
            </div>

            <p className="kicker">Secondary</p>
            <div className="tag-row">
              {exercise.secondaryTargetMuscleGroups.length ? (
                exercise.secondaryTargetMuscleGroups.map((target) => (
                  <span key={target.muscleGroup} className="pill pill--subtle">
                    {`${formatExerciseMuscleGroup(target.muscleGroup)} (${formatExerciseMuscleTargetFactor(
                      target.factor,
                    )})`}
                  </span>
                ))
              ) : (
                <span className="pill pill--subtle">No secondary targets mapped</span>
              )}
            </div>
          </section>

          <section className="section-card exercise-detail-section">
            <div className="section-header">
              <div>
                <p className="kicker">Overview</p>
                <h3>Description</h3>
              </div>
            </div>

            {exercise.descriptionHtml ? (
              <div
                className="rich-text"
                dangerouslySetInnerHTML={{ __html: exercise.descriptionHtml }}
              />
            ) : (
              <p className="muted">{exercise.description}</p>
            )}

            {exercise.instructions.length ? (
              <ol className="exercise-detail-list">
                {exercise.instructions.map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ol>
            ) : null}

            {exercise.aliases.length ? (
              <p className="muted">
                Also listed as: {exercise.aliases.join(', ')}
              </p>
            ) : null}

            {exercise.notes ? <p className="muted">{exercise.notes}</p> : null}
          </section>

          <section className="section-card exercise-detail-section exercise-detail-section--alternatives">
            <div className="section-header">
              <div>
                <p className="kicker">Same Targets</p>
                <h3>Exercise options</h3>
              </div>
              <span className="pill pill--subtle">
                <Layers3 size={14} />
                <span>{alternatives.length}</span>
              </span>
            </div>

            {alternatives.length ? (
              <div className="exercise-alt-table">
                {primaryAlternatives.length ? (
                  <div className="exercise-alt-group">
                    <p className="kicker">Primary target</p>
                    {renderAlternativeRows(primaryAlternatives)}
                  </div>
                ) : null}
                {secondaryAlternatives.length ? (
                  <div className="exercise-alt-group">
                    <p className="kicker">Secondary target</p>
                    {renderAlternativeRows(secondaryAlternatives)}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No same-target options</h3>
                <p>No other exercise currently maps to the same primary target group.</p>
              </div>
            )}
          </section>
        </div>
      </aside>
    </div>
  )
}
