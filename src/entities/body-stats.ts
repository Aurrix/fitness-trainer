export type BodyMeasurementKey =
  | 'neckCm'
  | 'shouldersCm'
  | 'chestCm'
  | 'waistCm'
  | 'hipsCm'
  | 'leftArmCm'
  | 'rightArmCm'
  | 'leftForearmCm'
  | 'rightForearmCm'
  | 'leftThighCm'
  | 'rightThighCm'
  | 'leftCalfCm'
  | 'rightCalfCm'

export type BodyMeasurements = Record<BodyMeasurementKey, number | null>

export type BodyStatEntry = {
  id: string
  bodyFatPercentage: number | null
  measurements: BodyMeasurements
  notes: string
  recordedAt: string
  weightKg: number | null
}

export type BodyStatEntryInput = Omit<BodyStatEntry, 'id'>

export const bodyMeasurementKeys: BodyMeasurementKey[] = [
  'neckCm',
  'shouldersCm',
  'chestCm',
  'waistCm',
  'hipsCm',
  'leftArmCm',
  'rightArmCm',
  'leftForearmCm',
  'rightForearmCm',
  'leftThighCm',
  'rightThighCm',
  'leftCalfCm',
  'rightCalfCm',
]

export const bodyMeasurementLabels: Record<BodyMeasurementKey, string> = {
  neckCm: 'Neck',
  shouldersCm: 'Shoulders',
  chestCm: 'Chest',
  waistCm: 'Waist',
  hipsCm: 'Hips',
  leftArmCm: 'Left Arm',
  rightArmCm: 'Right Arm',
  leftForearmCm: 'Left Forearm',
  rightForearmCm: 'Right Forearm',
  leftThighCm: 'Left Thigh',
  rightThighCm: 'Right Thigh',
  leftCalfCm: 'Left Calf',
  rightCalfCm: 'Right Calf',
}

export function createEmptyBodyMeasurements(): BodyMeasurements {
  return {
    neckCm: null,
    shouldersCm: null,
    chestCm: null,
    waistCm: null,
    hipsCm: null,
    leftArmCm: null,
    rightArmCm: null,
    leftForearmCm: null,
    rightForearmCm: null,
    leftThighCm: null,
    rightThighCm: null,
    leftCalfCm: null,
    rightCalfCm: null,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsedValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN

  return Number.isFinite(parsedValue) ? parsedValue : null
}

function normalizeMeasurements(value: unknown) {
  const source = isRecord(value) ? value : {}

  return {
    ...createEmptyBodyMeasurements(),
    neckCm: normalizeNullableNumber(source.neckCm),
    shouldersCm: normalizeNullableNumber(source.shouldersCm),
    chestCm: normalizeNullableNumber(source.chestCm),
    waistCm: normalizeNullableNumber(source.waistCm),
    hipsCm: normalizeNullableNumber(source.hipsCm),
    leftArmCm: normalizeNullableNumber(source.leftArmCm),
    rightArmCm: normalizeNullableNumber(source.rightArmCm),
    leftForearmCm: normalizeNullableNumber(source.leftForearmCm),
    rightForearmCm: normalizeNullableNumber(source.rightForearmCm),
    leftThighCm: normalizeNullableNumber(source.leftThighCm),
    rightThighCm: normalizeNullableNumber(source.rightThighCm),
    leftCalfCm: normalizeNullableNumber(source.leftCalfCm),
    rightCalfCm: normalizeNullableNumber(source.rightCalfCm),
  }
}

export function normalizeBodyStatEntry(value: unknown): BodyStatEntry | null {
  if (!isRecord(value)) {
    return null
  }

  const normalizedMeasurements = normalizeMeasurements(value.measurements)

  if (normalizedMeasurements.waistCm === null) {
    normalizedMeasurements.waistCm = normalizeNullableNumber(value.waistCm)
  }

  return {
    id:
      typeof value.id === 'string' && value.id.trim()
        ? value.id
        : `body-stat-${Math.random().toString(36).slice(2, 10)}`,
    bodyFatPercentage: normalizeNullableNumber(value.bodyFatPercentage),
    measurements: normalizedMeasurements,
    notes: typeof value.notes === 'string' ? value.notes : '',
    recordedAt:
      typeof value.recordedAt === 'string' && value.recordedAt.trim()
        ? value.recordedAt
        : new Date().toISOString().slice(0, 10),
    weightKg: normalizeNullableNumber(value.weightKg),
  }
}

export function normalizeBodyStatEntries(value: unknown): BodyStatEntry[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => normalizeBodyStatEntry(entry))
    .filter((entry): entry is BodyStatEntry => entry !== null)
    .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt))
}

export function countRecordedMeasurements(entry: BodyStatEntry) {
  return Object.values(entry.measurements).filter((value) => value !== null).length
}
