import { useState } from 'react'
import BottomSheet from './BottomSheet'

export type WorkoutTargetBadgeInsight = {
  detailLabel: string
  detailValue: string
  key: string
  shortLabel: string
}

type WorkoutTargetBadgeProps = {
  benchmarkAverages?: WorkoutTargetBadgeInsight[]
  duration?: string
  effort: string
  mode: 'horizontal' | 'vertical'
  personalAverages?: WorkoutTargetBadgeInsight[]
  reps?: string
  rest?: string
  sets?: number
  title: string
  type?: string | null
}

type TargetToken = {
  detailLabel: string
  detailValue: string
  key: string
  shortLabel: string
}

type TargetMetricKey = 'duration' | 'effort' | 'reps' | 'rest' | 'sets' | 'weight'

type TargetMetricRow = {
  benchmark: TargetToken | null
  key: TargetMetricKey
  label: string
  personal: TargetToken | null
  target: TargetToken | null
}

const targetMetricOrder: TargetMetricKey[] = [
  'sets',
  'reps',
  'weight',
  'duration',
  'effort',
  'rest',
]

const targetMetricLabels: Record<TargetMetricKey, string> = {
  duration: 'Time',
  effort: 'Effort',
  reps: 'Reps',
  rest: 'Rest',
  sets: 'Sets',
  weight: 'Weight',
}

function getTokenMetricKey(token: TargetToken): TargetMetricKey {
  const normalizedKey = token.key.toLowerCase()
  const normalizedLabel = `${token.shortLabel} ${token.detailLabel}`.toLowerCase()
  const searchableValue = `${normalizedKey} ${normalizedLabel}`

  if (
    searchableValue.includes('duration') ||
    searchableValue.includes('hold') ||
    searchableValue.includes('time')
  ) {
    return 'duration'
  }

  if (
    searchableValue.includes('assistance') ||
    searchableValue.includes('load') ||
    searchableValue.includes('weight') ||
    searchableValue.includes('kg')
  ) {
    return 'weight'
  }

  if (searchableValue.includes('reps')) {
    return 'reps'
  }

  if (searchableValue.includes('sets')) {
    return 'sets'
  }

  if (searchableValue.includes('rest')) {
    return 'rest'
  }

  return 'effort'
}

function getTokenColumn(token: TargetToken) {
  const normalizedKey = token.key.toLowerCase()

  return normalizedKey.includes('duration') ||
    normalizedKey.includes('assistance') ||
    normalizedKey.includes('hold') ||
    normalizedKey.includes('load') ||
    normalizedKey.includes('reps') ||
    normalizedKey.includes('weight')
    ? 'performance'
    : 'setup'
}

function buildTokens({
  duration,
  effort,
  reps,
  rest,
  sets,
  type,
}: Omit<WorkoutTargetBadgeProps, 'mode' | 'title'>) {
  const normalizedType = type?.trim().toLowerCase()
  const normalizedEffort = effort.trim()
  const normalizedDuration = duration?.trim() ?? ''
  const normalizedReps = reps?.trim() ?? ''
  const normalizedRest = rest?.trim() ?? ''
  const tokens: TargetToken[] = []

  if (normalizedType === 'continues') {
    if (normalizedDuration) {
      tokens.push({
        detailLabel: 'Target duration',
        detailValue: normalizedDuration,
        key: 'duration',
        shortLabel: 'T',
      })
    }

    if (normalizedEffort) {
      tokens.push({
        detailLabel: 'Target effort',
        detailValue: normalizedEffort,
        key: 'effort',
        shortLabel: 'E',
      })
    }

    if (normalizedRest) {
      tokens.push({
        detailLabel: 'Target rest',
        detailValue: normalizedRest,
        key: 'rest',
        shortLabel: 'Rest',
      })
    }

    return tokens
  }

  if (typeof sets === 'number' && sets > 0) {
    tokens.push({
      detailLabel: 'Target sets',
      detailValue: String(sets),
      key: 'sets',
      shortLabel: 'S',
    })
  }

  if (normalizedReps) {
    tokens.push({
      detailLabel: 'Target reps',
      detailValue: normalizedReps,
      key: 'reps',
      shortLabel: 'R',
    })
  }

  if (normalizedEffort) {
    tokens.push({
      detailLabel: 'Target effort',
      detailValue: normalizedEffort,
      key: 'effort',
      shortLabel: 'E',
    })
  }

  if (normalizedRest) {
    tokens.push({
      detailLabel: 'Target rest',
      detailValue: normalizedRest,
      key: 'rest',
      shortLabel: 'Rest',
    })
  }

  return tokens
}

function findTokenByMetric(tokens: TargetToken[], metricKey: TargetMetricKey) {
  return tokens.find((token) => getTokenMetricKey(token) === metricKey) ?? null
}

function buildTargetMetricRows({
  benchmarkAverages,
  personalAverages,
  targets,
}: {
  benchmarkAverages: TargetToken[]
  personalAverages: TargetToken[]
  targets: TargetToken[]
}) {
  return targetMetricOrder
    .map<TargetMetricRow>((metricKey) => ({
      benchmark: findTokenByMetric(benchmarkAverages, metricKey),
      key: metricKey,
      label: targetMetricLabels[metricKey],
      personal: findTokenByMetric(personalAverages, metricKey),
      target: findTokenByMetric(targets, metricKey),
    }))
    .filter((row) => row.benchmark || row.personal || row.target)
}

function renderMetricColumnValue(token: TargetToken | null) {
  return token ? <strong>{token.detailValue}</strong> : <span>-</span>
}

