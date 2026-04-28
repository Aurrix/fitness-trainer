import { useMemo, useState } from 'react'
import {
  Activity,
  BellRing,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Plus,
  StarOff,
  Target,
  Trash2,
} from 'lucide-react'
import type { BodyStatEntry } from '../entities/body-stats'
import type { ExerciseStatsStore } from '../entities/exercise-stats'
import type { ProgramCompletionLog } from '../entities/program-completion'
import type { ProgramDayLog } from '../entities/program-day-stats'
import type { WorkoutLog } from '../entities/workout'
import type { AppProgram, InsightsView } from '../lib/app-types'
import type { FitnessProfile } from '../lib/fitness-profile'
import { buildProgramHistoryRuns, formatHistoryDate } from '../lib/program-history'
import { buildSuggestions, type SuggestionFinding } from '../lib/suggestions'
import type { EditableExercise, ProgramDraft } from '../lib/user-data'
import type { Exercise } from '../lib/content'

type InsightsPageProps = {
  bodyStatsEntries: BodyStatEntry[]
  contentExercises: Exercise[]
  draft: ProgramDraft
  exerciseStatsStore: ExerciseStatsStore
  fitnessProfile: FitnessProfile
  insightsView: InsightsView
  isBuilderOpen: boolean
  mainProgram: AppProgram
  onAddExerciseToSection: (sectionId: string) => void
  onAddSection: () => void
  onCloseBuilder: () => void
  onRemoveExerciseFromSection: (sectionId: string, exerciseId: string) => void
  onRemoveSection: (sectionId: string) => void
  onResetBuilder: () => void
  onSaveDraft: () => void
  onSetInsightsView: (view: InsightsView) => void
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
  programCompletionLogs: ProgramCompletionLog[]
  programDayLogs: ProgramDayLog[]
  programs: AppProgram[]
  workoutLogs: WorkoutLog[]
}

type InsightsSection = Exclude<InsightsView, 'home' | 'programs'>
type InsightsPanel = InsightsSection | 'programs'

const insightSectionOrder: InsightsSection[] = ['notifications', 'advice', 'analysis']

const insightTabCopy: Record<
  InsightsSection,
  {
    emptyDescription: string
    kicker: string
  }
> = {
  advice: {
    emptyDescription:
      'Keep logging workouts and body snapshots to unlock more day-to-day coaching advice.',
    kicker: 'Advice',
  },
  analysis: {
    emptyDescription:
      'Log a bit more training history to unlock analysis on performance and body-composition trends.',
    kicker: 'Analysis',
  },
  notifications: {
    emptyDescription:
      'No active reminders right now. This tab will surface urgent findings and setup nudges when needed.',
    kicker: 'Notifications',
  },
}

function classifySuggestion(finding: SuggestionFinding): InsightsSection {
  if (finding.tone === 'attention' || finding.category === 'setup') {
    return 'notifications'
  }

  if (finding.category === 'body' || finding.category === 'progression') {
    return 'analysis'
  }

  return 'advice'
}

function formatSuggestionCategory(category: SuggestionFinding['category']) {
  switch (category) {
    case 'body':
      return 'Body'
    case 'consistency':
      return 'Consistency'
    case 'progression':
      return 'Progression'
    case 'recovery':
      return 'Recovery'
    case 'setup':
      return 'Setup'
    default:
      return category
  }
}

function getDefaultInsightsTab(suggestionsByTab: Record<InsightsSection, SuggestionFinding[]>) {
  if (suggestionsByTab.notifications.length) {
    return 'notifications' as const
  }

  if (suggestionsByTab.advice.length) {
    return 'advice' as const
  }

  return 'analysis' as const
}

