export type ProgramSource = 'library' | 'custom'

export type ProgramStatEventKind =
  | 'selected'
  | 'started'
  | 'completed'
  | 'discarded'

export type ProgramStatEvent = {
  kind: ProgramStatEventKind
  at: string
  sessionId: string | null
  sectionId: string | null
  meta: Record<string, string | number | boolean | null>
}

export type ProgramStatsRecord = {
  programId: string
  programSource: ProgramSource | null
  lastSelectedAt: string | null
  lastStartedAt: string | null
  lastCompletedAt: string | null
  lastEventAt: string | null
  activeSessionId: string | null
  totalSelections: number
  totalStarts: number
  totalCompletions: number
  totalMinutes: number
  totalCompletedExercises: number
  meta: Record<string, string | number | boolean | null>
  recentEvents: ProgramStatEvent[]
}

export type ProgramStatsStore = {
  byProgramId: Record<string, ProgramStatsRecord>
}

export type ProgramStatsPayload = {
  programId: string
  programSource: ProgramSource
  at?: string
  sessionId?: string | null
  sectionId?: string | null
  meta?: Record<string, string | number | boolean | null>
}

export type ProgramCompletionPayload = ProgramStatsPayload & {
  durationMinutes: number
  completedExercises: number
}

const STORAGE_KEY = 'fitness-trainer.program-stats'
const MAX_RECENT_EVENTS = 12

function createEmptyProgramStatsRecord(programId: string): ProgramStatsRecord {
  return {
    programId,
    programSource: null,
    lastSelectedAt: null,
    lastStartedAt: null,
    lastCompletedAt: null,
    lastEventAt: null,
    activeSessionId: null,
    totalSelections: 0,
    totalStarts: 0,
    totalCompletions: 0,
    totalMinutes: 0,
    totalCompletedExercises: 0,
    meta: {},
    recentEvents: [],
  }
}

export function createEmptyProgramStatsStore(): ProgramStatsStore {
  return {
    byProgramId: {},
  }
}

export function loadProgramStatsStore(): ProgramStatsStore {
  if (typeof window === 'undefined') {
    return createEmptyProgramStatsStore()
  }

  try {
    const rawStore = window.localStorage.getItem(STORAGE_KEY)
    return rawStore
      ? (JSON.parse(rawStore) as ProgramStatsStore)
      : createEmptyProgramStatsStore()
  } catch {
    return createEmptyProgramStatsStore()
  }
}

export function persistProgramStatsStore(store: ProgramStatsStore) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Ignore quota/privacy mode failures and keep the in-memory state usable.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toStringValue(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return ''
}

