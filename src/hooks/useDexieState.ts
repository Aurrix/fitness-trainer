import { useEffect, useRef, useState } from 'react'
import {
  readPersistedStateWithMigration,
  writePersistedState,
} from '../services/app-db'

type UseDexieStateOptions<T> = {
  hydrate?: (value: unknown) => T
}

export function useDexieState<T>(
  key: string,
  createInitialState: () => T,
  options?: UseDexieStateOptions<T>,
) {
  const [state, setState] = useState<T>(() => createInitialState())
  const [isReady, setIsReady] = useState(false)
  const hydrateRef = useRef(options?.hydrate)

  useEffect(() => {
    hydrateRef.current = options?.hydrate
  }, [options?.hydrate])

  useEffect(() => {
    let isCancelled = false

    async function loadState() {
      try {
        const storedValue = await readPersistedStateWithMigration<unknown>(key)

        if (isCancelled) {
          return
        }

        if (storedValue !== undefined) {
          setState(
            hydrateRef.current
              ? hydrateRef.current(storedValue)
              : (storedValue as T),
          )
        }
      } finally {
        if (!isCancelled) {
          setIsReady(true)
        }
      }
    }

    void loadState()

    return () => {
      isCancelled = true
    }
  }, [key])

  useEffect(() => {
    if (!isReady) {
      return
    }

    void (async () => {
      try {
        await writePersistedState(key, state)
      } catch {
        // Keep the in-memory state usable when IndexedDB writes are blocked.
      }
    })()
  }, [isReady, key, state])

  return [state, setState, isReady] as const
}
