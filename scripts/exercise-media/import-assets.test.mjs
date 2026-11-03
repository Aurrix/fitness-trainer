import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {execFileSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'

test('imports wait for inspection while legacy drafts and valid replacements remain usable', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'media-import-'))
  const script = fileURLToPath(new URL('./import-assets.mjs', import.meta.url))
  const write = (file, value) => {
    const destination = path.join(directory, file)
    fs.mkdirSync(path.dirname(destination), {recursive: true})
    fs.writeFileSync(destination, typeof value === 'string' ? value : JSON.stringify(value))
  }
  const mapping = (id, version) => ({video: `exercise-media/${id}/${version}/demo.mp4`, poster: `exercise-media/${id}/${version}/poster.webp`})
  const review = (id, version, inspected, status = 'draft-needs-review') =>
    write(`.exercise-media-references/remaining/${id}/${version}/review.json`, {status, sourceSheetInspected: inspected})
  const exported = (id, version, inspected, status) => {
    const base = `.exercise-media-references/remaining/${id}`
    write(`${base}/job.json`, {outputVersion: version})
    write(`${base}/${version}/export.json`, {})
    write(`${base}/${version}/demo.mp4`, `${id}-${version}-video`)
    write(`${base}/${version}/poster.webp`, `${id}-${version}-poster`)
    review(id, version, inspected, status)
  }
  const run = () => {
    execFileSync(process.execPath, [script], {cwd: directory})
    return JSON.parse(fs.readFileSync(path.join(directory, 'src/assets/exercise-media/index.json')))
  }
  try {
    for (const root of ['first-10', 'next-50', 'remaining']) fs.mkdirSync(path.join(directory, '.exercise-media-references', root), {recursive: true})
    const ids = ['fresh', 'existing', 'rejected', 'ready']
    write('src/assets/exercises/index.json', {manifests: ids.map(id => ({id}))})
    write('src/assets/programms/index.json', {manifests: [{id: 'program', file: 'program.json'}]})
    write('src/assets/programms/program.json', {exercises: ids.map(exerciseId => ({exerciseId}))})
    const previous = Object.fromEntries(['existing', 'rejected'].map(id => [id, mapping(id, 'video-v1')]))
    write('src/assets/exercise-media/index.json', previous)
    for (const entry of Object.values(previous)) {
      write('public/' + entry.video, 'legacy-video')
      write('public/' + entry.poster, 'legacy-poster')
    }
    exported('fresh', 'video-v1', false)
    review('existing', 'video-v1', false)
    exported('existing', 'video-v2', false)
    review('rejected', 'video-v1', true, 'revision-required')
    exported('rejected', 'video-v2', false)
    exported('ready', 'video-v1', true)
    let result = run()
    assert.equal(result.fresh, undefined, 'an encoding that finishes mid-import must wait')
    assert.deepEqual(result.existing, previous.existing, 'keep a usable older mapping while its replacement waits')
    assert.equal(result.rejected, undefined, 'remove rejected older media even if the replacement is waiting')
    assert.deepEqual(result.ready, mapping('ready', 'video-v1'))
    assert.equal(fs.existsSync(path.join(directory, 'public/exercise-media/fresh')), false)
    for (const [id, version] of [['fresh', 'video-v1'], ['existing', 'video-v2'], ['rejected', 'video-v2']]) review(id, version, true)
    result = run()
    assert.deepEqual(result.fresh, mapping('fresh', 'video-v1'))
    assert.deepEqual(result.existing, mapping('existing', 'video-v2'))
    assert.deepEqual(result.rejected, mapping('rejected', 'video-v2'))
    assert.equal(fs.readFileSync(path.join(directory, 'public/' + result.existing.video), 'utf8'), 'existing-video-v2-video')
    const coverage = JSON.parse(fs.readFileSync(path.join(directory, '.exercise-media-references/program-coverage.json')))
    assert.equal(coverage.complete, true)
  } finally {
    fs.rmSync(directory, {recursive: true, force: true})
  }
})
