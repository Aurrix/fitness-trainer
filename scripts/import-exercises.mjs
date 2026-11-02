import fs from 'node:fs'
import path from 'node:path'
const root = 'scripts/exercise-import'
const dir = 'src/assets/exercises'
const dry = process.argv.includes('--dry-run')
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const norm = s => slug(s).replaceAll('-', '').replaceAll('flye', 'fly').replaceAll('triceps', 'tricep')
const upstream = JSON.parse(fs.readFileSync(`${root}/upstream.json`))
const records = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'index.json').map(f => JSON.parse(fs.readFileSync(path.join(dir, f))))
const mappingPath = `${root}/mapping.json`
const mapping = fs.existsSync(mappingPath) ? JSON.parse(fs.readFileSync(mappingPath)) : {}
const muscles = {'abdominals':'abs','abductors':'glute-med','forearms':'forearm','glutes':'gluteal','hamstrings':'hamstring','lower back':'lower-back','middle back':'upper-back','shoulders':'deltoids','traps':'trapezius'}
let added = 0, enriched = 0
for (const source of upstream) {
  const candidates = records.filter(r => [r.id, r.displayLabel, ...(r.aliases ?? [])].some(n => norm(n) === norm(source.name)))
  let record = mapping[source.id] ? records.find(r => r.id === mapping[source.id]) : candidates.length === 1 ? candidates[0] : undefined
  if (!record) {
    let id = slug(source.id)
    if (records.some(r => r.id === id)) id = `fedb-${id}`
    record = {id, displayLabel:source.name, shortDescription:`${source.category} exercise targeting ${source.primaryMuscles.join(', ')}.`, aliases:[], substitutionExerciseIds:[]}
    records.push(record); added++
  } else enriched++
  mapping[source.id] = record.id
  record.aliases = [...new Set([...(record.aliases ?? []), source.name].filter(n => n !== record.displayLabel))]
  record.instructions ??= source.instructions
  record.equipment ??= source.equipment ? [source.equipment === 'body only' ? 'bodyweight' : source.equipment] : []
  record.category ??= source.category
  record.difficulty ??= source.level === 'expert' ? 'Advanced' : source.level[0].toUpperCase()+source.level.slice(1)
  for (const [key, values, factor] of [['primaryTargetMuscleGroups',source.primaryMuscles,1],['secondaryTargetMuscleGroups',source.secondaryMuscles,0.5]]) record[key] ??= values.map(m => ({muscleGroup:muscles[m] ?? m,factor}))
  record.tags = [...new Set([...(record.tags ?? []),source.force,source.mechanic].filter(Boolean))]
  if (['cardio','stretching'].includes(source.category) || /plank|\bhold\b|side bridge/i.test(source.name)) record.exerciseType ??= 'continues'
}
const write = (file, data) => {if (!dry) fs.writeFileSync(file, JSON.stringify(data,null,2)+'\n')}
for (const record of records) write(`${dir}/${record.id}.json`,record)
write(`${dir}/index.json`,{manifests:records.sort((a,b)=>a.id.localeCompare(b.id)).map(r=>({id:r.id,displayLabel:r.displayLabel,shortDescription:r.shortDescription,file:`${r.id}.json`}))})
write(mappingPath,mapping)
console.log(JSON.stringify({sourceRecords:upstream.length,added,matched:enriched,total:records.length,dryRun:dry}))
