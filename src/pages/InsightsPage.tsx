import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useDrag, useDrop } from 'react-dnd'
import type { Slug } from '@mjcdev/react-body-highlighter'
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BellRing,
  CalendarDays,
  CalendarRange,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  GripVertical,
  Plus,
  Search,
  StarOff,
  Target,
  Trash2,
} from 'lucide-react'
import MuscleVisualizer from '../components/MuscleVisualizer'
import WorkoutExercisePickerSheet from '../components/WorkoutExercisePickerSheet'
import type { BodyStatEntry } from '../entities/body-stats'
import type { ExerciseStatsStore } from '../entities/exercise-stats'
import {
  formatExerciseMuscleGroup,
  mapBodySlugToExerciseMuscleGroups,
  normalizeExerciseMuscleGroup,
} from '../entities/exercise-muscles'
import type { ProgramCompletionLog } from '../entities/program-completion'
import type { ProgramDayLog } from '../entities/program-day-stats'
import type { WorkoutLog } from '../entities/workout'
import type { AppProgram, InsightsView } from '../lib/app-types'
import {
  fitnessExperienceOptions,
  fitnessGoalOptions,
  type FitnessProfile,
} from '../lib/fitness-profile'
import { buildSectionMuscleProfile } from '../lib/muscles'
import { buildProgramHistoryRuns, formatHistoryDate } from '../lib/program-history'
import { buildSuggestions, type SuggestionFinding } from '../lib/suggestions'
import type { EditableExercise, EditableSection, ProgramDraft } from '../lib/user-data'
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
  onAddExerciseToSection: (sectionId: string, exercise?: Exercise) => void
  onAddSectionToWeek: (weekIndex: number) => void
  onAddWeek: () => void
  onCloseBuilder: () => void
  onMoveDraftExercise: (
    sectionId: string,
    exerciseId: string,
    direction: 'down' | 'up',
  ) => void
  onReorderSection: (draggedSectionId: string, targetSectionId: string) => void
  onReorderWeek: (draggedWeekIndex: number, targetWeekIndex: number) => void
  onRemoveWeek: (weekIndex: number) => void
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

const programTagOptions = [
  { label: 'Hypertrophy', value: 'hypertrophy' },
  { label: 'Strength', value: 'strength' },
  { label: 'Endurance', value: 'endurance' },
  { label: 'Mobility', value: 'mobility' },
  { label: 'Home', value: 'home' },
  { label: 'Gym', value: 'gym' },
  { label: 'Dumbbells', value: 'dumbbells' },
  { label: 'Bodyweight', value: 'bodyweight' },
  { label: 'Short', value: 'short' },
] as const

