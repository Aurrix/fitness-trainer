import type { Exercise, Program } from './content'
import type {
  ActiveWorkout,
  WorkoutExerciseLogEntry,
  WorkoutLog,
  WorkoutSetLogEntry,
} from '../entities/workout'

export type {
  ActiveWorkout,
  WorkoutExerciseLogEntry,
  WorkoutLog,
  WorkoutSetLogEntry,
} from '../entities/workout'

export type EditableExercise = {
  id: string
  exerciseName: string
  sets: string
  reps: string
  duration: string
  rest: string
  notes: string
}

export type EditableSection = {
  dayIndex: number
  dayLabel: string
  id: string
  name: string
  notes: string
  exercises: EditableExercise[]
  weekIndex: number
  weekLabel: string
}

export type ProgramDraft = {
  editingId: string | null
  sourceProgramId: string | null
  name: string
  description: string
  goal: string
  level: string
  tags: string
  sections: EditableSection[]
}

export type CustomProgram = {
  id: string
  sourceProgramId: string | null
  name: string
  description: string
  goal: string
  level: string
  tags: string[]
  sections: EditableSection[]
  createdAt: string
  updatedAt: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toStringValue(value: unknown, fallback = '') {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return fallback
}

function toNullableStringValue(value: unknown) {
  const normalizedValue = toStringValue(value).trim()
  return normalizedValue || null
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => toStringValue(entry).trim())
    .filter(Boolean)
}

function toNumberValue(value: unknown, fallback = 0) {
  const parsedValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN

  return Number.isFinite(parsedValue) ? parsedValue : fallback
}

function toNullableNumberValue(value: unknown) {
  const parsedValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN

  return Number.isFinite(parsedValue) ? parsedValue : null
}

function toEffortScale(value: unknown): WorkoutLog['exertionScale'] {
  return value === 'rir' || value === 'effort' ? value : 'rpe'
}

function toProgramSource(value: unknown): WorkoutLog['programSource'] {
  return value === 'custom' ? 'custom' : 'library'
}

export function createWorkoutSetLogEntry(
  options?: Partial<WorkoutSetLogEntry>,
): WorkoutSetLogEntry {
  return {
    completedAt: null,
    duration: '',
    effort: '',
    loggedAt: null,
    reps: '',
    suboptimal: false,
    weightKg: '',
    ...options,
  }
}

export function ensureWorkoutSetLogs(
  setLogs: WorkoutSetLogEntry[] | undefined,
  targetSetCount: number,
) {
  const nextLength = Math.max(Math.max(0, targetSetCount), setLogs?.length ?? 0)

  return Array.from({ length: nextLength }, (_, index) => {
    return setLogs?.[index] ?? createWorkoutSetLogEntry()
  })
}

export function createWorkoutExerciseLogEntry(
  exerciseName: string,
  options?: Partial<WorkoutExerciseLogEntry>,
): WorkoutExerciseLogEntry {
  return {
    completed: false,
    completedAt: null,
    completedSets: '',
    distanceKm: '',
    duration: '',
    effort: '',
    exerciseId: null,
    exerciseName,
    firstLoggedAt: null,
    logId: createId('workout-entry'),
    lastLoggedAt: null,
    loadKg: '',
    muscleGroups: [],
    notes: '',
    plannedExerciseId: null,
    setLogs: [],
    skippedAt: null,
    skipped: false,
    targetSetCountOverride: null,
    type: 'planned',
    ...options,
  }
}

export function createPlannedWorkoutLogs(
  program: Program,
  sectionId: string,
  exerciseLookup: (reference: string | null | undefined) => Exercise | null,
) {
  const section = program.sections.find((entry) => entry.id === sectionId)

  if (!section) {
    return {}
  }

  return section.exercises.reduce<Record<string, WorkoutExerciseLogEntry>>((logs, exercise) => {
    const resolvedExercise =
      exerciseLookup(exercise.resolvedExerciseId) ??
      exerciseLookup(exercise.exerciseId) ??
      exerciseLookup(exercise.exerciseName)

    logs[exercise.id] = createWorkoutExerciseLogEntry(exercise.exerciseName, {
      exerciseId: resolvedExercise?.id ?? exercise.resolvedExerciseId ?? exercise.exerciseId,
      logId: exercise.id,
      muscleGroups: resolvedExercise?.muscleGroups ?? [],
      notes: '',
      plannedExerciseId: exercise.id,
      type: 'planned',
    })

    return logs
  }, {})
}