export default function InsightsPage({
  bodyStatsEntries,
  contentExercises,
  draft,
  exerciseStatsStore,
  fitnessProfile,
  insightsView,
  isBuilderOpen,
  mainProgram,
  onAddExerciseToSection,
  onAddSection,
  onCloseBuilder,
  onRemoveExerciseFromSection,
  onRemoveSection,
  onResetBuilder,
  onSaveDraft,
  onSetInsightsView,
  onUpdateDraftExercise,
  onUpdateDraftField,
  onUpdateSectionField,
  programCompletionLogs,
  programDayLogs,
  programs,
  workoutLogs,
}: InsightsPageProps) {
  const suggestions = useMemo(() => {
    return buildSuggestions({
      bodyStatsEntries,
      exerciseStatsStore,
      fitnessProfile,
      mainProgram,
      programDayLogs,
      workoutLogs,
    })
  }, [
    bodyStatsEntries,
    exerciseStatsStore,
    fitnessProfile,
    mainProgram,
    programDayLogs,
    workoutLogs,
  ])
  const suggestionsByTab = useMemo<Record<InsightsSection, SuggestionFinding[]>>(() => {
    return suggestions.reduce<Record<InsightsSection, SuggestionFinding[]>>(
      (buckets, suggestion) => {
        buckets[classifySuggestion(suggestion)].push(suggestion)
        return buckets
      },
      {
        advice: [],
        analysis: [],
        notifications: [],
      },
    )
  }, [suggestions])
  const defaultInsightsTab = getDefaultInsightsTab(suggestionsByTab)
  const activePanel: InsightsPanel = insightsView === 'home' ? defaultInsightsTab : insightsView
  const activeInsightsTab: InsightsSection =
    activePanel === 'programs' ? defaultInsightsTab : activePanel
  const [expandedSuggestionId, setExpandedSuggestionId] = useState<string | null>(null)
  const programHistoryRuns = useMemo(() => {
    return buildProgramHistoryRuns(programs, programDayLogs, programCompletionLogs)
  }, [programCompletionLogs, programDayLogs, programs])
  const activeSuggestions = suggestionsByTab[activeInsightsTab]
  const visibleExpandedSuggestionId =
    expandedSuggestionId &&
    activeSuggestions.some((suggestion) => suggestion.id === expandedSuggestionId)
      ? expandedSuggestionId
      : null
  const insightTabs = insightSectionOrder.map((section) => {
    const sectionSuggestions = suggestionsByTab[section]
    const Icon =
      section === 'notifications' ? BellRing : section === 'advice' ? Dumbbell : Activity

    return {
      Icon,
      count: sectionSuggestions.length,
      section,
      ...insightTabCopy[section],
    }
  })
  const visibleProgramRuns = programHistoryRuns.slice(0, 5)

  if (isBuilderOpen) {
    return (
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
                          onUpdateDraftExercise(section.id, exercise.id, 'duration', event.target.value)
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
    )
  }

  return (
    <section className="section-card insights-section-card">
      <div className="insights-tab-strip" role="tablist" aria-label="Insight categories">
        {insightTabs.map(({ Icon, count, kicker, section }) => (
          <button
            key={section}
            type="button"
            className={`insights-tab-card insights-tab-card--${section} ${
              activePanel === section ? 'is-active' : ''
            }`}
            role="tab"
            aria-selected={activePanel === section}
            aria-label={`${kicker}: ${count}`}
            onClick={() => onSetInsightsView(section)}
          >
            <span className="insights-tab-card__icon">
              <Icon size={17} />
            </span>
            <span className="insights-tab-card__copy">
              <span>{kicker}</span>
              <strong>{count}</strong>
            </span>
          </button>
        ))}

        <button
          type="button"
          className={`insights-tab-card insights-tab-card--programs ${
            activePanel === 'programs' ? 'is-active' : ''
          }`}
          role="tab"
          aria-selected={activePanel === 'programs'}
          aria-label={`Programs: ${programHistoryRuns.length}`}
          onClick={() => onSetInsightsView('programs')}
        >
          <span className="insights-tab-card__icon">
            <ClipboardList size={17} />
          </span>
          <span className="insights-tab-card__copy">
            <span>Programs</span>
            <strong>{programHistoryRuns.length}</strong>
          </span>
        </button>
      </div>

      <div className="insights-list-card">
        {activePanel === 'programs' ? (
          visibleProgramRuns.length ? (
            <div className="insights-compact-list program-history-compact-list">
              {visibleProgramRuns.map((programRun) => (
                <article key={programRun.id} className="insights-compact-row">
                  <span className="insights-compact-row__icon insights-compact-row__icon--programs">
                    <ClipboardList size={17} />
                  </span>
                  <span className="insights-compact-row__copy">
                    <strong>{programRun.programName}</strong>
                    <span>
                      {formatHistoryDate(programRun.completedAt)} / {programRun.completedDayCount}/
                      {programRun.totalDayCount} days
                    </span>
                  </span>
                  <span className="insights-compact-row__meta">{programRun.programSource}</span>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state compact-empty-state insights-empty-card">
              <h3>No completed programs yet</h3>
              <p>Full completed-program runs will appear after you finish every day in a plan.</p>
            </div>
          )
        ) : activeSuggestions.length ? (
          <div className="insight-list suggestions-board suggestions-board--compact">
            {activeSuggestions.map((suggestion) => {
              const isExpanded = visibleExpandedSuggestionId === suggestion.id

              return (
                <button
                  key={suggestion.id}
                  type="button"
                  className={`insight-card suggestion-card suggestion-card--compact suggestion-card--${suggestion.tone} ${
                    isExpanded ? 'is-expanded' : ''
                  }`}
                  onClick={() =>
                    setExpandedSuggestionId((current) =>
                      current === suggestion.id ? null : suggestion.id,
                    )
                  }
                >
                  <div className="suggestion-card__compact-head">
                    <div>
                      <p className="kicker">{formatSuggestionCategory(suggestion.category)}</p>
                      <h4>{suggestion.title}</h4>
                    </div>
                    <ChevronRight
                      size={18}
                      className={`suggestion-card__chevron ${isExpanded ? 'is-expanded' : ''}`}
                    />
                  </div>

                  <p className="suggestion-card__summary">{suggestion.summary}</p>

                  {isExpanded ? (
                    <div className="suggestion-card__expanded">
                      {suggestion.details.length ? (
                        <ul className="suggestion-card__details">
                          {suggestion.details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
                        </ul>
                      ) : null}
                      <div className="suggestion-card__next-step suggestion-card__next-step--compact">
                        <span>Next step</span>
                        <strong>{suggestion.action}</strong>
                      </div>
                    </div>
                  ) : null}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="empty-state compact-empty-state insights-empty-card">
            <h3>No {activeInsightsTab} right now</h3>
            <p>{insightTabCopy[activeInsightsTab].emptyDescription}</p>
          </div>
        )}
      </div>
    </section>
  )
}
