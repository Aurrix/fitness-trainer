import { ArrowRight, CopyPlus, Pencil, Play, Star, StarOff, Target, Trash2 } from 'lucide-react'
import MuscleVisualizer from './MuscleVisualizer'
import ProgramMuscleVisualizer from './ProgramMuscleVisualizer'
import { formatExerciseMuscleGroup } from '../entities/exercise-muscles'
import type { Exercise } from '../lib/content'
import type { AppProgram } from '../lib/app-types'
import { buildSectionMuscleProfile } from '../lib/muscles'
import { countExercises } from '../lib/app-utils'

type ProgramDetailSheetProps = {
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
  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <aside
        className="overlay-sheet"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="overlay-header">
          <div>
            <span className="pill">
              {program.programSource === 'custom' ? 'Custom' : 'Library'}
            </span>
            <h2>{program.name}</h2>
            <p className="muted">
              {program.description ||
                `${countExercises(program)} exercises across ${program.sections.length} days.`}
            </p>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="tag-row">
          {program.goal ? <span className="pill pill--subtle">{program.goal}</span> : null}
          {program.level ? <span className="pill pill--subtle">{program.level}</span> : null}
          {program.duration ? <span className="pill pill--subtle">{program.duration}</span> : null}
          <span className="pill pill--subtle">{program.sections.length} days</span>
        </div>

        <div className="row-actions">
          <button
            type="button"
            className="primary-button icon-button"
            onClick={() => onStartWorkout(program, program.sections[0]?.id ?? '')}
            disabled={!program.sections[0]}
          >
            <Play size={16} />
            <span>Quick Start</span>
          </button>
          <button
            type="button"
            className="secondary-button icon-button"
            onClick={() => onSelectProgramAsMain(program)}
          >
            <Target size={16} />
            <span>Make Main</span>
          </button>
          <button
            type="button"
            className="secondary-button icon-button"
            onClick={() => onToggleSavedProgram(program.id)}
          >
            {isSaved ? <StarOff size={16} /> : <Star size={16} />}
            <span>{isSaved ? 'Remove' : 'Save'}</span>
          </button>
          <button
            type="button"
            className="secondary-button icon-button"
            onClick={() => onCloneProgram(program)}
          >
            <CopyPlus size={16} />
            <span>Clone</span>
          </button>
          {program.programSource === 'custom' ? (
            <button
              type="button"
              className="secondary-button icon-button"
              onClick={() => onEditCustomProgram(program.id)}
            >
              <Pencil size={16} />
              <span>Edit</span>
            </button>
          ) : null}
          {program.programSource === 'custom' ? (
            <button
              type="button"
              className="ghost-button icon-button"
              onClick={() => onDeleteCustomProgram(program.id)}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          ) : null}
        </div>

        <div className="sheet-content">
          <ProgramMuscleVisualizer exercises={exercises} gender={gender} program={program} />

          {program.sections.map((section) => (
            <section key={section.id} className="section-card">
              <div className="section-header">
                <div>
                  <p className="kicker">Day</p>
                  <h3>{section.name}</h3>
                </div>
                <button
                  type="button"
                  className="chip-button icon-button"
                  onClick={() => onStartWorkout(program, section.id)}
                >
                  <Play size={16} />
                  <span>Start</span>
                </button>
              </div>

              {section.notes ? <p className="muted">{section.notes}</p> : null}

              <MuscleVisualizer
                compact
                className="workout-day-visualizer"
                description="Coverage for this day."
                gender={gender}
                profile={buildSectionMuscleProfile(section, exercises)}
                title={section.name}
              />

              <div className="card-stack">
                {section.exercises.map((exercise) => {
                  const resolvedExercise = resolveExerciseForDisplay(exercise)

                  return (
                    <article key={exercise.id} className="exercise-row">
                      <div className="exercise-row__header">
                        <div>
                          <h4>{exercise.exerciseName}</h4>
                          <div className="tag-row">
                            {exercise.sets ? (
                              <span className="pill pill--subtle">{exercise.sets} sets</span>
                            ) : null}
                            {exercise.reps ? (
                              <span className="pill pill--subtle">{exercise.reps} reps</span>
                            ) : null}
                            {exercise.duration ? (
                              <span className="pill pill--subtle">{exercise.duration}</span>
                            ) : null}
                            {exercise.rest ? (
                              <span className="pill pill--subtle">Rest {exercise.rest}</span>
                            ) : null}
                            {resolvedExercise?.muscleGroups.slice(0, 4).map((muscleGroup) => (
                              <span key={muscleGroup} className="pill pill--subtle">
                                {formatExerciseMuscleGroup(muscleGroup)}
                              </span>
                            ))}
                            {!exercise.resolvedExerciseId ? (
                              <span className="pill pill--warning">Needs mapping</span>
                            ) : null}
                          </div>
                        </div>
                        {resolvedExercise ? (
                          <button
                            type="button"
                            className="chip-button icon-button"
                            onClick={() => onOpenExerciseDetails(resolvedExercise)}
                          >
                            <span>View</span>
                            <ArrowRight size={14} />
                          </button>
                        ) : null}
                      </div>
                      {exercise.notes ? <p className="muted">{exercise.notes}</p> : null}
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </aside>
    </div>
  )
}