function normalizeTextKey(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseDraftTags(tags: string) {
  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function toggleDraftTag(tags: string, tag: string) {
  const currentTags = parseDraftTags(tags)
  const normalizedTag = normalizeTextKey(tag)
  const hasTag = currentTags.some((entry) => normalizeTextKey(entry) === normalizedTag)
  const nextTags = hasTag
    ? currentTags.filter((entry) => normalizeTextKey(entry) !== normalizedTag)
    : [...currentTags, tag]

  return nextTags.join(', ')
}

function getExercisePrimaryGroups(exercise: Exercise) {
  const primaryGroups = exercise.primaryTargetMuscleGroups.flatMap((target) => {
    const muscleGroup = normalizeExerciseMuscleGroup(target.muscleGroup)
    return muscleGroup ? [muscleGroup] : []
  })

  if (primaryGroups.length) {
    return primaryGroups
  }

  return exercise.muscleGroups.flatMap((muscleGroup) => {
    const normalizedMuscleGroup = normalizeExerciseMuscleGroup(muscleGroup)
    return normalizedMuscleGroup ? [normalizedMuscleGroup] : []
  })
}

function getExerciseSecondaryGroups(exercise: Exercise) {
  return exercise.secondaryTargetMuscleGroups.flatMap((target) => {
    const muscleGroup = normalizeExerciseMuscleGroup(target.muscleGroup)
    return muscleGroup ? [muscleGroup] : []
  })
}

function hasMuscleGroupMatch(
  muscleGroups: string[],
  selectedMuscleGroups: ReadonlySet<string>,
) {
  return muscleGroups.some((muscleGroup) => selectedMuscleGroups.has(muscleGroup))
}

function findNextExerciseForMuscle(
  section: EditableSection,
  muscleSlug: Slug,
  contentExercises: Exercise[],
) {
  const matchingMuscleGroups = new Set(mapBodySlugToExerciseMuscleGroups(muscleSlug))
  const usedExerciseNames = new Set(
    section.exercises
      .map((exercise) => normalizeTextKey(exercise.exerciseName))
      .filter(Boolean),
  )
  const unusedExercises = contentExercises.filter(
    (exercise) => !usedExerciseNames.has(normalizeTextKey(exercise.name)),
  )
  const primaryMatches = unusedExercises.filter((exercise) =>
    hasMuscleGroupMatch(getExercisePrimaryGroups(exercise), matchingMuscleGroups),
  )
  const secondaryMatches = unusedExercises.filter((exercise) => {
    if (primaryMatches.some((primaryExercise) => primaryExercise.id === exercise.id)) {
      return false
    }

    return hasMuscleGroupMatch(getExerciseSecondaryGroups(exercise), matchingMuscleGroups)
  })
  const fallbackMatches = unusedExercises.filter((exercise) => {
    return (
      !primaryMatches.some((primaryExercise) => primaryExercise.id === exercise.id) &&
      !secondaryMatches.some((secondaryExercise) => secondaryExercise.id === exercise.id) &&
      hasMuscleGroupMatch(
        exercise.muscleGroups.flatMap((muscleGroup) => {
          const normalizedMuscleGroup = normalizeExerciseMuscleGroup(muscleGroup)
          return normalizedMuscleGroup ? [normalizedMuscleGroup] : []
        }),
        matchingMuscleGroups,
      )
    )
  })
  const sortByName = (left: Exercise, right: Exercise) => left.name.localeCompare(right.name)

  return [
    ...primaryMatches.sort(sortByName),
    ...secondaryMatches.sort(sortByName),
    ...fallbackMatches.sort(sortByName),
  ][0] ?? null
}

function buildDraftWeekGroups(sections: EditableSection[]) {
  const weekMap = new Map<
    number,
    {
      label: string
      sections: EditableSection[]
      weekIndex: number
    }
  >()

  for (const section of sections) {
    const weekIndex = section.weekIndex || 1
    const existingWeek = weekMap.get(weekIndex)

    if (existingWeek) {
      existingWeek.sections.push(section)
      continue
    }

    weekMap.set(weekIndex, {
      label: section.weekLabel || `Week ${weekIndex}`,
      sections: [section],
      weekIndex,
    })
  }

  return [...weekMap.values()]
    .map((week) => ({
      ...week,
      sections: [...week.sections].sort((left, right) => left.dayIndex - right.dayIndex),
    }))
    .sort((left, right) => left.weekIndex - right.weekIndex)
}

function buildEditableSectionProfile(section: EditableSection, contentExercises: Exercise[]) {
  return buildSectionMuscleProfile(
    {
      id: section.id,
      name: section.name,
      exercises: section.exercises
        .filter((exercise) => exercise.exerciseName.trim())
        .map((exercise) => ({
          duration: exercise.duration,
          exerciseName: exercise.exerciseName,
          reps: exercise.reps,
          sets: exercise.sets,
        })),
    },
    contentExercises,
  )
}

const PROGRAM_BUILDER_WEEK_DND_TYPE = 'PROGRAM_BUILDER_WEEK'
const PROGRAM_BUILDER_DAY_DND_TYPE = 'PROGRAM_BUILDER_DAY'
const PROGRAM_BUILDER_REMOVE_SWIPE_THRESHOLD = 64
const PROGRAM_BUILDER_REMOVE_SWIPE_MAX_OFFSET = 72

type ProgramBuilderDragHandleRef = (node: HTMLButtonElement | null) => void

type ProgramBuilderSwipeHandleHandlers = {
  onPointerCancel: () => void
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void
}

type ProgramBuilderWeekDragItem = {
  weekIndex: number
}

type ProgramBuilderDayDragItem = {
  sectionId: string
  weekIndex: number
}

type DraggableProgramBuilderWeekProps = {
  children: (
    dragHandleRef: ProgramBuilderDragHandleRef,
    isDragging: boolean,
    handleSwipeOffset: number,
    swipeHandleHandlers: ProgramBuilderSwipeHandleHandlers,
  ) => ReactNode
  canRemove: boolean
  onRemoveWeek: (weekIndex: number) => void
  onReorderWeek: (draggedWeekIndex: number, targetWeekIndex: number) => void
  weekIndex: number
}

function useProgramBuilderHandleSwipe({
  canRemove,
  onRemove,
}: {
  canRemove: boolean
  onRemove: () => void
}) {
  const handleSwipeStateRef = useRef<{
    pointerId: number
    startX: number
    startY: number
  } | null>(null)
  const [handleSwipeOffset, setHandleSwipeOffset] = useState(0)

  const resetHandleSwipe = useCallback(() => {
    handleSwipeStateRef.current = null
    setHandleSwipeOffset(0)
  }, [])

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!canRemove || (event.pointerType === 'mouse' && event.button !== 0)) {
        return
      }

      handleSwipeStateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
      }
      event.currentTarget.setPointerCapture?.(event.pointerId)
    },
    [canRemove],
  )

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const swipeState = handleSwipeStateRef.current

    if (!swipeState || swipeState.pointerId !== event.pointerId) {
      return
    }

    const deltaX = event.clientX - swipeState.startX
    const deltaY = Math.abs(event.clientY - swipeState.startY)

    if (deltaX <= 0 || deltaY > 34 || deltaY > Math.abs(deltaX)) {
      setHandleSwipeOffset(0)
      return
    }

    setHandleSwipeOffset(Math.min(PROGRAM_BUILDER_REMOVE_SWIPE_MAX_OFFSET, deltaX))
  }, [])

  const handlePointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const swipeState = handleSwipeStateRef.current

      if (!swipeState || swipeState.pointerId !== event.pointerId) {
        resetHandleSwipe()
        return
      }

      const deltaX = event.clientX - swipeState.startX
      const deltaY = Math.abs(event.clientY - swipeState.startY)
      const shouldRemove =
        canRemove && deltaX >= PROGRAM_BUILDER_REMOVE_SWIPE_THRESHOLD && deltaY <= 34

      if (shouldRemove) {
        event.preventDefault()
        event.stopPropagation()
        onRemove()
      }

      resetHandleSwipe()
    },
    [canRemove, onRemove, resetHandleSwipe],
  )

  return {
    handleSwipeHandlers: {
      onPointerCancel: resetHandleSwipe,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
    },
    handleSwipeOffset,
  }
}

