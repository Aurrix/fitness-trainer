// One-time, repeatable migration. The compatibility interpreter is only a conversion input.
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import * as E from '../../tests/reference/program.mjs'
import * as legacy from '../../tests/reference/legacy/runtime.mjs'
const directory='src/assets/programms'
const archivePath='tests/reference/legacy/definitions.mjs'
const archives=fs.existsSync(archivePath)?(await import('../../'+archivePath+'?t='+Date.now())).definitions:{}
const dry=process.argv.includes('--dry-run'),report=[]
const kg=w=>w?.unit==='%'?null:w?E.Weight_convertTo(w,'kg').value:null
const persist=(p,value)=>{if(!dry)fs.writeFileSync(p,JSON.stringify(value,null,2)+'\n')}
for(const file of fs.readdirSync(directory).filter(f=>f.endsWith('.json')&&f!=='index.json')){
 const raw=JSON.parse(fs.readFileSync(`${directory}/${file}`))
 if(raw.engine?.version===2&&(!process.argv.includes('--reconvert')||!raw.id.startsWith(''))){report.push({id:raw.id,execution:raw.engine.compatibility?'compatibility':'native',features:raw.engine.compatibility?.features??[],sections:raw.engine.sections.length});continue}
 const old=raw.engine?.version===1?raw.engine:archives[raw.id]
 if(!old)throw new Error(`Missing migration input: ${raw.id}`)
 archives[raw.id]=old
 const state=legacy.initialize({definition:old,id:raw.id,name:raw.displayLabel})
 const evaluated=E.Program_forceEvaluate(state.program,state.settings)
 const all=E.Program_getAllProgramExercises(evaluated).filter(x=>!x.notused)
 const nativeOriginal=old.origin==='native'
 const reasons=new Set()
 // Initialization rewrites scripts and can hide inherited update/prompt metadata.
 // Detect outstanding capabilities from the original declarations instead.
 const declaredSettings=E.Settings_build('kg');declaredSettings.exercises=structuredClone(old.customExercises??{})
 const declaredProgram={...E.Program_create(raw.displayLabel,raw.id),planner:{vtype:'planner',name:raw.displayLabel,weeks:E.PlannerProgram_evaluateText(old.source)}}
 const declared=E.Program_getAllProgramExercises(E.Program_forceEvaluate(declaredProgram,declaredSettings))
 // Complex scripts and within-session changes remain explicit compatibility features.
 for(const x of declared){
  if(x.update?.script)reasons.add('within-session rules')
  if(!nativeOriginal&&x.progress&&!['none','dp','lp'].includes(x.progress.type))reasons.add('custom progression')
  if(Object.values(x.progress?.stateMetadata??{}).some(m=>m.userPrompted))reasons.add('program inputs')
  if(x.exerciseVariations?.length>1)reasons.add('exercise variations')
 }
 const loads=Object.fromEntries(legacy.inspect({definition:old,id:raw.id,name:raw.displayLabel}).map(f=>[f.exerciseId,{name:f.name,bodyweight:f.bodyweight,maximum:f.maximum,incrementKg:f.increment}]))
 const warmupState=legacy.initialize({definition:old,id:raw.id,name:raw.displayLabel,values:Object.fromEntries(legacy.inspect({definition:old,id:raw.id,name:raw.displayLabel}).map(f=>[f.key,{weightKg:f.bodyweight?0:40,maximumKg:100,incrementKg:f.increment}]))})
 const reference={}
 const sessions=old.sections.map(section=>legacy.prepare({definition:old,state,sectionId:section.id}))
 for(const session of sessions)for(const entry of session.record.entries){for(const s of entry.sets)if(s.originalWeight?.unit!=='%'&&Math.abs(kg(s.originalWeight))>0){reference[entry.programExerciseId]??=kg(s.originalWeight)}}
 const warmupSessions=old.sections.map(section=>legacy.prepare({definition:old,state:warmupState,sectionId:section.id}))
 const sections=sessions.map((session,si)=>({...session.section,engineDay:undefined,exercises:session.section.exercises.map((slot,i)=>{
  const entry=session.record.entries[i],x=all.find(x=>x.key===entry.programExerciseId&&x.dayData.day===session.record.day)
  const progress=x?.progress,ps=progress?.state??{}
  const rule=progress?.type==='dp'?{kind:'double',incrementKg:kg(ps.increment),minReps:ps.minReps,maxReps:ps.maxReps}:progress?.type==='lp'?{kind:'linear',incrementKg:kg(ps.increment),successes:ps.successes,failures:ps.failures,decrement:ps.decrement?.unit==='%'?{percent:ps.decrement.value,basis:'maximum'}:{kg:kg(ps.decrement)}}:nativeOriginal&&progress?.type==='custom'?{kind:'range',incrementKg:kg(ps.increment),failures:3,decrement:{percent:10}}:{kind:'none'}
  if(!nativeOriginal&&entry.sets.some(s=>s.originalWeight==null&&kg(s.weight)>0))reasons.add('effort-based loads')
  const prescriptions=slot.prescriptions.map((p,j)=>({...p,weightKg:null,unloaded:entry.sets[j].weight==null,loadFactor:entry.sets[j].originalWeight?.unit==='%'?1:reference[entry.programExerciseId]?kg(entry.sets[j].originalWeight)/reference[entry.programExerciseId]:1,percentage:entry.sets[j].originalWeight?.unit==='%'?entry.sets[j].originalWeight.value:null}))
  // Bind progression across repeats using local exercise IDs and day position, not vendor keys.
  const matched=all.filter(ex=>ex.key===entry.programExerciseId)
  const first=matched[0]
  const progressionKey=nativeOriginal?`${slot.exerciseId}:day-${first?.dayData.dayInWeek??session.section.dayIndex}:slot-${i}`:`${slot.exerciseId}:rule-${all.findIndex(ex=>ex.key===entry.programExerciseId)}`
  return {...slot,engineKey:undefined,progressionKey,progression:rule,prescriptions,warmups:warmupSessions[si].section.exercises[i].warmups.map(p=>({...p,weightKg:null,workFraction:p.weightKg/(warmupSessions[si].section.exercises[i].prescriptions[0]?.weightKg||1)})),sets:String(prescriptions.length),reps:prescriptions.map(p=>p.minReps!=null&&p.minReps!==p.reps?`${p.minReps}-${p.reps}`:`${p.reps??''}${p.amrap?'+':''}`).join('/')}
 })}))
 const revision='native-v2:'+createHash('sha256').update(JSON.stringify({sections,loads,features:[...reasons]})).digest('hex').slice(0,16)
 raw.engine={version:2,revision,sections,loads,frequency:old.frequency,...(old.provenance?{provenance:old.provenance}:{}),...(reasons.size?{compatibility:{id:raw.id,features:[...reasons]}}:{})}
 // Standard weeks/days/items remain the editable catalog structure.
 raw.weeks=[]
 for(const section of sections){let week=raw.weeks.find(w=>w.week===section.weekIndex);if(!week){week={week:section.weekIndex,days:[]};raw.weeks.push(week)}week.days.push({day:section.dayIndex,displayLabel:section.shortName,notes:section.notes,optional:section.optional,items:section.exercises})}
 persist(`${directory}/${file}`,raw)
 report.push({id:raw.id,execution:reasons.size?'compatibility':'native',features:[...reasons],sections:sections.length})
}
if(!dry)fs.writeFileSync(archivePath,'// Temporary, licensed compatibility inputs. Remove after native feature parity.\nexport const definitions = '+JSON.stringify(archives)+'\n')
persist('scripts/program-import/native-migration-report.json',report)
console.log(JSON.stringify({programs:report.length,native:report.filter(p=>p.execution==='native').length,compatibility:report.filter(p=>p.execution==='compatibility').length,dry}))
