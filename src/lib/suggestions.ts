import registrySource from '../assets/suggestions/index.json'
import type { BodyStatEntry } from '../entities/body-stats'
import type { ExerciseStatsStore } from '../entities/exercise-stats'
import type { ProgramDayLog } from '../entities/program-day-stats'
import type { WorkoutLog } from '../entities/workout'
import type { AppProgram } from './app-types'
import type { FitnessProfile } from './fitness-profile'
import {
  buildBodyMetricSeries,
  buildExerciseProgressionBreakdown,
  buildProgramSessionPoints,
  buildWeeklyFrequency,
  derivePlannedSessionsPerWeek,
  formatSignedNumber,
  getSeriesDelta,
} from './progression'

type PrimitiveValue = boolean | null | number | string

type RuleValueSpec =
  | PrimitiveValue
  | { var: string }
  | {
      args?: RuleValueSpec[]
      keyword: string
      options?: Record<string, unknown>
    }

type RuleConditionSpec =
  | { all: RuleConditionSpec[] }
  | { any: RuleConditionSpec[] }
  | { eq: [RuleValueSpec, RuleValueSpec] }
  | { falsy: RuleValueSpec }
  | { gt: [RuleValueSpec, RuleValueSpec] }
  | { gte: [RuleValueSpec, RuleValueSpec] }
  | { includes: [RuleValueSpec, RuleValueSpec] }
  | { lt: [RuleValueSpec, RuleValueSpec] }
  | { lte: [RuleValueSpec, RuleValueSpec] }
  | { not: RuleConditionSpec }
  | { truthy: RuleValueSpec }

type RuleDefinition = {
  category: 'body' | 'consistency' | 'progression' | 'recovery' | 'setup'
  details?: string[]
  id: string
  messages: {
    action: string
    summary: string
  }
  priority: number
  title: string
  tone: 'attention' | 'neutral' | 'positive'
  variables?: Record<string, RuleValueSpec>
  when: RuleConditionSpec
}

export type RulesetDefinition = {
  rules: RuleDefinition[]
  version: number
}

type RulesetRegistry = {
  groups: Array<{
    file: string
    id: string
  }>
  version: number
}

type RulesetIndex = {
  rules: string[]
  version: number
}

export type SuggestionFinding = {
  action: string
  category: RuleDefinition['category']
  details: string[]
  id: string
  priority: number
  summary: string
  title: string
  tone: RuleDefinition['tone']
}

export type SuggestionEngineParams = {
  bodyStatsEntries: BodyStatEntry[]
  exerciseStatsStore: ExerciseStatsStore
  fitnessProfile: FitnessProfile
  mainProgram: AppProgram
  reminderEnabled?: boolean
  reminderLastSentAt?: string | null
  notificationPermission?: NotificationPermission | 'unsupported'
  programDayLogs: ProgramDayLog[]
  workoutLogs: WorkoutLog[]
}

type ExerciseSubsetMode = 'progressing' | 'regression' | 'stalled'

type RuleEngineContext = {
  baseVariables: Record<string, unknown>
  params: SuggestionEngineParams
}

type ValueResolver = (
  args: unknown[],
  options: Record<string, unknown>,
  context: RuleEngineContext,
) => unknown

