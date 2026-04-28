import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowLeft,
  BellRing,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  Clock3,
  Dumbbell,
  Plus,
  Sparkles,
  StarOff,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import type { BodyStatEntry } from '../entities/body-stats'
import type { ExerciseStatsStore } from '../entities/exercise-stats'
import type { ProgramCompletionLog } from '../entities/program-completion'
import type { ProgramDayLog } from '../entities/program-day-stats'
import type { WorkoutLog } from '../entities/workout'
import type { AppProgram, InsightsView } from '../lib/app-types'
import type { FitnessProfile } from '../lib/fitness-profile'
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

const insightSectionOrder: InsightsSection[] = ['notifications', 'advice', 'analysis']

const insightTabCopy: Record<
  InsightsSection,
  {
    description: string
    emptyDescription: string
    kicker: string
    title: string
  }
> = {
  advice: {
    description:
      'Actionable coaching prompts that point to your next best training or recovery move.',
    emptyDescription:
      'Keep logging workouts and body snapshots to unlock more day-to-day coaching advice.',
    kicker: 'Advice',
    title: 'Recommended next steps',
  },
  analysis: {
    description:
      'Deeper reads on progression, body trends, and longer-term patterns in your recent data.',
    emptyDescription:
      'Log a bit more training history to unlock analysis on performance and body-composition trends.',
    kicker: 'Analysis',
    title: 'What the data is showing',
  },
  notifications: {
    description:
      'Important reminders, setup gaps, and high-attention findings that should not be missed.',
    emptyDescription:
      'No active reminders right now. This tab will surface urgent findings and setup nudges when needed.',
    kicker: 'Notifications',
    title: 'Reminders and alerts',
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

function formatSuggestionTone(tone: SuggestionFinding['tone']) {
  return tone[0].toUpperCase() + tone.slice(1)
}

function formatSuggestionCount(count: number, label: string) {
  return `${count} ${label}${count === 1 ? '' : 's'}`
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

function buildAnalysisCategorySummary(findings: SuggestionFinding[]) {
  const counts = new Map<SuggestionFinding['category'], number>()

  for (const finding of findings) {
    counts.set(finding.category, (counts.get(finding.category) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([category, count]) => ({
      count,
      label: formatSuggestionCategory(category),
    }))
}

function formatHistoryDate(value: string) {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value.slice(0, 10)
  }

  return parsedDate.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDurationMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function formatHistoryNumber(value: number | null, suffix = '') {
  if (value === null) {
    return null
  }

  const formattedValue = Number.isInteger(value) ? String(value) : value.toFixed(1)
  return suffix ? `${formattedValue} ${suffix}` : formattedValue
}

function formatProgramSet(
  set: ProgramCompletionLog['dayLogs'][number]['exerciseEntries'][number]['sets'][number],
) {
  const parts = [
    formatHistoryNumber(set.durationMinutes, 'min'),
    formatHistoryNumber(set.weightKg, 'kg'),
    formatHistoryNumber(set.reps, 'reps'),
    set.difficulty || null,
  ].filter(Boolean)

  return parts.length ? parts.join(' / ') : '-'
}

function describeProgramExerciseState(
  exercise: ProgramCompletionLog['dayLogs'][number]['exerciseEntries'][number],
) {
  if (exercise.skipped) {
    return 'Skipped'
  }

  if (exercise.performedSetCount > 0) {
    return `${exercise.performedSetCount} set${exercise.performedSetCount === 1 ? '' : 's'}`
  }

  if (exercise.completed) {
    return 'Done'
  }

  return 'No sets'
}

function createProgramCompletionFromDayLogs(
  program: AppProgram,
  dayLogs: ProgramDayLog[],
  completedAt: string,
): ProgramCompletionLog {
  const startedAt = dayLogs.reduce((earliestStartedAt, dayLog) => {
    return dayLog.startedAt.localeCompare(earliestStartedAt) < 0
      ? dayLog.startedAt
      : earliestStartedAt
  }, dayLogs[0]?.startedAt ?? completedAt)

  return {
    completedAt,
    completedDayCount: dayLogs.length,
    completedExerciseCount: dayLogs.reduce(
      (total, dayLog) => total + dayLog.completedExerciseCount,
      0,
    ),
    dayLogs,
    durationMinutes: dayLogs.reduce((total, dayLog) => total + dayLog.durationMinutes, 0),
    exerciseEntryCount: dayLogs.reduce(
      (total, dayLog) => total + dayLog.exerciseEntries.length,
      0,
    ),
    id: `derived-program-completion-${program.id}-${completedAt}`,
    programId: program.id,
    programName: program.name,
    programSource: program.programSource,
    sessionDate: completedAt.slice(0, 10),
    startedAt,
    totalDayCount: program.sections.length,
    totalExerciseCount: dayLogs.reduce((total, dayLog) => total + dayLog.totalExerciseCount, 0),
  }
}

function deriveProgramCompletionsFromDayLogs(
  programs: AppProgram[],
  programDayLogs: ProgramDayLog[],
) {
  return programs.flatMap((program) => {
    const sectionIds = program.sections.map((section) => section.id)
    const sectionIdSet = new Set(sectionIds)

    if (!sectionIds.length) {
      return []
    }

    const completions: ProgramCompletionLog[] = []
    const currentRunBySectionId: Record<string, ProgramDayLog> = {}
    const sortedDayLogs = programDayLogs
      .filter((dayLog) => dayLog.programId === program.id && sectionIdSet.has(dayLog.sectionId))
      .sort((left, right) => left.completedAt.localeCompare(right.completedAt))

    for (const dayLog of sortedDayLogs) {
      currentRunBySectionId[dayLog.sectionId] = dayLog

      if (sectionIds.some((sectionId) => !currentRunBySectionId[sectionId])) {
        continue
      }

      const dayLogs = sectionIds.map((sectionId) => currentRunBySectionId[sectionId])
      completions.push(createProgramCompletionFromDayLogs(program, dayLogs, dayLog.completedAt))

      for (const sectionId of sectionIds) {
        delete currentRunBySectionId[sectionId]
      }
    }

    return completions
  })
}

function buildProgramHistoryRuns(
  programs: AppProgram[],
  programDayLogs: ProgramDayLog[],
  programCompletionLogs: ProgramCompletionLog[],
) {
  const completionKeys = new Set(
    programCompletionLogs.map((entry) => `${entry.programId}:${entry.completedAt}`),
  )
  const derivedCompletions = deriveProgramCompletionsFromDayLogs(programs, programDayLogs)
    .filter((entry) => !completionKeys.has(`${entry.programId}:${entry.completedAt}`))

  return [...programCompletionLogs, ...derivedCompletions].sort((left, right) =>
    right.completedAt.localeCompare(left.completedAt),
  )
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
  const activeInsightsTab =
    insightsView === 'home' || insightsView === 'programs' ? defaultInsightsTab : insightsView
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
  const activeTabCopy = insightTabCopy[activeInsightsTab]
  const attentionCount = suggestions.filter((entry) => entry.tone === 'attention').length
  const positiveCount = suggestions.filter((entry) => entry.tone === 'positive').length
  const neutralCount = suggestions.filter((entry) => entry.tone === 'neutral').length
  const analysisCategorySummary = useMemo(() => {
    return buildAnalysisCategorySummary(suggestionsByTab.analysis)
  }, [suggestionsByTab.analysis])
  const spotlightSuggestion = activeSuggestions[0] ?? suggestions[0] ?? null
  const compactSuggestions = spotlightSuggestion
    ? activeSuggestions.filter((suggestion) => suggestion.id !== spotlightSuggestion.id)
    : activeSuggestions
  const activeInsightsHighlights = useMemo(() => {
    if (activeInsightsTab === 'notifications') {
      return [
        {
          label: 'Attention',
          value: formatSuggestionCount(attentionCount, 'alert'),
        },
        {
          label: 'Cleared',
          value: formatSuggestionCount(
            Math.max(suggestions.length - attentionCount, 0),
            'other item',
          ),
        },
      ]
    }

    if (activeInsightsTab === 'analysis') {
      return analysisCategorySummary.slice(0, 2).map((entry) => ({
        label: entry.label,
        value: formatSuggestionCount(entry.count, 'signal'),
      }))
    }

    return [
      {
        label: 'Positive',
        value: formatSuggestionCount(positiveCount, 'win'),
      },
      {
        label: 'Steady',
        value: formatSuggestionCount(neutralCount, 'steady item'),
      },
    ]
  }, [activeInsightsTab, analysisCategorySummary, attentionCount, neutralCount, positiveCount, suggestions.length])

  const insightRows = insightSectionOrder.map((section) => {
    const sectionSuggestions = suggestionsByTab[section]
    const topSuggestion = sectionSuggestions[0] ?? null
    const Icon =
      section === 'notifications' ? BellRing : section === 'advice' ? Dumbbell : Activity

    return {
      Icon,
      count: sectionSuggestions.length,
      section,
      topSuggestion,
      ...insightTabCopy[section],
    }
  })
  const latestProgramHistoryRun = programHistoryRuns[0] ?? null

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
      <div className="insights-hero">
        <div className="insights-hero__copy">
          <p className="kicker">Insights</p>
          <h2>What matters most today</h2>
          <p className="muted">
            Faster readouts from your training data, with just enough detail when you want it.
          </p>
        </div>
        <div className="insights-hero__stats">
          <article className="insights-stat-card insights-stat-card--warm">
            <BellRing size={16} />
            <strong>{attentionCount}</strong>
            <span>Need attention</span>
          </article>
          <article className="insights-stat-card insights-stat-card--calm">
            <Sparkles size={16} />
            <strong>{positiveCount}</strong>
            <span>Going well</span>
          </article>
          <article className="insights-stat-card insights-stat-card--cool">
            <TrendingUp size={16} />
            <strong>{suggestions.length}</strong>
            <span>Total signals</span>
          </article>
        </div>
      </div>

      {insightsView === 'home' ? (
        <>
          {suggestions[0] ? (
            <button
              type="button"
              className={`insights-top-signal insights-top-signal--${suggestions[0].tone}`}
              onClick={() => onSetInsightsView(classifySuggestion(suggestions[0]))}
            >
              <span className="insights-top-signal__label">Top signal</span>
              <strong>{suggestions[0].title}</strong>
              <span>{suggestions[0].summary}</span>
              <ChevronRight size={18} />
            </button>
          ) : null}

          <div className="insights-entry-list" aria-label="Insight sections">
            <button
              type="button"
              className="insights-entry-row insights-entry-row--programs"
              onClick={() => onSetInsightsView('programs')}
            >
              <span className="insights-entry-row__icon">
                <ClipboardList size={20} />
              </span>
              <span className="insights-entry-row__content">
                <span className="insights-entry-row__eyebrow">Programs</span>
                <strong>Completed programs</strong>
                <span>
                  {latestProgramHistoryRun
                    ? `${latestProgramHistoryRun.programName} finished ${formatHistoryDate(
                        latestProgramHistoryRun.completedAt,
                      )}`
                    : 'Finished full programs will appear here with their day and set logs.'}
                </span>
              </span>
              <span className="insights-entry-row__count">{programHistoryRuns.length}</span>
              <ChevronRight size={18} className="insights-entry-row__chevron" />
            </button>
            {insightRows.map(({ Icon, count, emptyDescription, kicker, section, title, topSuggestion }) => (
              <button
                key={section}
                type="button"
                className={`insights-entry-row insights-entry-row--${section}`}
                onClick={() => onSetInsightsView(section)}
              >
                <span className="insights-entry-row__icon">
                  <Icon size={20} />
                </span>
                <span className="insights-entry-row__content">
                  <span className="insights-entry-row__eyebrow">{kicker}</span>
                  <strong>{title}</strong>
                  <span>{topSuggestion?.summary ?? emptyDescription}</span>
                </span>
                <span className="insights-entry-row__count">{count}</span>
                <ChevronRight size={18} className="insights-entry-row__chevron" />
              </button>
            ))}
          </div>
        </>
      ) : insightsView === 'programs' ? (
        <>
          <div className="insights-subpage-nav">
            <button
              type="button"
              className="ghost-button icon-button"
              onClick={() => onSetInsightsView('home')}
            >
              <ArrowLeft size={16} />
              <span>Overview</span>
            </button>
            <div className="insights-jump-row" aria-label="Switch insight section">
              <button
                type="button"
                className="is-active"
                onClick={() => onSetInsightsView('programs')}
              >
                Programs
              </button>
              {insightSectionOrder.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => onSetInsightsView(section)}
                >
                  {insightTabCopy[section].kicker}
                </button>
              ))}
            </div>
          </div>

          <div className="insights-panel-header">
            <div>
              <p className="kicker">Programs</p>
              <h3>Completed programs</h3>
              <p className="muted insights-panel-header__summary">
                Full program runs with the completed days, exercises, weights, reps, and effort.
              </p>
            </div>
            <div className="insights-highlight-row">
              <span className="pill pill--subtle">{programHistoryRuns.length} runs</span>
              {latestProgramHistoryRun ? (
                <>
                  <div className="insights-highlight-pill">
                    <span>Latest</span>
                    <strong>{latestProgramHistoryRun.programName}</strong>
                  </div>
                  <div className="insights-highlight-pill">
                    <span>Finished</span>
                    <strong>{formatHistoryDate(latestProgramHistoryRun.completedAt)}</strong>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {programHistoryRuns.length ? (
            <div className="program-history-board">
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
                      <details
                        key={dayLog.id}
                        className="program-history-day"
                        open={dayIndex === 0}
                      >
                        <summary>
                          <span>
                            <strong>{dayLog.sectionName}</strong>
                            <span>
                              {dayLog.completedExerciseCount}/{dayLog.totalExerciseCount}{' '}
                              exercises
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
        </>
      ) : (
        <>
          <div className="insights-subpage-nav">
            <button
              type="button"
              className="ghost-button icon-button"
              onClick={() => onSetInsightsView('home')}
            >
              <ArrowLeft size={16} />
              <span>Overview</span>
            </button>
            <div className="insights-jump-row" aria-label="Switch insight section">
              <button
                type="button"
                onClick={() => onSetInsightsView('programs')}
              >
                Programs
              </button>
              {insightSectionOrder.map((section) => (
                <button
                  key={section}
                  type="button"
                  className={activeInsightsTab === section ? 'is-active' : ''}
                  onClick={() => onSetInsightsView(section)}
                >
                  {insightTabCopy[section].kicker}
                </button>
              ))}
            </div>
          </div>

          <div className="insights-panel-header">
            <div>
              <p className="kicker">{activeTabCopy.kicker}</p>
              <h3>{activeTabCopy.title}</h3>
              <p className="muted insights-panel-header__summary">{activeTabCopy.description}</p>
            </div>
            <div className="insights-highlight-row">
              <span className="pill pill--subtle">{activeSuggestions.length} items</span>
              {activeInsightsHighlights.map((entry) => (
                <div key={entry.label} className="insights-highlight-pill">
                  <span>{entry.label}</span>
                  <strong>{entry.value}</strong>
                </div>
              ))}
            </div>
          </div>

          {activeSuggestions.length ? (
            <>
              {spotlightSuggestion ? (
                <article
                  className={`insight-card suggestion-card suggestion-card--spotlight suggestion-card--${spotlightSuggestion.tone}`}
                >
                  <div className="suggestion-card__header">
                    <div>
                      <p className="kicker">{formatSuggestionCategory(spotlightSuggestion.category)}</p>
                      <h4>{spotlightSuggestion.title}</h4>
                    </div>
                    <span className="pill pill--subtle suggestion-card__tone">
                      {formatSuggestionTone(spotlightSuggestion.tone)}
                    </span>
                  </div>

                  <p className="suggestion-card__summary suggestion-card__summary--spotlight">
                    {spotlightSuggestion.summary}
                  </p>

                  <div className="suggestion-card__next-step">
                    <span>Do this next</span>
                    <strong>{spotlightSuggestion.action}</strong>
                  </div>

                  {spotlightSuggestion.details.length ? (
                    <div className="suggestion-card__chips">
                      {spotlightSuggestion.details.map((detail) => (
                        <span key={detail} className="suggestion-chip">
                          {detail}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              ) : null}

              {compactSuggestions.length ? (
                <div className="insight-list suggestions-board suggestions-board--compact">
                  {compactSuggestions.map((suggestion) => {
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

                        <div className="suggestion-card__footer-row">
                          <span className="pill pill--subtle suggestion-card__tone">
                            {formatSuggestionTone(suggestion.tone)}
                          </span>
                          <span className="suggestion-card__tap-hint">
                            {isExpanded ? 'Hide detail' : 'Tap for detail'}
                          </span>
                        </div>

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
              ) : null}
            </>
          ) : (
            <div className="empty-state compact-empty-state">
              <h3>No {activeInsightsTab} right now</h3>
              <p>{activeTabCopy.emptyDescription}</p>
            </div>
          )}
        </>
      )}
    </section>
  )
}
