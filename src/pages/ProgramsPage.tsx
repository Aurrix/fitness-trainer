import { Pencil, Play, Plus, StarOff, Target, Trash2 } from 'lucide-react'
import { countExercises } from '../lib/app-utils'
import type { AppProgram } from '../lib/app-types'
import type { EditableExercise, ProgramDraft } from '../lib/user-data'
import type { Exercise } from '../lib/content'

type ProgramsPageProps = {
  contentExercises: Exercise[]
  customPrograms: AppProgram[]
  draft: ProgramDraft
  isBuilderOpen: boolean
  mainProgram: AppProgram | null
  onAddExerciseToSection: (sectionId: string) => void
  onAddSection: () => void
  onCloseBuilder: () => void
  onDeleteCustomProgram: (programId: string) => void
  onEditCustomProgram: (programId: string) => void
  onOpenProgram: (program: AppProgram) => void
  onRemoveExerciseFromSection: (sectionId: string, exerciseId: string) => void
  onRemoveSection: (sectionId: string) => void
  onResetBuilder: () => void
  onSaveDraft: () => void
  onSelectProgramAsMain: (program: AppProgram) => void
  onStartWorkout: (program: AppProgram, sectionId: string) => void
  onToggleSavedProgram: (programId: string) => void
  onUpdateDraftExercise: (
    sectionId: string,
    exerciseId: string,
    field: Exclude<keyof EditableExercise, 'id'>,
    value: string,
  ) => void
  onUpdateDraftField: <K extends keyof ProgramDraft>(field: K, value: ProgramDraft[K]) => void
  onUpdateSectionField: (
    sectionId: string,
    field: 'name' | 'notes',
    value: string,
  ) => void
  savedPrograms: AppProgram[]
}

