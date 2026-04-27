import { create } from 'zustand'
import {
  normalizeBodyCompositionEntries,
  type BodyCompositionEntry,
} from '../entities/body-composition'
import {
  createEmptyExerciseStatsStore,
  normalizeExerciseStatsStore,
  type ExerciseStatsStore,
} from '../entities/exercise-stats'
import {
  createEmptyProgramProgressStore,
  normalizeProgramProgressStore,
  type ProgramProgressStore,
} from '../entities/program-progression'
import {
  normalizeProgramDayLogs,
  type ProgramDayLog,
} from '../entities/program-day-stats'
import { createDefaultStatsPreferences, normalizeStatsPreferences, type StatsPreferences } from '../entities/stats-preferences'
import { LOCAL_STORAGE_KEYS } from '../lib/app-storage'
import {
  createDefaultFitnessProfile,
  normalizeFitnessProfile,
  type FitnessProfile,
} from '../lib/fitness-profile'
import {
  normalizeActiveWorkout,
  normalizeCustomPrograms,
  normalizeWorkoutLogs,
  type ActiveWorkout,
  type CustomProgram,
  type WorkoutLog,
} from '../lib/user-data'
import {
  createEmptyProgramStatsStore,
  normalizeProgramStatsStore,
  type ProgramStatsStore,
} from '../services/program-stats'
import {
  readPersistedStateWithMigration,
  writePersistedState,
} from '../services/app-db'

type StateUpdater<T> = T | ((current: T) => T)

type AppStoreState = {
  activeWorkout: ActiveWorkout | null
  bodyCompositionEntries: BodyCompositionEntry[]
  customPrograms: CustomProgram[]
  exerciseStatsStore: ExerciseStatsStore
  fitnessProfile: FitnessProfile
  hydrate: () => Promise<void>
  isHydrated: boolean
  isHydrating: boolean
  mainProgramId: string | null
  programProgressStore: ProgramProgressStore
  programDayLogs: ProgramDayLog[]
  programStatsStore: ProgramStatsStore
  resetPersistedState: () => Promise<void>
  resetProgressionState: () => Promise<void>
  savedProgramIds: string[]
  setStatsPreferences: (updater: StateUpdater<StatsPreferences>) => void
  setActiveWorkout: (updater: StateUpdater<ActiveWorkout | null>) => void
  setBodyCompositionEntries: (updater: StateUpdater<BodyCompositionEntry[]>) => void
  setCustomPrograms: (updater: StateUpdater<CustomProgram[]>) => void
  setExerciseStatsStore: (updater: StateUpdater<ExerciseStatsStore>) => void
  setFitnessProfile: (updater: StateUpdater<FitnessProfile>) => void
  setMainProgramId: (value: string | null) => void
  setProgramProgressStore: (updater: StateUpdater<ProgramProgressStore>) => void
  setProgramDayLogs: (updater: StateUpdater<ProgramDayLog[]>) => void
  setProgramStatsStore: (updater: StateUpdater<ProgramStatsStore>) => void
  setSavedProgramIds: (updater: StateUpdater<string[]>) => void
  setWorkoutLogs: (updater: StateUpdater<WorkoutLog[]>) => void
  statsPreferences: StatsPreferences
  workoutLogs: WorkoutLog[]
}

function resolveUpdater<T>(current: T, updater: StateUpdater<T>) {
  return typeof updater === 'function'
    ? (updater as (current: T) => T)(current)
    : updater
}

function normalizeMainProgramId(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null
}

function normalizeSavedProgramIds(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return [
    ...new Set(
      value.filter((entry): entry is string => {
        return typeof entry === 'string' && entry.trim().length > 0
      }),
    ),
  ]
}

async function persistState<T>(key: string, value: T) {
  try {
    await writePersistedState(key, value)
  } catch {
    // Keep the in-memory store usable when IndexedDB writes are blocked.
  }
}

async function safeRead(key: string) {
  try {
    return await readPersistedStateWithMigration<unknown>(key)
  } catch {
    return undefined
  }
}

async function persistMany(entries: Array<[string, unknown]>) {
  await Promise.allSettled(entries.map(([key, value]) => persistState(key, value)))
}

const defaultFitnessProfile = createDefaultFitnessProfile()
const defaultExerciseStatsStore = createEmptyExerciseStatsStore()
const defaultProgramProgressStore = createEmptyProgramProgressStore()
const defaultProgramStatsStore = createEmptyProgramStatsStore()
const defaultStatsPreferences = createDefaultStatsPreferences()

