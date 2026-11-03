import fs from 'node:fs'
import { exerciseDescription } from '../../public/engine/descriptions.mjs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import * as E from '../../tests/reference/program.mjs'
const dry=process.argv.includes('--dry-run')
const lock=JSON.parse(fs.readFileSync('scripts/program-import/upstream-lock.json'))
const root='third-party/program/upstream/programs/builtin'
const dir='src/assets/programms', exdir='src/assets/exercises'
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const write=(p,d)=>{if(!dry)fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n')}
const common={benchPress_barbell:'barbell-bench-press',squat_barbell:'back-squat',deadlift_barbell:'deadlift',overheadPress_barbell:'overhead-press',bentOverRow_barbell:'barbell-bent-over-row',latPulldown_cable:'lat-pulldown',chinUp_bodyweight:'chin-up',pullUp_bodyweight:'pull-up',inclineBenchPress_dumbbell:'incline-dumbbell-press',inclineBenchPress_barbell:'barbell-incline-press',frontSquat_barbell:'front-squat',romanianDeadlift_barbell:'romanian-deadlift',legPress_leverageMachine:'leg-press',seatedLegCurl_leverageMachine:'seated-leg-curl',lyingLegCurl_leverageMachine:'lying-leg-curl',legExtension_leverageMachine:'leg-extension',standingCalfRaise_leverageMachine:'standing-calf-raise',seatedCalfRaise_leverageMachine:'seated-calf-raise',bicepCurl_barbell:'barbell-curl',bicepCurl_dumbbell:'dumbbell-curl',hammerCurl_dumbbell:'hammer-curl',lateralRaise_dumbbell:'dumbbell-lateral-raise',facePull_cable:'face-pull',tricepsPushdown_cable:'triceps-pushdown',abWheel_bodyweight:'ab-wheel-rollout'}
const mapping={...common};const reports=[]
function binding(type,settings){
 const key=E.Exercise_toKey(type)
 if(mapping[key]&&fs.existsSync(`${exdir}/${mapping[key]}.json`))return mapping[key]
 const id=''+slug(key),e=E.Exercise_get(type,settings.exercises)
 mapping[key]=id
 const muscles={glutes:'gluteal',hamstrings:'hamstring',quads:'quadriceps',shoulders:'deltoids',back:'upper-back',forearms:'forearm'}
 const primary=E.Exercise_targetMusclesGroups(type,settings).map(m=>({muscleGroup:muscles[m]??m,factor:1}))
 const secondary=E.Exercise_synergistMusclesGroups(type,settings).map(m=>({muscleGroup:muscles[m]??m,factor:0.5}))
 write(`${exdir}/${id}.json`,{id,displayLabel:`${e.name} (${type.equipment??e.defaultEquipment})`,shortDescription:'Exercise variant referenced by the program program catalog.',equipment:[type.equipment??e.defaultEquipment],primaryTargetMuscleGroups:primary,secondaryTargetMuscleGroups:secondary,aliases:[],tags:['program','AGPL-3.0'],sourceUrl:'https://github.com/astashov/program',license:'AGPL-3.0'})
 return id
}
function buildSections(p,settings,bindings){
 const ev=E.Program_forceEvaluate(p,settings)
 if(ev.errors.length)throw new Error(JSON.stringify(ev.errors))
 let n=0
 return ev.weeks.flatMap((w,wi)=>w.days.map((day,di)=>{
  n++;const record=E.Program_nextHistoryRecord(p,settings,E.Stats_getEmpty(),n)
  const exercises=record.entries.map((entry,i)=>{
   const x=day.exercises.find(x=>x.key===entry.programExerciseId)
   const id=bindings[E.Exercise_toKey(entry.exercise)]
   return {id:`engine-${n}-${i}`,exerciseId:id,resolvedExerciseId:id,exerciseName:E.Exercise_fullName(E.Exercise_get(entry.exercise,settings.exercises),settings),sets:String(entry.sets.length),reps:entry.sets.map(s=>s.reps+(s.isAmrap?'+':'')).join('/'),duration:'',rest:entry.sets[0]?.timer?`${entry.sets[0].timer} sec`:'',notes:exerciseDescription(x),engineKey:entry.programExerciseId}
  })
  return {id:`engine-day-${n}`,engineDay:n,dayIndex:di+1,dayLabel:`Day ${di+1}`,name:`${w.name} — ${day.name}`,shortName:day.name,notes:day.description??'',weekIndex:wi+1,weekLabel:w.name,exercises}
 }))
}
for(const f of lock.programs){
 const t=fs.readFileSync(path.join(root,f.file),'utf8');if(createHash('sha256').update(t).digest('hex')!==f.sha256)throw new Error(`Upstream changed: ${f.file}`)
 const meta=Object.fromEntries(t.split('---')[1].split('\n').flatMap(l=>{const m=l.match(/^([\w]+):\s*(.*)$/);return m?[[m[1],m[2].replace(/^"|"$/g,'')]]:[]}))
 let source=[...t.matchAll(/```liftoscript\s*\n([\s\S]*?)```/g)].map(m=>m[1]).join('\n')
 const id=f.file==='basicBeginner.md'?'basic-beginner':`${slug(meta.id??f.file.replace('.md',''))}`
 const settings=E.Settings_build('kg');const p={...E.Program_create(meta.name,id),planner:{vtype:'planner',name:meta.name,weeks:E.PlannerProgram_evaluateText(source)}}

 const ev=E.Program_forceEvaluate(p,settings);if(ev.errors.length)throw new Error(`${f.file}: ${JSON.stringify(ev.errors)}`)
 const bindings={}
 for(const x of E.Program_getAllProgramExercises(ev))for(const v of x.exerciseVariations??[]){if(v.exerciseType)bindings[E.Exercise_toKey(v.exerciseType)]=binding(v.exerciseType,settings)}
 let sections=buildSections(p,settings,bindings)
 if(p.planner.weeks.length===1 && sections.length<Number(meta.frequency)){const base=sections,n=base.length,freq=Number(meta.frequency);let length=n;while(length%freq)length+=n;sections=Array.from({length},(_,i)=>({...structuredClone(base[i%n]),id:`engine-day-${i+1}`,weekIndex:Math.floor(i/freq)+1,weekLabel:`Week ${Math.floor(i/freq)+1}`,dayIndex:i%freq+1,exercises:base[i%n].exercises.map((e,j)=>({...e,id:`engine-${i+1}-${j}`}))}))}
 const engine={version:1,revision:lock.commit,source,customExercises:{},bindings,sections,frequency:Number(meta.frequency)||sections.length,origin:'program',provenance:{author:meta.author,license:'AGPL-3.0',sourceUrl:`https://github.com/astashov/program/blob/${lock.commit}/programs/builtin/${f.file}`,commit:lock.commit}}
 write(`${dir}/${id}.json`,{id,displayLabel:meta.name+' — program',shortDescription:meta.shortDescription,descriptionHtml:`<p>${meta.shortDescription??''}</p>`,author:meta.author,sourceUrl:`https://github.com/astashov/program/blob/${lock.commit}/programs/builtin/${f.file}`,license:'AGPL-3.0',goal:meta.goal,level:meta.age,duration:meta.isMultiweek==='true'?`${ev.weeks.length} weeks`:'Repeat cycle',tags:['program','Automatic progression'],engine,weeks:sections.reduce((ws,s)=>{let w=ws.find(w=>w.week===s.weekIndex);if(!w){w={week:s.weekIndex,days:[]};ws.push(w)}w.days.push({day:s.dayIndex,displayLabel:s.shortName,items:s.exercises});return ws},[])})
 reports.push({id,file:f.file,days:sections.length,exercises:Object.keys(bindings).length})
}
write('scripts/program-import/mapping.json',mapping)
write('scripts/program-import/report.json',reports)
for(const bucket of [dir,exdir]){
 const manifests=fs.readdirSync(bucket).filter(f=>f.endsWith('.json')&&f!=='index.json').map(file=>{const x=JSON.parse(fs.readFileSync(path.join(bucket,file)));return {id:x.id,displayLabel:x.displayLabel,shortDescription:x.shortDescription,file}})
 write(path.join(bucket,'index.json'),{manifests})
}
console.log(JSON.stringify({programs:reports.length,mappedExercises:Object.keys(mapping).length,dryRun:dry}))
