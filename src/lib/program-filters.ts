import type { Exercise, Program } from './content'

export const programFilterOptions = {
  days: [['any', 'Any'], ...Array.from({ length: 7 }, (_, i) => [String(i + 1), String(i + 1)])],
  split: [['any', 'Any'], ['full', 'Full Body'], ['upper-lower', 'Upper / Lower'], ['ppl', 'Push / Pull / Legs'], ['body-part', 'Body Part Split'], ['hybrid', 'Hybrid'], ['other', 'Other']],
  goal: [['any', 'Any'], ['muscle', 'Build muscle'], ['strength', 'Get stronger'], ['general', 'General fitness']],
  experience: [['any', 'Any'], ['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']],
  equipment: [['any', 'Any'], ['gym', 'Gym equipment'], ['dumbbells', 'Dumbbells + bodyweight'], ['bodyweight', 'Bodyweight']],
  length: [['any', 'Any'], ['short', 'Up to 6 weeks'], ['medium', '7–12 weeks'], ['long', '13+ weeks'], ['repeat', 'Repeatable']],
} as const
export type ProgramFacets = Record<keyof typeof programFilterOptions, string>
export const emptyProgramFacets: ProgramFacets = { days: 'any', split: 'any', goal: 'any', experience: 'any', equipment: 'any', length: 'any' }
export const programFacetLabels: Record<keyof ProgramFacets, string> = { days: 'Days per week', split: 'Split type', goal: 'Goal', experience: 'Experience', equipment: 'Equipment required', length: 'Program length' }
const normalize = (text: string) => text.toLowerCase().replace(/[_/–—-]+/g, ' ')
export function getProgramSchedule(program: Program) {
  const weeks = new Map<number, number>()
  for (const section of program.sections) if (!section.optional) weeks.set(section.weekIndex || 1, (weeks.get(section.weekIndex || 1) ?? 0) + 1)
  const days = [...new Set(weeks.values())].sort((a, b) => a - b)
  return { days, label: days.length ? `${days.join('–')} days / week` : 'Schedule not specified' }
}
export function getProgramSplit(program: Program) {
  const name = normalize([program.name, ...program.tags].join(' '))
  const sections = normalize(program.sections.map(s => s.shortName || s.name).join(' '))
  const upperLower = /upper/.test(name) && /lower/.test(name)
  const ppl = /\bppl\b|push\s+pull\s+legs/.test(name)
  if ((ppl && upperLower) || /\bphat\b/.test(name)) return 'hybrid'
  if (ppl) return 'ppl'
  if (upperLower || /\bphul\b/.test(name)) return 'upper-lower'
  if (/full\s*body|easy strength|basic beginner|recommended routine|stronglifts|starting strength|greyskull|gzclp/.test(name)) return 'full'
  if (/body\s*part|bro split|arnold|jay cutler|shortcut to size/.test(name)) return 'body-part'
  if (/full\s*body/.test(sections)) return 'full'
  if (/upper/.test(sections) && /lower/.test(sections)) return 'upper-lower'
  if (/push/.test(sections) && /pull/.test(sections) && /legs/.test(sections)) return 'ppl'
  return 'other'
}
export function getProgramExperience(program: Program) {
  const level = normalize(program.level)
  if (/advanced|more than 3|over 3|3\+/.test(level)) return 'advanced'
  if (/intermediate|more than year|1 to 3/.test(level)) return 'intermediate'
  if (/beginner|novice|3 to 12|less than|0 to/.test(level)) return 'beginner'
  return 'other'
}
export function getProgramEquipment(program: Program, exercises: Map<string, Exercise>) {
  const required = new Set<string>()
  let unknown = false
  for (const slot of program.sections.filter(s => !s.optional).flatMap(s => s.exercises)) {
    const exercise = exercises.get(slot.resolvedExerciseId ?? slot.exerciseId ?? '')
    if (!exercise || !exercise.equipment.length) { unknown = true; continue }
    exercise.equipment.forEach(item => required.add(normalize(item)))
  }
  if (unknown || !required.size) return 'unknown'
  const bodyweight = (item: string) => /^(bodyweight|body weight|none|no equipment)$/.test(item)
  if ([...required].every(bodyweight)) return 'bodyweight'
  if ([...required].every(item => bodyweight(item) || /^(dumbbells?|bench|flat bench|adjustable bench)$/.test(item))) return 'dumbbells'
  return 'gym'
}
export function matchesProgramFacets(program: Program, facets: ProgramFacets, exercises: Map<string, Exercise>) {
  if (facets.days !== 'any' && !getProgramSchedule(program).days.includes(Number(facets.days))) return false
  if (facets.split !== 'any' && getProgramSplit(program) !== facets.split) return false
  if (facets.experience !== 'any' && getProgramExperience(program) !== facets.experience) return false
  const goal = normalize(program.goal)
  if (facets.goal === 'muscle' && !/hypertrophy|muscle|bodybuilding/.test(goal)) return false
  if (facets.goal === 'strength' && !/strength|power/.test(goal)) return false
  if (facets.goal === 'general' && !/general|fitness|endurance|conditioning/.test(goal)) return false
  const repeatable = /repeat|ongoing|indefinite/.test(program.duration.toLowerCase())
  const durationWeeks = Number(program.duration.match(/(\d+)\s*weeks?/i)?.[1]) || 0
  if (facets.length === 'repeat' && !repeatable) return false
  if (facets.length !== 'any' && facets.length !== 'repeat') {
    if (repeatable || !durationWeeks) return false
    if (facets.length === 'short' && durationWeeks > 6) return false
    if (facets.length === 'medium' && (durationWeeks < 7 || durationWeeks > 12)) return false
    if (facets.length === 'long' && durationWeeks < 13) return false
  }
  if (facets.equipment !== 'any') {
    const equipment = getProgramEquipment(program, exercises)
    if (facets.equipment === 'gym' ? equipment !== 'gym' : facets.equipment === 'bodyweight' ? equipment !== 'bodyweight' : !['dumbbells', 'bodyweight'].includes(equipment)) return false
  }
  return true
}
