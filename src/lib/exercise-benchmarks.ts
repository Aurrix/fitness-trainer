import type {
  Exercise,
  StrengthBenchmarkAgeGroup,
  StrengthBenchmarkProfile,
} from './content'
import type {
  FitnessExperienceLevel,
  FitnessProfile,
  FitnessProfileGender,
} from './fitness-profile'

export type ExerciseBenchmarkMetricKey =
  | 'assistanceKg'
  | 'durationMinutes'
  | 'externalLoadKg'
  | 'holdSeconds'
  | 'loadKg'
  | 'reps'

export type ExerciseBenchmarkInputKind = 'duration' | 'reps' | 'weightKg'

export type ExerciseBenchmarkMetric = {
  average: number
  inputKind: ExerciseBenchmarkInputKind
  key: ExerciseBenchmarkMetricKey
  label: string
  lowerIsBetter: boolean
  range: [number, number]
  unit: 'kg' | 'minutes' | 'reps' | 'seconds'
}

export type ExerciseBenchmarkSummary = {
  ageGroup: StrengthBenchmarkAgeGroup
  basis: string
  experienceLevel: FitnessExperienceLevel
  gender: FitnessProfileGender
  metrics: ExerciseBenchmarkMetric[]
}

export type ExerciseBenchmarkComparison = {
  metric: ExerciseBenchmarkMetric
  status: 'above' | 'below' | 'meets'
  value: number
}

type WorkoutSetLike = {
  duration: string
  reps: string
  weightKg: string
}

const metricDefinitions: Array<{
  field: keyof StrengthBenchmarkProfile
  inputKind: ExerciseBenchmarkInputKind
  key: ExerciseBenchmarkMetricKey
  label: string
  lowerIsBetter: boolean
}> = [
  {
    field: 'loadRangeKg',
    inputKind: 'weightKg',
    key: 'loadKg',
    label: 'Load',
    lowerIsBetter: false,
  },
  {
    field: 'externalLoadRangeKg',
    inputKind: 'weightKg',
    key: 'externalLoadKg',
    label: 'Added load',
    lowerIsBetter: false,
  },
  {
    field: 'assistanceRangeKg',
    inputKind: 'weightKg',
    key: 'assistanceKg',
    label: 'Assistance',
    lowerIsBetter: true,
  },
  {
    field: 'repRange',
    inputKind: 'reps',
    key: 'reps',
    label: 'Reps',
    lowerIsBetter: false,
  },
  {
    field: 'durationMinutesRange',
    inputKind: 'duration',
    key: 'durationMinutes',
    label: 'Duration',
    lowerIsBetter: false,
  },
  {
    field: 'holdSecondsRange',
    inputKind: 'duration',
    key: 'holdSeconds',
    label: 'Hold',
    lowerIsBetter: false,
  },
]

function getMetricUnit(
  key: ExerciseBenchmarkMetricKey,
): ExerciseBenchmarkMetric['unit'] {
  if (
    key === 'assistanceKg' ||
    key === 'externalLoadKg' ||
    key === 'loadKg'
  ) {
    return 'kg'
  }

  if (key === 'durationMinutes') {
    return 'minutes'
  }

  if (key === 'holdSeconds') {
    return 'seconds'
  }

  return 'reps'
}

export function getStrengthBenchmarkAgeGroup(
  age: number | null,
): StrengthBenchmarkAgeGroup {
  if (age !== null && age < 30) {
    return '18-29'
  }

  if (age !== null && age >= 45) {
    return '45+'
  }

  return '30-44'
}

export function formatBenchmarkNumber(value: number) {
  if (Number.isInteger(value)) {
    return String(value)
  }

  return value.toFixed(1).replace(/\.0$/, '')
}

export function formatBenchmarkValue(
  value: number,
  unit: ExerciseBenchmarkMetric['unit'],
) {
  const formattedValue = formatBenchmarkNumber(value)

  if (unit === 'kg') {
    return `${formattedValue} kg`
  }

  if (unit === 'minutes') {
    return `${formattedValue} min`
  }

  if (unit === 'seconds') {
    return `${formattedValue} sec`
  }

  return `${formattedValue} reps`
}

export function formatBenchmarkRange(metric: ExerciseBenchmarkMetric) {
  return `${formatBenchmarkValue(metric.range[0], metric.unit)} - ${formatBenchmarkValue(
    metric.range[1],
    metric.unit,
  )}`
}

export function formatBenchmarkProfileLabel(summary: ExerciseBenchmarkSummary) {
  return `${summary.gender} / ${summary.ageGroup} / ${summary.experienceLevel}`
}

function parseNullableNumber(value: string) {
  const normalizedValue = value.trim().replace(',', '.')

  if (!normalizedValue) {
    return null
  }

  const parsedValue = Number(normalizedValue)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

function getMetricInputValue(metric: ExerciseBenchmarkMetric, setLog: WorkoutSetLike) {
  if (metric.inputKind === 'weightKg') {
    return parseNullableNumber(setLog.weightKg)
  }

  if (metric.inputKind === 'reps') {
    return parseNullableNumber(setLog.reps)
  }

  return parseNullableNumber(setLog.duration)
}

export function getExerciseBenchmarkSummary(
  exercise: Exercise | null,
  profile: FitnessProfile,
): ExerciseBenchmarkSummary | null {
  if (!exercise?.strengthBenchmarks) {
    return null
  }

  const ageGroup = getStrengthBenchmarkAgeGroup(profile.age)
  const benchmarkProfile =
    exercise.strengthBenchmarks.profiles[profile.gender]?.[ageGroup]?.[
      profile.experienceLevel
    ] ?? null

  if (!benchmarkProfile) {
    return null
  }

  const metrics = metricDefinitions.flatMap<ExerciseBenchmarkMetric>((definition) => {
    const range = benchmarkProfile[definition.field]

    if (!Array.isArray(range)) {
      return []
    }

    return [
      {
        average: (range[0] + range[1]) / 2,
        inputKind: definition.inputKind,
        key: definition.key,
        label: definition.label,
        lowerIsBetter: definition.lowerIsBetter,
        range,
        unit: getMetricUnit(definition.key),
      },
    ]
  })

  if (!metrics.length) {
    return null
  }

  return {
    ageGroup,
    basis: exercise.strengthBenchmarks.measurement.basis,
    experienceLevel: profile.experienceLevel,
    gender: profile.gender,
    metrics,
  }
}

export function compareSetToExerciseBenchmark(
  exercise: Exercise | null,
  profile: FitnessProfile,
  setLog: WorkoutSetLike,
) {
  const summary = getExerciseBenchmarkSummary(exercise, profile)

  if (!summary) {
    return [] as ExerciseBenchmarkComparison[]
  }

  return summary.metrics.flatMap<ExerciseBenchmarkComparison>((metric) => {
    const value = getMetricInputValue(metric, setLog)

    if (value === null) {
      return []
    }

    const isBelowAverage = metric.lowerIsBetter
      ? value > metric.average
      : value < metric.average
    const isAboveAverage = metric.lowerIsBetter
      ? value < metric.average
      : value > metric.average

    return [
      {
        metric,
        status: isBelowAverage ? 'below' : isAboveAverage ? 'above' : 'meets',
        value,
      },
    ]
  })
}

export function getSetBenchmarkInputStatus(
  comparisons: ExerciseBenchmarkComparison[],
  inputKind: ExerciseBenchmarkInputKind,
) {
  return comparisons.find((comparison) => comparison.metric.inputKind === inputKind)?.status ?? null
}
