import Dexie, { type Table } from 'dexie'

type AppStateRecord = {
  key: string
  updatedAt: string
  value: unknown
}

class FitnessTrainerDb extends Dexie {
  appState!: Table<AppStateRecord, string>

  constructor() {
    super('fitness-trainer-db')

    this.version(1).stores({
      appState: '&key, updatedAt',
    })
  }
}

const appDb = new FitnessTrainerDb()

export async function readPersistedState<T>(key: string) {
  const record = await appDb.appState.get(key)
  return record?.value as T | undefined
}

export async function writePersistedState<T>(key: string, value: T) {
  await appDb.appState.put({
    key,
    updatedAt: new Date().toISOString(),
    value,
  })
}

export async function deletePersistedState(key: string) {
  await appDb.appState.delete(key)
}

export async function readPersistedStateWithMigration<T>(key: string) {
  const persistedValue = await readPersistedState<T>(key)

  if (persistedValue !== undefined) {
    return persistedValue
  }

  if (typeof window === 'undefined') {
    return undefined
  }

  const legacyValue = window.localStorage.getItem(key)

  if (!legacyValue) {
    return undefined
  }

  try {
    const parsedValue = JSON.parse(legacyValue) as T
    await writePersistedState(key, parsedValue)
    return parsedValue
  } catch {
    return undefined
  }
}
