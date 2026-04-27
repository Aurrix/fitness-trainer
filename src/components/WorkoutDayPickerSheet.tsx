import { useState } from 'react'
import { CalendarDays, CalendarRange } from 'lucide-react'
import BottomSheet from './BottomSheet'
import type { WorkoutDayOption, WorkoutWeekGroup } from '../lib/app-types'

type WorkoutDayPickerSheetProps = {
  mode: 'days' | 'weeks'
  onClose: () => void
  onSelectDay: (sectionId: string) => void
  selectedWorkoutDay: WorkoutDayOption | null
  selectedWorkoutWeek: WorkoutWeekGroup | null
  workoutWeeks: WorkoutWeekGroup[]
}

export default function WorkoutDayPickerSheet({
  mode,
  onClose,
  onSelectDay,
  selectedWorkoutDay,
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
                {focusedWeek.dayOptions.map((day) => (
                  <button
                    key={day.section.id}
                    type="button"
                    className={`list-card workout-picker__day ${
                      selectedWorkoutDay?.section.id === day.section.id ? 'is-active' : ''
                    }`}
                    onClick={() => {
                      onSelectDay(day.section.id)
                      onClose()
                    }}
                  >
                    <div>
                      <span className="pill pill--subtle">{day.dayLabel}</span>
                      <strong>{day.label}</strong>
                      <p className="muted">
                        {day.section.exercises.length} exercises in {focusedWeek.label}
                      </p>
                    </div>
                    <CalendarDays size={18} />
                  </button>
                ))}
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

                <div className="card-stack">
                  {week.dayOptions.map((day) => (
                    <button
                      key={day.section.id}
                      type="button"
                      className={`list-card workout-picker__day ${
                        selectedWorkoutDay?.section.id === day.section.id ? 'is-active' : ''
                      }`}
                      onClick={() => {
                        onSelectDay(day.section.id)
                        onClose()
                      }}
                    >
                      <div>
                        <span className="pill pill--subtle">{day.dayLabel}</span>
                        <strong>{day.label}</strong>
                        <p className="muted">{day.section.exercises.length} exercises planned</p>
                      </div>
                      <CalendarDays size={18} />
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
    </BottomSheet>
  )
}
