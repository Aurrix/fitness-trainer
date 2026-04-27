import type { ExtendedBodyPart, Slug } from '@mjcdev/react-body-highlighter'
import benchmarkSource from '../assets/progression/body-growth-benchmarks.json?raw'
import type {
  BodyMeasurementKey,
  BodyStatEntry,
} from '../entities/body-stats'
import {
  formatExerciseMuscleGroup,
  mapExerciseMuscleGroupToBodySlug,
} from '../entities/exercise-muscles'
import type {
  ExercisePerformanceSample,
  ExerciseStatsStore,
} from '../entities/exercise-stats'
import type { ProgramDayLog } from '../entities/program-day-stats'
import type { WorkoutLog } from '../entities/workout'
import {
  getContentLibrary,
  type Exercise,
  type StrengthBenchmarkKind,
  type StrengthBenchmarks,
} from './content'
import {
  calculateBodyMassIndex,
  type FitnessExperienceLevel,
  type FitnessGoal,
  type FitnessProfile,
  type FitnessProfileGender,
} from './fitness-profile'
import { muscleLabels, type MuscleProfile } from './muscles'

const DAY_MS = 24 * 60 * 60 * 1_000
const MONTH_DAYS = 30.4375

type BenchmarkDirection = 'grow' | 'maintainOrReduce'

type BenchmarkRange = {
  direction: BenchmarkDirection
  optimal: [number, number]
}

type BenchmarkAgeGroup = '18-29' | '30-44' | '45+'

type BodyGrowthBenchmarks = {
  bodyParts: Record<
    FitnessProfileGender,
    Record<
      BenchmarkAgeGroup,
      Record<FitnessExperienceLevel, Partial<Record<BodyPartProgressKey, BenchmarkRange>>>
    >
  >
  meta: {
    cadence: string
    inferenceNote: string
    sources: Array<{
      id: string
      title: string
      url: string
    }>
    units: string
    version: number
  }
}

export type BodyMetricKey = 'bmi' | 'bodyFatPercentage' | 'leanMassKg' | 'weightKg'

export type BodyPartProgressKey =
  | 'armsCm'
  | 'calvesCm'
  | 'chestCm'
  | 'forearmsCm'
  | 'hipsCm'
  | 'shouldersCm'
  | 'thighsCm'
  | 'waistCm'

export type MetricPoint = {
  date: string
  label: string
  value: number
}

export type TrendDirection = 'declining' | 'growing' | 'stable'

export type TrendTone = 'negative' | 'neutral' | 'positive'

export type TrendSummary = {
  change: number | null
  current: number | null
  direction: TrendDirection
  label: string
  monthlyRate: number | null
  previous: number | null
  tone: TrendTone
}

export type ProgramSessionPoint = {
  completionRatio: number
  date: string
  durationMinutes: number
  label: string
  sessionId: string
  strengthScore: number | null
  totalSetCount: number
  totalVolumeKg: number | null
}

export type ExerciseProgressEntry = {
  benchmarkComparison: ExerciseStrengthBenchmarkComparison | null
  coefficient: number
  confidence: number
  earlierAverageScore: number
  exerciseKey: string
  exerciseName: string
  lastRecordedAt: string | null
  laterAverageScore: number
  latestVolumeKg: number | null
  latestScore: number | null
  muscleGroups: string[]
  previousScore: number | null
  previousVolumeKg: number | null
  sampleCount: number
  scoreLabel: string
  scoreUnit: string
  targetCoefficients: Array<{ coefficient: number; muscleGroup: string }>
}

export type MuscleProgressEntry = {
  coefficient: number
  contributorCount: number
  exerciseNames: string[]
  label: string
  sampleCount: number
  slug: Slug
}

export type MuscleProgressTimelineSeries = {
  data: Array<number | null>
  label: string
  slug: Slug
}

export type MuscleProgressTimeline = {
  labels: string[]
  series: MuscleProgressTimelineSeries[]
}

export type ExerciseProgressTimelineSeries = {
  data: Array<number | null>
  exerciseKey: string
  label: string
}

export type ExerciseProgressTimeline = {
  labels: string[]
  series: ExerciseProgressTimelineSeries[]
}

export type ExerciseStrengthBenchmarkComparison = {
  benchmarkRange: [number, number]
  comparisonDelta: number
  comparisonPercent: number
  comparisonTone: 'negative' | 'neutral' | 'positive'
  direction: 'higher-is-better' | 'lower-is-better'
  latestValue: number
  measurementLabel: string
  measurementUnit: 'kg' | 'minutes' | 'reps' | 'seconds'
}

const parsedBenchmarks = JSON.parse(benchmarkSource) as BodyGrowthBenchmarks

export const bodyMetricLabels: Record<BodyMetricKey, string> = {
  bmi: 'BMI',
  bodyFatPercentage: 'Body Fat',
  leanMassKg: 'Lean Mass',
  weightKg: 'Weight',
}

export const bodyMetricUnits: Record<BodyMetricKey, string> = {
  bmi: '',
  bodyFatPercentage: '%',
  leanMassKg: 'kg',
  weightKg: 'kg',
}

