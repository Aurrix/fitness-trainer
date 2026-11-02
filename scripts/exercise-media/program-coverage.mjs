import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const roots = ['remaining', 'next-50', 'first-10'].map(name => `.exercise-media-references/${name}`)

export function programCoverage() {
  const catalog = new Map(read('src/assets/exercises/index.json').manifests.map(e => [e.id, e]))
  const media = read('src/assets/exercise-media/index.json')
  const usage = new Map()
  const programs = []
  function collect(value, ids) {
    if (Array.isArray(value)) { for (const item of value) collect(item, ids); return }
    if (!value || typeof value !== 'object') return
    if (typeof value.exerciseId === 'string' && value.exerciseId) {
      ids.add(value.resolvedExerciseId || value.exerciseId)
    }
    for (const item of Object.values(value)) collect(item, ids)
  }
  function available(id) {
    const entry = media[id]
    if (!entry?.video || !entry?.poster) return false
    if (!fs.existsSync('public/' + entry.video) || !fs.existsSync('public/' + entry.poster)) return false
    const version = entry.video.match(/\/(video-v[1-9]\d*)\//)?.[1]
    if (version) for (const root of roots) {
      const file = `${root}/${id}/${version}/review.json`
      if (fs.existsSync(file) && ['rejected', 'revision-required'].includes(read(file).status)) return false
    }
    return true
  }
  for (const manifest of read('src/assets/programms/index.json').manifests) {
    const file = 'src/assets/programms/' + manifest.file
    const ids = new Set()
    collect(read(file), ids)
    const exerciseIds = [...ids].sort()
    const missingIds = exerciseIds.filter(id => !catalog.has(id) || !available(id))
    programs.push({id: manifest.id, name: manifest.displayLabel, file,
      total: ids.size, covered: ids.size - missingIds.length, missing: missingIds.length,
      complete: missingIds.length === 0, exerciseIds, missingIds})
    for (const id of ids) {
      if (!usage.has(id)) usage.set(id, [])
      usage.get(id).push(manifest.id)
    }
  }
  const exercises = [...usage].map(([id, programIds]) => ({
    id, name: catalog.get(id)?.displayLabel ?? id, programCount: programIds.length,
    programIds, known: catalog.has(id), covered: catalog.has(id) && available(id),
  })).sort((a, b) => b.programCount - a.programCount || a.id.localeCompare(b.id))
  const missing = exercises.filter(e => !e.covered)
  return {checkedAt: new Date().toISOString(), programs: programs.length,
    programsCovered: programs.filter(p => p.complete).length,
    uniqueExercises: exercises.length, covered: exercises.length - missing.length,
    missing: missing.length, unknownIds: exercises.filter(e => !e.known).map(e => e.id),
    complete: missing.length === 0 && programs.length > 0,
    missingIds: missing.map(e => e.id), exercises, programCoverage: programs}
}

// Recompute from current program files and actual app assets on every selection.
// The frozen reference inventory and provenance order remain unchanged.
export function prioritizeProgramExercises(entries) {
  const report = programCoverage()
  const ranks = new Map(report.missingIds.map((id, rank) => [id, rank]))
  return [...entries].sort((a, b) =>
    (ranks.get(a.id) ?? Infinity) - (ranks.get(b.id) ?? Infinity) || a.order - b.order)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = programCoverage()
  if (process.argv.includes('--write')) {
    fs.mkdirSync('.exercise-media-references', {recursive: true})
    fs.writeFileSync('.exercise-media-references/program-coverage.json', JSON.stringify(report, null, 2) + '\n')
  }
  console.log(JSON.stringify(process.argv.includes('--details') ? report : {
    programs: report.programs, programsCovered: report.programsCovered,
    uniqueExercises: report.uniqueExercises, covered: report.covered, missing: report.missing,
    unknownIds: report.unknownIds, complete: report.complete,
    next: report.exercises.filter(e => !e.covered).slice(0, 10).map(({id, programCount}) => ({id, programCount})),
  }))
}
