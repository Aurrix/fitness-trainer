import type { FitnessEffortScale } from './fitness-profile'
import type { Program } from './content'

export function formatRelativeDate(dateValue: string | null) {
  if (!dateValue) {
    return 'Never'
  }

  const date = new Date(dateValue)
  const today = new Date()
  const oneDay = 24 * 60 * 60 * 1000
  const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = Math.round((todayKey.getTime() - dateKey.getTime()) / oneDay)

  if (diff === 0) {
    return 'Today'
  }

  if (diff === 1) {
    return 'Yesterday'
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}

export function formatMinutes(value: number) {
  if (!value) {
    return '0 min'
  }

  if (value < 60) {
    return `${value} min`
  }

  const hours = Math.floor(value / 60)
  const minutes = value % 60

  if (!minutes) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`
}

export function countExercises(program: Program) {
  return program.sections.reduce((total, section) => {
    return total + section.exercises.length
  }, 0)
}

export function findOptionLabel<T extends string>(
  options: Array<{ label: string; value: T }>,
  value: T,
) {
  return options.find((option) => option.value === value)?.label ?? value
}

export function getTargetSetCount(value: string, fallback = 3) {
  const parsedValues = value.match(/\d+/g)?.map(Number).filter(Number.isFinite) ?? []

  if (!parsedValues.length) {
    return fallback
  }

  return Math.min(8, Math.max(1, Math.max(...parsedValues)))
}

export function formatExerciseDifficultyTarget(
  difficulty: string,
  effortScale: FitnessEffortScale,
) {
  const normalizedDifficulty = difficulty.trim().toLowerCase()

  if (!normalizedDifficulty) {
    return ''
  }

  if (normalizedDifficulty.includes('beginner') || normalizedDifficulty.includes('easy')) {
    return effortScale === 'rir'
      ? '4 RIR'
      : effortScale === 'effort'
        ? 'Easy'
        : 'RPE 6'
  }

  if (normalizedDifficulty.includes('advanced') || normalizedDifficulty.includes('hard')) {
    return effortScale === 'rir'
      ? '1 RIR'
      : effortScale === 'effort'
        ? 'Hard'
        : 'RPE 9'
  }

  return effortScale === 'rir'
    ? '2 RIR'
    : effortScale === 'effort'
      ? 'Medium'
      : 'RPE 8'
}