export const bodyPartProgressLabels: Record<BodyPartProgressKey, string> = {
  armsCm: 'Arms',
  calvesCm: 'Calves',
  chestCm: 'Chest',
  forearmsCm: 'Forearms',
  hipsCm: 'Hips',
  shouldersCm: 'Shoulders',
  thighsCm: 'Thighs',
  waistCm: 'Waist',
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function average(values: number[]) {
  if (!values.length) {
    return null
  }

  return values.reduce((total, value) => total + value, 0) / values.length
}

function averageNullable(values: Array<number | null>) {
  return average(values.filter((value): value is number => value !== null))
}

function toDate(dateValue: string) {
  return new Date(
    dateValue.length <= 10 ? `${dateValue.slice(0, 10)}T00:00:00` : dateValue,
  )
}

export function formatShortDate(dateValue: string) {
  return toDate(dateValue).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}

export function getDateRangeStart(
  preset: '30d' | '90d' | '180d' | '365d' | 'all',
  latestDateValue: string | null,
) {
  if (preset === 'all' || !latestDateValue) {
    return null
  }

  const latestDate = toDate(latestDateValue)
  const daysByPreset = {
    '30d': 30,
    '90d': 90,
    '180d': 180,
    '365d': 365,
    all: Number.POSITIVE_INFINITY,
  } as const

  return new Date(latestDate.getTime() - daysByPreset[preset] * DAY_MS)
}

export function filterPointsByRange(
  points: MetricPoint[],
  preset: '30d' | '90d' | '180d' | '365d' | 'all',
) {
  if (!points.length || preset === 'all') {
    return points
  }

  const startDate = getDateRangeStart(preset, points.at(-1)?.date ?? null)

  if (!startDate) {
    return points
  }

  return points.filter((point) => toDate(point.date) >= startDate)
}

export function getSeriesDelta(points: MetricPoint[]) {
  if (points.length < 2) {
    return null
  }

  return points.at(-1)!.value - points[0]!.value
}

export function getMonthlyRate(points: MetricPoint[]) {
  if (points.length < 2) {
    return null
  }

  const firstPoint = points[0]!
  const lastPoint = points.at(-1)!
  const daySpan = Math.max(
    1,
    Math.round((toDate(lastPoint.date).getTime() - toDate(firstPoint.date).getTime()) / DAY_MS),
  )

  return (lastPoint.value - firstPoint.value) / (daySpan / MONTH_DAYS)
}

function toTrendDirection(change: number | null, threshold: number) {
  if (change === null || Math.abs(change) < threshold) {
    return 'stable' as const
  }

  return change > 0 ? ('growing' as const) : ('declining' as const)
}

function getWeightTone(change: number | null, goal: FitnessGoal) {
  const direction = toTrendDirection(change, 0.2)

  if (direction === 'stable') {
    return {
      direction,
      label: 'Holding steady',
      tone: goal === 'general-fitness' ? ('positive' as const) : ('neutral' as const),
    }
  }

  const positiveForGrowth = goal === 'muscle-gain' || goal === 'strength'
  const positiveForLoss = goal === 'fat-loss'
  const isPositive =
    (direction === 'growing' && positiveForGrowth) ||
    (direction === 'declining' && positiveForLoss)

  return {
    direction,
    label:
      direction === 'growing'
        ? isPositive
          ? 'Moving up'
          : 'Watch the gain'
        : isPositive
          ? 'Moving down'
          : 'Dropping off',
    tone: isPositive ? ('positive' as const) : ('negative' as const),
  }
}

function getBodyFatTone(change: number | null) {
  const direction = toTrendDirection(change, 0.3)

  if (direction === 'stable') {
    return {
      direction,
      label: 'Holding steady',
      tone: 'neutral' as const,
    }
  }

  return {
    direction,
    label: direction === 'declining' ? 'Leaning out' : 'Body fat rising',
    tone: direction === 'declining' ? ('positive' as const) : ('negative' as const),
  }
}

function getLeanMassTone(change: number | null) {
  const direction = toTrendDirection(change, 0.2)

  if (direction === 'stable') {
    return {
      direction,
      label: 'Holding steady',
      tone: 'neutral' as const,
    }
  }

  return {
    direction,
    label: direction === 'growing' ? 'Mass building' : 'Lean mass slipping',
    tone: direction === 'growing' ? ('positive' as const) : ('negative' as const),
  }
}

function getBmiTone(
  change: number | null,
  currentValue: number | null,
) {
  if (currentValue === null) {
    return {
      direction: 'stable' as const,
      label: 'Need more data',
      tone: 'neutral' as const,
    }
  }

  const targetBmi = 22
  const previousValue = change !== null ? currentValue - change : null
  const currentDistance = Math.abs(currentValue - targetBmi)
  const previousDistance = previousValue !== null ? Math.abs(previousValue - targetBmi) : null

  if (previousDistance === null || Math.abs(currentDistance - previousDistance) < 0.15) {
    return {
      direction: 'stable' as const,
      label: 'Holding range',
      tone:
        currentValue >= 18.5 && currentValue <= 24.9
          ? ('positive' as const)
          : ('neutral' as const),
    }
  }

  const improving = currentDistance < previousDistance
  return {
    direction: change !== null && change > 0 ? ('growing' as const) : ('declining' as const),
    label: improving ? 'Closer to target' : 'Farther from target',
    tone: improving ? ('positive' as const) : ('negative' as const),
  }
}

function buildMetricPoint(date: string, value: number) {
  return {
    date,
    label: formatShortDate(date),
    value,
  }
}

function buildLeanMass(weightKg: number | null, bodyFatPercentage: number | null) {
  if (weightKg === null || bodyFatPercentage === null) {
    return null
  }

  return weightKg * (1 - bodyFatPercentage / 100)
}

export function getFallbackBodyMetricValue(
  profile: FitnessProfile,
  key: BodyMetricKey,
) {
  switch (key) {
    case 'bmi':
      return calculateBodyMassIndex(profile)
    case 'bodyFatPercentage':
      return profile.bodyFatPercentage
    case 'leanMassKg':
      return buildLeanMass(profile.weightKg, profile.bodyFatPercentage)
    case 'weightKg':
      return profile.weightKg
    default:
      return null
  }
}

export function buildBodyMetricSeries(
  entries: BodyStatEntry[],
  profile: FitnessProfile,
  key: BodyMetricKey,
) {
  return [...entries]
    .sort((left, right) => left.recordedAt.localeCompare(right.recordedAt))
    .flatMap((entry) => {
      switch (key) {
        case 'bmi': {
          const weightKg = entry.weightKg

          if (weightKg === null || !profile.heightCm) {
            return []
          }

          const bmi = calculateBodyMassIndex({
            ...profile,
            weightKg,
          })
          return bmi !== null ? [buildMetricPoint(entry.recordedAt, bmi)] : []
        }
        case 'bodyFatPercentage':
          return entry.bodyFatPercentage !== null
            ? [buildMetricPoint(entry.recordedAt, entry.bodyFatPercentage)]
            : []
        case 'leanMassKg': {
          const leanMass = buildLeanMass(entry.weightKg, entry.bodyFatPercentage)
          return leanMass !== null ? [buildMetricPoint(entry.recordedAt, leanMass)] : []
        }
        case 'weightKg':
          return entry.weightKg !== null ? [buildMetricPoint(entry.recordedAt, entry.weightKg)] : []
        default:
          return []
      }
    })
}

function getBodyMetricThreshold(key: BodyMetricKey) {
  switch (key) {
    case 'bmi':
      return 0.15
    case 'bodyFatPercentage':
      return 0.3
    case 'leanMassKg':
      return 0.2
    case 'weightKg':
      return 0.2
    default:
      return 0.1
  }
}

export function summarizeBodyMetricTrend(
  key: BodyMetricKey,
  points: MetricPoint[],
  profile: FitnessProfile,
): TrendSummary {
  const current = points.at(-1)?.value ?? getFallbackBodyMetricValue(profile, key)
  const previous = points.length >= 2 ? points[0]!.value : null
  const change = current !== null && previous !== null ? current - previous : null
  const monthlyRate = getMonthlyRate(points)

  switch (key) {
    case 'bmi': {
      const tone = getBmiTone(change, current)
      return {
        change,
        current,
        monthlyRate,
        previous,
        ...tone,
      }
    }
    case 'bodyFatPercentage': {
      const tone = getBodyFatTone(change)
      return {
        change,
        current,
        monthlyRate,
        previous,
        ...tone,
      }
    }
    case 'leanMassKg': {
      const tone = getLeanMassTone(change)
      return {
        change,
        current,
        monthlyRate,
        previous,
        ...tone,
      }
    }
    case 'weightKg': {
      const tone = getWeightTone(change, profile.primaryGoal)
      return {
        change,
        current,
        monthlyRate,
        previous,
        ...tone,
      }
    }
    default:
      return {
        change,
        current,
        direction: toTrendDirection(change, getBodyMetricThreshold(key)),
        label: 'Tracking',
        monthlyRate,
        previous,
        tone: 'neutral',
      }
  }
}

function measurementAverage(
  measurements: Record<BodyMeasurementKey, number | null>,
  keys: BodyMeasurementKey[],
) {
  return averageNullable(keys.map((key) => measurements[key]))
}

export function buildBodyPartSeries(entries: BodyStatEntry[], key: BodyPartProgressKey) {
  return [...entries]
    .sort((left, right) => left.recordedAt.localeCompare(right.recordedAt))
    .flatMap((entry) => {
      let value: number | null

      switch (key) {
        case 'armsCm':
          value = measurementAverage(entry.measurements, ['leftArmCm', 'rightArmCm'])
          break
        case 'calvesCm':
          value = measurementAverage(entry.measurements, ['leftCalfCm', 'rightCalfCm'])
          break
        case 'forearmsCm':
          value = measurementAverage(entry.measurements, ['leftForearmCm', 'rightForearmCm'])
          break
        case 'thighsCm':
          value = measurementAverage(entry.measurements, ['leftThighCm', 'rightThighCm'])
          break
        default:
          value = entry.measurements[key]
      }

      return value !== null ? [buildMetricPoint(entry.recordedAt, value)] : []
    })
}

function getAgeGroup(age: number | null): BenchmarkAgeGroup {
  if (age === null || age < 30) {
    return '18-29'
  }

  if (age < 45) {
    return '30-44'
  }

  return '45+'
}

export function getBodyPartBenchmark(
  profile: FitnessProfile,
  key: BodyPartProgressKey,
) {
  return (
    parsedBenchmarks.bodyParts[profile.gender]?.[getAgeGroup(profile.age)]?.[
      profile.experienceLevel
    ]?.[key] ?? null
  )
}

export function summarizeBodyPartTrend(
  key: BodyPartProgressKey,
  points: MetricPoint[],
  profile: FitnessProfile,
): TrendSummary & { benchmark: BenchmarkRange | null } {
  const current = points.at(-1)?.value ?? null
  const previous = points.length >= 2 ? points[0]!.value : null
  const change = current !== null && previous !== null ? current - previous : null
  const monthlyRate = getMonthlyRate(points)
  const benchmark = getBodyPartBenchmark(profile, key)

  if (!benchmark || monthlyRate === null) {
    const direction = toTrendDirection(change, 0.1)

    return {
      benchmark,
      change,
      current,
      direction,
      label:
        direction === 'growing'
          ? 'Growing'
          : direction === 'declining'
            ? 'Declining'
            : 'Holding steady',
      monthlyRate,
      previous,
      tone:
        direction === 'stable'
          ? ('neutral' as const)
          : direction === 'growing'
            ? ('positive' as const)
            : ('negative' as const),
    }
  }

  const [minOptimal, maxOptimal] = benchmark.optimal

  if (benchmark.direction === 'maintainOrReduce') {
    if (monthlyRate > maxOptimal) {
      return {
        benchmark,
        change,
        current,
        direction: 'growing',
        label: 'Above target',
        monthlyRate,
        previous,
        tone: 'negative',
      }
    }

    if (monthlyRate < minOptimal) {
      return {
        benchmark,
        change,
        current,
        direction: 'declining',
        label: 'Ahead of target',
        monthlyRate,
        previous,
        tone: 'positive',
      }
    }

    return {
      benchmark,
      change,
      current,
      direction: toTrendDirection(change, 0.1),
      label: 'On target',
      monthlyRate,
      previous,
      tone: 'positive',
    }
  }

  if (monthlyRate < minOptimal) {
    return {
      benchmark,
      change,
      current,
      direction: 'stable',
      label: 'Below benchmark',
      monthlyRate,
      previous,
      tone: 'negative',
    }
  }

  if (monthlyRate > maxOptimal) {
    return {
      benchmark,
      change,
      current,
      direction: 'growing',
      label: 'Above benchmark',
      monthlyRate,
      previous,
      tone: 'positive',
    }
  }

  return {
    benchmark,
    change,
    current,
    direction: 'growing',
    label: 'Optimal growth',
    monthlyRate,
    previous,
    tone: 'positive',
  }
}

function parseNullableNumber(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

function calculateSetStrengthScore(
  sets: Array<{ reps: number | null; weightKg: number | null }>,
) {
  return sets.reduce<number | null>((bestScore, set) => {
    if (set.weightKg === null || set.reps === null) {
      return bestScore
    }

    const estimatedOneRepMax = set.weightKg * (1 + set.reps / 30)
    return bestScore === null ? estimatedOneRepMax : Math.max(bestScore, estimatedOneRepMax)
  }, null)
}

function calculateWorkoutStrengthScore(workoutLog: WorkoutLog) {
  const exerciseScores = workoutLog.exerciseLogs.flatMap((exerciseLog) => {
    const bestScore = calculateSetStrengthScore(
      exerciseLog.setLogs.map((setLog) => ({
        reps: parseNullableNumber(setLog.reps),
        weightKg: parseNullableNumber(setLog.weightKg),
      })),
    )

    return bestScore !== null ? [bestScore] : []
  })

  return average(exerciseScores)
}

function calculateWorkoutVolume(workoutLog: WorkoutLog) {
  const totalVolume = workoutLog.exerciseLogs.reduce((volume, exerciseLog) => {
    return (
      volume +
      exerciseLog.setLogs.reduce((setVolume, setLog) => {
        const weightKg = parseNullableNumber(setLog.weightKg)
        const reps = parseNullableNumber(setLog.reps)

        if (weightKg === null) {
          return setVolume
        }

        return setVolume + weightKg * (reps ?? 1)
      }, 0)
    )
  }, 0)

  return totalVolume || null
}

function hasLoggedWorkoutSet(
  setLog: Pick<WorkoutLog['exerciseLogs'][number]['setLogs'][number], 'duration' | 'effort' | 'reps' | 'weightKg'>,
) {
  return Boolean(
    setLog.duration.trim() ||
      setLog.effort.trim() ||
      setLog.reps.trim() ||
      setLog.weightKg.trim(),
  )
}

function calculateWorkoutSetCount(workoutLog: WorkoutLog) {
  return workoutLog.exerciseLogs.reduce((total, exerciseLog) => {
    return (
      total + exerciseLog.setLogs.filter((setLog) => hasLoggedWorkoutSet(setLog)).length
    )
  }, 0)
}

function calculateProgramDayStrengthScore(dayLog: ProgramDayLog) {
  const exerciseScores = dayLog.exerciseEntries.flatMap((exerciseEntry) => {
    const bestScore = calculateSetStrengthScore(exerciseEntry.sets)
    return bestScore !== null ? [bestScore] : []
  })

  return average(exerciseScores)
}

export function buildProgramSessionPoints(
  programId: string | null,
  programDayLogs: ProgramDayLog[],
  workoutLogs: WorkoutLog[],
  range: '30d' | '90d' | '180d' | '365d' | 'all',
) {
  if (!programId) {
    return [] as ProgramSessionPoint[]
  }

  const sessionMap = new Map<string, ProgramSessionPoint>()

  for (const workoutLog of workoutLogs) {
    if (workoutLog.programId !== programId) {
      continue
    }

    sessionMap.set(workoutLog.id, {
      completionRatio:
        workoutLog.totalExerciseCount > 0
          ? Math.round((workoutLog.completedExerciseCount / workoutLog.totalExerciseCount) * 100)
          : 0,
      date: workoutLog.completedAt,
      durationMinutes: workoutLog.durationMinutes,
      label: formatShortDate(workoutLog.completedAt),
      sessionId: workoutLog.id,
      strengthScore: calculateWorkoutStrengthScore(workoutLog),
      totalSetCount: calculateWorkoutSetCount(workoutLog),
      totalVolumeKg: calculateWorkoutVolume(workoutLog),
    })
  }

  for (const dayLog of programDayLogs) {
    if (dayLog.programId !== programId) {
      continue
    }

    const totalVolumeKg = dayLog.exerciseEntries.reduce((total, exerciseEntry) => {
      return total + (exerciseEntry.totalVolumeKg ?? 0)
    }, 0)

    sessionMap.set(dayLog.sessionId, {
      completionRatio:
        dayLog.totalExerciseCount > 0
          ? Math.round((dayLog.completedExerciseCount / dayLog.totalExerciseCount) * 100)
          : 0,
      date: dayLog.completedAt,
      durationMinutes: dayLog.durationMinutes,
      label: formatShortDate(dayLog.completedAt),
      sessionId: dayLog.sessionId,
      strengthScore: calculateProgramDayStrengthScore(dayLog),
      totalSetCount: dayLog.exerciseEntries.reduce(
        (total, exerciseEntry) => total + exerciseEntry.performedSetCount,
        0,
      ),
      totalVolumeKg: totalVolumeKg || null,
    })
  }

  const points = [...sessionMap.values()].sort((left, right) => left.date.localeCompare(right.date))

  if (range === 'all') {
    return points
  }

  const startDate = getDateRangeStart(range, points.at(-1)?.date ?? null)
  return startDate ? points.filter((point) => toDate(point.date) >= startDate) : points
}

function getWeekStart(dateValue: string) {
  const date = toDate(dateValue)
  const day = date.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const weekStart = new Date(date)
  weekStart.setDate(date.getDate() + mondayOffset)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

function formatWeekLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}

function getStrengthBenchmarkAgeGroup(age: number | null) {
  return getAgeGroup(age)
}

function normalizeLookupLabel(value: string) {
  return value.trim().toLowerCase()
}

function buildExerciseLookup() {
  const library = getContentLibrary()
  const byId = new Map<string, Exercise>()
  const byName = new Map<string, Exercise>()

  for (const exercise of library.exercises) {
    byId.set(exercise.id, exercise)
    byName.set(normalizeLookupLabel(exercise.name), exercise)

    for (const alias of exercise.aliases) {
      byName.set(normalizeLookupLabel(alias), exercise)
    }
  }

  return { byId, byName }
}

const exerciseLookup = buildExerciseLookup()

function resolveExerciseByHistorySample(sample: ExercisePerformanceSample | null) {
  if (!sample) {
    return null
  }

  if (sample.exerciseId?.trim()) {
    const byId = exerciseLookup.byId.get(sample.exerciseId.trim())

    if (byId) {
      return byId
    }
  }

  return exerciseLookup.byName.get(normalizeLookupLabel(sample.exerciseName)) ?? null
}

function getScoreUnit(scoreLabel: string) {
  switch (scoreLabel) {
    case 'e1RM':
    case 'Volume':
      return 'kg'
    case 'Duration':
      return 'min'
    case 'Reps':
      return 'reps'
    default:
      return ''
  }
}

function getMaxSetReps(sample: ExercisePerformanceSample) {
  return sample.sets.reduce<number | null>((currentMax, set) => {
    if (set.reps === null) {
      return currentMax
    }

    return currentMax === null ? set.reps : Math.max(currentMax, set.reps)
  }, null)
}

function getMaxSetDurationSeconds(sample: ExercisePerformanceSample) {
  return sample.sets.reduce<number | null>((currentMax, set) => {
    if (set.durationMinutes === null) {
      return currentMax
    }

    const durationSeconds = set.durationMinutes * 60
    return currentMax === null ? durationSeconds : Math.max(currentMax, durationSeconds)
  }, null)
}

function getBenchmarkRange(profile: StrengthBenchmarks['profiles'][FitnessProfileGender][BenchmarkAgeGroup][FitnessExperienceLevel], kind: StrengthBenchmarkKind) {
  switch (kind) {
    case 'assistanceKg':
      return profile.assistanceRangeKg ?? null
    case 'bodyweightReps':
      return profile.repRange ?? null
    case 'durationMinutes':
      return profile.durationMinutesRange ?? null
    case 'externalLoadKg':
      return profile.externalLoadRangeKg ?? null
    case 'holdSeconds':
      return profile.holdSecondsRange ?? null
    case 'loadKg':
      return profile.loadRangeKg ?? null
    default:
      return null
  }
}

function getBenchmarkSampleValue(sample: ExercisePerformanceSample, kind: StrengthBenchmarkKind) {
  switch (kind) {
    case 'assistanceKg':
      return sample.maxWeightKg
    case 'bodyweightReps':
      return getMaxSetReps(sample)
    case 'durationMinutes':
      return sample.totalDurationMinutes
    case 'externalLoadKg':
    case 'loadKg':
      return sample.maxWeightKg
    case 'holdSeconds':
      return getMaxSetDurationSeconds(sample)
    default:
      return null
  }
}

function buildExerciseStrengthBenchmarkComparison(
  profile: FitnessProfile,
  exercise: Exercise | null,
  sample: ExercisePerformanceSample | null,
) {
  if (!exercise?.strengthBenchmarks || !sample) {
    return null
  }

  const benchmarkProfile =
    exercise.strengthBenchmarks.profiles[profile.gender]?.[
      getStrengthBenchmarkAgeGroup(profile.age)
    ]?.[profile.experienceLevel] ?? null

  if (!benchmarkProfile) {
    return null
  }

  const benchmarkRange = getBenchmarkRange(benchmarkProfile, exercise.strengthBenchmarks.kind)
  const latestValue = getBenchmarkSampleValue(sample, exercise.strengthBenchmarks.kind)

  if (!benchmarkRange || latestValue === null) {
    return null
  }

  const benchmarkMidpoint = (benchmarkRange[0] + benchmarkRange[1]) / 2
  const direction =
    exercise.strengthBenchmarks.kind === 'assistanceKg'
      ? ('lower-is-better' as const)
      : ('higher-is-better' as const)
  const rawDelta = latestValue - benchmarkMidpoint
  const comparisonDelta = direction === 'lower-is-better' ? -rawDelta : rawDelta
  const comparisonPercent = benchmarkMidpoint
    ? (comparisonDelta / benchmarkMidpoint) * 100
    : 0
  const comparisonTone =
    Math.abs(comparisonPercent) < 4
      ? ('neutral' as const)
      : comparisonPercent > 0
        ? ('positive' as const)
        : ('negative' as const)

  return {
    benchmarkRange,
    comparisonDelta,
    comparisonPercent,
    comparisonTone,
    direction,
    latestValue,
    measurementLabel: exercise.strengthBenchmarks.measurement.basis,
    measurementUnit: exercise.strengthBenchmarks.measurement.unit,
  } satisfies ExerciseStrengthBenchmarkComparison
}

export function buildWeeklyFrequency(points: ProgramSessionPoint[]) {
  if (!points.length) {
    return [] as Array<{ label: string; sessions: number; weekStart: string }>
  }

  const sortedPoints = [...points].sort((left, right) => left.date.localeCompare(right.date))
  const startWeek = getWeekStart(sortedPoints[0]!.date)
  const endWeek = getWeekStart(sortedPoints.at(-1)!.date)
  const sessionsByWeek = new Map<string, number>()

  for (const point of sortedPoints) {
    const weekStart = getWeekStart(point.date).toISOString().slice(0, 10)
    sessionsByWeek.set(weekStart, (sessionsByWeek.get(weekStart) ?? 0) + 1)
  }

  const bars: Array<{ label: string; sessions: number; weekStart: string }> = []
  const currentWeek = new Date(startWeek)

  while (currentWeek <= endWeek) {
    const weekStart = currentWeek.toISOString().slice(0, 10)
    bars.push({
      label: formatWeekLabel(currentWeek),
      sessions: sessionsByWeek.get(weekStart) ?? 0,
      weekStart,
    })
    currentWeek.setDate(currentWeek.getDate() + 7)
  }

  return bars
}

export function summarizeTrend(values: Array<number | null>) {
  const filteredValues = values.filter((value): value is number => value !== null)

  if (filteredValues.length < 2) {
    return null
  }

  const splitIndex = Math.floor(filteredValues.length / 2)
  const earlierValues = filteredValues.slice(0, splitIndex)
  const laterValues = filteredValues.slice(splitIndex)

  if (!earlierValues.length || !laterValues.length) {
    return null
  }

  const earlierAverage = average(earlierValues)
  const laterAverage = average(laterValues)

  if (earlierAverage === null || laterAverage === null) {
    return null
  }

  return laterAverage - earlierAverage
}

function getPerformanceScore(sample: ExercisePerformanceSample) {
  const strengthScore = calculateSetStrengthScore(sample.sets)

  if (strengthScore !== null) {
    return {
      score: strengthScore,
      scoreLabel: 'e1RM',
    }
  }

  if (sample.totalVolumeKg !== null) {
    return {
      score: sample.totalVolumeKg,
      scoreLabel: 'Volume',
    }
  }

  if (sample.totalReps !== null) {
    return {
      score: sample.totalReps,
      scoreLabel: 'Reps',
    }
  }

  if (sample.totalDurationMinutes !== null) {
    return {
      score: sample.totalDurationMinutes,
      scoreLabel: 'Duration',
    }
  }

  return null
}

export function calculateExerciseProgressionCoefficient(
  history: ExercisePerformanceSample[],
) {
  const usableHistory = [...history]
    .filter((sample) => !sample.skipped)
    .map((sample) => {
      const score = getPerformanceScore(sample)
      return score
        ? {
            ...sample,
            ...score,
          }
        : null
    })
    .filter(
      (
        sample,
      ): sample is ExercisePerformanceSample & { score: number; scoreLabel: string } =>
        sample !== null,
    )
    .sort((left, right) => left.recordedAt.localeCompare(right.recordedAt))

  if (usableHistory.length < 2) {
    return null
  }

  const splitIndex = Math.max(1, Math.floor(usableHistory.length / 2))
  const earlierWindow = usableHistory.slice(0, splitIndex)
  const laterWindow = usableHistory.slice(-splitIndex)
  const earlierAverage = average(earlierWindow.map((sample) => sample.score))
  const laterAverage = average(laterWindow.map((sample) => sample.score))

  if (earlierAverage === null || laterAverage === null) {
    return null
  }

  // Compare the later average to the earlier average and dampen noisy results when the
  // sample count is small, so single-session spikes do not dominate the progression map.
  const rawCoefficient = (laterAverage - earlierAverage) / Math.max(Math.abs(earlierAverage), 1)
  const confidence = clamp(usableHistory.length / 6, 0.35, 1)
  const coefficient = clamp(rawCoefficient * confidence, -1, 1)
  const latestSample = usableHistory.at(-1) ?? null

  return {
    coefficient,
    confidence,
    earlierAverageScore: earlierAverage,
    lastRecordedAt: latestSample?.recordedAt ?? null,
    laterAverageScore: laterAverage,
    latestScore: latestSample?.score ?? null,
    sampleCount: usableHistory.length,
    scoreLabel: latestSample?.scoreLabel ?? usableHistory[0]!.scoreLabel,
    targetCoefficients: latestSample?.targetCoefficients ?? [],
  }
}

export function buildExerciseProgressionBreakdown(
  programId: string | null,
  statsStore: ExerciseStatsStore,
  range: '30d' | '90d' | '180d' | '365d' | 'all',
  profile?: FitnessProfile | null,
) {
  if (!programId) {
    return [] as ExerciseProgressEntry[]
  }

  return Object.entries(statsStore.byExerciseKey)
    .flatMap(([exerciseKey, record]) => {
      const filteredHistory = record.progressionHistory.filter((sample) => {
        if (sample.programId !== programId) {
          return false
        }

        if (range === 'all') {
          return true
        }

        const latestRecordedAt = record.progressionHistory[0]?.recordedAt ?? null
        const startDate = getDateRangeStart(range, latestRecordedAt)
        return startDate ? toDate(sample.recordedAt) >= startDate : true
      })

      const progression = calculateExerciseProgressionCoefficient(filteredHistory)

      if (!progression) {
        return []
      }

      const sortedHistory = [...filteredHistory].sort((left, right) =>
        left.recordedAt.localeCompare(right.recordedAt),
      )
      const latestSample = sortedHistory.at(-1) ?? null
      const previousSample = sortedHistory.length > 1 ? sortedHistory.at(-2) ?? null : null
      const latestScore = getPerformanceScore(latestSample ?? filteredHistory[0]!)?.score ?? null
      const previousScore = previousSample ? getPerformanceScore(previousSample)?.score ?? null : null
      const benchmarkComparison =
        profile && latestSample
          ? buildExerciseStrengthBenchmarkComparison(
              profile,
              resolveExerciseByHistorySample(latestSample),
              latestSample,
            )
          : null

      return [
        {
          benchmarkComparison,
          coefficient: progression.coefficient,
          confidence: progression.confidence,
          earlierAverageScore: progression.earlierAverageScore,
          exerciseKey,
          exerciseName: record.exerciseName,
          lastRecordedAt: progression.lastRecordedAt,
          laterAverageScore: progression.laterAverageScore,
          latestScore,
          latestVolumeKg: latestSample?.totalVolumeKg ?? null,
          muscleGroups:
            latestSample?.muscleGroups.length ? latestSample.muscleGroups : record.muscleGroups,
          previousScore,
          previousVolumeKg: previousSample?.totalVolumeKg ?? null,
          sampleCount: progression.sampleCount,
          scoreLabel: progression.scoreLabel,
          scoreUnit: getScoreUnit(progression.scoreLabel),
          targetCoefficients: progression.targetCoefficients,
        },
      ]
    })
    .sort((left, right) => Math.abs(right.coefficient) - Math.abs(left.coefficient))
}

export function buildMuscleProgressionBreakdown(exercises: ExerciseProgressEntry[]) {
  const buckets = new Map<
    Slug,
    {
      coefficientTotal: number
      exerciseNames: Set<string>
      label: string
      sampleCount: number
      weight: number
    }
  >()

  for (const exercise of exercises) {
    const coefficients =
      exercise.targetCoefficients.length > 0
        ? exercise.targetCoefficients
        : exercise.muscleGroups.length
          ? exercise.muscleGroups.map((muscleGroup) => ({
              coefficient: 1 / exercise.muscleGroups.length,
              muscleGroup,
            }))
          : []

    for (const target of coefficients) {
      const slug = mapExerciseMuscleGroupToBodySlug(target.muscleGroup)

      if (!slug) {
        continue
      }

      const bucket = buckets.get(slug) ?? {
        coefficientTotal: 0,
        exerciseNames: new Set<string>(),
        label: muscleLabels[slug] ?? formatExerciseMuscleGroup(target.muscleGroup),
        sampleCount: 0,
        weight: 0,
      }

      bucket.coefficientTotal += exercise.coefficient * target.coefficient
      bucket.exerciseNames.add(exercise.exerciseName)
      bucket.sampleCount += exercise.sampleCount
      bucket.weight += target.coefficient
      buckets.set(slug, bucket)
    }
  }

  return [...buckets.entries()]
    .map(([slug, bucket]) => ({
      coefficient: bucket.weight ? bucket.coefficientTotal / bucket.weight : 0,
      contributorCount: bucket.exerciseNames.size,
      exerciseNames: [...bucket.exerciseNames].sort(),
      label: bucket.label,
      sampleCount: bucket.sampleCount,
      slug,
    }))
    .sort((left, right) => Math.abs(right.coefficient) - Math.abs(left.coefficient))
}

export function buildMuscleProgressTimeline(
  programId: string | null,
  statsStore: ExerciseStatsStore,
  range: '30d' | '90d' | '180d' | '365d' | 'all',
  focusSlugs: Slug[],
) {
  if (!programId || !focusSlugs.length) {
    return { labels: [], series: [] } as MuscleProgressTimeline
  }

  const buckets = new Map<
    string,
    Map<
      Slug,
      {
        coefficientTotal: number
        weight: number
      }
    >
  >()

  for (const record of Object.values(statsStore.byExerciseKey)) {
    const filteredHistory = record.progressionHistory.filter((sample) => {
      if (sample.programId !== programId) {
        return false
      }

      if (range === 'all') {
        return true
      }

      const latestRecordedAt = record.progressionHistory[0]?.recordedAt ?? null
      const startDate = getDateRangeStart(range, latestRecordedAt)
      return startDate ? toDate(sample.recordedAt) >= startDate : true
    })

    const scoredHistory = [...filteredHistory]
      .filter((sample) => !sample.skipped)
      .map((sample) => {
        const score = getPerformanceScore(sample)
        return score ? { ...sample, ...score } : null
      })
      .filter(
        (
          sample,
        ): sample is ExercisePerformanceSample & { score: number; scoreLabel: string } =>
          sample !== null,
      )
      .sort((left, right) => left.recordedAt.localeCompare(right.recordedAt))

    for (let index = 1; index < scoredHistory.length; index += 1) {
      const progression = calculateExerciseProgressionCoefficient(scoredHistory.slice(0, index + 1))

      if (!progression) {
        continue
      }

      const sample = scoredHistory[index]!
      const dateKey = sample.recordedAt.slice(0, 10)
      const coefficients =
        progression.targetCoefficients.length > 0
          ? progression.targetCoefficients
          : sample.muscleGroups.length
            ? sample.muscleGroups.map((muscleGroup) => ({
                coefficient: 1 / sample.muscleGroups.length,
                muscleGroup,
              }))
            : []

      for (const target of coefficients) {
        const slug = mapExerciseMuscleGroupToBodySlug(target.muscleGroup)

        if (!slug || !focusSlugs.includes(slug)) {
          continue
        }

        const byDate = buckets.get(dateKey) ?? new Map()
        const currentBucket = byDate.get(slug) ?? {
          coefficientTotal: 0,
          weight: 0,
        }

        currentBucket.coefficientTotal += progression.coefficient * target.coefficient
        currentBucket.weight += target.coefficient
        byDate.set(slug, currentBucket)
        buckets.set(dateKey, byDate)
      }
    }
  }

  const labels = [...buckets.keys()].sort()
  const series = focusSlugs
    .map((slug) => ({
      data: labels.map((label) => {
        const bucket = buckets.get(label)?.get(slug)
        return bucket && bucket.weight ? bucket.coefficientTotal / bucket.weight : null
      }),
      label: muscleLabels[slug] ?? slug,
      slug,
    }))
    .filter((entry) => entry.data.some((value) => value !== null))

  return {
    labels: labels.map((label) => formatShortDate(label)),
    series,
  } satisfies MuscleProgressTimeline
}

export function buildExerciseProgressTimeline(
  programId: string | null,
  statsStore: ExerciseStatsStore,
  range: '30d' | '90d' | '180d' | '365d' | 'all',
  focusExerciseKeys: string[],
) {
  if (!programId || !focusExerciseKeys.length) {
    return { labels: [], series: [] } as ExerciseProgressTimeline
  }

  const seriesByExercise = new Map<
    string,
    Array<{
      coefficient: number
      date: string
    }>
  >()

  for (const [exerciseKey, record] of Object.entries(statsStore.byExerciseKey)) {
    if (!focusExerciseKeys.includes(exerciseKey)) {
      continue
    }

    const filteredHistory = record.progressionHistory.filter((sample) => {
      if (sample.programId !== programId) {
        return false
      }

      if (range === 'all') {
        return true
      }

      const latestRecordedAt = record.progressionHistory[0]?.recordedAt ?? null
      const startDate = getDateRangeStart(range, latestRecordedAt)
      return startDate ? toDate(sample.recordedAt) >= startDate : true
    })

    const scoredHistory = [...filteredHistory]
      .filter((sample) => !sample.skipped)
      .map((sample) => {
        const score = getPerformanceScore(sample)
        return score ? { ...sample, ...score } : null
      })
      .filter(
        (
          sample,
        ): sample is ExercisePerformanceSample & { score: number; scoreLabel: string } =>
          sample !== null,
      )
      .sort((left, right) => left.recordedAt.localeCompare(right.recordedAt))

    const points: Array<{ coefficient: number; date: string }> = []

    for (let index = 1; index < scoredHistory.length; index += 1) {
      const progression = calculateExerciseProgressionCoefficient(scoredHistory.slice(0, index + 1))

      if (!progression) {
        continue
      }

      points.push({
        coefficient: progression.coefficient,
        date: scoredHistory[index]!.recordedAt.slice(0, 10),
      })
    }

    if (points.length) {
      seriesByExercise.set(exerciseKey, points)
    }
  }

  const labelSet = new Set<string>()

  for (const points of seriesByExercise.values()) {
    for (const point of points) {
      labelSet.add(point.date)
    }
  }

  const labels = [...labelSet].sort()
  const series = focusExerciseKeys
    .map((exerciseKey) => {
      const points = seriesByExercise.get(exerciseKey)

      if (!points?.length) {
        return null
      }

      const byDate = new Map(points.map((point) => [point.date, point.coefficient]))

      return {
        data: labels.map((label) => byDate.get(label) ?? null),
        exerciseKey,
        label: statsStore.byExerciseKey[exerciseKey]?.exerciseName ?? exerciseKey,
      }
    })
    .filter((entry): entry is ExerciseProgressTimelineSeries => entry !== null)

  return {
    labels: labels.map((label) => formatShortDate(label)),
    series,
  } satisfies ExerciseProgressTimeline
}

function getCoefficientColor(value: number) {
  if (value >= 0.18) {
    return '#15a34a'
  }

  if (value >= 0.05) {
    return '#4ade80'
  }

  if (value <= -0.18) {
    return '#dc2626'
  }

  if (value <= -0.05) {
    return '#fb7185'
  }

  return '#94a3b8'
}

export function buildMuscleProgressProfile(entries: MuscleProgressEntry[]): MuscleProfile {
  const data = entries.map<ExtendedBodyPart>(({ coefficient, slug }) => ({
    color: getCoefficientColor(coefficient),
    slug,
  }))

  return {
    data,
    muscles: entries.map((entry) => ({
      count: Math.round(entry.coefficient * 100),
      slug: entry.slug,
    })),
    topMuscles: entries.slice(0, 6).map((entry) => ({
      count: Math.round(entry.coefficient * 100),
      slug: entry.slug,
    })),
  }
}

export function derivePlannedSessionsPerWeek(
  program: { sections: Array<{ weekIndex?: number | null }> } | null,
  fallbackTarget: number | null,
) {
  if (!program?.sections.length) {
    return fallbackTarget ?? 0
  }

  const countsByWeek = new Map<number, number>()

  for (const section of program.sections) {
    const weekIndex = section.weekIndex ?? 1
    countsByWeek.set(weekIndex, (countsByWeek.get(weekIndex) ?? 0) + 1)
  }

  return Math.max(...countsByWeek.values(), fallbackTarget ?? 0)
}

export function formatSignedNumber(value: number | null, digits = 1) {
  if (value === null) {
    return 'N/A'
  }

  return `${value > 0 ? '+' : ''}${value.toFixed(digits)}`
}
