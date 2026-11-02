/** Read planner description text without coercing structured values into strings. */
export function descriptionText(value) {
  if (typeof value === 'string') return value.replace(/\[object Object\]/g, '').trim()
  if (value && typeof value === 'object') return descriptionText(value.value ?? value.text)
  return ''
}
export function exerciseDescription(exercise) {
  const visited = new Set()
  while (exercise && !visited.has(exercise)) {
    visited.add(exercise)
    const values = exercise.descriptions?.values ?? []
    if (values.length) return descriptionText(values.find(value => value.isCurrent) ?? values[0])
    exercise = exercise.descriptions?.reuse?.exercise
  }
  return ''
}
