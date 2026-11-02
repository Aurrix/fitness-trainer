import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {programCoverage, prioritizeProgramExercises} from './program-coverage.mjs'

test('audits every program, deduplicates snapshots and prioritizes real delivery gaps', () => {
  const previous = process.cwd(), directory = fs.mkdtempSync(path.join(os.tmpdir(), 'program-media-'))
  const write = (file, value) => {
    fs.mkdirSync(path.dirname(file), {recursive: true})
    fs.writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value))
  }
  try {
    process.chdir(directory)
    write('src/assets/exercises/index.json', {manifests: ['a', 'b', 'c', 'd'].map(id => ({id, displayLabel: id}))})
    write('src/assets/programms/index.json', {manifests: [{id: 'one', file: 'one.json'}, {id: 'two', file: 'two.json'}]})
    write('src/assets/programms/one.json', {weeks: [{exerciseId: 'a'}, {exerciseId: 'a'}, {exerciseId: 'b'}, {exerciseId: 'c'}]})
    write('src/assets/programms/two.json', {native: {days: [{exerciseId: 'old-alias', resolvedExerciseId: 'a'}, {exerciseId: 'd'}, {exerciseId: 'unknown'}]}})
    const media = Object.fromEntries(['a', 'c', 'd'].map(id => [id, {
      video: `exercise-media/${id}/video-v1/demo.mp4`, poster: `exercise-media/${id}/video-v1/poster.webp`,
    }]))
    write('src/assets/exercise-media/index.json', media)
    for (const id of ['a', 'c', 'd']) write('public/' + media[id].video, 'video')
    for (const id of ['a', 'c']) write('public/' + media[id].poster, 'poster')
    write('.exercise-media-references/remaining/a/video-v1/review.json', {status: 'revision-required'})
    let report = programCoverage()
    assert.equal(report.programs, 2)
    assert.equal(report.uniqueExercises, 5)
    assert.equal(report.covered, 1)
    assert.equal(report.exercises.find(e => e.id === 'a').programCount, 2)
    assert.deepEqual(report.unknownIds, ['unknown'])
    assert.deepEqual(report.programCoverage.map(p => p.missing), [2, 3])
    assert.deepEqual(prioritizeProgramExercises([
      {id: 'library-only', order: 1}, {id: 'd', order: 2}, {id: 'b', order: 3}, {id: 'a', order: 4},
    ]).map(e => e.id), ['a', 'b', 'd', 'library-only'])
    write('.exercise-media-references/remaining/a/video-v1/review.json', {status: 'draft-needs-review'})
    report = programCoverage()
    assert.equal(report.covered, 2)
    assert.equal(report.complete, false)
    write('src/assets/programms/one.json', {items: [{exerciseId: 'a'}, {exerciseId: 'c'}]})
    write('src/assets/programms/two.json', {items: [{exerciseId: 'a'}]})
    report = programCoverage()
    assert.equal(report.complete, true)
    assert.equal(report.programsCovered, 2)
  } finally {
    process.chdir(previous)
    fs.rmSync(directory, {recursive: true, force: true})
  }
})
