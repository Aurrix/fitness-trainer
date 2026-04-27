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

const navigationEventName = 'app-route-change'

function normalizeBasePath(value: string) {
  if (!value || value === '/') {
    return '/'
  }

  let normalized = value

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`
  }

  normalized = normalized.replace(/\/{2,}/g, '/')

  if (normalized.length > 1) {
    normalized = normalized.replace(/\/+$/g, '')
  }

  return normalized || '/'
}

function getBasePath() {
  return normalizeBasePath(import.meta.env.BASE_URL || '/')
}

function stripBasePath(pathname: string) {
  const basePath = getBasePath()

  if (basePath === '/') {
    return pathname || '/'
  }

  if (pathname === basePath) {
    return '/'
  }

  if (pathname.startsWith(`${basePath}/`)) {
    return pathname.slice(basePath.length) || '/'
  }

  return pathname || '/'
}

function buildUrlForRoute(path: string) {
  const normalizedPath = normalizeRoutePath(path)
  const basePath = getBasePath()
  const pathname =
    basePath === '/'
      ? normalizedPath
      : normalizedPath === '/'
        ? basePath
        : `${basePath}${normalizedPath}`

  return `${pathname}${window.location.search}`
}

function getCurrentRoutePath() {
  if (typeof window === 'undefined') {
    return DEFAULT_ROUTE.path
  }

  if (window.location.hash) {
    return normalizeRoutePath(window.location.hash.slice(1))
  }

  return normalizeRoutePath(stripBasePath(window.location.pathname))
}

function updatePath(path: string, replace = false) {
  if (typeof window === 'undefined') {
    return
  }

  const nextPath = normalizeRoutePath(path)
  const currentPath = getCurrentRoutePath()

  if (!window.location.hash && currentPath === nextPath) {
    return
  }

  const nextUrl = buildUrlForRoute(nextPath)

  if (replace) {
    window.history.replaceState(null, '', nextUrl)
  } else {
    window.history.pushState(null, '', nextUrl)
  }

  window.dispatchEvent(new Event(navigationEventName))
}

function subscribeToRouteChanges(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const handleChange = () => onStoreChange()

  window.addEventListener('popstate', handleChange)
  window.addEventListener(navigationEventName, handleChange)

  return () => {
    window.removeEventListener('popstate', handleChange)
    window.removeEventListener(navigationEventName, handleChange)
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

    if (window.location.hash || getCurrentRoutePath() !== route.path) {
      updatePath(route.path, true)
    }
  }, [route.path])

  const navigate = useCallback(
    (routeIdOrPath: AppRouteId | string, options?: NavigateOptions) => {
      updatePath(getRoutePath(routeIdOrPath), options?.replace ?? false)
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
