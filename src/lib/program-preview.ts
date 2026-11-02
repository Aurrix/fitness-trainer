import type { ProgramExerciseRef } from './content'

export function programNote(value: unknown): string {
  if (typeof value === 'string') return value.replace(/\[object Object\]/g, '').trim()
  if (value && typeof value === 'object' && 'value' in value) return programNote(value.value)
  return ''
}
export function programExerciseTarget(exercise: ProgramExerciseRef) {
  const reps = exercise.reps.split('/').map(value => value.trim()).filter(Boolean)
  const repText = reps.length && reps.every(value => value === reps[0]) ? reps[0] : reps.join(' / ')
  const target = exercise.duration || (repText ? `${repText} reps` : 'Target not specified')
  return `${exercise.sets ? `${exercise.sets} sets · ` : ''}${target}`
}