export default function WorkoutTargetBadge({
  benchmarkAverages = [],
  duration,
  effort,
  mode,
  personalAverages = [],
  reps,
  rest,
  sets,
  title,
  type,
}: WorkoutTargetBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const tokens = buildTokens({
    duration,
    effort,
    reps,
    rest,
    sets,
    type,
  })
  const shouldUseAverageColumns =
    mode === 'vertical' && (benchmarkAverages.length > 0 || personalAverages.length > 0)
  const metricRows = shouldUseAverageColumns
    ? buildTargetMetricRows({
        benchmarkAverages,
        personalAverages,
        targets: tokens,
      })
    : []
  const averageColumnCount =
    1 +
    (benchmarkAverages.length > 0 ? 1 : 0) +
    (personalAverages.length > 0 ? 1 : 0)
  const expandedTokens =
    mode === 'vertical' && !shouldUseAverageColumns
      ? [
          ...tokens,
          ...personalAverages.map((token) => ({
            ...token,
            key: `personal-${token.key}`,
          })),
          ...benchmarkAverages.map((token) => ({
            ...token,
            key: `benchmark-${token.key}`,
          })),
        ]
      : tokens
  const detailTokens = shouldUseAverageColumns
    ? metricRows.flatMap((row) => [
        ...(row.benchmark
          ? [
              {
                ...row.benchmark,
                detailLabel: `Average ${row.label.toLowerCase()}`,
                key: `detail-average-${row.key}`,
              },
            ]
          : []),
        ...(row.personal
          ? [
              {
                ...row.personal,
                detailLabel: `Your ${row.label.toLowerCase()}`,
                key: `detail-personal-${row.key}`,
              },
            ]
          : []),
        ...(row.target
          ? [
              {
                ...row.target,
                detailLabel: `Program ${row.label.toLowerCase()}`,
                key: `detail-target-${row.key}`,
              },
            ]
          : []),
      ])
    : expandedTokens
  const performanceTokens = expandedTokens.filter(
    (token) => getTokenColumn(token) === 'performance',
  )
  const setupTokens = expandedTokens.filter((token) => getTokenColumn(token) === 'setup')
  const shouldUseVerticalColumns =
    !shouldUseAverageColumns &&
    mode === 'vertical' &&
    performanceTokens.length > 0 &&
    setupTokens.length > 0

  if (!tokens.length) {
    return <span className="pill pill--subtle">Open target</span>
  }

  return (
    <>
      <button
        type="button"
        className={[
          'workout-target-badge',
          `workout-target-badge--${mode}`,
          shouldUseAverageColumns ? 'workout-target-badge--matrix' : '',
          shouldUseAverageColumns
            ? `workout-target-badge--columns-${averageColumnCount}`
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => setIsOpen(true)}
      >
        {shouldUseAverageColumns ? (
          <>
            {benchmarkAverages.length ? (
              <span className="workout-target-badge__column">
                <span className="workout-target-badge__column-heading">Avg</span>
                {metricRows.map((row) => (
                  <span key={`benchmark-${row.key}`} className="workout-target-badge__token">
                    <span className="workout-target-badge__label">{row.label}</span>
                    {renderMetricColumnValue(row.benchmark)}
                  </span>
                ))}
              </span>
            ) : null}
            {personalAverages.length ? (
              <span className="workout-target-badge__column">
                <span className="workout-target-badge__column-heading">You</span>
                {metricRows.map((row) => (
                  <span key={`personal-${row.key}`} className="workout-target-badge__token">
                    <span className="workout-target-badge__label">{row.label}</span>
                    {renderMetricColumnValue(row.personal)}
                  </span>
                ))}
              </span>
            ) : null}
            <span className="workout-target-badge__column">
              <span className="workout-target-badge__column-heading">Program</span>
              {metricRows.map((row) => (
                <span key={`target-${row.key}`} className="workout-target-badge__token">
                  <span className="workout-target-badge__label">{row.label}</span>
                  {renderMetricColumnValue(row.target)}
                </span>
              ))}
            </span>
          </>
        ) : shouldUseVerticalColumns ? (
          <>
            <span className="workout-target-badge__column">
              {performanceTokens.map((token) => (
                <span key={token.key} className="workout-target-badge__token">
                  <span className="workout-target-badge__label">{token.shortLabel}</span>
                  <strong>{token.detailValue}</strong>
                </span>
              ))}
            </span>
            <span className="workout-target-badge__column">
              {setupTokens.map((token) => (
                <span key={token.key} className="workout-target-badge__token">
                  <span className="workout-target-badge__label">{token.shortLabel}</span>
                  <strong>{token.detailValue}</strong>
                </span>
              ))}
            </span>
          </>
        ) : (
          expandedTokens.map((token) => (
            <span key={token.key} className="workout-target-badge__token">
              <span className="workout-target-badge__label">{token.shortLabel}</span>
              <strong>{token.detailValue}</strong>
            </span>
          ))
        )}
      </button>

      {isOpen ? (
        <BottomSheet
          description="Compact target legend for this exercise row."
          kicker="Workout Target"
          onClose={() => setIsOpen(false)}
          title={title}
        >
          <div className="muscle-list">
            {detailTokens.map((token) => (
              <div key={token.key} className="muscle-row">
                <span>{token.detailLabel}</span>
                <strong>{token.detailValue}</strong>
              </div>
            ))}
          </div>
        </BottomSheet>
      ) : null}
    </>
  )
}