function DraggableProgramBuilderWeek({
  children,
  canRemove,
  onRemoveWeek,
  onReorderWeek,
  weekIndex,
}: DraggableProgramBuilderWeekProps) {
  const removeWeek = useCallback(() => {
    onRemoveWeek(weekIndex)
  }, [onRemoveWeek, weekIndex])
  const { handleSwipeHandlers, handleSwipeOffset } = useProgramBuilderHandleSwipe({
    canRemove,
    onRemove: removeWeek,
  })
  const [{ isDragging }, drag] = useDrag(
    () => ({
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      item: {
        weekIndex,
      },
      type: PROGRAM_BUILDER_WEEK_DND_TYPE,
    }),
    [weekIndex],
  )
  const [{ canDrop, isOver }, drop] = useDrop<ProgramBuilderWeekDragItem, void, {
    canDrop: boolean
    isOver: boolean
  }>(
    () => ({
      accept: PROGRAM_BUILDER_WEEK_DND_TYPE,
      canDrop: (item) => item.weekIndex !== weekIndex,
      collect: (monitor) => ({
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver({ shallow: true }),
      }),
      drop: (item) => {
        if (item.weekIndex !== weekIndex) {
          onReorderWeek(item.weekIndex, weekIndex)
        }
      },
    }),
    [onReorderWeek, weekIndex],
  )
  const attachContainerRef = useCallback(
    (node: HTMLElement | null) => {
      drop(node)
    },
    [drop],
  )
  const attachHandleRef = useCallback(
    (node: HTMLButtonElement | null) => {
      drag(node)
    },
    [drag],
  )

  return (
    <section
      ref={attachContainerRef}
      className={[
        'program-builder-week',
        isDragging ? 'is-dragging' : '',
        canDrop && isOver ? 'is-drop-target' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children(attachHandleRef, isDragging, handleSwipeOffset, handleSwipeHandlers)}
    </section>
  )
}

type DraggableProgramBuilderDayProps = {
  children: (
    dragHandleRef: ProgramBuilderDragHandleRef,
    isDragging: boolean,
    handleSwipeOffset: number,
    swipeHandleHandlers: ProgramBuilderSwipeHandleHandlers,
  ) => ReactNode
  canRemove: boolean
  onRemoveSection: (sectionId: string) => void
  onReorderSection: (draggedSectionId: string, targetSectionId: string) => void
  section: EditableSection
}

function DraggableProgramBuilderDay({
  children,
  canRemove,
  onRemoveSection,
  onReorderSection,
  section,
}: DraggableProgramBuilderDayProps) {
  const removeSection = useCallback(() => {
    onRemoveSection(section.id)
  }, [onRemoveSection, section.id])
  const { handleSwipeHandlers, handleSwipeOffset } = useProgramBuilderHandleSwipe({
    canRemove,
    onRemove: removeSection,
  })
  const [{ isDragging }, drag] = useDrag(
    () => ({
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      item: {
        sectionId: section.id,
        weekIndex: section.weekIndex,
      },
      type: PROGRAM_BUILDER_DAY_DND_TYPE,
    }),
    [section.id, section.weekIndex],
  )
  const [{ canDrop, isOver }, drop] = useDrop<ProgramBuilderDayDragItem, void, {
    canDrop: boolean
    isOver: boolean
  }>(
    () => ({
      accept: PROGRAM_BUILDER_DAY_DND_TYPE,
      canDrop: (item) =>
        item.sectionId !== section.id && item.weekIndex === section.weekIndex,
      collect: (monitor) => ({
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver({ shallow: true }),
      }),
      drop: (item) => {
        if (item.sectionId !== section.id && item.weekIndex === section.weekIndex) {
          onReorderSection(item.sectionId, section.id)
        }
      },
    }),
    [onReorderSection, section.id, section.weekIndex],
  )
  const attachContainerRef = useCallback(
    (node: HTMLElement | null) => {
      drop(node)
    },
    [drop],
  )
  const attachHandleRef = useCallback(
    (node: HTMLButtonElement | null) => {
      drag(node)
    },
    [drag],
  )

  return (
    <article
      ref={attachContainerRef}
      className={[
        'program-builder-day',
        isDragging ? 'is-dragging' : '',
        canDrop && isOver ? 'is-drop-target' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children(attachHandleRef, isDragging, handleSwipeOffset, handleSwipeHandlers)}
    </article>
  )
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
  onAddSectionToWeek,
  onAddWeek,
  onCloseBuilder,
  onMoveDraftExercise,
  onReorderSection,
  onReorderWeek,
  onRemoveWeek,
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
  const [exercisePickerTarget, setExercisePickerTarget] = useState<{
    exerciseId: string | null
    sectionId: string
  } | null>(null)
  const [expandedWeekIndex, setExpandedWeekIndex] = useState<number | null | undefined>(
    undefined,
  )
  const [expandedSectionIdByWeek, setExpandedSectionIdByWeek] = useState<
    Record<number, string | null>
  >({})
  const programHistoryRuns = useMemo(() => {
    return buildProgramHistoryRuns(programs, programDayLogs, programCompletionLogs)
  }, [programCompletionLogs, programDayLogs, programs])
  const activeSuggestions = suggestionsByTab[activeInsightsTab]
  const draftTags = parseDraftTags(draft.tags)
  const draftWeeks = useMemo(() => buildDraftWeekGroups(draft.sections), [draft.sections])
  const firstDraftWeekIndex = draftWeeks[0]?.weekIndex ?? null
  const visibleExpandedWeekIndex =
    expandedWeekIndex === undefined
      ? firstDraftWeekIndex
      : draftWeeks.some((week) => week.weekIndex === expandedWeekIndex)
        ? expandedWeekIndex
        : null
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
  const handleAddWeek = () => {
    const nextWeekIndex =
      Math.max(0, ...draftWeeks.map((week) => week.weekIndex || 0)) + 1

    onAddWeek()
    setExpandedWeekIndex(nextWeekIndex)
  }

  if (isBuilderOpen) {
    return (
      <>
        <section className="section-card program-builder-overview">
          <div className="section-header program-builder-overview__header">
            <div>
              <p className="kicker">Builder</p>
              <h2>{draft.editingId ? 'Edit custom plan' : 'Create custom plan'}</h2>
            </div>
          </div>
          <div className="row-actions program-builder-overview__actions">
            <button type="button" className="ghost-button icon-button" onClick={onResetBuilder}>
              <StarOff size={16} />
              <span>Reset</span>
            </button>
            <button type="button" className="ghost-button icon-button" onClick={onCloseBuilder}>
              <Trash2 size={16} />
              <span>Close</span>
            </button>
          </div>

          <div className="form-grid program-builder-form">
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
              <select
                value={draft.goal}
                onChange={(event) => onUpdateDraftField('goal', event.target.value)}
              >
                <option value="">Select goal</option>
                {fitnessGoalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Level</span>
              <select
                value={draft.level}
                onChange={(event) => onUpdateDraftField('level', event.target.value)}
              >
                <option value="">Select level</option>
                {fitnessExperienceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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

          <div className="program-builder-tags">
            <span className="field-label">Tags</span>
            <div className="program-builder-tag-grid">
              {programTagOptions.map((option) => {
                const isActive = draftTags.some(
                  (tag) => normalizeTextKey(tag) === normalizeTextKey(option.value),
                )

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`chip-button ${isActive ? 'is-active' : ''}`}
                    onClick={() =>
                      onUpdateDraftField('tags', toggleDraftTag(draft.tags, option.value))
                    }
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <div className="program-builder-week-stack">
          {draftWeeks.map((week) => {
            const isWeekExpanded = week.weekIndex === visibleExpandedWeekIndex
            const expandedSectionId = expandedSectionIdByWeek[week.weekIndex]
            const visibleExpandedSectionId =
              expandedSectionId === null
                ? null
                : week.sections.some((section) => section.id === expandedSectionId)
                  ? expandedSectionId
                  : week.sections[0]?.id ?? null

            return (
              <DraggableProgramBuilderWeek
                canRemove={draftWeeks.length > 1}
                key={week.weekIndex}
                onRemoveWeek={onRemoveWeek}
                onReorderWeek={onReorderWeek}
                weekIndex={week.weekIndex}
              >
                {(
                  weekDragHandleRef,
                  isWeekDragging,
                  weekHandleSwipeOffset,
                  weekSwipeHandleHandlers,
                ) => (
                  <>
                    <div className="section-header program-builder-week__header">
                      <div className="program-builder-drag-title">
                        <button
                          ref={weekDragHandleRef}
                          type="button"
                          className={`chip-button icon-button program-builder-drag-handle ${
                            isWeekDragging ? 'is-active' : ''
                          } ${weekHandleSwipeOffset ? 'is-remove-swiping' : ''}`}
                          style={
                            {
                              '--program-builder-handle-swipe': `${weekHandleSwipeOffset}px`,
                            } as CSSProperties
                          }
                          title={
                            draftWeeks.length > 1
                              ? 'Drag week; swipe right to remove'
                              : 'Drag week'
                          }
                          aria-label={
                            draftWeeks.length > 1
                              ? `Drag ${week.label}. Swipe right to remove.`
                              : `Drag ${week.label}`
                          }
                          onPointerCancel={weekSwipeHandleHandlers.onPointerCancel}
                          onPointerDown={weekSwipeHandleHandlers.onPointerDown}
                          onPointerMove={weekSwipeHandleHandlers.onPointerMove}
                          onPointerUp={weekSwipeHandleHandlers.onPointerUp}
                        >
                          {weekHandleSwipeOffset ? <Trash2 size={15} /> : <GripVertical size={15} />}
                        </button>
                        <button
                          type="button"
                          className="program-builder-accordion-button"
                          onClick={() =>
                            setExpandedWeekIndex((currentWeekIndex) =>
                              currentWeekIndex === week.weekIndex ? null : week.weekIndex,
                            )
                          }
                          aria-expanded={isWeekExpanded}
                        >
                          <span className="program-builder-accordion-copy">
                            <strong>{week.label}</strong>
                          </span>
                          <ChevronRight
                            size={17}
                            className={`program-builder-accordion-chevron ${
                              isWeekExpanded ? 'is-expanded' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {isWeekExpanded ? (
                      <>
                        <div className="program-builder-day-stack">
                          {week.sections.map((section) => {
                            const isDayExpanded = section.id === visibleExpandedSectionId

                            return (
                              <DraggableProgramBuilderDay
                                canRemove={draft.sections.length > 1}
                                key={section.id}
                                onRemoveSection={onRemoveSection}
                                onReorderSection={onReorderSection}
                                section={section}
                              >
                                {(
                                  dayDragHandleRef,
                                  isDayDragging,
                                  dayHandleSwipeOffset,
                                  daySwipeHandleHandlers,
                                ) => (
                                  <>
                                    <div className="section-header program-builder-day__header">
                                      <div className="program-builder-drag-title">
                                        <button
                                          ref={dayDragHandleRef}
                                          type="button"
                                          className={`chip-button icon-button program-builder-drag-handle ${
                                            isDayDragging ? 'is-active' : ''
                                          } ${dayHandleSwipeOffset ? 'is-remove-swiping' : ''}`}
                                          style={
                                            {
                                              '--program-builder-handle-swipe': `${dayHandleSwipeOffset}px`,
                                            } as CSSProperties
                                          }
                                          title={
                                            draft.sections.length > 1
                                              ? 'Drag day; swipe right to remove'
                                              : 'Drag day'
                                          }
                                          aria-label={
                                            draft.sections.length > 1
                                              ? `Drag ${section.dayLabel}. Swipe right to remove.`
                                              : `Drag ${section.dayLabel}`
                                          }
                                          onPointerCancel={daySwipeHandleHandlers.onPointerCancel}
                                          onPointerDown={daySwipeHandleHandlers.onPointerDown}
                                          onPointerMove={daySwipeHandleHandlers.onPointerMove}
                                          onPointerUp={daySwipeHandleHandlers.onPointerUp}
                                        >
                                          {dayHandleSwipeOffset ? (
                                            <Trash2 size={15} />
                                          ) : (
                                            <GripVertical size={15} />
                                          )}
                                        </button>
                                        <button
                                          type="button"
                                          className="program-builder-accordion-button program-builder-accordion-button--day"
                                          onClick={() =>
                                            setExpandedSectionIdByWeek((currentSections) => ({
                                              ...currentSections,
                                              [week.weekIndex]: isDayExpanded ? null : section.id,
                                            }))
                                          }
                                          aria-expanded={isDayExpanded}
                                        >
                                          <span className="program-builder-accordion-copy">
                                            <strong>{section.dayLabel}</strong>
                                          </span>
                                          <ChevronRight
                                            size={17}
                                            className={`program-builder-accordion-chevron ${
                                              isDayExpanded ? 'is-expanded' : ''
                                            }`}
                                          />
                                        </button>
                                      </div>
                                    </div>

                                    {isDayExpanded ? (
                                      <>
                                        <div className="form-grid program-builder-day__fields">
                                          <label className="field field--full">
                                            <span className="field-label">Coach notes</span>
                                            <textarea
                                              rows={2}
                                              value={section.notes}
                                              onChange={(event) =>
                                                onUpdateSectionField(
                                                  section.id,
                                                  'notes',
                                                  event.target.value,
                                                )
                                              }
                                              placeholder="Tempo, warm-up notes, pacing guidance..."
                                            ></textarea>
                                          </label>
                                        </div>

                                        <MuscleVisualizer
                                          compact
                                          className="program-builder-day__visualizer"
                                          detailSheetDescription="Matching exercise targets for this training day."
                                          detailsMode="sheet"
                                          gender={fitnessProfile.gender}
                                          onSelectMuscle={(slug) => {
                                            const nextExercise = findNextExerciseForMuscle(
                                              section,
                                              slug,
                                              contentExercises,
                                            )

                                            if (nextExercise) {
                                              onAddExerciseToSection(section.id, nextExercise)
                                            }
                                          }}
                                          profile={buildEditableSectionProfile(
                                            section,
                                            contentExercises,
                                          )}
                                          showSheetPreview={false}
                                          title={`${section.dayLabel} muscles`}
                                        />

                                        <div className="program-builder-exercise-table">
                                          <div className="program-builder-exercise-table__head">
                                            <span>Exercise</span>
                                            <span>Sets</span>
                                            <span>Reps</span>
                                            <span>Duration</span>
                                            <span>Rest</span>
                                            <span>Notes</span>
                                            <span aria-hidden="true" />
                                          </div>

                                          {section.exercises.map((exercise, exerciseIndex) => {
                                            const selectedLibraryExercise = contentExercises.find(
                                              (libraryExercise) =>
                                                normalizeTextKey(libraryExercise.name) ===
                                                normalizeTextKey(exercise.exerciseName),
                                            )
                                            const muscleSummary = selectedLibraryExercise
                                              ? getExercisePrimaryGroups(selectedLibraryExercise)
                                                  .slice(0, 2)
                                                  .map((muscleGroup) =>
                                                    formatExerciseMuscleGroup(muscleGroup),
                                                  )
                                                  .join(' / ')
                                              : ''

                                            return (
                                              <div
                                                key={exercise.id}
                                                className="program-builder-exercise-row"
                                              >
                                                <div className="program-builder-exercise-row__exercise">
                                                  <button
                                                    type="button"
                                                    className={`program-builder-exercise-select-button ${
                                                      exercise.exerciseName ? '' : 'is-empty'
                                                    }`}
                                                    onClick={() =>
                                                      setExercisePickerTarget({
                                                        exerciseId: exercise.id,
                                                        sectionId: section.id,
                                                      })
                                                    }
                                                  >
                                                    <span className="program-builder-exercise-select-button__copy">
                                                      <strong>
                                                        {exercise.exerciseName ||
                                                          `Exercise ${exerciseIndex + 1}`}
                                                      </strong>
                                                      {muscleSummary ? (
                                                        <span>{muscleSummary}</span>
                                                      ) : null}
                                                    </span>
                                                    <Search size={14} />
                                                  </button>
                                                </div>

                                                <label className="field">
                                                  <span className="field-label">Sets</span>
                                                  <input
                                                    type="text"
                                                    value={exercise.sets}
                                                    onChange={(event) =>
                                                      onUpdateDraftExercise(
                                                        section.id,
                                                        exercise.id,
                                                        'sets',
                                                        event.target.value,
                                                      )
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
                                                      onUpdateDraftExercise(
                                                        section.id,
                                                        exercise.id,
                                                        'reps',
                                                        event.target.value,
                                                      )
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
                                                      onUpdateDraftExercise(
                                                        section.id,
                                                        exercise.id,
                                                        'rest',
                                                        event.target.value,
                                                      )
                                                    }
                                                    placeholder="60 sec"
                                                  />
                                                </label>

                                                <label className="field program-builder-exercise-row__notes">
                                                  <span className="field-label">Notes</span>
                                                  <input
                                                    type="text"
                                                    value={exercise.notes}
                                                    onChange={(event) =>
                                                      onUpdateDraftExercise(
                                                        section.id,
                                                        exercise.id,
                                                        'notes',
                                                        event.target.value,
                                                      )
                                                    }
                                                    placeholder="Technique cues"
                                                  />
                                                </label>

                                                <div className="program-builder-exercise-row__actions">
                                                  <button
                                                    type="button"
                                                    className="chip-button icon-button"
                                                    onClick={() =>
                                                      onMoveDraftExercise(
                                                        section.id,
                                                        exercise.id,
                                                        'up',
                                                      )
                                                    }
                                                    disabled={exerciseIndex === 0}
                                                    title="Move exercise up"
                                                    aria-label={`Move exercise ${
                                                      exerciseIndex + 1
                                                    } up`}
                                                  >
                                                    <ArrowUp size={14} />
                                                  </button>
                                                  <button
                                                    type="button"
                                                    className="chip-button icon-button"
                                                    onClick={() =>
                                                      onMoveDraftExercise(
                                                        section.id,
                                                        exercise.id,
                                                        'down',
                                                      )
                                                    }
                                                    disabled={
                                                      exerciseIndex ===
                                                      section.exercises.length - 1
                                                    }
                                                    title="Move exercise down"
                                                    aria-label={`Move exercise ${
                                                      exerciseIndex + 1
                                                    } down`}
                                                  >
                                                    <ArrowDown size={14} />
                                                  </button>
                                                  <button
                                                    type="button"
                                                    className="chip-button icon-button program-builder-exercise-row__remove"
                                                    onClick={() =>
                                                      onRemoveExerciseFromSection(
                                                        section.id,
                                                        exercise.id,
                                                      )
                                                    }
                                                    disabled={section.exercises.length === 1}
                                                    title="Remove exercise"
                                                    aria-label={`Remove exercise ${
                                                      exerciseIndex + 1
                                                    }`}
                                                  >
                                                    <Trash2 size={14} />
                                                  </button>
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>

                                        <div className="row-actions program-builder-day__footer-actions">
                                          <button
                                            type="button"
                                            className="secondary-button icon-button"
                                            onClick={() =>
                                              setExercisePickerTarget({
                                                exerciseId: null,
                                                sectionId: section.id,
                                              })
                                            }
                                          >
                                            <Plus size={16} />
                                            <span>Add exercise</span>
                                          </button>
                                        </div>
                                      </>
                                    ) : null}
                                  </>
                                )}
                              </DraggableProgramBuilderDay>
                            )
                          })}
                        </div>

                        <div className="row-actions program-builder-week__footer-actions">
                          <button
                            type="button"
                            className="secondary-button icon-button"
                            onClick={() => {
                              onAddSectionToWeek(week.weekIndex)
                              setExpandedWeekIndex(week.weekIndex)
                            }}
                          >
                            <CalendarDays size={16} />
                            <span>Add day</span>
                          </button>
                        </div>
                      </>
                    ) : null}
                  </>
                )}
              </DraggableProgramBuilderWeek>
            )
          })}
        </div>

        <section className="program-builder-end-actions">
          <button type="button" className="secondary-button icon-button" onClick={handleAddWeek}>
            <CalendarRange size={16} />
            <span>Add week</span>
          </button>
          <button type="button" className="primary-button icon-button" onClick={onSaveDraft}>
            <Target size={16} />
            <span>Save Program</span>
          </button>
        </section>

        {exercisePickerTarget ? (
          <WorkoutExercisePickerSheet
            actionLabel="Select"
            description="Choose an exercise for this custom program day."
            exercises={contentExercises}
            onClose={() => setExercisePickerTarget(null)}
            onSelectExercise={(exercise) => {
              if (exercisePickerTarget.exerciseId) {
                onUpdateDraftExercise(
                  exercisePickerTarget.sectionId,
                  exercisePickerTarget.exerciseId,
                  'exerciseName',
                  exercise.name,
                )
              } else {
                onAddExerciseToSection(exercisePickerTarget.sectionId, exercise)
              }

              setExercisePickerTarget(null)
            }}
            title="Choose exercise"
          />
        ) : null}
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