export function buildWorkoutExerciseOrder(
  requestedOrder: string[] | undefined,
  exerciseLogs: Record<string, WorkoutExerciseLogEntry>,
  extraEntries: WorkoutExerciseLogEntry[],
) {
  const availableIds = [
    ...Object.keys(exerciseLogs),
    ...extraEntries.map((entry) => entry.logId).filter(Boolean),
  ]
  const availableIdSet = new Set(availableIds)
  const nextOrder: string[] = []

  for (const entryId of requestedOrder ?? []) {
    if (!availableIdSet.has(entryId) || nextOrder.includes(entryId)) {
      continue
    }

    nextOrder.push(entryId)
  }

  for (const entryId of availableIds) {
    if (!nextOrder.includes(entryId)) {
      nextOrder.push(entryId)
    }
  }

  return nextOrder
}

export function createActiveWorkoutFromLog(
  workoutLog: WorkoutLog,
  options?: { updatedAt?: string },
): ActiveWorkout {
  const exerciseLogs = workoutLog.exerciseLogs.reduce<
    Record<string, WorkoutExerciseLogEntry>
  >((logs, entry) => {
    if (entry.type !== 'planned') {
      return logs
    }

    const exerciseId = entry.plannedExerciseId ?? entry.logId

    if (exerciseId) {
      logs[exerciseId] = entry
    }

    return logs
  }, {})
  const extraEntries = workoutLog.exerciseLogs.filter((entry) => entry.type !== 'planned')
  const exerciseOrder = workoutLog.exerciseLogs.flatMap((entry) => {
    const entryId = entry.type === 'planned' ? entry.plannedExerciseId ?? entry.logId : entry.logId
    return entryId ? [entryId] : []
  })

  return {
    completedExerciseIds: Object.entries(exerciseLogs)
      .filter(([, entry]) => entry.completed)
      .map(([exerciseId]) => exerciseId),
    exerciseLogs,
    exerciseOrder,
    exertionScale: workoutLog.exertionScale,
    extraEntries,
    notes: workoutLog.notes,
    programId: workoutLog.programId,
    programName: workoutLog.programName,
    programSource: workoutLog.programSource,
    sectionId: workoutLog.sectionId,
    sectionName: workoutLog.sectionName,
    sessionId: workoutLog.id,
    startedAt: workoutLog.startedAt,
    updatedAt: options?.updatedAt ?? workoutLog.completedAt,
  }
}

export function createExtraExerciseWorkoutLog(exercise: Exercise) {
  return createWorkoutExerciseLogEntry(exercise.name, {
    exerciseId: exercise.id,
    muscleGroups: exercise.muscleGroups,
    plannedExerciseId: null,
    type: 'extra-exercise',
  })
}

export function createCardioWorkoutLog() {
  return createWorkoutExerciseLogEntry('Cardio', {
    plannedExerciseId: null,
    type: 'cardio',
  })
}

export function normalizeWorkoutExerciseLogEntry(
  value: unknown,
  fallbackExerciseName = 'Exercise',
): WorkoutExerciseLogEntry {
  if (!isRecord(value)) {
    return createWorkoutExerciseLogEntry(fallbackExerciseName)
  }

  return createWorkoutExerciseLogEntry(
    toStringValue(value.exerciseName, fallbackExerciseName),
    {
      completed: value.completed === true,
      completedSets: toStringValue(value.completedSets),
      distanceKm: toStringValue(value.distanceKm),
      duration: toStringValue(value.duration),
      effort: toStringValue(value.effort),
      exerciseId: toNullableStringValue(value.exerciseId),
      logId: toStringValue(value.logId) || createId('workout-entry'),
      loadKg: toStringValue(value.loadKg),
      muscleGroups: toStringArray(value.muscleGroups),
      notes: toStringValue(value.notes),
      plannedExerciseId: toNullableStringValue(value.plannedExerciseId),
      setLogs: Array.isArray(value.setLogs)
        ? value.setLogs.map((entry) => {
            if (!isRecord(entry)) {
              return createWorkoutSetLogEntry()
            }

            return createWorkoutSetLogEntry({
              completedAt: toNullableStringValue(entry.completedAt),
              duration: toStringValue(entry.duration),
              effort: toStringValue(entry.effort),
              loggedAt: toNullableStringValue(entry.loggedAt),
              reps: toStringValue(entry.reps),
              suboptimal: entry.suboptimal === true,
              weightKg: toStringValue(entry.weightKg),
            })
          })
        : [],
      completedAt: toNullableStringValue(value.completedAt),
      firstLoggedAt: toNullableStringValue(value.firstLoggedAt),
      lastLoggedAt: toNullableStringValue(value.lastLoggedAt),
      skipped: value.skipped === true,
      skippedAt: toNullableStringValue(value.skippedAt),
      targetSetCountOverride: toNullableNumberValue(value.targetSetCountOverride),
      type:
        value.type === 'extra-exercise' || value.type === 'cardio'
          ? value.type
          : 'planned',
    },
  )
}

