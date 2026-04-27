import type { AppTab, InsightsView, LibraryView } from './lib/app-types'

export type AppRouteId =
  | 'workout'
  | 'library-home'
  | 'library-programs'
  | 'library-exercises'
  | 'progression'
  | 'insights'
  | 'insights-notifications'
  | 'insights-advice'
  | 'insights-analysis'
  | 'profile'

export type AppRoute = {
  id: AppRouteId
  path: string
  primaryTab: AppTab
  title: string
  insightsView?: InsightsView
  libraryView?: LibraryView
}

export const APP_ROUTES: AppRoute[] = [
  {
    id: 'workout',
    path: '/workout',
    primaryTab: 'workout',
    title: 'Workout',
  },
  {
    id: 'library-home',
    path: '/library',
    primaryTab: 'library',
    title: 'Library',
    libraryView: 'home',
  },
  {
    id: 'library-programs',
    path: '/library/programs',
    primaryTab: 'library',
    title: 'Programs',
    libraryView: 'programs',
  },
  {
    id: 'library-exercises',
    path: '/library/exercises',
    primaryTab: 'library',
    title: 'Exercises',
    libraryView: 'exercises',
  },
  {
    id: 'progression',
    path: '/progression',
    primaryTab: 'progression',
    title: 'Stats',
  },
  {
    id: 'insights',
    path: '/insights',
    primaryTab: 'insights',
    title: 'Insights',
    insightsView: 'home',
  },
  {
    id: 'insights-notifications',
    path: '/insights/notifications',
    primaryTab: 'insights',
    title: 'Notifications',
    insightsView: 'notifications',
  },
  {
    id: 'insights-advice',
    path: '/insights/advice',
    primaryTab: 'insights',
    title: 'Advice',
    insightsView: 'advice',
  },
  {
    id: 'insights-analysis',
    path: '/insights/analysis',
    primaryTab: 'insights',
    title: 'Analysis',
    insightsView: 'analysis',
  },
  {
    id: 'profile',
    path: '/profile',
    primaryTab: 'settings',
    title: 'Profile',
  },
]

export const DEFAULT_ROUTE = APP_ROUTES[0]

const routeByPath = new Map(APP_ROUTES.map((route) => [route.path, route]))
const routeById = new Map(APP_ROUTES.map((route) => [route.id, route]))
const LEGACY_ROUTE_REDIRECTS = new Map<string, string>([
  ['/programs', '/insights'],
  ['/progression/body', '/progression'],
  ['/progression/overview', '/progression'],
  ['/progression/muscles', '/progression'],
  ['/progression/history', '/progression'],
])

export function normalizeRoutePath(value?: string | null) {
  let normalized = value?.trim() ?? ''

  if (!normalized) {
    return DEFAULT_ROUTE.path
  }

  const hashIndex = normalized.indexOf('#')

  if (hashIndex >= 0) {
    normalized = normalized.slice(hashIndex + 1)
  }

  const queryIndex = normalized.indexOf('?')

  if (queryIndex >= 0) {
    normalized = normalized.slice(0, queryIndex)
  }

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`
  }

  normalized = normalized.replace(/\/{2,}/g, '/')

  if (normalized.length > 1) {
    normalized = normalized.replace(/\/+$/g, '')
  }

  return normalized || DEFAULT_ROUTE.path
}

export function getRouteByPath(path: string) {
  const normalizedPath = normalizeRoutePath(path)
  const redirectedPath = LEGACY_ROUTE_REDIRECTS.get(normalizedPath) ?? normalizedPath
  return routeByPath.get(redirectedPath) ?? DEFAULT_ROUTE
}

export function getRouteById(routeId: AppRouteId) {
  return routeById.get(routeId) ?? DEFAULT_ROUTE
}

export function getRoutePath(routeIdOrPath: AppRouteId | string) {
  return routeById.has(routeIdOrPath as AppRouteId)
    ? getRouteById(routeIdOrPath as AppRouteId).path
    : normalizeRoutePath(routeIdOrPath)
}

export function getLibraryPath(view: LibraryView = 'home') {
  switch (view) {
    case 'programs':
      return '/library/programs'
    case 'exercises':
      return '/library/exercises'
    default:
      return '/library'
  }
}

export function getProgressionPath() {
  return '/progression'
}

export function getInsightsPath(view: InsightsView = 'home') {
  switch (view) {
    case 'notifications':
      return '/insights/notifications'
    case 'advice':
      return '/insights/advice'
    case 'analysis':
      return '/insights/analysis'
    default:
      return '/insights'
  }
}

export function getPrimaryRoutePath(tab: AppTab) {
  switch (tab) {
    case 'library':
      return getLibraryPath()
    case 'progression':
      return getProgressionPath()
    case 'insights':
      return getInsightsPath()
    case 'settings':
      return '/profile'
    default:
      return '/workout'
  }
}
