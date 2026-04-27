import { ArrowRight, CopyPlus, Pencil, Play, Plus, Search, Star } from 'lucide-react'
import MuscleVisualizer from '../components/MuscleVisualizer'
import exercisesLibraryImage from '../assets/images/exercises.png'
import programsLibraryImage from '../assets/images/programms.png'
import { formatExerciseMuscleGroup } from '../entities/exercise-muscles'
import { countExercises } from '../lib/app-utils'
import type { AppProgram, ExerciseFilter, LibraryView, ProgramFilter } from '../lib/app-types'
import type { Exercise } from '../lib/content'
import { createMuscleProfile } from '../lib/muscles'

type LibraryPageProps = {
  contentExercises: Exercise[]
  customProgramCount: number
  exerciseFilter: ExerciseFilter
  filteredExercises: Exercise[]
  filteredPrograms: AppProgram[]
  fitnessGender: 'male' | 'female'
  exerciseQuery: string
  favoriteExerciseCount: number
  favoriteExerciseIdSet: Set<string>
  favoriteProgramCount: number
  libraryView: LibraryView
  onCloneProgram: (program: AppProgram) => void
  onEditCustomProgram: (programId: string) => void
  onOpenExerciseDetails: (exercise: Exercise) => void
  onOpenManualBuilder: () => void
  onOpenProgram: (program: AppProgram) => void
  onSetExerciseFilter: (filter: ExerciseFilter) => void
  onSetExerciseQuery: (value: string) => void
  onSetLibraryView: (view: LibraryView) => void
  onSetProgramFilter: (filter: ProgramFilter) => void
  onSetProgramQuery: (value: string) => void
  onStartWorkout: (program: AppProgram, sectionId: string) => void
  onToggleSavedExercise: (exerciseId: string) => void
  onToggleSavedProgram: (programId: string) => void
  programFilter: ProgramFilter
  programQuery: string
  savedProgramIdSet: Set<string>
  isCustomExercise: (exercise: Exercise) => boolean
}