function normalizeEditableExercise(value: unknown): EditableExercise | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    id: toStringValue(value.id) || createId('exercise'),
    exerciseName: toStringValue(value.exerciseName),
    sets: toStringValue(value.sets),
    reps: toStringValue(value.reps),
    duration: toStringValue(value.duration),
    rest: toStringValue(value.rest),
    notes: toStringValue(value.notes),
  }
}

function normalizeEditableSection(value: unknown, fallbackIndex = 0): EditableSection | null {
  if (!isRecord(value)) {
    return null
  }

  const exercises = Array.isArray(value.exercises)
    ? value.exercises
        .map((exercise) => normalizeEditableExercise(exercise))
        .filter((exercise): exercise is EditableExercise => exercise !== null)
    : []

  return {
    dayIndex: Math.max(1, toNumberValue(value.dayIndex, fallbackIndex + 1)),
    dayLabel: toStringValue(value.dayLabel) || `Day ${fallbackIndex + 1}`,
    id: toStringValue(value.id) || createId('section'),
    name: toStringValue(value.name, 'Session'),
    notes: toStringValue(value.notes),
    exercises,
    weekIndex: Math.max(1, toNumberValue(value.weekIndex, 1)),
    weekLabel: toStringValue(value.weekLabel) || 'Week 1',
  }
}

export function normalizeCustomPrograms(value: unknown): CustomProgram[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => {
      if (!isRecord(entry)) {
        return null
      }

      const sections = Array.isArray(entry.sections)
        ? entry.sections
            .map((section, sectionIndex) => normalizeEditableSection(section, sectionIndex))
            .filter((section): section is EditableSection => section !== null)
        : []
      const createdAt = toStringValue(entry.createdAt) || new Date().toISOString()
      const updatedAt = toStringValue(entry.updatedAt) || createdAt

      return {
        id: toStringValue(entry.id) || createId('program'),
        sourceProgramId: toNullableStringValue(entry.sourceProgramId),
        name: toStringValue(entry.name, 'Custom Program'),
        description: toStringValue(entry.description),
        goal: toStringValue(entry.goal),
        level: toStringValue(entry.level),
        tags: toStringArray(entry.tags),
        sections,
        createdAt,
        updatedAt,
      }
    })
    .filter((program): program is CustomProgram => program !== null)
}

export function normalizeWorkoutLog(value: unknown): WorkoutLog | null {
  if (!isRecord(value)) {
    return null
  }

  const exerciseLogs = Array.isArray(value.exerciseLogs)
    ? value.exerciseLogs.map((entry) => normalizeWorkoutExerciseLogEntry(entry))
    : []
  const startedAt = toStringValue(value.startedAt) || new Date().toISOString()
  const completedAt = toStringValue(value.completedAt) || startedAt
  const sessionDate =
    toStringValue(value.sessionDate) ||
    (completedAt || startedAt).slice(0, 10)

  return {
    id: toStringValue(value.id) || createId('workout-log'),
    cardioEntryCount: toNumberValue(
      value.cardioEntryCount,
      exerciseLogs.filter((entry) => entry.type === 'cardio').length,
    ),
    exerciseLogs,
    exertionScale: toEffortScale(value.exertionScale ?? value.effortScale),
    programId: toStringValue(value.programId),
    programName: toStringValue(value.programName, 'Workout'),
    programSource: toProgramSource(value.programSource),
    sessionDate,
    sectionId: toStringValue(value.sectionId),
    sectionName: toStringValue(value.sectionName, 'Workout Day'),
    startedAt,
    completedAt,
    durationMinutes: toNumberValue(value.durationMinutes),
    completedExerciseCount: toNumberValue(
      value.completedExerciseCount,
      exerciseLogs.filter((entry) => entry.type === 'planned' && entry.completed).length,
    ),
    totalExerciseCount: toNumberValue(
      value.totalExerciseCount,
      exerciseLogs.filter((entry) => entry.type === 'planned').length,
    ),
    notes: toStringValue(value.notes),
  }
}

