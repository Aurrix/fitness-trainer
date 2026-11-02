import type { Exercise } from './content'

// Content records are immutable; cache normalized text without retaining removed records.
const searchTextCache = new WeakMap<Exercise, string>()

export function normalizeExerciseSearch(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export function matchesExerciseSearch(exercise: Exercise, query: string) {
  const tokens = normalizeExerciseSearch(query).split(/\s+/).filter(Boolean)
  if (!tokens.length) return true

  let text = searchTextCache.get(exercise)
  if (text === undefined) {
    text = normalizeExerciseSearch([
      exercise.name, ...exercise.aliases, exercise.description, exercise.category,
      exercise.difficulty, ...exercise.tags, ...exercise.muscleGroups, ...exercise.equipment,
    ].join(' '))
    searchTextCache.set(exercise, text)
  }
  return tokens.every(token => text.includes(token))
}
