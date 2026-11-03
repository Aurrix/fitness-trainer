import { build } from 'esbuild'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const bundle = await build({ stdin: { contents: `export * from './src/lib/program-filters.ts'; export * from './src/lib/muscles.ts'; export * from './src/lib/program-preview.ts'`, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, platform: 'node', format: 'esm', write: false })
const M = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`)
const native = id => {const p = JSON.parse(fs.readFileSync(`src/assets/programms/${id}.json`));return { ...p, name: p.displayLabel, sections: p.engine.sections }}
const upper = native('upper-lower-intermediate'), full = native('fundamentals-full-body'), hybrid = native('push-pull-legs-upper-lower')
assert.deepEqual(M.getProgramSchedule(upper).days, [4])
assert.equal(M.getProgramSplit(upper), 'upper-lower')
assert.equal(M.getProgramSplit(full), 'full')
assert.equal(M.getProgramSplit(hybrid), 'hybrid')
assert.equal(M.getProgramSplit(native('phat-5-day-power-hypertrophy')), 'hybrid')
assert.equal(M.getProgramSplit(native('torso-limbs-hypertrophy')), 'other')
assert.ok(M.matchesProgramFacets(upper, { ...M.emptyProgramFacets, days: '4', split: 'upper-lower', length: 'medium' }, new Map()))
assert.ok(!M.matchesProgramFacets(upper, { ...M.emptyProgramFacets, days: '7' }, new Map()))
assert.equal(M.getProgramExperience(native('phul')), 'beginner')
assert.equal(M.getProgramExperience({ level: 'more_than_year' }), 'intermediate')
const slot = (id, sets) => ({exerciseId: id, exerciseName: id, sets})
const exercise = (id, muscle, secondary = [], equipment = ['barbell']) => ({id, name:id, exerciseKey:id, equipment, muscleGroups:[muscle],primaryTargetMuscleGroups:[{muscleGroup:muscle,factor:1}],secondaryTargetMuscleGroups:secondary.map(muscleGroup=>({muscleGroup,factor:.5}))})
const bench = exercise('bench', 'middle-chest', ['upper-chest','triceps'])
const curl = exercise('curl', 'biceps')
const sections = [{exercises:[slot('bench','10'),slot('curl','2–4')]},{exercises:[slot('bench','3'),slot('bench','2')]}]
const coverage = M.buildProgramCoverage(sections, [bench,curl])
const chest = coverage.rows.find(row=>row.slug==='chest')
assert.equal(chest.exercises,3) // Two chest subregions still count once per slot.
assert.equal(chest.sessions,2) // Two slots in one session still count once.
assert.equal(chest.setsMin,15) // Ten-set plans must not be clamped to eight.
assert.equal(coverage.rows.find(row=>row.slug==='biceps').setsMax,4)
assert.ok(!M.buildProgramCoverage(sections,[bench,curl],true).rows.some(row=>row.slug==='triceps'))
const optional = {...upper,sections:[...upper.sections,{weekIndex:1,optional:true,exercises:[]}]}
assert.deepEqual(M.getProgramSchedule(optional).days,[4])
const body = exercise('pushup','chest',[],['bodyweight'])
assert.equal(M.getProgramEquipment({sections:[{exercises:[slot('pushup','3')]}]},new Map([['pushup',body]])),'bodyweight')
assert.equal(M.getProgramEquipment({sections:[{exercises:[slot('missing','3')]}]},new Map()),'unknown')
assert.equal(M.buildProgramCoverage([{exercises:[slot('missing','AMRAP')]}],[]).unmappedExercises,1)
console.log('Passed weekly schedules, split/experience/duration filters, equipment requirements, muscle deduplication, set ranges, session frequency, and primary-target counts.')

const { exerciseDescription } = await import('../public/engine/descriptions.mjs')
assert.equal(exerciseDescription({ descriptions: { values: [{ value: 'Old note', isCurrent: false }, { value: 'Use 70% of 1RM', isCurrent: true }] } }), 'Use 70% of 1RM')
assert.equal(exerciseDescription({ descriptions: { reuse: { exercise: { descriptions: { values: [{ value: 'Inherited cue' }] } } } } }), 'Inherited cue')
assert.equal(M.programExerciseTarget({ sets: '3', reps: '8/8/8', duration: '' }), '3 sets · 8 reps')
assert.equal(M.programExerciseTarget({ sets: '2', reps: '', duration: '30 sec' }), '2 sets · 30 sec')
assert.equal(M.programNote({ value: 'Keep a controlled tempo' }), 'Keep a controlled tempo')
for (const file of fs.readdirSync('src/assets/programms').filter(file => file.endsWith('.json'))) assert.ok(!fs.readFileSync('src/assets/programms/' + file, 'utf8').includes('[object Object]'), file)
assert.ok(native('high-frequency-full-body').engine.sections.some(section => section.exercises.some(exercise => /%/.test(exercise.notes))))
console.log('Passed structured/inherited descriptions, compact rep targets, and repaired catalog regression checks.')

assert.equal(M.formatCoverageMetric(chest, 'sets', 2), '15 sets')
assert.equal(M.formatCoverageMetric(chest, 'exercises', 2), '3 exercise slots')
assert.equal(M.formatCoverageMetric(chest, 'sessions', 2), '2 / 2 sessions')
assert.equal(M.buildCoverageMuscleProfile([chest], 'sets').muscles[0].count, 15)
assert.equal(M.buildCoverageMuscleProfile([chest], 'exercises').muscles[0].count, 3)
assert.equal(M.buildCoverageMuscleProfile([chest], 'sessions').muscles[0].count, 2)
console.log('Passed distinct selected-metric values, units, and map scores.')
