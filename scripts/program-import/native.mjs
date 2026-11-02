// Rebuild original programs using only the app's own weeks/days/items and engine.
import fs from 'node:fs'
import {adapt,compile} from '../../public/engine/native.mjs'
const directory='src/assets/programms',dry=process.argv.includes('--dry-run')
let count=0
for(const file of fs.readdirSync(directory).filter(f=>f.endsWith('.json')&&f!=='index.json'&&!f.startsWith('liftosaur-'))){
 const raw=JSON.parse(fs.readFileSync(`${directory}/${file}`))
 if(raw.engine?.version!==2)throw new Error(`Convert ${raw.id} to the native format before rebuilding it.`)
 const previous=raw.engine.sections
 const sections=raw.weeks.flatMap(week=>week.days.map(day=>{
  const section=previous.find(s=>s.weekIndex===Number(week.week)&&s.dayIndex===day.day)
  if(!section)throw new Error(`Missing workout template for ${raw.id}, week ${week.week}, day ${day.day}`)
  return {...section,shortName:day.displayLabel,notes:day.notes??'',optional:day.optional??false,exercises:day.items}
 }))
 let engine
 if(sections.every(s=>s.exercises.every(e=>e.prescriptions?.length))){
  engine=compile({definition:raw.engine,source:JSON.stringify({sections,loads:raw.engine.loads})})
 }else{
  const exercises=fs.readdirSync('src/assets/exercises').filter(f=>f.endsWith('.json')&&f!=='index.json').map(f=>{const ex=JSON.parse(fs.readFileSync('src/assets/exercises/'+f));return {...ex,name:ex.displayLabel}})
  engine=adapt({program:{name:raw.displayLabel,sections},exercises})
 }
 if(!dry)fs.writeFileSync(`${directory}/${file}`,JSON.stringify({...raw,engine},null,2)+'\n')
 count++
}
console.log(`Validated ${count} native programs${dry?' (dry run)':''}.`)
