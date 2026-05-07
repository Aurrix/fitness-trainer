export type StatsRangePreset = '30d' | '90d' | '180d' | '365d' | 'all'

export type MuscleProgressBreakdownView = 'muscles' | 'exercises' | 'neglect'
export type ProgramPrimaryChartView = 'frequency' | 'sets'

export type StatsPreferences = {
  bodyMetricRanges: Record<string, StatsRangePreset>
  bodyPartRanges: Record<string, StatsRangePreset>
  programPrimaryChart: ProgramPrimaryChartView
  programMetricRanges: Record<string, StatsRangePreset>
  muscleProgressRange: StatsRangePreset
  muscleProgressView: MuscleProgressBreakdownView
}

export const statsRangePresetOptions: Array<{ label: string; value: StatsRangePreset }> = [
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '180D', value: '180d' },
  { label: '1Y', value: '365d' },
  { label: 'All', value: 'all' },
]

export function createDefaultStatsPreferences(): StatsPreferences {
  return {
    bodyMetricRanges: {},
    bodyPartRanges: {},
    programPrimaryChart: 'sets',
    programMetricRanges: {},
    muscleProgressRange: '180d',
    muscleProgressView: 'muscles',
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeRangePreset(value: unknown): StatsRangePreset {
  switch (value) {
    case '30d':
    case '90d':
    case '180d':
    case '365d':
    case 'all':
      return value
    default:
      return '180d'
  }
}

function normalizeRangeMap(value: unknown) {
  if (!isRecord(value)) {
    return {} as Record<string, StatsRangePreset>
  }

  return Object.entries(value).reduce<Record<string, StatsRangePreset>>((ranges, [key, entry]) => {
    if (!key.trim()) {
      return ranges
    }

    ranges[key] = normalizeRangePreset(entry)
    return ranges
  }, {})
}

export function normalizeStatsPreferences(value: unknown): StatsPreferences {
  const defaults = createDefaultStatsPreferences()

  if (!isRecord(value)) {
    return defaults
  }

  return {
    bodyMetricRanges: normalizeRangeMap(value.bodyMetricRanges),
    bodyPartRanges: normalizeRangeMap(value.bodyPartRanges),
    programPrimaryChart:
      value.programPrimaryChart === 'frequency' ? 'frequency' : defaults.programPrimaryChart,
    programMetricRanges: normalizeRangeMap(value.programMetricRanges),
    muscleProgressRange: normalizeRangePreset(value.muscleProgressRange),
    muscleProgressView:
      value.muscleProgressView === 'exercises' || value.muscleProgressView === 'neglect'
        ? value.muscleProgressView
        : defaults.muscleProgressView,
  }
}
