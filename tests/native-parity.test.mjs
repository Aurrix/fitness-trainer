import assert from 'node:assert/strict'
import fs from 'node:fs'
import * as native from '../public/engine/native.mjs'
import * as old from './reference/legacy/runtime.mjs'
import {definitions} from './reference/legacy/definitions.mjs'
let sections=0;const errors=[]
function match(a,b,i){
 const key=a.record.entries[i]?.programExerciseId
 const index=b.section.exercises.findIndex(slot=>slot.advanced?.migration.key===key)
 if(index>=0)return index
 if(b.section.exercises[i]?.exerciseId===a.section.exercises[i].exerciseId)return i
 return b.section.exercises.findIndex(slot=>slot.exerciseId===a.section.exercises[i].exerciseId)
}
function compare(id,a,b,label,warmups=false){
 for(const [i,exercise] of a.section.exercises.entries()){
  const ni=match(a,b,i),target=b.section.exercises[ni]
  if(!target){errors.push({id,label,i,field:'exercise',old:exercise.exerciseId});continue}
  if(exercise.exerciseId!==target.exerciseId)errors.push({id,label,i,field:'exercise',old:exercise.exerciseId,native:target.exerciseId})
  if(exercise.prescriptions.length!==target.prescriptions.length){errors.push({id,label,i,field:'sets',old:exercise.prescriptions.length,native:target.prescriptions.length});continue}
  exercise.prescriptions.forEach((set,j)=>{
   const next=target.prescriptions[j]
   for(const field of ['reps','minReps','weightKg','formula','effort','durationSeconds','restSeconds','amrap','unilateral'])if(set[field]!==next[field])errors.push({id,label,i,j,field,old:set[field],native:next[field]})
  })
  if(warmups){assert.equal(target.warmups.length,exercise.warmups.length,`${id}: warm-up count`);exercise.warmups.forEach((set,j)=>{for(const field of ['reps','weightKg','kind'])if(set[field]!==target.warmups[j][field])errors.push({id,label,i,j,field:'warmup '+field,old:set[field],native:target.warmups[j][field]})})}
 }
}
function logsFor(session,outcome='success'){
 return Object.fromEntries(session.section.exercises.map(slot=>[slot.id,{exerciseId:slot.exerciseId,setLogs:slot.prescriptions.map(p=>({reps:String(outcome==='failure'?0:(p.reps??1)+(outcome==='overperform'?5:0)),weightKg:String(outcome==='failure'?(p.weightKg??0)/2:p.weightKg??0),duration:String((p.durationSeconds??30)/60),effort:String(p.effort??7),completedAt:'2026-11-02T12:00:00Z'}))}]))
}
function remap(a,b,logs){return Object.fromEntries(a.section.exercises.map((slot,i)=>[b.section.exercises[match(a,b,i)].id,logs[slot.id]]))}
for(const file of fs.readdirSync('src/assets/programms').filter(f=>f.endsWith('.json')&&f!=='index.json')){
 const p=JSON.parse(fs.readFileSync('src/assets/programms/'+file)),d=p.engine,legacy=definitions[p.id]
 const values=Object.fromEntries(old.inspect({definition:legacy,id:p.id,name:p.displayLabel}).map(f=>[f.key,{weightKg:f.bodyweight?0:40,maximumKg:100,incrementKg:f.increment}]))
 const a=old.initialize({definition:legacy,id:p.id,name:p.displayLabel,values}),b=native.initialize({definition:d,values:Object.fromEntries(native.inspect({definition:d}).map(f=>[f.key,{weightKg:f.bodyweight?0:40,maximumKg:100,incrementKg:f.increment}]))})
 for(const section of d.sections){
  const x=old.prepare({definition:legacy,state:a,sectionId:section.id}),y=native.prepare({definition:d,state:b,sectionId:section.id});sections++
  compare(p.id,x,y,section.id,true)
 }
 let oldState=a,nativeState=b
 for(const outcome of ['success','failure','failure','failure','overperform','success']){
  const sectionId=d.sections[0].id,x=old.prepare({definition:legacy,state:oldState,sectionId}),y=native.prepare({definition:d,state:nativeState,sectionId})
  const logs=logsFor(x,outcome)
  oldState=old.finish({session:x,logs,effortScale:'rpe'}).state
  nativeState=native.finish({session:{...y,answers:Object.fromEntries(y.prompts.map(p=>[p.id,0]))},logs:remap(x,y,logs),effortScale:'rpe'}).state
  compare(p.id,old.prepare({definition:legacy,state:oldState,sectionId}),native.prepare({definition:d,state:nativeState,sectionId}),outcome)
 }
}
if(errors.length){fs.mkdirSync('.tmp/engine-completion',{recursive:true});fs.writeFileSync('.tmp/engine-completion/parity-errors.json',JSON.stringify(errors,null,2))}
assert.deepEqual(errors,[])
console.log(`Native prescriptions and repeated progression match reference fixtures across ${sections} workout templates in all 75 programs.`)
