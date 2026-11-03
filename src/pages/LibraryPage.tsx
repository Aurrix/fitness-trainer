import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, CopyPlus, Pencil, Play, Plus, Search, Star } from 'lucide-react'
import ExerciseFilters from '../components/ExerciseFilters'
import ExerciseMuscleMaps from '../components/ExerciseMuscleMaps'
import { emptyExerciseFacets, matchesExerciseFacets } from '../lib/exercise-filters'
import ProgramFilters from '../components/ProgramFilters'
import ProgramMuscleCardOverview from '../components/ProgramMuscleCardOverview'
import { emptyProgramFacets, getProgramSchedule, getProgramSplit, matchesProgramFacets, programFilterOptions, type ProgramFacets } from '../lib/program-filters'
import ProgramExercisePreview from '../components/ProgramExercisePreview'
import { formatExerciseMuscleGroup } from '../entities/exercise-muscles'
import exercisesLibraryImage from '../assets/images/exercises.png'
import programsLibraryImage from '../assets/images/programms.png'
import { countExercises } from '../lib/app-utils'
import type { AppProgram, ExerciseFilter, LibraryView, ProgramFilter } from '../lib/app-types'
import type { Exercise } from '../lib/content'

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
  onOpenProgram: (program: AppProgram, view?: 'days' | 'muscles') => void
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
  const [programFacets, setProgramFacets] = useState<ProgramFacets>({ ...emptyProgramFacets })
  const [programSort, setProgramSort] = useState('default')
  const equipmentLookup = useMemo(() => new Map(contentExercises.map(exercise => [exercise.id, exercise])), [contentExercises])
  const matchingPrograms = useMemo(() => {
    const result = filteredPrograms.filter(program => matchesProgramFacets(program, programFacets, equipmentLookup))
    if (programSort === 'name') result.sort((a, b) => a.name.localeCompare(b.name))
    if (programSort === 'days') result.sort((a, b) => (getProgramSchedule(a).days[0] ?? Infinity) - (getProgramSchedule(b).days[0] ?? Infinity))
    return result
  }, [filteredPrograms, programFacets, programSort, equipmentLookup])
  const [exerciseFacets, setExerciseFacets] = useState({ ...emptyExerciseFacets })
  const mediaFiltered = filteredExercises.filter(exercise => matchesExerciseFacets(exercise, exerciseFacets))
  const batchSize = 12
  const [listing, setListing] = useState({ key: '', limit: batchSize })
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const listingKey = JSON.stringify([exerciseQuery, exerciseFilter, libraryView, exerciseFacets])
  const limit = listing.key === listingKey ? listing.limit : batchSize
  if (listing.key !== listingKey) {
    setListing({ key: listingKey, limit: batchSize })
  }
  const visibleExercises = mediaFiltered.slice(0, limit)
  const hasMore = visibleExercises.length < mediaFiltered.length
  const loadMore = () => setListing((current) => ({
    key: listingKey,
    limit: (current.key === listingKey ? current.limit : batchSize) + batchSize,
  }))

  useEffect(() => {
    const target = loadMoreRef.current
    if (libraryView !== 'exercises' || !hasMore || !target || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect()
        setListing((current) => ({
          key: listingKey,
          limit: (current.key === listingKey ? current.limit : batchSize) + batchSize,
        }))
      }
    }, { rootMargin: '600px 0px' })
    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, libraryView, listingKey, limit, mediaFiltered.length])

  return (
    <>
      {libraryView === 'home' ? (
        <section className="section-card library-home" aria-labelledby="library-home-title">
          <header className="library-home__header">
            <p className="kicker">Library</p>
            <h2 id="library-home-title">Find your next workout</h2>
            <p className="muted">Explore a plan or find the right movement.</p>
          </header>

          <div className="library-switch-grid">
            <button
              type="button"
              className="library-switch-card"
              onClick={() => onSetLibraryView('programs')}
            >
              <span className="library-switch-card__media">
                <img src={programsLibraryImage} alt="" />
              </span>
              <span className="library-switch-card__copy">
                <span className="library-switch-card__title">Programs</span>
                <span className="library-switch-card__description">Follow a plan. Build a routine.</span>
                <span className="library-switch-card__meta">
                  {customProgramCount} custom · {favoriteProgramCount} saved
                </span>
              </span>
              <ArrowRight className="library-switch-card__arrow" size={20} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="library-switch-card"
              onClick={() => onSetLibraryView('exercises')}
            >
              <span className="library-switch-card__media">
                <img src={exercisesLibraryImage} alt="" />
              </span>
              <span className="library-switch-card__copy">
                <span className="library-switch-card__title">Exercises</span>
                <span className="library-switch-card__description">Explore movements and muscles.</span>
                <span className="library-switch-card__meta">
                  {contentExercises.length} exercises · {favoriteExerciseCount} saved
                </span>
              </span>
              <ArrowRight className="library-switch-card__arrow" size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="library-home__create">
            <div>
              <h3>Make it your own</h3>
              <p className="muted">Build a program around your goals.</p>
            </div>
            <button type="button" className="primary-button icon-button" onClick={onOpenManualBuilder}>
              <Plus size={18} aria-hidden="true" />
              <span>Create a program</span>
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

          <ProgramFilters value={programFacets} onChange={setProgramFacets} countMatches={facets => filteredPrograms.filter(program => matchesProgramFacets(program, facets, equipmentLookup)).length} sort={programSort} onSort={setProgramSort} />
          <p className="muted" role="status">{matchingPrograms.length} {matchingPrograms.length === 1 ? 'program' : 'programs'}</p>
          {matchingPrograms.length ? (
            <div className="card-stack">
              {matchingPrograms.map((program) => (
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
                    <span className="pill pill--subtle">{getProgramSchedule(program).label}</span>
                    <span className="pill pill--subtle">{programFilterOptions.split.find(option => option[0] === getProgramSplit(program))?.[1]}</span>
                    <span className="pill pill--subtle">{countExercises(program)} exercises</span>
                    {program.duration ? (
                      <span className="pill pill--subtle">{program.duration}</span>
                    ) : null}
                    {program.goal ? (
                      <span className="pill pill--subtle">{program.goal}</span>
                    ) : null}
                  </div>

                  <ProgramMuscleCardOverview program={program} exercises={contentExercises} gender={fitnessGender} />
                  <button type="button" className="ghost-button program-coverage-link" onClick={() => onOpenProgram(program, 'muscles')}>View muscle coverage <ArrowRight size={15} /></button>
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
              <p>Try fewer filters, broaden your search, or create your own program.</p>
              <button type="button" className="secondary-button" onClick={() => { setProgramFacets({ ...emptyProgramFacets }); onSetProgramQuery(''); onSetProgramFilter('all') }}>Clear search and filters</button>
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

          <ExerciseFilters value={exerciseFacets} onChange={setExerciseFacets} exercises={contentExercises} countMatches={facets => filteredExercises.filter(exercise => matchesExerciseFacets(exercise, facets)).length} />
          <p className="muted exercise-list-count" role="status">
            Showing {visibleExercises.length} of {mediaFiltered.length} exercises
          </p>

          {mediaFiltered.length ? (
            <div className="card-stack exercise-infinite-list">
              {visibleExercises.map((exercise) => {
                const exerciseIsCustom = isCustomExercise(exercise)

                return (
                  <article className={`exercise-library-card ${exerciseIsCustom ? 'is-custom' : ''}`} key={exercise.id}>
                    <ProgramExercisePreview exercise={exercise} gender={fitnessGender} onOpen={() => onOpenExerciseDetails(exercise)} />
                    <div className="exercise-library-card__body">
                      <header className="exercise-library-card__header">
                        <div className="exercise-library-card__heading">
                          <p className="exercise-library-card__category">{exerciseIsCustom ? 'Custom exercise' : formatExerciseMuscleGroup(exercise.primaryTargetMuscleGroups[0]?.muscleGroup || exercise.category || 'Exercise')}</p>
                          <h3>{exercise.name}</h3>
                        </div>
                        <button
                          type="button"
                          className={`program-card__star-button ${favoriteExerciseIdSet.has(exercise.id) ? 'is-active' : ''}`}
                          onClick={() => onToggleSavedExercise(exercise.id)}
                          aria-label={favoriteExerciseIdSet.has(exercise.id) ? `Remove ${exercise.name} from favorite exercises` : `Save ${exercise.name} as favorite exercise`}
                          title={favoriteExerciseIdSet.has(exercise.id) ? 'Favorite' : 'Add favorite'}
                        >
                          <Star size={17} fill={favoriteExerciseIdSet.has(exercise.id) ? 'currentColor' : 'none'} />
                        </button>
                      </header>
                      <p className="exercise-library-card__description">
                        {exercise.description || exercise.notes || 'Exercise ready to be used in programs.'}
                      </p>
                      <div className="exercise-library-card__footer">
                        <div className="exercise-library-card__metadata">
                          {[...exercise.primaryTargetMuscleGroups, ...exercise.secondaryTargetMuscleGroups].map((target, index) => (
                            <span className={`exercise-library-card__meta exercise-library-card__meta--muscle ${index < exercise.primaryTargetMuscleGroups.length ? 'is-primary' : ''}`} key={`${target.muscleGroup}-${index}`}>
                              {formatExerciseMuscleGroup(target.muscleGroup)}
                            </span>
                          ))}
                          {exercise.equipment.slice(0, 1).map(equipment => <span className="exercise-library-card__meta" key={equipment}>{equipment}</span>)}
                          {exercise.difficulty ? <span className="exercise-library-card__meta">{exercise.difficulty}</span> : null}
                          <button type="button" className="exercise-library-card__details" onClick={() => onOpenExerciseDetails(exercise)}>Details <ArrowRight size={14} /></button>
                        </div>
                        <div className="exercise-library-card__muscles" role="group" aria-label={`${exercise.name} front and back muscle targets`}>
                          <div><ExerciseMuscleMaps exercise={exercise} gender={fitnessGender} side="front" miniature /><span>Front</span></div>
                          <div><ExerciseMuscleMaps exercise={exercise} gender={fitnessGender} side="back" miniature /><span>Back</span></div>
                        </div>
                      </div>
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
          {hasMore ? (
            <div ref={loadMoreRef} className="exercise-load-more">
              <button type="button" className="chip-button" onClick={loadMore}>
                Load more exercises
              </button>
            </div>
          ) : mediaFiltered.length ? (
            <p className="muted exercise-list-count">All matching exercises shown</p>
          ) : null}
        </section>
      ) : null}
    </>
  )
}
