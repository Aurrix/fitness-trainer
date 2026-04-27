import { useState } from 'react'
import BottomSheet from './BottomSheet'

type WorkoutTargetBadgeProps = {
  duration?: string
  effort: string
  mode: 'horizontal' | 'vertical'
  reps?: string
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

function buildTokens({
  duration,
  effort,
  reps,
  sets,
  type,
}: Omit<WorkoutTargetBadgeProps, 'mode' | 'title'>) {
  const normalizedType = type?.trim().toLowerCase()
  const normalizedEffort = effort.trim()
  const normalizedDuration = duration?.trim() ?? ''
  const normalizedReps = reps?.trim() ?? ''
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

  return tokens
}

export default function WorkoutTargetBadge({
  duration,
  effort,
  mode,
  reps,
  sets,
  title,
  type,
}: WorkoutTargetBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const tokens = buildTokens({
    duration,
    effort,
    reps,
    sets,
    type,
  })

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
        {tokens.map((token) => (
          <span key={token.key} className="workout-target-badge__token">
            <span className="workout-target-badge__label">{token.shortLabel}</span>
            <strong>{token.detailValue}</strong>
          </span>
        ))}
      </button>

      {isOpen ? (
        <BottomSheet
          description="Compact target legend for this exercise row."
          kicker="Workout Target"
          onClose={() => setIsOpen(false)}
          title={title}
        >
          <div className="muscle-list">
            {tokens.map((token) => (
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
