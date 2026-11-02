import assert from 'node:assert/strict'
import fs from 'node:fs'
import * as N from '../public/engine/native.mjs'
import * as O from './reference/legacy/runtime.mjs'
import {definitions} from './reference/legacy/definitions.mjs'
const errors=[];let sessions=0
const wanted=process.argv.slice(2)
function match(a,b,i){const key=a.record.entries[i]?.programExerciseId;return b.section.exercises.findIndex(e=>e.advanced.migration.key===key)}
function compare(id,section,phase,a,b){for(const [i,e] of a.section.exercises.entries()){
 const ni=match(a,b,i),next=b.section.exercises[ni];if(!next){errors.push({id,section,phase,i,f:'missing'});continue}
 if(e.exerciseId!==next.exerciseId){errors.push({id,section,phase,i,f:'exercise',old:e.exerciseId,native:next.exerciseId});continue}
 if(e.prescriptions.length!==next.prescriptions.length){errors.push({id,section,phase,i,f:'count',old:e.prescriptions.length,native:next.prescriptions.length});continue}
 e.prescriptions.forEach((set,j)=>{for(const f of ['reps','minReps','weightKg','formula','effort','durationSeconds','restSeconds','amrap'])if(set[f]!==next.prescriptions[j][f])errors.push({id,section,phase,i,j,f,old:set[f],native:next.prescriptions[j][f]})})
}}
for(const file of fs.readdirSync('src/assets/programms').filter(f=>f.endsWith('.json')&&f!=='index.json')){
 const p=JSON.parse(fs.readFileSync('src/assets/programms/'+file)),d=p.engine;if(!d.rulePrograms||wanted.length&&!wanted.includes(p.id))continue
 const old=definitions[p.id];let a=O.initialize({definition:old,id:p.id,name:p.id,values:Object.fromEntries(O.inspect({definition:old,id:p.id,name:p.id}).map(f=>[f.key,{weightKg:f.bodyweight?0:40,maximumKg:100,incrementKg:f.increment}]))}),b=N.initialize({definition:d,values:Object.fromEntries(N.inspect({definition:d}).map(f=>[f.key,{weightKg:f.bodyweight?0:40,maximumKg:100,incrementKg:f.increment}]))})
 for(const section of d.sections){
  const x=O.prepare({definition:old,state:a,sectionId:section.id}),y=N.prepare({definition:d,state:b,sectionId:section.id});compare(p.id,section.id,'before',x,y)
  const logs=Object.fromEntries(x.section.exercises.map(ex=>[ex.id,{exerciseId:ex.exerciseId,setLogs:ex.prescriptions.map(set=>({reps:String((set.reps??1)+(set.amrap?2:0)),weightKg:String(set.weightKg??0),duration:String((set.durationSeconds??30)/60),effort:String(set.effort??7),completedAt:'2026-11-02T12:00:00Z'}))}]))
  const nativeLogs=Object.fromEntries(x.section.exercises.map((ex,i)=>[y.section.exercises[match(x,y,i)].id,logs[ex.id]]))
  const u=O.update({session:x,logs,effortScale:'rpe'}),v=N.update({session:y,logs:nativeLogs,effortScale:'rpe'});compare(p.id,section.id,'update',u,v)
  a=O.finish({session:x,logs,effortScale:'rpe'}).state;b=N.finish({session:{...y,answers:Object.fromEntries(y.prompts.map(p=>[p.id,0]))},logs:nativeLogs,effortScale:'rpe'}).state
  compare(p.id,section.id,'after',O.prepare({definition:old,state:a,sectionId:section.id}),N.prepare({definition:d,state:b,sectionId:section.id}));sessions++
 }
 fs.writeFileSync('.tmp/engine-completion/cycle-errors.json',JSON.stringify(errors,null,2));console.log(p.id,'sessions',sessions,'differences',errors.filter(e=>e.id===p.id).length)
}
assert.deepEqual(errors,[])
console.log('Completed',sessions,'native/reference program sessions without differences.')
