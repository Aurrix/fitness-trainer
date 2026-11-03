import fs from 'node:fs'
import * as E from '../../tests/reference/program.mjs'
import { exerciseDescription } from '../../public/engine/descriptions.mjs'
let repaired = 0
for (const file of fs.readdirSync('src/assets/programms').filter(file => file.endsWith('.json') && file !== 'index.json')) {
  const path = `src/assets/programms/${file}`, program = JSON.parse(fs.readFileSync(path, 'utf8'))
  if (!program.engine || !JSON.stringify(program).includes('[object Object]')) continue
  const settings = E.Settings_build('kg')
  settings.exercises = program.engine.customExercises ?? {}
  const compiled = { ...E.Program_create(program.displayLabel, program.id), planner: { vtype: 'planner', name: program.displayLabel, weeks: E.PlannerProgram_evaluateText(program.engine.source) } }
  const evaluated = E.Program_forceEvaluate(compiled, settings)
  if (evaluated.errors.length) throw Error(JSON.stringify(evaluated.errors))
  const days = evaluated.weeks.flatMap(week => week.days), notes = new Map()
  for (const [index, section] of program.engine.sections.entries()) {
    const day = days[(section.engineDay ?? index + 1) - 1]
    for (const slot of section.exercises) {
      if (slot.notes?.includes('[object Object]')) slot.notes = exerciseDescription(day?.exercises.find(exercise => exercise.key === slot.engineKey))
      notes.set(slot.id, slot.notes)
    }
  }
  function repair(value) {
    if (!value || typeof value !== 'object') return
    if (typeof value.notes === 'string' && value.notes.includes('[object Object]')) {
      if (!notes.has(value.id)) throw Error(`Unresolved notes: ${file} ${value.id}`)
      value.notes = notes.get(value.id)
    }
    Object.values(value).forEach(repair)
  }
  repair(program)
  if (JSON.stringify(program).includes('[object Object]')) throw Error(`Unresolved structured description in ${file}`)
  fs.writeFileSync(path, JSON.stringify(program, null, 2) + '\n')
  repaired++
}
console.log(`Repaired descriptions in ${repaired} programs.`)
