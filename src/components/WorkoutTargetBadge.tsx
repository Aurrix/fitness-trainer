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
  const expandedTokens =
    mode === 'vertical'
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
  const performanceTokens = expandedTokens.filter(
    (token) => getTokenColumn(token) === 'performance',
  )
  const setupTokens = expandedTokens.filter((token) => getTokenColumn(token) === 'setup')
  const shouldUseVerticalColumns =
    mode === 'vertical' && performanceTokens.length > 0 && setupTokens.length > 0

  if (!tokens.length) {
    return <span className="pill pill--subtle">Open target</span>
  }

  return (
    <>
      <button
        type="button"
        className={`workout-target-badge workout-target-badge--${mode}`}
        onClick={() => setIsOpen(true)}
      >
        {shouldUseVerticalColumns ? (
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
            {expandedTokens.map((token) => (
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
