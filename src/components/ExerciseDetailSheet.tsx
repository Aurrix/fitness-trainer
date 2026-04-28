import { ArrowRight, Gauge, Layers3, Star, StarOff, Target } from 'lucide-react'
import type { ExerciseStatsRecord } from '../entities/exercise-stats'
import {
  formatExerciseMuscleGroup,
  formatExerciseMuscleTargetFactor,
} from '../entities/exercise-muscles'
import type { Exercise } from '../lib/content'
import type { FitnessProfileGender } from '../lib/fitness-profile'
import { buildExerciseMuscleProfile } from '../lib/muscles'
import ExerciseStatsPanel from './ExerciseStatsPanel'
import MuscleVisualizer from './MuscleVisualizer'

type ExerciseAlternative = {
  canOpen: boolean
  description: string
  difficulty: string
  id: string
  muscleGroups: string[]
  name: string
}

type ExerciseDetailSheetProps = {
  alternatives: ExerciseAlternative[]
  exercise: Exercise
  gender: FitnessProfileGender
  isSaved: boolean
  onClose: () => void
  onSelectAlternative: (exerciseId: string) => void
  onToggleSavedExercise: (exerciseId: string) => void
  statsRecord: ExerciseStatsRecord | null
}

export default function ExerciseDetailSheet({
  alternatives,
  exercise,
  gender,
  isSaved,
  onClose,
  onSelectAlternative,
  onToggleSavedExercise,
  statsRecord,
}: ExerciseDetailSheetProps) {
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
            <p className="muted">
              {exercise.source.label} / {exercise.source.group}
            </p>
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
          </div>

          <section className="section-card exercise-detail-section">
            <div className="exercise-detail-meta">
              {exercise.difficulty ? (
                <span className="pill">
                  <Gauge size={14} />
                  <span>{exercise.difficulty}</span>
                </span>
              ) : null}
              {exercise.category ? (
                <span className="pill pill--subtle">{exercise.category}</span>
              ) : null}
              {exercise.equipment.map((equipment) => (
                <span key={equipment} className="pill pill--subtle">
                  {equipment}
                </span>
              ))}
            </div>

            <MuscleVisualizer
              description="Primary coverage for this exercise."
              gender={gender}
              profile={buildExerciseMuscleProfile(exercise)}
              title={exercise.name}
            />
          </section>

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

          <section className="section-card exercise-detail-section">
            <div className="section-header">
              <div>
                <p className="kicker">Substitutions</p>
                <h3>Alternatives</h3>
              </div>
              <span className="pill pill--subtle">
                <Layers3 size={14} />
                <span>{alternatives.length}</span>
              </span>
            </div>

            {alternatives.length ? (
              <div className="card-stack">
                {alternatives.map((alternative) => (
                  <article key={alternative.id} className="exercise-alt-card">
                    <div>
                      <h4>{alternative.name}</h4>
                      <p className="muted">
                        {alternative.description || 'Alternative reference imported from the exercise data.'}
                      </p>
                      <div className="tag-row">
                        {alternative.difficulty ? (
                          <span className="pill pill--subtle">{alternative.difficulty}</span>
                        ) : null}
                        {alternative.muscleGroups.map((muscleGroup) => (
                          <span key={muscleGroup} className="pill pill--subtle">
                            {formatExerciseMuscleGroup(muscleGroup)}
                          </span>
                        ))}
                      </div>
                    </div>
                    {alternative.canOpen ? (
                      <button
                        type="button"
                        className="chip-button icon-button"
                        onClick={() => onSelectAlternative(alternative.id)}
                      >
                        <span>View</span>
                        <ArrowRight size={14} />
                      </button>
                    ) : (
                      <span className="pill pill--subtle">Reference only</span>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No alternatives listed</h3>
                <p>This exercise does not include substitution references yet.</p>
              </div>
            )}
          </section>
        </div>
      </aside>
    </div>
  )
}
