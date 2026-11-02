import { build } from 'esbuild'
import assert from 'node:assert/strict'
const bundle = await build({ entryPoints: ['src/lib/exercise-performance.ts'], bundle: true, platform: 'node', format: 'esm', write: false })
const { exerciseSessionSummary, exerciseHistory, findExercisePerformance } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`)
const set = (weightKg, reps, durationMinutes = null) => ({ weightKg, reps, durationMinutes })
const sample = { skipped: false, sets: [set(60, 8), set(65, 5), set(60, 10)], maxWeightKg: 65, totalReps: 23, totalDurationMinutes: null }
assert.equal(exerciseSessionSummary(sample), '65 kg × 5 reps') // Never pair a maximum load with reps from another set.
assert.equal(exerciseSessionSummary({ ...sample, sets: [], maxWeightKg: 65 }), '65 kg top load')
assert.equal(exerciseSessionSummary({ ...sample, sets: [set(0, 15)], maxWeightKg: 0 }), '15 reps')
assert.equal(exerciseSessionSummary({ ...sample, sets: [set(null, null, 2.5)], maxWeightKg: null }), '2.5 min')
assert.equal(exerciseSessionSummary({ ...sample, skipped: true }), 'Skipped')
const history = [{ recordedAt: '2026-10-01' }, { recordedAt: '2026-10-29' }]
assert.equal(exerciseHistory({ progressionHistory: history })[0].recordedAt, '2026-10-29')
assert.equal(history[0].recordedAt, '2026-10-01')
const record = { exerciseId: 'bench', exerciseName: 'Bench press', progressionHistory: history }
assert.equal(findExercisePerformance({ byExerciseKey: { bench: record } }, 'bench', 'Other name'), record)
assert.equal(findExercisePerformance({ byExerciseKey: { legacy: record } }, 'unknown', 'Bench Press'), record)
assert.equal(findExercisePerformance({ byExerciseKey: {} }, 'bench', 'Bench press'), null)
console.log('Passed actual-set summaries, aggregate-only history, bodyweight, duration, skipped sessions, ordering, and identity lookup.')
