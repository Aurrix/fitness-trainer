import { useMemo } from 'react'
import { CalendarCheck, Clock3 } from 'lucide-react'
import type { ProgramCompletionLog } from '../entities/program-completion'
import type { ProgramDayLog } from '../entities/program-day-stats'
import type { AppProgram } from '../lib/app-types'
import { countExercises } from '../lib/app-utils'
import type { FitnessProfile } from '../lib/fitness-profile'
import {
  buildProgramHistoryRuns,
  describeProgramExerciseState,
  formatDurationMinutes,
  formatHistoryDate,
  formatProgramSet,
} from '../lib/program-history'

type ProfilePageProps = {
  activityLevelLabel: string
  fitnessActivityLevelOptions: Array<{ label: string; value: FitnessProfile['activityLevel'] }>
  fitnessEffortScaleOptions: Array<{ label: string; value: FitnessProfile['effortScale'] }>
  fitnessExperienceOptions: Array<{
    label: string
    value: FitnessProfile['experienceLevel']
  }>
  fitnessGoalOptions: Array<{ label: string; value: FitnessProfile['primaryGoal'] }>
  fitnessProfile: FitnessProfile
  isMainProgramEmpty: boolean
  mainProgram: AppProgram
  onChangeMainProgram: () => void
  onOpenMainProgram: () => void
  onResetProgressionData: () => void
  onResetStoredData: () => void
  onUpdateFitnessProfile: <K extends keyof FitnessProfile>(
    field: K,
    value: FitnessProfile[K],
  ) => void
  onUpdateNumericFitnessProfileField: (
    field:
      | 'age'
      | 'heightCm'
      | 'weightKg'
      | 'bodyFatPercentage'
      | 'weeklyWorkoutTarget',
    rawValue: string,
  ) => void
  programCompletionLogs: ProgramCompletionLog[]
  programDayLogs: ProgramDayLog[]
  programs: AppProgram[]
}