export function normalizeWorkoutLogs(value: unknown): WorkoutLog[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => normalizeWorkoutLog(entry))
    .filter((entry): entry is WorkoutLog => entry !== null)
}

export function normalizeActiveWorkout(value: unknown): ActiveWorkout | null {
  if (!isRecord(value)) {
    return null
  }

  const exerciseLogs = isRecord(value.exerciseLogs)
    ? Object.entries(value.exerciseLogs).reduce<Record<string, WorkoutExerciseLogEntry>>(
        (logs, [exerciseId, entry]) => {
          logs[exerciseId] = normalizeWorkoutExerciseLogEntry(entry)
          return logs
        },
        {},
      )
    : {}
  const completedExerciseIds = Array.isArray(value.completedExerciseIds)
    ? value.completedExerciseIds
        .map((entry) => toStringValue(entry).trim())
        .filter(Boolean)
    : Object.entries(exerciseLogs)
        .filter(([, entry]) => entry.completed)
        .map(([exerciseId]) => exerciseId)
  const extraEntries = Array.isArray(value.extraEntries)
    ? value.extraEntries.map((entry) => normalizeWorkoutExerciseLogEntry(entry))
    : []
  const exerciseOrder = buildWorkoutExerciseOrder(
    Array.isArray(value.exerciseOrder)
      ? value.exerciseOrder
          .map((entry) => toStringValue(entry).trim())
          .filter(Boolean)
      : undefined,
    exerciseLogs,
    extraEntries,
  )
  const programId = toStringValue(value.programId).trim()
  const sectionId = toStringValue(value.sectionId).trim()

  if (!programId || !sectionId) {
    return null
  }

  return {
    exerciseLogs,
    exerciseOrder,
    exertionScale: toEffortScale(value.exertionScale ?? value.effortScale),
    extraEntries,
    sessionId: toStringValue(value.sessionId) || createId('session'),
    programId,
    programName: toStringValue(value.programName, 'Workout'),
    programSource: toProgramSource(value.programSource),
    sectionId,
    sectionName: toStringValue(value.sectionName, 'Workout Day'),
    startedAt: toStringValue(value.startedAt) || new Date().toISOString(),
    updatedAt:
      toStringValue(value.updatedAt) ||
      toStringValue(value.startedAt) ||
      new Date().toISOString(),
    completedExerciseIds,
    notes: toStringValue(value.notes),
  }
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function createEmptyExercise(): EditableExercise {
  return {
    id: createId('exercise'),
    exerciseName: '',
    sets: '',
    reps: '',
    duration: '',
    rest: '',
    notes: '',
  }
}

export function createEmptySection(
  options: Partial<Pick<EditableSection, 'dayIndex' | 'dayLabel' | 'name' | 'weekIndex' | 'weekLabel'>> = {},
): EditableSection {
  const weekIndex = Math.max(1, options.weekIndex ?? 1)
  const dayIndex = Math.max(1, options.dayIndex ?? 1)

  return {
    dayIndex,
    dayLabel: options.dayLabel ?? `Day ${dayIndex}`,
    id: createId('section'),
    name: options.name ?? `Day ${dayIndex}`,
    notes: '',
    exercises: [createEmptyExercise()],
    weekIndex,
    weekLabel: options.weekLabel ?? `Week ${weekIndex}`,
  }
}

export function createEmptyDraft(): ProgramDraft {
  return {
    editingId: null,
    sourceProgramId: null,
    name: '',
    description: '',
    goal: '',
    level: '',
    tags: '',
    sections: [createEmptySection()],
  }
}

export function programToDraft(program: Program): ProgramDraft {
  return {
    editingId: null,
    sourceProgramId: program.id,
    name: `${program.name} Copy`,
    description: program.description,
    goal: program.goal,
    level: program.level,
    tags: program.tags.join(', '),
    sections: program.sections.map((section) => ({
      dayIndex: section.dayIndex,
      dayLabel: section.dayLabel,
      id: createId('section'),
      name: section.name,
      notes: section.notes,
      exercises: section.exercises.map((exercise) => ({
        id: createId('exercise'),
        exerciseName: exercise.exerciseName,
        sets: exercise.sets,
        reps: exercise.reps,
        duration: exercise.duration,
        rest: exercise.rest,
          notes: exercise.notes,
        })),
      weekIndex: section.weekIndex,
      weekLabel: section.weekLabel,
    })),
  }
}

export function customProgramToDraft(program: CustomProgram): ProgramDraft {
  return {
    editingId: program.id,
    sourceProgramId: program.sourceProgramId,
    name: program.name,
    description: program.description,
    goal: program.goal,
    level: program.level,
    tags: program.tags.join(', '),
    sections: program.sections.map((section) => ({
      dayIndex: section.dayIndex,
      dayLabel: section.dayLabel,
      id: createId('section'),
      name: section.name,
      notes: section.notes,
      exercises: section.exercises.map((exercise) => ({
        ...exercise,
        id: createId('exercise'),
      })),
      weekIndex: section.weekIndex,
      weekLabel: section.weekLabel,
    })),
  }
}

export function draftToCustomProgram(
  draft: ProgramDraft,
  currentPrograms: CustomProgram[],
): CustomProgram {
  const now = new Date().toISOString()
  const existingProgram = draft.editingId
    ? currentPrograms.find((program) => program.id === draft.editingId) ?? null
    : null

  return {
    id: existingProgram?.id ?? createId('program'),
    sourceProgramId: draft.sourceProgramId,
    name: draft.name.trim(),
    description: draft.description.trim(),
    goal: draft.goal.trim(),
    level: draft.level.trim(),
    tags: draft.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    sections: draft.sections.map((section) => ({
      dayIndex: section.dayIndex,
      dayLabel: section.dayLabel.trim() || `Day ${section.dayIndex || 1}`,
      id: section.id,
      name: section.name.trim() || 'Session',
      notes: section.notes.trim(),
      exercises: section.exercises
        .filter((exercise) => exercise.exerciseName.trim())
        .map((exercise) => ({
          ...exercise,
          exerciseName: exercise.exerciseName.trim(),
          sets: exercise.sets.trim(),
          reps: exercise.reps.trim(),
          duration: exercise.duration.trim(),
          rest: exercise.rest.trim(),
          notes: exercise.notes.trim(),
        })),
      weekIndex: section.weekIndex,
      weekLabel: section.weekLabel.trim() || `Week ${section.weekIndex || 1}`,
    })),
    createdAt: existingProgram?.createdAt ?? now,
    updatedAt: now,
  }
}

export function customProgramToProgram(program: CustomProgram): Program {
  return {
    id: program.id,
    name: program.name,
    description: program.description,
    descriptionHtml: '',
    goal: program.goal,
    level: program.level,
    duration: '',
    weekCount: 0,
    phaseNames: [],
    tags: program.tags,
    source: {
      id: `custom-${program.id}`,
      label: 'Custom Program',
      group: 'custom',
      relativePath: program.id,
      sourceFile: 'localStorage',
    },
    details: [
      {
        key: 'Created',
        value: new Date(program.createdAt).toLocaleDateString(),
      },
      {
        key: 'Updated',
        value: new Date(program.updatedAt).toLocaleDateString(),
      },
    ],
    sections: program.sections.map((section, index) => ({
      id: section.id,
      dayIndex: section.dayIndex || index + 1,
      dayLabel: section.dayLabel || `Day ${section.dayIndex || index + 1}`,
      name: section.name,
      notes: section.notes,
      shortName: section.name,
      exercises: section.exercises.map((exercise) => ({
        id: exercise.id,
        exerciseId: null,
        exerciseName: exercise.exerciseName,
        sets: exercise.sets,
        reps: exercise.reps,
        duration: exercise.duration,
        rest: exercise.rest,
        notes: exercise.notes,
        resolvedExerciseId: null,
      })),
      weekIndex: section.weekIndex || 1,
      weekLabel: section.weekLabel || `Week ${section.weekIndex || 1}`,
    })),
  }
}
