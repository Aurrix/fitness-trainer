export type ProgramProgressRecord = {
  lastCompletedSectionId: string | null
  lastStartedSectionId: string | null
  programId: string
  selectedSectionId: string | null
  updatedAt: string | null
}

export type ProgramProgressStore = {
  byProgramId: Record<string, ProgramProgressRecord>
}

type ProgramSectionProgressPayload = {
  at?: string
  programId: string
  sectionId: string | null
}

type ProgramSectionCompletionPayload = {
  at?: string
  completedSectionId: string
  nextSectionId?: string | null
  programId: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toNullableString(value: unknown) {
  if (typeof value === 'string') {
    const trimmedValue = value.trim()
    return trimmedValue || null
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return null
}

function createEmptyProgramProgressRecord(programId: string): ProgramProgressRecord {
  return {
    lastCompletedSectionId: null,
    lastStartedSectionId: null,
    programId,
    selectedSectionId: null,
    updatedAt: null,
  }
}

export function createEmptyProgramProgressStore(): ProgramProgressStore {
  return {
    byProgramId: {},
  }
}

export function normalizeProgramProgressStore(value: unknown): ProgramProgressStore {
  if (!isRecord(value) || !isRecord(value.byProgramId)) {
    return createEmptyProgramProgressStore()
  }

  return {
    byProgramId: Object.entries(value.byProgramId).reduce<
      Record<string, ProgramProgressRecord>
    >((records, [programId, rawRecord]) => {
      if (!isRecord(rawRecord)) {
        records[programId] = createEmptyProgramProgressRecord(programId)
        return records
      }

      records[programId] = {
        lastCompletedSectionId: toNullableString(rawRecord.lastCompletedSectionId),
        lastStartedSectionId: toNullableString(rawRecord.lastStartedSectionId),
        programId,
        selectedSectionId: toNullableString(rawRecord.selectedSectionId),
        updatedAt: toNullableString(rawRecord.updatedAt),
      }

      return records
    }, {}),
  }
}

function updateProgramProgressRecord(
  store: ProgramProgressStore,
  programId: string,
  updater: (record: ProgramProgressRecord) => ProgramProgressRecord,
) {
  const currentRecord =
    store.byProgramId[programId] ?? createEmptyProgramProgressRecord(programId)

  return {
    ...store,
    byProgramId: {
      ...store.byProgramId,
      [programId]: updater(currentRecord),
    },
  }
}

export function selectProgramSection(
  store: ProgramProgressStore,
  payload: ProgramSectionProgressPayload,
) {
  const updatedAt = payload.at ?? new Date().toISOString()

  return updateProgramProgressRecord(store, payload.programId, (record) => ({
    ...record,
    selectedSectionId: payload.sectionId,
    updatedAt,
  }))
}

export function markProgramSectionStarted(
  store: ProgramProgressStore,
  payload: ProgramSectionProgressPayload,
) {
  const updatedAt = payload.at ?? new Date().toISOString()

  return updateProgramProgressRecord(store, payload.programId, (record) => ({
    ...record,
    lastStartedSectionId: payload.sectionId,
    selectedSectionId: payload.sectionId,
    updatedAt,
  }))
}

export function markProgramSectionCompleted(
  store: ProgramProgressStore,
  payload: ProgramSectionCompletionPayload,
) {
  const updatedAt = payload.at ?? new Date().toISOString()

  return updateProgramProgressRecord(store, payload.programId, (record) => ({
    ...record,
    lastCompletedSectionId: payload.completedSectionId,
    selectedSectionId: payload.nextSectionId ?? payload.completedSectionId,
    updatedAt,
  }))
}