function toNumberValue(value: unknown) {
  const parsedValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN

  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function normalizeMeta(value: unknown): Record<string, string | number | boolean | null> {
  if (!isRecord(value)) {
    return {}
  }

  return Object.entries(value).reduce<Record<string, string | number | boolean | null>>(
    (meta, [key, entry]) => {
      if (
        typeof entry === 'string' ||
        typeof entry === 'number' ||
        typeof entry === 'boolean' ||
        entry === null
      ) {
        meta[key] = entry
      }

      return meta
    },
    {},
  )
}

function normalizeRecentEvent(value: unknown): ProgramStatEvent | null {
  if (!isRecord(value)) {
    return null
  }

  const kind =
    value.kind === 'selected' ||
    value.kind === 'started' ||
    value.kind === 'completed' ||
    value.kind === 'discarded'
      ? value.kind
      : null

  if (!kind) {
    return null
  }

  return {
    kind,
    at: toStringValue(value.at) || new Date().toISOString(),
    sessionId: toStringValue(value.sessionId) || null,
    sectionId: toStringValue(value.sectionId) || null,
    meta: normalizeMeta(value.meta),
  }
}

function normalizeProgramStatsRecord(
  programId: string,
  value: unknown,
): ProgramStatsRecord {
  if (!isRecord(value)) {
    return createEmptyProgramStatsRecord(programId)
  }

  const recentEvents = Array.isArray(value.recentEvents)
    ? value.recentEvents
        .map((entry) => normalizeRecentEvent(entry))
        .filter((entry): entry is ProgramStatEvent => entry !== null)
        .slice(0, MAX_RECENT_EVENTS)
    : []

  return {
    programId,
    programSource:
      value.programSource === 'library' || value.programSource === 'custom'
        ? value.programSource
        : null,
    lastSelectedAt: toStringValue(value.lastSelectedAt) || null,
    lastStartedAt: toStringValue(value.lastStartedAt) || null,
    lastCompletedAt: toStringValue(value.lastCompletedAt) || null,
    lastEventAt: toStringValue(value.lastEventAt) || null,
    activeSessionId: toStringValue(value.activeSessionId) || null,
    totalSelections: toNumberValue(value.totalSelections),
    totalStarts: toNumberValue(value.totalStarts),
    totalCompletions: toNumberValue(value.totalCompletions),
    totalMinutes: toNumberValue(value.totalMinutes),
    totalCompletedExercises: toNumberValue(value.totalCompletedExercises),
    meta: normalizeMeta(value.meta),
    recentEvents,
  }
}

export function normalizeProgramStatsStore(value: unknown): ProgramStatsStore {
  if (!isRecord(value) || !isRecord(value.byProgramId)) {
    return createEmptyProgramStatsStore()
  }

  return {
    byProgramId: Object.entries(value.byProgramId).reduce<Record<string, ProgramStatsRecord>>(
      (records, [programId, record]) => {
        records[programId] = normalizeProgramStatsRecord(programId, record)
        return records
      },
      {},
    ),
  }
}

function appendRecentEvent(
  recentEvents: ProgramStatEvent[],
  nextEvent: ProgramStatEvent,
) {
  return [nextEvent, ...recentEvents].slice(0, MAX_RECENT_EVENTS)
}

function updateProgramRecord(
  store: ProgramStatsStore,
  payload: ProgramStatsPayload,
  updater: (record: ProgramStatsRecord) => ProgramStatsRecord,
) {
  const currentRecord =
    store.byProgramId[payload.programId] ??
    createEmptyProgramStatsRecord(payload.programId)

  return {
    ...store,
    byProgramId: {
      ...store.byProgramId,
      [payload.programId]: updater(currentRecord),
    },
  }
}

function createEvent(
  payload: ProgramStatsPayload,
  kind: ProgramStatEventKind,
): ProgramStatEvent {
  return {
    kind,
    at: payload.at ?? new Date().toISOString(),
    sessionId: payload.sessionId ?? null,
    sectionId: payload.sectionId ?? null,
    meta: payload.meta ?? {},
  }
}

export function getProgramStatsRecord(
  store: ProgramStatsStore,
  programId: string | null,
) {
  if (!programId) {
    return null
  }

  return store.byProgramId[programId] ?? createEmptyProgramStatsRecord(programId)
}

export function markProgramSelected(
  store: ProgramStatsStore,
  payload: ProgramStatsPayload,
) {
  const event = createEvent(payload, 'selected')

  return updateProgramRecord(store, payload, (record) => ({
    ...record,
    programSource: payload.programSource,
    lastSelectedAt: event.at,
    lastEventAt: event.at,
    totalSelections: record.totalSelections + 1,
    meta: {
      ...record.meta,
      ...event.meta,
    },
    recentEvents: appendRecentEvent(record.recentEvents, event),
  }))
}

export function markProgramStarted(
  store: ProgramStatsStore,
  payload: ProgramStatsPayload,
) {
  const event = createEvent(payload, 'started')

  return updateProgramRecord(store, payload, (record) => ({
    ...record,
    programSource: payload.programSource,
    lastStartedAt: event.at,
    lastEventAt: event.at,
    activeSessionId: payload.sessionId ?? null,
    totalStarts: record.totalStarts + 1,
    meta: {
      ...record.meta,
      ...event.meta,
    },
    recentEvents: appendRecentEvent(record.recentEvents, event),
  }))
}

export function markProgramCompleted(
  store: ProgramStatsStore,
  payload: ProgramCompletionPayload,
) {
  const event = createEvent(payload, 'completed')

  return updateProgramRecord(store, payload, (record) => ({
    ...record,
    programSource: payload.programSource,
    lastCompletedAt: event.at,
    lastEventAt: event.at,
    activeSessionId: null,
    totalCompletions: record.totalCompletions + 1,
    totalMinutes: record.totalMinutes + payload.durationMinutes,
    totalCompletedExercises:
      record.totalCompletedExercises + payload.completedExercises,
    meta: {
      ...record.meta,
      ...event.meta,
      lastDurationMinutes: payload.durationMinutes,
      lastCompletedExercises: payload.completedExercises,
    },
    recentEvents: appendRecentEvent(record.recentEvents, event),
  }))
}

export function markProgramDiscarded(
  store: ProgramStatsStore,
  payload: ProgramStatsPayload,
) {
  const event = createEvent(payload, 'discarded')

  return updateProgramRecord(store, payload, (record) => ({
    ...record,
    programSource: payload.programSource,
    lastEventAt: event.at,
    activeSessionId:
      record.activeSessionId === (payload.sessionId ?? null)
        ? null
        : record.activeSessionId,
    meta: {
      ...record.meta,
      ...event.meta,
    },
    recentEvents: appendRecentEvent(record.recentEvents, event),
  }))
}
