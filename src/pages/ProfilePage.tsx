import type { AppProgram } from '../lib/app-types'
import { countExercises } from '../lib/app-utils'
import type { FitnessProfile } from '../lib/fitness-profile'

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
}: ProfilePageProps) {
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