export default function ProgramsPage({
  contentExercises,
  customPrograms,
  draft,
  isBuilderOpen,
  mainProgram,
  onAddExerciseToSection,
  onAddSection,
  onCloseBuilder,
  onDeleteCustomProgram,
  onEditCustomProgram,
  onOpenProgram,
  onRemoveExerciseFromSection,
  onRemoveSection,
  onResetBuilder,
  onSaveDraft,
  onSelectProgramAsMain,
  onStartWorkout,
  onToggleSavedProgram,
  onUpdateDraftExercise,
  onUpdateDraftField,
  onUpdateSectionField,
  savedPrograms,
}: ProgramsPageProps) {
  return (
    <>
      <section className="section-card">
        <div className="section-header">
          <div>
            <p className="kicker">Programs</p>
            <h2>Your saved collection</h2>
          </div>
        </div>

        {mainProgram ? (
          <article className="program-card program-card--featured">
            <div className="section-header">
              <div>
                <span className="pill">Main Program</span>
                <h3>{mainProgram.name}</h3>
                <p className="muted">
                  {mainProgram.description ||
                    `${countExercises(mainProgram)} exercises across ${mainProgram.sections.length} days.`}
                </p>
              </div>
              <button type="button" className="ghost-button" onClick={() => onOpenProgram(mainProgram)}>
                Open
              </button>
            </div>
            <div className="tag-row">
              <span className="pill pill--subtle">{mainProgram.programSource}</span>
              <span className="pill pill--subtle">{mainProgram.sections.length} days</span>
            </div>
          </article>
        ) : (
          <div className="empty-state">
            <h3>No main program yet</h3>
            <p>Choose one from the library or build your own plan.</p>
          </div>
        )}
      </section>

      <section className="section-card">
        <div className="section-header">
          <div>
            <p className="kicker">Saved from library</p>
            <h2>Pinned programs</h2>
          </div>
        </div>

        {savedPrograms.length ? (
          <div className="card-stack">
            {savedPrograms.map((program) => (
              <article key={program.id} className={`program-card program-card--${program.programSource}`}>
                <div className="section-header">
                  <div>
                    <span className="pill pill--subtle">Saved</span>
                    <h3>{program.name}</h3>
                    <p className="muted">
                      {program.description ||
                        `${countExercises(program)} exercises across ${program.sections.length} days.`}
                    </p>
                  </div>
                  <button type="button" className="ghost-button" onClick={() => onOpenProgram(program)}>
                    Open
                  </button>
                </div>

                <div className="row-actions">
                  <button
                    type="button"
                    className="primary-button icon-button"
                    onClick={() => onStartWorkout(program, program.sections[0]?.id ?? '')}
                    disabled={!program.sections[0]}
                  >
                    <Play size={16} />
                    <span>Start</span>
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
                    <StarOff size={16} />
                    <span>Remove</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No pinned programs</h3>
            <p>Save programs from the library to keep them in your personal list.</p>
          </div>
        )}
      </section>

      <section className="section-card">
        <div className="section-header">
          <div>
            <p className="kicker">Custom programs</p>
            <h2>Your own plans</h2>
          </div>
        </div>

        {customPrograms.length ? (
          <div className="card-stack">
            {customPrograms.map((program) => (
              <article key={program.id} className="program-card program-card--custom">
                <div className="section-header">
                  <div>
                    <span className="pill">Custom</span>
                    <h3>{program.name}</h3>
                    <p className="muted">
                      {program.description ||
                        `${countExercises(program)} exercises across ${program.sections.length} days.`}
                    </p>
                  </div>
                  <button type="button" className="ghost-button" onClick={() => onOpenProgram(program)}>
                    Open
                  </button>
                </div>

                <div className="row-actions">
                  <button
                    type="button"
                    className="primary-button icon-button"
                    onClick={() => onStartWorkout(program, program.sections[0]?.id ?? '')}
                    disabled={!program.sections[0]}
                  >
                    <Play size={16} />
                    <span>Start</span>
                  </button>
                  <button
                    type="button"
                    className="secondary-button icon-button"
                    onClick={() => onEditCustomProgram(program.id)}
                  >
                    <Pencil size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="ghost-button icon-button"
                    onClick={() => onDeleteCustomProgram(program.id)}
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No custom programs yet</h3>
            <p>Use the builder below to create your first saved plan.</p>
          </div>
        )}
      </section>

      {isBuilderOpen ? (
        <>
          <section className="section-card">
            <div className="section-header">
              <div>
                <p className="kicker">Builder</p>
                <h2>{draft.editingId ? 'Edit custom plan' : 'Create custom plan'}</h2>
              </div>
              <div className="row-actions">
                <button type="button" className="ghost-button icon-button" onClick={onResetBuilder}>
                  <StarOff size={16} />
                  <span>Reset</span>
                </button>
                <button type="button" className="ghost-button icon-button" onClick={onCloseBuilder}>
                  <Trash2 size={16} />
                  <span>Close</span>
                </button>
              </div>
            </div>

            <div className="form-grid">
              <label className="field">
                <span className="field-label">Program name</span>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(event) => onUpdateDraftField('name', event.target.value)}
                  placeholder="4-week strength reset"
                />
              </label>

              <label className="field">
                <span className="field-label">Goal</span>
                <input
                  type="text"
                  value={draft.goal}
                  onChange={(event) => onUpdateDraftField('goal', event.target.value)}
                  placeholder="Strength, mobility, fat loss..."
                />
              </label>

              <label className="field">
                <span className="field-label">Level</span>
                <input
                  type="text"
                  value={draft.level}
                  onChange={(event) => onUpdateDraftField('level', event.target.value)}
                  placeholder="Beginner, intermediate..."
                />
              </label>

              <label className="field">
                <span className="field-label">Tags</span>
                <input
                  type="text"
                  value={draft.tags}
                  onChange={(event) => onUpdateDraftField('tags', event.target.value)}
                  placeholder="home, dumbbells, 30 min"
                />
              </label>

              <label className="field field--full">
                <span className="field-label">Description</span>
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(event) => onUpdateDraftField('description', event.target.value)}
                  placeholder="What this program is for and how it should feel."
                ></textarea>
              </label>
            </div>
          </section>

          {draft.sections.map((section, sectionIndex) => (
            <section key={section.id} className="section-card">
              <div className="section-header">
                <div>
                  <p className="kicker">Session {sectionIndex + 1}</p>
                  <h3>{section.name || 'Untitled session'}</h3>
                </div>
                <button
                  type="button"
                  className="ghost-button icon-button"
                  onClick={() => onRemoveSection(section.id)}
                  disabled={draft.sections.length === 1}
                >
                  <Trash2 size={16} />
                  <span>Remove</span>
                </button>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span className="field-label">Session name</span>
                  <input
                    type="text"
                    value={section.name}
                    onChange={(event) => onUpdateSectionField(section.id, 'name', event.target.value)}
                    placeholder="Lower body A"
                  />
                </label>

                <label className="field field--full">
                  <span className="field-label">Coach notes</span>
                  <textarea
                    rows={2}
                    value={section.notes}
                    onChange={(event) => onUpdateSectionField(section.id, 'notes', event.target.value)}
                    placeholder="Tempo, warm-up notes, pacing guidance..."
                  ></textarea>
                </label>
              </div>

              <div className="card-stack">
                {section.exercises.map((exercise, exerciseIndex) => (
                  <article key={exercise.id} className="builder-card">
                    <div className="section-header">
                      <div>
                        <p className="kicker">Exercise {exerciseIndex + 1}</p>
                        <h4>{exercise.exerciseName || 'Choose an exercise'}</h4>
                      </div>
                      <button
                        type="button"
                        className="ghost-button icon-button"
                        onClick={() => onRemoveExerciseFromSection(section.id, exercise.id)}
                        disabled={section.exercises.length === 1}
                      >
                        <Trash2 size={16} />
                        <span>Remove</span>
                      </button>
                    </div>

                    <label className="field field--full">
                      <span className="field-label">Exercise</span>
                      <select
                        value={exercise.exerciseName}
                        onChange={(event) =>
                          onUpdateDraftExercise(
                            section.id,
                            exercise.id,
                            'exerciseName',
                            event.target.value,
                          )
                        }
                      >
                        <option value="">Select an exercise</option>
                        {contentExercises.map((libraryExercise) => (
                          <option key={libraryExercise.id} value={libraryExercise.name}>
                            {libraryExercise.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="form-grid compact-grid">
                      <label className="field">
                        <span className="field-label">Sets</span>
                        <input
                          type="text"
                          value={exercise.sets}
                          onChange={(event) =>
                            onUpdateDraftExercise(section.id, exercise.id, 'sets', event.target.value)
                          }
                          placeholder="4"
                        />
                      </label>

                      <label className="field">
                        <span className="field-label">Reps</span>
                        <input
                          type="text"
                          value={exercise.reps}
                          onChange={(event) =>
                            onUpdateDraftExercise(section.id, exercise.id, 'reps', event.target.value)
                          }
                          placeholder="8-10"
                        />
                      </label>

                      <label className="field">
                        <span className="field-label">Duration</span>
                        <input
                          type="text"
                          value={exercise.duration}
                          onChange={(event) =>
                            onUpdateDraftExercise(
                              section.id,
                              exercise.id,
                              'duration',
                              event.target.value,
                            )
                          }
                          placeholder="45 sec"
                        />
                      </label>

                      <label className="field">
                        <span className="field-label">Rest</span>
                        <input
                          type="text"
                          value={exercise.rest}
                          onChange={(event) =>
                            onUpdateDraftExercise(section.id, exercise.id, 'rest', event.target.value)
                          }
                          placeholder="60 sec"
                        />
                      </label>
                    </div>

                    <label className="field field--full">
                      <span className="field-label">Notes</span>
                      <textarea
                        rows={2}
                        value={exercise.notes}
                        onChange={(event) =>
                          onUpdateDraftExercise(section.id, exercise.id, 'notes', event.target.value)
                        }
                        placeholder="Technique cues or progression notes."
                      ></textarea>
                    </label>
                  </article>
                ))}
              </div>

              <div className="row-actions">
                <button
                  type="button"
                  className="secondary-button icon-button"
                  onClick={() => onAddExerciseToSection(section.id)}
                >
                  <Plus size={16} />
                  <span>Add Exercise</span>
                </button>
              </div>
            </section>
          ))}

          <section className="sticky-actions">
            <button type="button" className="secondary-button icon-button" onClick={onAddSection}>
              <Plus size={16} />
              <span>Add Session</span>
            </button>
            <button type="button" className="primary-button icon-button" onClick={onSaveDraft}>
              <Target size={16} />
              <span>Save Program</span>
            </button>
          </section>
        </>
      ) : null}
    </>
  )
}