export default function LibraryPage({
  contentExercises,
  customProgramCount,
  exerciseFilter,
  exerciseQuery,
  favoriteExerciseCount,
  favoriteExerciseIdSet,
  favoriteProgramCount,
  filteredExercises,
  filteredPrograms,
  fitnessGender,
  libraryView,
  onCloneProgram,
  onEditCustomProgram,
  onOpenExerciseDetails,
  onOpenManualBuilder,
  onOpenProgram,
  onSetExerciseFilter,
  onSetExerciseQuery,
  onSetLibraryView,
  onSetProgramFilter,
  onSetProgramQuery,
  onStartWorkout,
  onToggleSavedExercise,
  onToggleSavedProgram,
  programFilter,
  programQuery,
  savedProgramIdSet,
  isCustomExercise,
}: LibraryPageProps) {
  return (
    <>
      {libraryView === 'home' ? (
        <section className="section-card">
          <div className="section-header">
            <div>
              <p className="kicker">Library</p>
              <h2>Browse training content</h2>
            </div>
          </div>

          <div className="library-switch-grid">
            <button
              type="button"
              className="library-switch-card"
              onClick={() => onSetLibraryView('programs')}
            >
              <div className="library-switch-card__media">
                <img src={programsLibraryImage} alt="" />
              </div>
              <div className="library-switch-card__copy">
                <h3>Programs</h3>
                <p className="muted">
                  Browse built-in templates, saved picks, and custom plans.
                </p>
                <div className="tag-row">
                  <span className="pill pill--subtle">{filteredPrograms.length} shown</span>
                  <span className="pill pill--subtle">{customProgramCount} custom</span>
                  <span className="pill pill--subtle">{favoriteProgramCount} favorites</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className="library-switch-card"
              onClick={() => onSetLibraryView('exercises')}
            >
              <div className="library-switch-card__media">
                <img src={exercisesLibraryImage} alt="" />
              </div>
              <div className="library-switch-card__copy">
                <h3>Exercises</h3>
                <p className="muted">
                  Inspect movements, target muscles, and available alternatives.
                </p>
                <div className="tag-row">
                  <span className="pill pill--subtle">{contentExercises.length} loaded</span>
                  <span className="pill pill--subtle">{filteredExercises.length} shown</span>
                  <span className="pill pill--subtle">{favoriteExerciseCount} favorites</span>
                </div>
              </div>
            </button>
          </div>
        </section>
      ) : null}

      {libraryView === 'programs' ? (
        <section className="section-card">
          <div className="section-header">
            <h2>Programs</h2>
            <button
              type="button"
              className="ghost-button"
              onClick={() => onSetLibraryView('home')}
            >
              Back
            </button>
          </div>

          <button
            type="button"
            className="primary-button icon-button library-programs__create-button"
            onClick={onOpenManualBuilder}
          >
            <Plus size={16} />
            <span>Create Custom</span>
          </button>

          <label className="field library-programs__search">
            <span className="field-label">Search programs</span>
            <div className="input-with-icon">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={programQuery}
                onChange={(event) => onSetProgramQuery(event.target.value)}
                placeholder="Strength, recovery, bodyweight..."
              />
            </div>
          </label>

          <div className="segmented-control library-programs__filters">
            {(['all', 'library', 'custom', 'favorites'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                className={programFilter === filter ? 'is-active' : ''}
                onClick={() => onSetProgramFilter(filter)}
              >
                {filter === 'all'
                  ? 'All'
                  : filter === 'library'
                    ? 'Library'
                    : filter === 'custom'
                      ? 'Custom'
                      : 'Favorites'}
              </button>
            ))}
          </div>

          {filteredPrograms.length ? (
            <div className="card-stack">
              {filteredPrograms.map((program) => (
                <article
                  key={program.id}
                  className={`program-card program-card--${program.programSource}`}
                >
                  <div className="section-header">
                    <div className="program-card__title-stack">
                      <div className="program-card__title-row">
                        <button
                          type="button"
                          className={`program-card__star-button ${
                            savedProgramIdSet.has(program.id) ? 'is-active' : ''
                          }`}
                          onClick={() => onToggleSavedProgram(program.id)}
                          aria-label={
                            savedProgramIdSet.has(program.id)
                              ? `Remove ${program.name} from saved programs`
                              : `Save ${program.name}`
                          }
                          title={savedProgramIdSet.has(program.id) ? 'Saved' : 'Save'}
                        >
                          <Star
                            size={17}
                            fill={savedProgramIdSet.has(program.id) ? 'currentColor' : 'none'}
                          />
                        </button>
                        <div className="program-card__title-copy">
                          <span className="pill">
                            {program.programSource === 'custom' ? 'Custom' : 'Library'}
                          </span>
                          <h3>{program.name}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => onOpenProgram(program)}
                      >
                        Open
                      </button>
                    </div>
                  </div>

                  <p className="muted">
                    {program.description ||
                      `${countExercises(program)} exercises across ${program.sections.length} days.`}
                  </p>

                  <div className="tag-row program-card__meta">
                    <span className="pill pill--subtle">{program.sections.length} days</span>
                    <span className="pill pill--subtle">{countExercises(program)} exercises</span>
                    {program.duration ? (
                      <span className="pill pill--subtle">{program.duration}</span>
                    ) : null}
                    {program.goal ? (
                      <span className="pill pill--subtle">{program.goal}</span>
                    ) : null}
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
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No matching programs</h3>
              <p>Try a broader search or create your own program from scratch.</p>
            </div>
          )}
        </section>
      ) : null}

      {libraryView === 'exercises' ? (
        <section className="section-card">
          <div className="section-header">
            <div>
              <p className="kicker">Exercises</p>
              <h2>Exercise library</h2>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => onSetLibraryView('home')}
            >
              Back
            </button>
          </div>

          <label className="field library-exercises__search">
            <span className="field-label">Search exercises</span>
            <div className="input-with-icon">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={exerciseQuery}
                onChange={(event) => onSetExerciseQuery(event.target.value)}
                placeholder="Squat, pull, mobility..."
              />
            </div>
          </label>

          <div className="segmented-control library-programs__filters">
            {(['all', 'favorites'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                className={exerciseFilter === filter ? 'is-active' : ''}
                onClick={() => onSetExerciseFilter(filter)}
              >
                {filter === 'all' ? 'All' : 'Favorites'}
              </button>
            ))}
          </div>

          {filteredExercises.length ? (
            <div className="card-stack">
              {filteredExercises.map((exercise) => {
                const exerciseIsCustom = isCustomExercise(exercise)

                return (
                  <article
                    key={exercise.id}
                    className={`exercise-card ${
                      exerciseIsCustom ? 'exercise-card--custom' : 'exercise-card--library'
                    }`}
                  >
                    <div className="section-header">
                      <div>
                        <h3>{exercise.name}</h3>
                        <p className="muted">
                          {exercise.source.label} / {exercise.source.group}
                        </p>
                      </div>
                      <div className="row-actions">
                        <button
                          type="button"
                          className={`program-card__star-button ${
                            favoriteExerciseIdSet.has(exercise.id) ? 'is-active' : ''
                          }`}
                          onClick={() => onToggleSavedExercise(exercise.id)}
                          aria-label={
                            favoriteExerciseIdSet.has(exercise.id)
                              ? `Remove ${exercise.name} from favorite exercises`
                              : `Save ${exercise.name} as favorite exercise`
                          }
                          title={favoriteExerciseIdSet.has(exercise.id) ? 'Favorite' : 'Add favorite'}
                        >
                          <Star
                            size={17}
                            fill={favoriteExerciseIdSet.has(exercise.id) ? 'currentColor' : 'none'}
                          />
                        </button>
                        {exerciseIsCustom ? (
                          <span className="pill">Custom</span>
                        ) : exercise.category ? (
                          <span className="pill">{exercise.category}</span>
                        ) : null}
                      </div>
                    </div>
                    <p className="muted">
                      {exercise.description ||
                        exercise.notes ||
                        exercise.muscleGroups
                          .map((muscleGroup) => formatExerciseMuscleGroup(muscleGroup))
                          .join(', ') ||
                        'Exercise ready to be used in programs.'}
                    </p>
                    <div className="tag-row">
                      {exercise.difficulty ? (
                        <span className="pill pill--subtle">{exercise.difficulty}</span>
                      ) : null}
                      {exercise.muscleGroups.slice(0, 3).map((muscleGroup) => (
                        <span key={muscleGroup} className="pill pill--subtle">
                          {formatExerciseMuscleGroup(muscleGroup)}
                        </span>
                      ))}
                      {exercise.equipment.slice(0, 2).map((equipment) => (
                        <span key={equipment} className="pill pill--subtle">
                          {equipment}
                        </span>
                      ))}
                      {exerciseIsCustom ? (
                        <span className="pill pill--subtle">Custom Source</span>
                      ) : null}
                    </div>
                    <MuscleVisualizer
                      compact
                      className="exercise-muscle-visualizer"
                      detailsMode="sheet"
                      gender={fitnessGender}
                      hideHeader
                      profile={createMuscleProfile(exercise.muscleGroups)}
                      showSheetPreview={false}
                      title={exercise.name}
                    />
                    <div className="row-actions exercise-card__actions">
                      <button
                        type="button"
                        className="chip-button icon-button"
                        onClick={() => onOpenExerciseDetails(exercise)}
                      >
                        <span>View exercise</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No matching exercises</h3>
              <p>Try a broader search or switch back to all exercises.</p>
            </div>
          )}
        </section>
      ) : null}
    </>
  )
}