export default function ProfilePage({
  activityLevelLabel,
  fitnessActivityLevelOptions,
  fitnessEffortScaleOptions,
  fitnessExperienceOptions,
  fitnessGoalOptions,
  fitnessProfile,
  isMainProgramEmpty,
  mainProgram,
  onChangeMainProgram,
  onOpenMainProgram,
  onResetProgressionData,
  onResetStoredData,
  onUpdateFitnessProfile,
  onUpdateNumericFitnessProfileField,
  programCompletionLogs,
  programDayLogs,
  programs,
}: ProfilePageProps) {
  const programHistoryRuns = useMemo(() => {
    return buildProgramHistoryRuns(programs, programDayLogs, programCompletionLogs)
  }, [programCompletionLogs, programDayLogs, programs])
  const latestProgramHistoryRun = programHistoryRuns[0] ?? null

  return (
    <>
      <section className="section-card">
        <div className="section-header">
          <div>
            <p className="kicker">Main Program</p>
            <h2>Selected plan</h2>
          </div>
        </div>

        <article className="program-card program-card--featured profile-main-program-card">
          <div className="section-header">
            <div className="profile-main-program-card__header">
              <span className="pill">{isMainProgramEmpty ? 'Default' : 'Selected'}</span>
              <h3>{mainProgram.name}</h3>
              <p className="muted">
                {mainProgram.description ||
                  `${countExercises(mainProgram)} exercises across ${mainProgram.sections.length} days.`}
              </p>
            </div>
          </div>

          <div className="tag-row profile-main-program-card__tags">
            <span className="pill pill--subtle">{mainProgram.sections.length} days</span>
            <span className="pill pill--subtle">{countExercises(mainProgram)} exercises</span>
            {!isMainProgramEmpty ? (
              <span className="pill pill--subtle">{mainProgram.programSource}</span>
            ) : null}
          </div>

          <p className="muted">
            Changing programs archives this run for your statistics. Selecting this program again
            starts a new run and resets its finished days.
          </p>

          <div className="row-actions profile-main-program-card__actions">
            {!isMainProgramEmpty ? (
              <button
                type="button"
                className="secondary-button profile-main-program-card__action"
                onClick={onOpenMainProgram}
              >
                View Program
              </button>
            ) : null}
            <button
              type="button"
              className="primary-button profile-main-program-card__action"
              onClick={onChangeMainProgram}
            >
              Change Program
            </button>
          </div>
        </article>
      </section>

      <section className="section-card profile-program-history-section">
        <div className="section-header">
          <div>
            <p className="kicker">Completed Programs</p>
            <h2>Program history</h2>
            <p className="muted profile-program-history-section__summary">
              Full runs with completed days, exercises, weights, reps, and effort.
            </p>
          </div>
          <span className="pill pill--subtle">{programHistoryRuns.length} runs</span>
        </div>

        {latestProgramHistoryRun ? (
          <div className="profile-program-history-overview">
            <div>
              <span>Latest</span>
              <strong>{latestProgramHistoryRun.programName}</strong>
            </div>
            <div>
              <span>Finished</span>
              <strong>{formatHistoryDate(latestProgramHistoryRun.completedAt)}</strong>
            </div>
            <div>
              <span>Duration</span>
              <strong>{formatDurationMinutes(latestProgramHistoryRun.durationMinutes)}</strong>
            </div>
          </div>
        ) : null}

        {programHistoryRuns.length ? (
          <div className="program-history-board program-history-board--profile">
            {programHistoryRuns.map((programRun) => (
              <article key={programRun.id} className="insight-card program-history-card">
                <div className="program-history-card__header">
                  <div>
                    <p className="kicker">{programRun.programSource}</p>
                    <h4>{programRun.programName}</h4>
                    <span>
                      {programRun.completedDayCount}/{programRun.totalDayCount} days /{' '}
                      {formatDurationMinutes(programRun.durationMinutes)}
                    </span>
                  </div>
                  <div className="program-history-card__meta">
                    <CalendarCheck size={16} />
                    <span>{formatHistoryDate(programRun.completedAt)}</span>
                  </div>
                </div>

                <div className="program-history-days">
                  {programRun.dayLogs.map((dayLog, dayIndex) => (
                    <details key={dayLog.id} className="program-history-day" open={dayIndex === 0}>
                      <summary>
                        <span>
                          <strong>{dayLog.sectionName}</strong>
                          <span>
                            {dayLog.completedExerciseCount}/{dayLog.totalExerciseCount} exercises
                          </span>
                        </span>
                        <span className="program-history-day__meta">
                          <Clock3 size={14} />
                          {formatDurationMinutes(dayLog.durationMinutes)}
                        </span>
                      </summary>

                      <div className="program-history-exercise-list">
                        {dayLog.exerciseEntries.map((exercise) => (
                          <div
                            key={`${dayLog.id}-${exercise.logId}`}
                            className="program-history-exercise-row"
                          >
                            <div className="program-history-exercise-row__header">
                              <strong>{exercise.exerciseName}</strong>
                              <span>{describeProgramExerciseState(exercise)}</span>
                            </div>
                            <div className="program-history-exercise-row__sets">
                              {exercise.sets.length ? (
                                exercise.sets.map((set) => (
                                  <span
                                    key={`${exercise.logId}-${set.setIndex}`}
                                    className="program-history-set-chip"
                                  >
                                    Set {set.setIndex}: {formatProgramSet(set)}
                                  </span>
                                ))
                              ) : (
                                <span className="program-history-set-chip">No set details</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state compact-empty-state">
            <h3>No completed programs yet</h3>
            <p>Complete every programmed day in a plan to save a full-program history entry.</p>
          </div>
        )}
      </section>

      <section className="section-card">
        <div className="section-header">
          <div>
            <p className="kicker">Body Profile</p>
            <h2>Personal details</h2>
          </div>
          <span className="pill pill--subtle">{activityLevelLabel}</span>
        </div>

        <div className="field">
          <span className="field-label">Gender</span>
          <div className="segmented-control segmented-control--two">
            <button
              type="button"
              className={fitnessProfile.gender === 'male' ? 'is-active' : ''}
              onClick={() => onUpdateFitnessProfile('gender', 'male')}
            >
              Male
            </button>
            <button
              type="button"
              className={fitnessProfile.gender === 'female' ? 'is-active' : ''}
              onClick={() => onUpdateFitnessProfile('gender', 'female')}
            >
              Female
            </button>
          </div>
        </div>

        <div className="input-grid compact-grid settings-grid">
          <label className="field">
            <span className="field-label">Age</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              value={fitnessProfile.age ?? ''}
              onChange={(event) => onUpdateNumericFitnessProfileField('age', event.target.value)}
              placeholder="29"
            />
          </label>

          <label className="field">
            <span className="field-label">Height (cm)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="260"
              step="0.1"
              value={fitnessProfile.heightCm ?? ''}
              onChange={(event) =>
                onUpdateNumericFitnessProfileField('heightCm', event.target.value)
              }
              placeholder="178"
            />
          </label>

          <label className="field">
            <span className="field-label">Weight (kg)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="400"
              step="0.1"
              value={fitnessProfile.weightKg ?? ''}
              onChange={(event) =>
                onUpdateNumericFitnessProfileField('weightKg', event.target.value)
              }
              placeholder="78.5"
            />
          </label>

          <label className="field">
            <span className="field-label">Body Fat %</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.1"
              value={fitnessProfile.bodyFatPercentage ?? ''}
              onChange={(event) =>
                onUpdateNumericFitnessProfileField('bodyFatPercentage', event.target.value)
              }
              placeholder="16"
            />
          </label>
        </div>
      </section>

      <section className="section-card">
        <div className="section-header">
          <div>
            <p className="kicker">Training Preferences</p>
            <h2>How you train</h2>
          </div>
        </div>

        <div className="input-grid compact-grid settings-grid">
          <label className="field">
            <span className="field-label">Primary Goal</span>
            <select
              value={fitnessProfile.primaryGoal}
              onChange={(event) =>
                onUpdateFitnessProfile(
                  'primaryGoal',
                  event.target.value as FitnessProfile['primaryGoal'],
                )
              }
            >
              {fitnessGoalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Experience Level</span>
            <select
              value={fitnessProfile.experienceLevel}
              onChange={(event) =>
                onUpdateFitnessProfile(
                  'experienceLevel',
                  event.target.value as FitnessProfile['experienceLevel'],
                )
              }
            >
              {fitnessExperienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Activity Level</span>
            <select
              value={fitnessProfile.activityLevel}
              onChange={(event) =>
                onUpdateFitnessProfile(
                  'activityLevel',
                  event.target.value as FitnessProfile['activityLevel'],
                )
              }
            >
              {fitnessActivityLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Workout Logging Scale</span>
            <select
              value={fitnessProfile.effortScale}
              onChange={(event) =>
                onUpdateFitnessProfile(
                  'effortScale',
                  event.target.value as FitnessProfile['effortScale'],
                )
              }
            >
              {fitnessEffortScaleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Workout Days / Week</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="14"
              value={fitnessProfile.weeklyWorkoutTarget ?? ''}
              onChange={(event) =>
                onUpdateNumericFitnessProfileField('weeklyWorkoutTarget', event.target.value)
              }
              placeholder="4"
            />
          </label>
        </div>

        <label className="field">
          <span className="field-label">Injuries, restrictions, notes</span>
          <textarea
            rows={4}
            value={fitnessProfile.notes}
            onChange={(event) => onUpdateFitnessProfile('notes', event.target.value)}
            placeholder="Knee discomfort on deep flexion, prefer shorter sessions, training mostly at home..."
          />
        </label>
      </section>

      <section className="section-card">
        <div className="section-header">
          <div>
            <p className="kicker">Local Data</p>
            <h2>Device storage and actions</h2>
          </div>
        </div>

        <div className="card-stack">
          <article className="list-card">
            <div>
              <h4>Reset progression</h4>
              <p className="muted">
                Clears workout history, active sessions, and tracked program stats.
              </p>
            </div>
            <button type="button" className="chip-button icon-button" onClick={onResetProgressionData}>
              <span>Reset</span>
            </button>
          </article>

          <article className="list-card">
            <div>
              <h4>Reset local data</h4>
              <p className="muted">
                Clears Dexie-stored workouts, saved programs, and app state on this device.
              </p>
            </div>
            <button type="button" className="ghost-button icon-button" onClick={onResetStoredData}>
              <span>Reset</span>
            </button>
          </article>
        </div>
      </section>
    </>
  )
}