const DAY_MS = 24 * 60 * 60 * 1_000
const rulesetRegistry = registrySource as unknown as RulesetRegistry
const rulesetModules = import.meta.glob('../assets/suggestions/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

function toDate(value: string) {
  return new Date(value.length <= 10 ? `${value}T00:00:00` : value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function toStringValue(value: unknown) {
  return typeof value === 'string' ? value : value === null || value === undefined ? '' : String(value)
}

function toBoolean(value: unknown) {
  return Boolean(value)
}

function formatNumber(value: number, digits = 1) {
  return value.toFixed(digits)
}

function formatSigned(value: number, digits = 1) {
  return formatSignedNumber(value, digits)
}

function joinLabels(values: unknown[], separator = ', ') {
  const labels = values.map((value) => toStringValue(value).trim()).filter(Boolean)

  if (!labels.length) {
    return ''
  }

  if (labels.length === 1) {
    return labels[0]
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`
  }

  return `${labels.slice(0, -1).join(separator)}, and ${labels.at(-1)}`
}

function daysSince(dateValue: string | null | undefined) {
  if (!dateValue) {
    return Number.POSITIVE_INFINITY
  }

  return Math.max(0, Math.round((Date.now() - toDate(dateValue).getTime()) / DAY_MS))
}

function renderTemplate(template: string, variables: Record<string, unknown>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = variables[key]
    return value === undefined || value === null ? '' : String(value)
  })
}

function buildExerciseSubset(
  params: SuggestionEngineParams,
  mode: ExerciseSubsetMode,
  options: Record<string, unknown>,
) {
  if (!params.mainProgram.sections.length) {
    return []
  }

  const lookbackDays = typeof options.lookbackDays === 'number' ? options.lookbackDays : 60
  const minimumSamples = typeof options.minimumSamples === 'number' ? options.minimumSamples : 3
  const maxExercises = typeof options.maxExercises === 'number' ? options.maxExercises : 3
  const maxAbsCoefficient =
    typeof options.maxAbsCoefficient === 'number' ? options.maxAbsCoefficient : 0.03
  const minNegativeCoefficient =
    typeof options.minNegativeCoefficient === 'number'
      ? options.minNegativeCoefficient
      : -0.08
  const minPositiveCoefficient =
    typeof options.minPositiveCoefficient === 'number'
      ? options.minPositiveCoefficient
      : 0.08

  const breakdown = buildExerciseProgressionBreakdown(
    params.mainProgram.id,
    params.exerciseStatsStore,
    '180d',
    params.fitnessProfile,
  )

  const filtered = breakdown.filter((exercise) => {
    if (exercise.sampleCount < minimumSamples || daysSince(exercise.lastRecordedAt) > lookbackDays) {
      return false
    }

    if (mode === 'stalled') {
      return Math.abs(exercise.coefficient) <= maxAbsCoefficient
    }

    if (mode === 'progressing') {
      return exercise.coefficient >= minPositiveCoefficient
    }

    return exercise.coefficient <= minNegativeCoefficient
  })

  const sorted = [...filtered].sort((left, right) => {
    if (mode === 'stalled') {
      return right.sampleCount - left.sampleCount
    }

    if (mode === 'progressing') {
      return right.coefficient - left.coefficient
    }

    return left.coefficient - right.coefficient
  })

  return sorted.slice(0, maxExercises)
}

function buildContext(params: SuggestionEngineParams): RuleEngineContext {
  return {
    baseVariables: {
      mainProgramName: params.mainProgram.name,
      notificationPermission: params.notificationPermission ?? 'unsupported',
      notificationSupported:
        params.notificationPermission !== undefined &&
        params.notificationPermission !== 'unsupported',
    },
    params,
  }
}

function buildAllProgramSessionPoints(params: SuggestionEngineParams) {
  if (!params.mainProgram.sections.length) {
    return []
  }

  return buildProgramSessionPoints(
    params.mainProgram.id,
    params.programDayLogs,
    params.workoutLogs,
    'all',
  )
}

const keywordResolvers: Record<string, ValueResolver> = {
  abs(args) {
    return Math.abs(toNumber(args[0]) ?? 0)
  },
  bodyMetricDelta(args, options, context) {
    const metricKey = toStringValue(args[0])
    const lookbackDays = typeof options.lookbackDays === 'number' ? options.lookbackDays : 90
    const cutoff = Date.now() - lookbackDays * DAY_MS
    const series = buildBodyMetricSeries(
      context.params.bodyStatsEntries,
      context.params.fitnessProfile,
      metricKey as 'bodyFatPercentage' | 'leanMassKg' | 'weightKg' | 'bmi',
    ).filter((point) => toDate(point.date).getTime() >= cutoff)

    return getSeriesDelta(series)
  },
  bodyStatCount(_args, _options, context) {
    return context.params.bodyStatsEntries.length
  },
  divide(args) {
    const dividend = toNumber(args[0])
    const divisor = toNumber(args[1])

    if (dividend === null || divisor === null || divisor === 0) {
      return null
    }

    return dividend / divisor
  },
  exerciseDetails(args) {
    const exercises = Array.isArray(args[0]) ? args[0] : []
    const mode = toStringValue(args[1])

    return exercises
      .filter(isRecord)
      .map((exercise) => {
        const name = toStringValue(exercise.exerciseName)
        const sampleCount = toNumber(exercise.sampleCount) ?? 0
        const coefficient = toNumber(exercise.coefficient) ?? 0
        const prefix =
          mode === 'regression'
            ? `coefficient ${formatSigned(coefficient * 100, 0)}%`
            : `coefficient ${formatSigned(coefficient * 100, 0)}%`
        return `${name}: ${prefix} across ${sampleCount} logs.`
      })
  },
  exerciseNames(args) {
    const exercises = Array.isArray(args[0]) ? args[0] : []
    return joinLabels(
      exercises
        .filter(isRecord)
        .map((exercise) => exercise.exerciseName),
    )
  },
  exerciseSubset(_args, options, context) {
    const modeValue = toStringValue(options.mode)
    const mode =
      modeValue === 'progressing'
        ? 'progressing'
        : modeValue === 'regression'
          ? 'regression'
          : 'stalled'
    return buildExerciseSubset(context.params, mode, options)
  },
  formatNumber(args, options) {
    const value = toNumber(args[0])
    const digits = typeof options.digits === 'number' ? options.digits : 1
    return value === null ? 'N/A' : formatNumber(value, digits)
  },
  formatSigned(args, options) {
    const value = toNumber(args[0])
    const digits = typeof options.digits === 'number' ? options.digits : 1
    return value === null ? 'N/A' : formatSigned(value, digits)
  },
  goal(_args, _options, context) {
    return context.params.fitnessProfile.primaryGoal
  },
  isAre(args) {
    return (toNumber(args[0]) ?? 0) === 1 ? 'is' : 'are'
  },
  joinLabels(args, options) {
    const values = Array.isArray(args[0]) ? args[0] : []
    const separator = typeof options.separator === 'string' ? options.separator : ', '
    return joinLabels(values, separator)
  },
  lastReminderAt(_args, _options, context) {
    return context.params.reminderLastSentAt ?? null
  },
  length(args) {
    const value = args[0]

    if (Array.isArray(value) || typeof value === 'string') {
      return value.length
    }

    return 0
  },
  mainProgramIsEmpty(_args, _options, context) {
    return context.params.mainProgram.sections.length === 0
  },
  reminderEnabled(_args, _options, context) {
    return context.params.reminderEnabled === true
  },
  multiply(args) {
    const left = toNumber(args[0])
    const right = toNumber(args[1])
    return left === null || right === null ? null : left * right
  },
  notificationPermission(_args, _options, context) {
    return context.params.notificationPermission ?? 'unsupported'
  },
  plannedSessionsPerWeek(_args, _options, context) {
    return derivePlannedSessionsPerWeek(
      context.params.mainProgram,
      context.params.fitnessProfile.weeklyWorkoutTarget,
    )
  },
  programCompletionAverage(_args, options, context) {
    const lookbackSessions =
      typeof options.lookbackSessions === 'number' ? options.lookbackSessions : 6
    const points = buildAllProgramSessionPoints(context.params).slice(-lookbackSessions)

    if (!points.length) {
      return null
    }

    return points.reduce((total, point) => total + point.completionRatio, 0) / points.length
  },
  programSessionCount(_args, _options, context) {
    return buildAllProgramSessionPoints(context.params).length
  },
  recentWeeklySessionCount(_args, options, context) {
    const lookbackWeeks = typeof options.lookbackWeeks === 'number' ? options.lookbackWeeks : 6
    const weeklyBars = buildWeeklyFrequency(
      buildProgramSessionPoints(
        context.params.mainProgram.id,
        context.params.programDayLogs,
        context.params.workoutLogs,
        '90d',
      ),
    )
    return weeklyBars.slice(-lookbackWeeks).length
  },
  round(args, options) {
    const value = toNumber(args[0])
    const digits = typeof options.digits === 'number' ? options.digits : 0

    if (value === null) {
      return null
    }

    const factor = 10 ** digits
    return Math.round(value * factor) / factor
  },
  weeklySessionAverage(_args, options, context) {
    const lookbackWeeks = typeof options.lookbackWeeks === 'number' ? options.lookbackWeeks : 6
    const weeklyBars = buildWeeklyFrequency(
      buildProgramSessionPoints(
        context.params.mainProgram.id,
        context.params.programDayLogs,
        context.params.workoutLogs,
        '90d',
      ),
    )
    const recentWeeks = weeklyBars.slice(-lookbackWeeks)

    if (!recentWeeks.length) {
      return 0
    }

    return recentWeeks.reduce((total, week) => total + week.sessions, 0) / recentWeeks.length
  },
  weeklySessionTotal(_args, options, context) {
    const lookbackWeeks = typeof options.lookbackWeeks === 'number' ? options.lookbackWeeks : 6
    const weeklyBars = buildWeeklyFrequency(
      buildProgramSessionPoints(
        context.params.mainProgram.id,
        context.params.programDayLogs,
        context.params.workoutLogs,
        '90d',
      ),
    )
    return weeklyBars
      .slice(-lookbackWeeks)
      .reduce((total, week) => total + week.sessions, 0)
  },
  daysSinceTimestamp(args) {
    const value = typeof args[0] === 'string' ? args[0] : null
    const result = daysSince(value)
    return Number.isFinite(result) ? result : null
  },
  daysSinceLastBodyEntry(_args, _options, context) {
    const latestEntry = [...context.params.bodyStatsEntries]
      .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt))[0]
    const result = daysSince(latestEntry?.recordedAt ?? null)
    return Number.isFinite(result) ? result : null
  },
  daysSinceLastProgramSession(_args, _options, context) {
    const latestPoint = buildAllProgramSessionPoints(context.params).at(-1) ?? null
    const result = daysSince(latestPoint?.date ?? null)
    return Number.isFinite(result) ? result : null
  },
}

function resolveUnknown(
  value: unknown,
  resolveValue: (spec: RuleValueSpec) => unknown,
): unknown {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map((entry) => resolveUnknown(entry, resolveValue))
  }

  if (isRecord(value)) {
    if (
      typeof value.keyword === 'string' ||
      typeof value.var === 'string'
    ) {
      return resolveValue(value as RuleValueSpec)
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, resolveUnknown(entry, resolveValue)]),
    )
  }

  return value
}

function evaluateCondition(
  condition: RuleConditionSpec,
  resolveValue: (spec: RuleValueSpec) => unknown,
): boolean {
  if ('all' in condition) {
    return condition.all.every((entry) => evaluateCondition(entry, resolveValue))
  }

  if ('any' in condition) {
    return condition.any.some((entry) => evaluateCondition(entry, resolveValue))
  }

  if ('not' in condition) {
    return !evaluateCondition(condition.not, resolveValue)
  }

  if ('truthy' in condition) {
    return toBoolean(resolveValue(condition.truthy))
  }

  if ('falsy' in condition) {
    return !toBoolean(resolveValue(condition.falsy))
  }

  if ('eq' in condition) {
    return resolveValue(condition.eq[0]) === resolveValue(condition.eq[1])
  }

  if ('gt' in condition) {
    return (toNumber(resolveValue(condition.gt[0])) ?? Number.NEGATIVE_INFINITY) >
      (toNumber(resolveValue(condition.gt[1])) ?? Number.POSITIVE_INFINITY)
  }

  if ('gte' in condition) {
    return (toNumber(resolveValue(condition.gte[0])) ?? Number.NEGATIVE_INFINITY) >=
      (toNumber(resolveValue(condition.gte[1])) ?? Number.POSITIVE_INFINITY)
  }

  if ('lt' in condition) {
    return (toNumber(resolveValue(condition.lt[0])) ?? Number.POSITIVE_INFINITY) <
      (toNumber(resolveValue(condition.lt[1])) ?? Number.NEGATIVE_INFINITY)
  }

  if ('lte' in condition) {
    return (toNumber(resolveValue(condition.lte[0])) ?? Number.POSITIVE_INFINITY) <=
      (toNumber(resolveValue(condition.lte[1])) ?? Number.NEGATIVE_INFINITY)
  }

  if ('includes' in condition) {
    const haystack = resolveValue(condition.includes[0])
    const needle = resolveValue(condition.includes[1])

    if (Array.isArray(haystack)) {
      return haystack.includes(needle)
    }

    if (typeof haystack === 'string') {
      return haystack.includes(toStringValue(needle))
    }
  }

  return false
}

export function evaluateSuggestionRules(
  customRuleset: RulesetDefinition,
  params: SuggestionEngineParams,
) {
  const context = buildContext(params)

  return customRuleset.rules.flatMap((rule) => {
    const variableCache = new Map<string, unknown>()

    const resolveValue = (spec: RuleValueSpec): unknown => {
      if (
        spec === null ||
        typeof spec === 'boolean' ||
        typeof spec === 'number' ||
        typeof spec === 'string'
      ) {
        return spec
      }

      if ('var' in spec) {
        if (variableCache.has(spec.var)) {
          return variableCache.get(spec.var)
        }

        if (spec.var in rule.variables! && rule.variables) {
          const value = resolveValue(rule.variables[spec.var]!)
          variableCache.set(spec.var, value)
          return value
        }

        return context.baseVariables[spec.var]
      }

      const resolver = keywordResolvers[spec.keyword]

      if (!resolver) {
        return null
      }

      const args = (spec.args ?? []).map((entry) => resolveValue(entry))
      const options = isRecord(spec.options)
        ? (resolveUnknown(spec.options, resolveValue) as Record<string, unknown>)
        : {}

      return resolver(args, options, context)
    }

    if (!evaluateCondition(rule.when, resolveValue)) {
      return []
    }

    const renderedVariables = {
      ...context.baseVariables,
      ...Object.fromEntries(
        Object.keys(rule.variables ?? {}).map((key) => [key, resolveValue({ var: key })]),
      ),
    }

    return [
      {
        action: renderTemplate(rule.messages.action, renderedVariables),
        category: rule.category,
        details: (rule.details ?? []).map((detail) => renderTemplate(detail, renderedVariables)),
        id: rule.id,
        priority: rule.priority,
        summary: renderTemplate(rule.messages.summary, renderedVariables),
        title: rule.title,
        tone: rule.tone,
      } satisfies SuggestionFinding,
    ]
  })
}

export function loadSuggestionRuleset(groupId: string): RulesetDefinition {
  const group = rulesetRegistry.groups.find((entry) => entry.id === groupId)

  if (!group) {
    return {
      rules: [],
      version: 1,
    }
  }

  const groupModulePath = `../assets/suggestions/${group.file}`
  const groupIndex = rulesetModules[groupModulePath] as RulesetIndex | undefined

  if (!groupIndex?.rules?.length) {
    return {
      rules: [],
      version: groupIndex?.version ?? 1,
    }
  }

  const groupDirectory = group.file.split('/').slice(0, -1).join('/')

  return {
    rules: groupIndex.rules
      .map((file) => {
        const modulePath = `../assets/suggestions/${groupDirectory}/${file}`
        return rulesetModules[modulePath] as RuleDefinition | undefined
      })
      .filter((rule): rule is RuleDefinition => Boolean(rule?.id)),
    version: groupIndex.version,
  }
}

export function buildSuggestions(params: SuggestionEngineParams) {
  return evaluateSuggestionRules(loadSuggestionRuleset('insights'), params).sort(
    (left, right) => right.priority - left.priority,
  )
}
