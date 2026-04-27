import { useMemo, useState } from 'react'
import type { Slug } from '@mjcdev/react-body-highlighter'
import { CalendarDays, CalendarRange, LibraryBig } from 'lucide-react'
import FloatingSessionBar from '../components/FloatingSessionBar'
import MuscleVisualizer from '../components/MuscleVisualizer'
import WorkoutDayPickerSheet from '../components/WorkoutDayPickerSheet'
import WorkoutExercisePickerSheet from '../components/WorkoutExercisePickerSheet'
import WorkoutExerciseTable from '../components/WorkoutExerciseTable'
import { muscleLabels } from '../lib/muscles'
import type { ExerciseStatsRecord } from '../entities/exercise-stats'
import { mapExerciseMuscleGroupsToBodySlugs } from '../entities/exercise-muscles'
import type {
  AppProgram,
  WorkoutDayOption,
  WorkoutWeekGroup,
} from '../lib/app-types'
import type { Exercise } from '../lib/content'
import type { FitnessProfile } from '../lib/fitness-profile'
import type { MuscleProfile } from '../lib/muscles'
import type {
  ActiveWorkout,
  WorkoutExerciseLogEntry,
  WorkoutSetLogEntry,
} from '../lib/user-data'

type WorkoutPageProps = {
  activeWorkout: ActiveWorkout | null
  activeWorkoutExerciseLogs: Record<string, WorkoutExerciseLogEntry>
  activeWorkoutExtraEntries: WorkoutExerciseLogEntry[]
  completionRatio: number
  contentExercises: Exercise[]
  completedWorkoutMuscles: MuscleProfile
  exertionOptions: string[]
  fitnessProfile: FitnessProfile
  handledPlannedExerciseCount: number
  isSelectedWorkoutActive: boolean
  launchProgram: AppProgram | null
  onAddWorkoutExercise: (exercise: Exercise) => void
  onAddWorkoutExerciseSet: (exerciseId: string) => void
  onAddWorkoutExtraExerciseSet: (logId: string) => void
  onOpenExerciseDetails: (exercise: Exercise) => void
  onOpenLibrary: (view: 'home' | 'programs' | 'exercises') => void
  onReorderWorkoutExercise: (
    draggedLogId: string,
    targetLogId: string,
    position: 'before' | 'after',
  ) => void
  onRemoveWorkoutExtraExercise: (logId: string) => void
  onSetSelectedWorkoutSectionId: (sectionId: string | null) => void
  onStartWorkout: (program: AppProgram, sectionId: string) => void
  onSubstituteWorkoutExercise: (exerciseId: string, exercise: Exercise) => void
  onSubstituteWorkoutExtraExercise: (logId: string, exercise: Exercise) => void
  onToggleWorkoutExercise: (exerciseId: string) => void
  onToggleWorkoutExerciseSkipped: (exerciseId: string) => void
  onToggleWorkoutExtraExercise: (logId: string) => void
  onUpdateWorkoutExerciseSetLog: (
    exerciseId: string,
    setIndex: number,
    field: keyof WorkoutSetLogEntry,
    value: string,
  ) => void
  onUpdateWorkoutExtraExerciseSetLog: (
    logId: string,
    setIndex: number,
    field: keyof WorkoutSetLogEntry,
    value: string,
  ) => void
  previewExerciseOrder: string[]
  resolveExerciseStatsRecord: (
    exerciseId: string | null,
    exerciseName: string,
  ) => ExerciseStatsRecord | null
  resolveExerciseForDisplay: (exercise: {
    exerciseId: string | null
    exerciseName: string
    resolvedExerciseId: string | null
  }) => Exercise | null
  selectedWorkoutDay: WorkoutDayOption | null
  selectedWorkoutSection: AppProgram['sections'][number] | null
  selectedWorkoutTargetProfile: MuscleProfile
  selectedWorkoutWeek: WorkoutWeekGroup | null
  workoutWeeks: WorkoutWeekGroup[]
}

