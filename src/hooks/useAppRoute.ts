import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import {
  DEFAULT_ROUTE,
  getRouteByPath,
  getRoutePath,
  normalizeRoutePath,
  type AppRouteId,
} from '../routes'

type NavigateOptions = {
  replace?: boolean
}

function getCurrentRoutePath() {
  if (typeof window === 'undefined') {
    return DEFAULT_ROUTE.path
  }

  return normalizeRoutePath(window.location.hash.slice(1) || window.location.pathname)
}

function updateHashPath(path: string, replace = false) {
  if (typeof window === 'undefined') {
    return
  }

  const normalizedPath = normalizeRoutePath(path)
  const nextHash = `#${normalizedPath}`

  if (window.location.hash === nextHash) {
    return
  }

  if (replace) {
    const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`
    window.history.replaceState(null, '', nextUrl)
    window.dispatchEvent(new Event('hashchange'))
    return
  }

  window.location.hash = normalizedPath
}

function subscribeToRouteChanges(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const handleChange = () => onStoreChange()

  window.addEventListener('hashchange', handleChange)
  window.addEventListener('popstate', handleChange)

  return () => {
    window.removeEventListener('hashchange', handleChange)
    window.removeEventListener('popstate', handleChange)
  }
}

export function useAppRoute() {
  const currentPath = useSyncExternalStore(
    subscribeToRouteChanges,
    getCurrentRoutePath,
    () => DEFAULT_ROUTE.path,
  )
  const route = useMemo(() => getRouteByPath(currentPath), [currentPath])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (window.location.hash !== `#${route.path}`) {
      updateHashPath(route.path, true)
    }
  }, [route.path])

  const navigate = useCallback(
    (routeIdOrPath: AppRouteId | string, options?: NavigateOptions) => {
      updateHashPath(getRoutePath(routeIdOrPath), options?.replace ?? false)
    },
    [],
  )

  return {
    activeTab: route.primaryTab,
    navigate,
    path: route.path,
    route,
  }
}
