import { LOCAL_STORAGE_KEYS } from './app-storage'
import {
  readPersistedStateWithMigration,
  writePersistedState,
} from '../services/app-db'

type JsonRecord = Record<string, unknown>

type ReleaseManifestEntry = {
  date: string
  file: string
  id: string
  title: string
}

type ReleaseManifest = {
  releases: ReleaseManifestEntry[]
}

export type ReleaseNote = ReleaseManifestEntry & {
  content: string
}

export type ReleaseNoteBundle = {
  latestReleaseId: string
  releases: ReleaseNote[]
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function pickText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeReleaseManifestEntry(value: unknown): ReleaseManifestEntry | null {
  if (!isRecord(value)) {
    return null
  }

  const id = pickText(value.id)
  const file = pickText(value.file)

  if (!id || !file) {
    return null
  }

  return {
    date: pickText(value.date),
    file,
    id,
    title: pickText(value.title) || id,
  }
}

function normalizeReleaseManifest(value: unknown): ReleaseManifest {
  if (!isRecord(value) || !Array.isArray(value.releases)) {
    return { releases: [] }
  }

  return {
    releases: value.releases.flatMap((entry) => {
      const release = normalizeReleaseManifestEntry(entry)
      return release ? [release] : []
    }),
  }
}

function normalizeLastShownReleaseId(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

async function fetchReleaseContent(file: string) {
  const response = await fetch(`/releases/${file}`, {
    cache: 'no-cache',
  })

  if (!response.ok) {
    return ''
  }

  return response.text()
}

export async function loadUnseenReleaseNotes(): Promise<ReleaseNoteBundle | null> {
  const manifestResponse = await fetch('/releases/index.json', {
    cache: 'no-cache',
  })

  if (!manifestResponse.ok) {
    return null
  }

  const manifest = normalizeReleaseManifest(await manifestResponse.json())
  const releases = [...manifest.releases].sort((left, right) => {
    const dateComparison = left.date.localeCompare(right.date)
    return dateComparison !== 0 ? dateComparison : left.id.localeCompare(right.id)
  })

  if (!releases.length) {
    return null
  }

  const lastShownReleaseId = normalizeLastShownReleaseId(
    await readPersistedStateWithMigration(LOCAL_STORAGE_KEYS.lastShownRelease),
  )
  const lastShownIndex = lastShownReleaseId
    ? releases.findIndex((release) => release.id === lastShownReleaseId)
    : -1
  const unseenReleases = lastShownIndex >= 0 ? releases.slice(lastShownIndex + 1) : releases

  if (!unseenReleases.length) {
    return null
  }

  const releaseNotes = await Promise.all(
    unseenReleases.map(async (release) => ({
      ...release,
      content: await fetchReleaseContent(release.file),
    })),
  )
  const visibleReleaseNotes = releaseNotes.filter((release) => release.content.trim())

  if (!visibleReleaseNotes.length) {
    return null
  }

  return {
    latestReleaseId: visibleReleaseNotes[visibleReleaseNotes.length - 1].id,
    releases: visibleReleaseNotes,
  }
}

export async function markReleaseNotesShown(releaseId: string) {
  await writePersistedState(LOCAL_STORAGE_KEYS.lastShownRelease, releaseId)
}