export default function WorkoutPage({
  activeWorkout,
  activeWorkoutExerciseLogs,
  activeWorkoutExtraEntries,
  completionRatio,
  contentExercises,
  completedWorkoutMuscles,
  exertionOptions,
  fitnessProfile,
  handledPlannedExerciseCount,
  isSelectedWorkoutActive,
  launchProgram,
  onAddWorkoutExercise,
  onAddWorkoutExerciseSet,
  onAddWorkoutExtraExerciseSet,
  onOpenExerciseDetails,
  onOpenLibrary,
  onReorderWorkoutExercise,
  onRemoveWorkoutExtraExercise,
  onSetSelectedWorkoutSectionId,
  onStartWorkout,
  onSubstituteWorkoutExercise,
  onSubstituteWorkoutExtraExercise,
  onToggleWorkoutExercise,
  onToggleWorkoutExerciseSkipped,
  onToggleWorkoutExtraExercise,
  onUpdateWorkoutExerciseSetLog,
  onUpdateWorkoutExtraExerciseSetLog,
  previewExerciseOrder,
  resolveExerciseStatsRecord,
  resolveExerciseForDisplay,
  selectedWorkoutDay,
  selectedWorkoutSection,
  selectedWorkoutTargetProfile,
  selectedWorkoutWeek,
  workoutWeeks,
}: WorkoutPageProps) {
  const [pickerMode, setPickerMode] = useState<'days' | 'weeks' | null>(null)
  const [selectedQuickAddMuscle, setSelectedQuickAddMuscle] = useState<Slug | null>(null)
  const defaultMuscleView = isSelectedWorkoutActive ? 'completed' : 'planned'
  const muscleViewKey = `${selectedWorkoutSection?.id ?? 'none'}:${defaultMuscleView}`
  const [muscleViewState, setMuscleViewState] = useState<{
    key: string
    value: 'completed' | 'planned'
  }>({
    key: muscleViewKey,
    value: defaultMuscleView,
  })
  const muscleView =
    muscleViewState.key === muscleViewKey ? muscleViewState.value : defaultMuscleView
  const visibleMuscleView =
    isSelectedWorkoutActive && muscleView === 'completed' ? 'completed' : 'planned'
  const workoutDayLabel = useMemo(() => {
    if (!selectedWorkoutDay) {
      return null
    }

    return `${selectedWorkoutDay.weekLabel} / ${selectedWorkoutDay.dayLabel}`
  }, [selectedWorkoutDay])
  const startThisDayAction =
    launchProgram && selectedWorkoutSection && !isSelectedWorkoutActive
      ? () => onStartWorkout(launchProgram, selectedWorkoutSection.id)
      : null
  const quickAddExercises = useMemo(() => {
    if (!selectedQuickAddMuscle) {
      return []
    }

    return [...contentExercises]
      .filter((exercise) =>
        mapExerciseMuscleGroupsToBodySlugs(exercise.muscleGroups, { dedupe: true }).includes(
          selectedQuickAddMuscle,
        ),
      )
      .sort((left, right) => {
        const leftPrimaryHit = mapExerciseMuscleGroupsToBodySlugs(
          left.primaryTargetMuscleGroups.map((entry) => entry.muscleGroup),
          { dedupe: true },
        ).includes(selectedQuickAddMuscle)
        const rightPrimaryHit = mapExerciseMuscleGroupsToBodySlugs(
          right.primaryTargetMuscleGroups.map((entry) => entry.muscleGroup),
          { dedupe: true },
        ).includes(selectedQuickAddMuscle)

        if (leftPrimaryHit !== rightPrimaryHit) {
          return leftPrimaryHit ? -1 : 1
        }

        return left.name.localeCompare(right.name)
      })
  }, [contentExercises, selectedQuickAddMuscle])

  if (!launchProgram || !selectedWorkoutSection || !selectedWorkoutWeek) {
    return (
      <section className="launchpad-card workout-empty-card">
        <div className="section-header launchpad-header">
          <div>
            <p className="kicker">Workout</p>
            <h2>No main program selected</h2>
            <p className="muted">
              Pick a program from the library to unlock the week and day workflow.
            </p>
          </div>
        </div>

        <div className="row-actions">
          <button
            type="button"
            className="primary-button icon-button"
            onClick={() => onOpenLibrary('programs')}
          >
            <LibraryBig size={16} />
            <span>Choose program</span>
          </button>
        </div>
      </section>
    )
  }

  return (
    <>
      <FloatingSessionBar
        completedExerciseCount={handledPlannedExerciseCount}
        completionRatio={completionRatio}
        isSelectedWorkoutActive={isSelectedWorkoutActive}
        launchProgram={launchProgram}
        selectedWorkoutSectionName={selectedWorkoutSection.shortName || selectedWorkoutSection.name}
        totalExerciseCount={selectedWorkoutSection.exercises.length}
      />

      {startThisDayAction ? (
        <button
          type="button"
          className="primary-button workout-start-day-button"
          onClick={startThisDayAction}
        >
          Start this day
        </button>
      ) : null}

      <MuscleVisualizer
        centerHeader
        compact
        className="workout-day-visualizer workout-day-visualizer--focused"
        detailSheetDescription={
          visibleMuscleView === 'completed'
            ? 'All muscle groups hit by exercises already completed during this day.'
            : 'All muscle groups this day is designed to target.'
        }
        detailsMode="sheet"
        gender={fitnessProfile.gender}
        headerLeading={
          <button
            type="button"
            className="chip-button icon-button workout-visualizer-toolbar__button workout-visualizer-toolbar__button--round"
            onClick={() => setPickerMode('weeks')}
            aria-label="Choose week"
            title="Choose week"
          >
            <CalendarRange size={15} />
          </button>
        }
        headerTrailing={
          <button
            type="button"
            className="chip-button icon-button workout-visualizer-toolbar__button workout-visualizer-toolbar__button--round"
            onClick={() => setPickerMode('days')}
            aria-label="Choose day"
            title="Choose day"
          >
            <CalendarDays size={15} />
          </button>
        }
        kicker={workoutDayLabel ?? 'Workout muscles'}
        intensityLegendLabel="Blue means lighter relative activation in this day view, while warm orange and gold highlight the most-hit muscle groups."
        onSelectMuscle={(slug) => {
          if (!isSelectedWorkoutActive) {
            return
          }

          setSelectedQuickAddMuscle(slug)
        }}
        showIntensityLegend
        showSheetPreview={false}
        toolbar={
          <div className="workout-visualizer-toolbar">
            <div className="segmented-control segmented-control--two workout-coverage-toggle">
              <button
                type="button"
                className={visibleMuscleView === 'planned' ? 'is-active' : ''}
                onClick={() =>
                  setMuscleViewState({
                    key: muscleViewKey,
                    value: 'planned',
                  })
                }
              >
                All targeted
              </button>
              <button
                type="button"
                className={visibleMuscleView === 'completed' ? 'is-active' : ''}
                onClick={() =>
                  setMuscleViewState({
                    key: muscleViewKey,
                    value: 'completed',
                  })
                }
                disabled={!isSelectedWorkoutActive}
              >
                Covered so far
              </button>
            </div>
          </div>
        }
        profile={
          visibleMuscleView === 'completed'
            ? completedWorkoutMuscles
            : selectedWorkoutTargetProfile
        }
        title={visibleMuscleView === 'completed' ? 'Covered muscles' : 'Target muscles'}
      />

      <WorkoutExerciseTable
        activeWorkout={activeWorkout}
        activeWorkoutExerciseLogs={activeWorkoutExerciseLogs}
        activeWorkoutExtraEntries={activeWorkoutExtraEntries}
        contentExercises={contentExercises}
        effortScale={fitnessProfile.effortScale}
        exertionOptions={exertionOptions}
        isSelectedWorkoutActive={isSelectedWorkoutActive}
        onAddWorkoutExercise={onAddWorkoutExercise}
        onAddWorkoutExerciseSet={onAddWorkoutExerciseSet}
        onAddWorkoutExtraExerciseSet={onAddWorkoutExtraExerciseSet}
        onOpenExerciseDetails={onOpenExerciseDetails}
        onReorderWorkoutExercise={onReorderWorkoutExercise}
        onRemoveWorkoutExtraExercise={onRemoveWorkoutExtraExercise}
        onSubstituteWorkoutExercise={onSubstituteWorkoutExercise}
        onSubstituteWorkoutExtraExercise={onSubstituteWorkoutExtraExercise}
        onToggleWorkoutExercise={onToggleWorkoutExercise}
        onToggleWorkoutExerciseSkipped={onToggleWorkoutExerciseSkipped}
        onToggleWorkoutExtraExercise={onToggleWorkoutExtraExercise}
        onUpdateWorkoutExerciseSetLog={onUpdateWorkoutExerciseSetLog}
        onUpdateWorkoutExtraExerciseSetLog={onUpdateWorkoutExtraExerciseSetLog}
        previewExerciseOrder={previewExerciseOrder}
        resolveExerciseStatsRecord={resolveExerciseStatsRecord}
        resolveExerciseForDisplay={resolveExerciseForDisplay}
        section={selectedWorkoutSection}
      />

      {pickerMode ? (
        <WorkoutDayPickerSheet
          mode={pickerMode}
          onClose={() => setPickerMode(null)}
          onSelectDay={onSetSelectedWorkoutSectionId}
          selectedWorkoutDay={selectedWorkoutDay}
          selectedWorkoutWeek={selectedWorkoutWeek}
          workoutWeeks={workoutWeeks}
        />
      ) : null}

      {selectedQuickAddMuscle ? (
        <WorkoutExercisePickerSheet
          actionLabel="Add"
          description={`Quick add an exercise that targets ${muscleLabels[selectedQuickAddMuscle]}.`}
          exercises={quickAddExercises}
          onClose={() => setSelectedQuickAddMuscle(null)}
          onSelectExercise={(exercise) => {
            onAddWorkoutExercise(exercise)
            setSelectedQuickAddMuscle(null)
          }}
          title={`Add ${muscleLabels[selectedQuickAddMuscle]}`}
        />
      ) : null}
    </>
  )
}