export const useAppStore = create<AppStoreState>((set, get) => ({
  activeWorkout: null,
  bodyCompositionEntries: [],
  customPrograms: [],
  exerciseStatsStore: defaultExerciseStatsStore,
  fitnessProfile: defaultFitnessProfile,
  async hydrate() {
    if (get().isHydrated || get().isHydrating) {
      return
    }

    set({
      isHydrating: true,
    })

    const [
      storedCustomPrograms,
      storedBodyCompositionEntries,
      storedFitnessProfile,
      storedWorkoutLogs,
      storedActiveWorkout,
      storedExerciseStats,
      storedMainProgramId,
      storedProgramProgress,
      storedProgramDayLogs,
      storedSavedProgramIds,
      storedStatsPreferences,
      storedProgramStats,
    ] = await Promise.all([
      safeRead(LOCAL_STORAGE_KEYS.customPrograms),
      safeRead(LOCAL_STORAGE_KEYS.bodyCompositionEntries),
      safeRead(LOCAL_STORAGE_KEYS.fitnessProfile),
      safeRead(LOCAL_STORAGE_KEYS.workoutLogs),
      safeRead(LOCAL_STORAGE_KEYS.activeWorkout),
      safeRead(LOCAL_STORAGE_KEYS.exerciseStats),
      safeRead(LOCAL_STORAGE_KEYS.mainProgramId),
      safeRead(LOCAL_STORAGE_KEYS.programProgress),
      safeRead(LOCAL_STORAGE_KEYS.programDayLogs),
      safeRead(LOCAL_STORAGE_KEYS.savedProgramIds),
      safeRead(LOCAL_STORAGE_KEYS.statsPreferences),
      safeRead(LOCAL_STORAGE_KEYS.programStats),
    ])

    set({
      activeWorkout: normalizeActiveWorkout(storedActiveWorkout),
      bodyCompositionEntries: normalizeBodyCompositionEntries(storedBodyCompositionEntries),
      customPrograms: normalizeCustomPrograms(storedCustomPrograms),
      exerciseStatsStore: normalizeExerciseStatsStore(storedExerciseStats),
      fitnessProfile: normalizeFitnessProfile(storedFitnessProfile),
      isHydrated: true,
      isHydrating: false,
      mainProgramId: normalizeMainProgramId(storedMainProgramId),
      programProgressStore: normalizeProgramProgressStore(storedProgramProgress),
      programDayLogs: normalizeProgramDayLogs(storedProgramDayLogs),
      programStatsStore: normalizeProgramStatsStore(storedProgramStats),
      savedProgramIds: normalizeSavedProgramIds(storedSavedProgramIds),
      statsPreferences: normalizeStatsPreferences(storedStatsPreferences),
      workoutLogs: normalizeWorkoutLogs(storedWorkoutLogs),
    })
  },
  isHydrated: false,
  isHydrating: false,
  mainProgramId: null,
  programProgressStore: defaultProgramProgressStore,
  programDayLogs: [],
  programStatsStore: defaultProgramStatsStore,
  statsPreferences: defaultStatsPreferences,
  async resetPersistedState() {
    const nextFitnessProfile = createDefaultFitnessProfile()
    const nextExerciseStatsStore = createEmptyExerciseStatsStore()
    const nextProgramProgressStore = createEmptyProgramProgressStore()
    const nextProgramStatsStore = createEmptyProgramStatsStore()
    const nextStatsPreferences = createDefaultStatsPreferences()

    set({
      activeWorkout: null,
      bodyCompositionEntries: [],
      customPrograms: [],
      exerciseStatsStore: nextExerciseStatsStore,
      fitnessProfile: nextFitnessProfile,
      mainProgramId: null,
      programProgressStore: nextProgramProgressStore,
      programDayLogs: [],
      programStatsStore: nextProgramStatsStore,
      savedProgramIds: [],
      statsPreferences: nextStatsPreferences,
      workoutLogs: [],
    })

    await persistMany([
      [LOCAL_STORAGE_KEYS.activeWorkout, null],
      [LOCAL_STORAGE_KEYS.bodyCompositionEntries, []],
      [LOCAL_STORAGE_KEYS.customPrograms, []],
      [LOCAL_STORAGE_KEYS.exerciseStats, nextExerciseStatsStore],
      [LOCAL_STORAGE_KEYS.fitnessProfile, nextFitnessProfile],
      [LOCAL_STORAGE_KEYS.mainProgramId, null],
      [LOCAL_STORAGE_KEYS.programProgress, nextProgramProgressStore],
      [LOCAL_STORAGE_KEYS.programDayLogs, []],
      [LOCAL_STORAGE_KEYS.programStats, nextProgramStatsStore],
      [LOCAL_STORAGE_KEYS.savedProgramIds, []],
      [LOCAL_STORAGE_KEYS.statsPreferences, nextStatsPreferences],
      [LOCAL_STORAGE_KEYS.workoutLogs, []],
    ])
  },
  async resetProgressionState() {
    const nextExerciseStatsStore = createEmptyExerciseStatsStore()
    const nextProgramProgressStore = createEmptyProgramProgressStore()
    const nextProgramStatsStore = createEmptyProgramStatsStore()

    set({
      activeWorkout: null,
      bodyCompositionEntries: [],
      exerciseStatsStore: nextExerciseStatsStore,
      programProgressStore: nextProgramProgressStore,
      programDayLogs: [],
      programStatsStore: nextProgramStatsStore,
      workoutLogs: [],
    })

    await persistMany([
      [LOCAL_STORAGE_KEYS.activeWorkout, null],
      [LOCAL_STORAGE_KEYS.bodyCompositionEntries, []],
      [LOCAL_STORAGE_KEYS.exerciseStats, nextExerciseStatsStore],
      [LOCAL_STORAGE_KEYS.programProgress, nextProgramProgressStore],
      [LOCAL_STORAGE_KEYS.programDayLogs, []],
      [LOCAL_STORAGE_KEYS.programStats, nextProgramStatsStore],
      [LOCAL_STORAGE_KEYS.workoutLogs, []],
    ])
  },
  savedProgramIds: [],
  setActiveWorkout(updater) {
    set((state) => {
      const nextValue = resolveUpdater(state.activeWorkout, updater)
      void persistState(LOCAL_STORAGE_KEYS.activeWorkout, nextValue)
      return {
        activeWorkout: nextValue,
      }
    })
  },
  setBodyCompositionEntries(updater) {
    set((state) => {
      const nextValue = resolveUpdater(state.bodyCompositionEntries, updater)
      void persistState(LOCAL_STORAGE_KEYS.bodyCompositionEntries, nextValue)
      return {
        bodyCompositionEntries: nextValue,
      }
    })
  },
  setCustomPrograms(updater) {
    set((state) => {
      const nextValue = resolveUpdater(state.customPrograms, updater)
      void persistState(LOCAL_STORAGE_KEYS.customPrograms, nextValue)
      return {
        customPrograms: nextValue,
      }
    })
  },
  setExerciseStatsStore(updater) {
    set((state) => {
      const nextValue = resolveUpdater(state.exerciseStatsStore, updater)
      void persistState(LOCAL_STORAGE_KEYS.exerciseStats, nextValue)
      return {
        exerciseStatsStore: nextValue,
      }
    })
  },
  setFitnessProfile(updater) {
    set((state) => {
      const nextValue = resolveUpdater(state.fitnessProfile, updater)
      void persistState(LOCAL_STORAGE_KEYS.fitnessProfile, nextValue)
      return {
        fitnessProfile: nextValue,
      }
    })
  },
  setMainProgramId(value) {
    set({
      mainProgramId: value,
    })
    void persistState(LOCAL_STORAGE_KEYS.mainProgramId, value)
  },
  setProgramProgressStore(updater) {
    set((state) => {
      const nextValue = normalizeProgramProgressStore(
        resolveUpdater(state.programProgressStore, updater),
      )
      void persistState(LOCAL_STORAGE_KEYS.programProgress, nextValue)
      return {
        programProgressStore: nextValue,
      }
    })
  },
  setProgramDayLogs(updater) {
    set((state) => {
      const nextValue = resolveUpdater(state.programDayLogs, updater)
      void persistState(LOCAL_STORAGE_KEYS.programDayLogs, nextValue)
      return {
        programDayLogs: nextValue,
      }
    })
  },
  setProgramStatsStore(updater) {
    set((state) => {
      const nextValue = resolveUpdater(state.programStatsStore, updater)
      void persistState(LOCAL_STORAGE_KEYS.programStats, nextValue)
      return {
        programStatsStore: nextValue,
      }
    })
  },
  setSavedProgramIds(updater) {
    set((state) => {
      const nextValue = normalizeSavedProgramIds(resolveUpdater(state.savedProgramIds, updater))
      void persistState(LOCAL_STORAGE_KEYS.savedProgramIds, nextValue)
      return {
        savedProgramIds: nextValue,
      }
    })
  },
  setStatsPreferences(updater) {
    set((state) => {
      const nextValue = normalizeStatsPreferences(resolveUpdater(state.statsPreferences, updater))
      void persistState(LOCAL_STORAGE_KEYS.statsPreferences, nextValue)
      return {
        statsPreferences: nextValue,
      }
    })
  },
  setWorkoutLogs(updater) {
    set((state) => {
      const nextValue = resolveUpdater(state.workoutLogs, updater)
      void persistState(LOCAL_STORAGE_KEYS.workoutLogs, nextValue)
      return {
        workoutLogs: nextValue,
      }
    })
  },
  workoutLogs: [],
}))
