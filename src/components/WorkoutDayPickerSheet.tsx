import { useState } from 'react'
import {
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Circle,
  Clock3,
  SkipForward,
} from 'lucide-react'
import BottomSheet from './BottomSheet'
import type { WorkoutDayOption, WorkoutDayPreview, WorkoutWeekGroup } from '../lib/app-types'

type WorkoutDayPickerSheetProps = {
  mode: 'days' | 'weeks'
  onClose: () => void
  onSelectDay: (sectionId: string) => void
  selectedWorkoutDay: WorkoutDayOption | null
  selectedWorkoutDayPreviewBySectionId: Record<string, WorkoutDayPreview>
  selectedWorkoutWeek: WorkoutWeekGroup | null
  workoutWeeks: WorkoutWeekGroup[]
}

function formatCompletedAt(value: string | null) {
  if (!value) {
    return null
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}

function describeExercisePreviewState(preview: WorkoutDayPreview['exercisePreviews'][number]) {
  if (preview.skipped) {
    return 'Skipped'
  }

  if (preview.completed) {
    return preview.performedSetCount > 0
      ? `${preview.performedSetCount} logged set${preview.performedSetCount === 1 ? '' : 's'}`
      : 'Done'
  }

  if (preview.performedSetCount > 0) {
    return `${preview.performedSetCount} logged set${preview.performedSetCount === 1 ? '' : 's'}`
  }

  return 'Planned'
}

function renderDayCard(
  day: WorkoutDayOption,
  preview: WorkoutDayPreview | undefined,
  isSelected: boolean,
  weekLabel: string,
  onClose: () => void,
  onSelectDay: (sectionId: string) => void,
) {
  const completedAtLabel = formatCompletedAt(preview?.completedAt ?? null)
  const summary = preview
    ? `${preview.completedExerciseCount}/${preview.plannedExerciseCount} done`
    : `${day.section.exercises.length} planned`
  const secondarySummary = preview
    ? [
        preview.skippedExerciseCount ? `${preview.skippedExerciseCount} skipped` : null,
        preview.extraEntryCount ? `${preview.extraEntryCount} extras` : null,
        preview.performedExerciseCount
          ? `${preview.performedExerciseCount} touched`
          : null,
      ]
        .filter(Boolean)
        .join(' • ')
    : ''

  return (
    <button
      key={day.section.id}
      type="button"
      className={`list-card workout-picker__day ${isSelected ? 'is-active' : ''} ${
        preview?.isComplete ? 'is-complete' : ''
      } ${preview?.isActive ? 'is-current' : ''}`}
      onClick={() => {
        onSelectDay(day.section.id)
        onClose()
      }}
    >
      <div className="workout-picker__day-header">
        <div className="workout-picker__day-title">
          <div className="workout-picker__day-badges">
            <span className="pill pill--subtle">{day.dayLabel}</span>
            {preview?.isActive ? (
              <span className="pill workout-picker__status workout-picker__status--active">
                Active
              </span>
            ) : null}
            {preview?.isComplete ? (
              <span className="pill workout-picker__status workout-picker__status--complete">
                Completed
              </span>
            ) : null}
          </div>
          <strong>{day.label}</strong>
          <p className="muted">
            {summary}
            {secondarySummary ? ` • ${secondarySummary}` : ''}
            {!preview ? ` • ${weekLabel}` : ''}
            {completedAtLabel ? ` • Last done ${completedAtLabel}` : ''}
          </p>
        </div>
        <CalendarDays size={18} />
      </div>

      <div className="workout-picker__exercise-preview-list">
        {(preview?.exercisePreviews.length
          ? preview.exercisePreviews
          : day.section.exercises.map((exercise) => ({
              completed: false,
              exerciseId: exercise.id,
              hasLoggedSets: false,
              name: exercise.exerciseName,
              performedSetCount: 0,
              skipped: false,
              type: 'planned' as const,
            }))
        )
          .slice(0, 6)
          .map((exercisePreview) => (
            <div
              key={exercisePreview.exerciseId}
              className={`workout-picker__exercise-preview ${
                exercisePreview.completed
                  ? 'is-complete'
                  : exercisePreview.skipped
                    ? 'is-skipped'
                    : exercisePreview.hasLoggedSets
                      ? 'is-logged'
                      : ''
              }`}
            >
              <span className="workout-picker__exercise-preview-icon" aria-hidden="true">
                {exercisePreview.skipped ? (
                  <SkipForward size={14} />
                ) : exercisePreview.completed ? (
                  <CheckCircle2 size={14} />
                ) : exercisePreview.hasLoggedSets ? (
                  <Clock3 size={14} />
                ) : (
                  <Circle size={14} />
                )}
              </span>
              <span className="workout-picker__exercise-preview-name">
                {exercisePreview.name}
                {exercisePreview.type !== 'planned' ? ' (Extra)' : ''}
              </span>
              <span className="workout-picker__exercise-preview-state">
                {describeExercisePreviewState(exercisePreview)}
              </span>
            </div>
          ))}
      </div>
    </button>
  )
}

function renderCompactDayChip(
  day: WorkoutDayOption,
  preview: WorkoutDayPreview | undefined,
  isSelected: boolean,
  onClose: () => void,
  onSelectDay: (sectionId: string) => void,
) {
  const statusClassName = preview?.isActive
    ? 'workout-picker__compact-status--active'
    : preview?.isComplete
      ? 'workout-picker__compact-status--complete'
      : preview?.performedExerciseCount
        ? 'workout-picker__compact-status--progress'
        : 'workout-picker__compact-status--planned'
  const summary = preview
    ? `${preview.completedExerciseCount}/${preview.plannedExerciseCount}`
    : `${day.section.exercises.length}`

  return (
    <button
      key={day.section.id}
      type="button"
      className={`workout-picker__compact-day ${
        isSelected ? 'is-active' : ''
      } ${preview?.isComplete ? 'is-complete' : ''} ${preview?.isActive ? 'is-current' : ''}`}
      onClick={() => {
        onSelectDay(day.section.id)
        onClose()
      }}
    >
      <span className="workout-picker__compact-day-label">{day.dayLabel}</span>
      <span className={`workout-picker__compact-status ${statusClassName}`} aria-hidden="true" />
      <span className="workout-picker__compact-day-count">{summary}</span>
    </button>
  )
}

export default function WorkoutDayPickerSheet({
  mode,
  onClose,
  onSelectDay,
  selectedWorkoutDay,
  selectedWorkoutDayPreviewBySectionId,
  selectedWorkoutWeek,
  workoutWeeks,
}: WorkoutDayPickerSheetProps) {
  const baseFocusedWeekIndex = selectedWorkoutWeek?.weekIndex ?? workoutWeeks[0]?.weekIndex ?? 1
  const [focusedWeekState, setFocusedWeekState] = useState<{
    anchor: number
    value: number
  }>({
    anchor: baseFocusedWeekIndex,
    value: baseFocusedWeekIndex,
  })
  const focusedWeekIndex =
    focusedWeekState.anchor === baseFocusedWeekIndex
      ? focusedWeekState.value
      : baseFocusedWeekIndex
  const focusedWeek =
    workoutWeeks.find((week) => week.weekIndex === focusedWeekIndex) ?? workoutWeeks[0] ?? null

  return (
    <BottomSheet
      description={
        mode === 'weeks'
          ? 'Start with a training week, then pick the day you want to run.'
          : 'Jump directly to any programmed day in your current plan.'
      }
      kicker={mode === 'weeks' ? 'Weeks' : 'Days'}
      onClose={onClose}
      title={mode === 'weeks' ? 'Choose week and day' : 'Choose workout day'}
    >
      {mode === 'weeks' ? (
        <>
          <div className="shortcut-scroller workout-picker__weeks">
            {workoutWeeks.map((week) => (
              <button
                key={week.weekIndex}
                type="button"
                className={`shortcut-chip ${
                  week.weekIndex === focusedWeekIndex ? 'is-active' : ''
                }`}
                onClick={() =>
                  setFocusedWeekState({
                    anchor: baseFocusedWeekIndex,
                    value: week.weekIndex,
                  })
                }
              >
                <CalendarRange size={16} />
                <span>{week.label}</span>
              </button>
            ))}
          </div>

          {focusedWeek ? (
            <div className="card-stack workout-picker__stack">
              {focusedWeek.dayOptions.map((day) =>
                renderDayCard(
                  day,
                  selectedWorkoutDayPreviewBySectionId[day.section.id],
                  selectedWorkoutDay?.section.id === day.section.id,
                  focusedWeek.label,
                  onClose,
                  onSelectDay,
                ),
              )}
            </div>
          ) : null}
        </>
      ) : (
        <div className="card-stack workout-picker__stack">
          {workoutWeeks.map((week) => (
            <section key={week.weekIndex} className="section-card workout-picker__group">
              <div className="section-header">
                <div>
                  <p className="kicker">Week</p>
                  <h3>{week.label}</h3>
                </div>
              </div>

              <div className="workout-picker__compact-days">
                {week.dayOptions.map((day) =>
                  renderCompactDayChip(
                    day,
                    selectedWorkoutDayPreviewBySectionId[day.section.id],
                    selectedWorkoutDay?.section.id === day.section.id,
                    onClose,
                    onSelectDay,
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </BottomSheet>
  )
}
