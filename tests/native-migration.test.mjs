import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import * as N from '../public/engine/runtime.mjs'
import * as O from './reference/legacy/runtime.mjs'
import {definitions} from './reference/legacy/definitions.mjs'
const scenarios=['phul','gzclp','bullmastiff','basic-beginner','upper-lower-intermediate']
function log(session,outcome){return Object.fromEntries(session.section.exercises.map(e=>[e.id,{exerciseId:e.exerciseId,setLogs:e.prescriptions.map(s=>({reps:String(outcome==='success'?s.reps??1:0),weightKg:String(s.weightKg??0),effort:String(s.effort??7),duration:String((s.durationSeconds??30)/60),completedAt:'2026-11-02T12:00:00Z'}))}]))}
function compare(old,next){for(const exercise of old.section.exercises){const counterpart=next.section.exercises.find(n=>n.exerciseId===exercise.exerciseId);assert.ok(counterpart,exercise.exerciseName);assert.deepEqual(counterpart.prescriptions.map(s=>[s.reps,s.weightKg]),exercise.prescriptions.map(s=>[s.reps,s.weightKg]))}}
for(const id of scenarios)test(`saved ${id} runs preserve targets and continue in the native engine`,()=>{
 const oldDefinition=definitions[id],definition=JSON.parse(fs.readFileSync('src/assets/programms/'+id+'.json')).engine
 let state=O.initialize({definition:oldDefinition,id,name:id,values:Object.fromEntries(O.inspect({definition:oldDefinition,id,name:id}).map(f=>[f.key,{weightKg:f.bodyweight?0:40,maximumKg:100,incrementKg:f.increment}]))})
 for(const outcome of ['success','failure','failure']){
  const old=O.prepare({definition:oldDefinition,state,sectionId:oldDefinition.sections[0].id})
  const next=N.prepare({definition:oldDefinition,migrationDefinition:definition,state,sectionId:old.section.id})
  compare(old,next)
  const logs=log(old,outcome),original=JSON.stringify(old)
  const result=N.finish({session:old,migrationDefinition:definition,logs,effortScale:'rpe'})
  const expected=O.finish({session:old,logs,effortScale:'rpe'})
  compare(O.prepare({definition:oldDefinition,state:expected.state,sectionId:old.section.id}),N.prepare({definition,state:result.state,sectionId:old.section.id}))
  assert.equal(result.state.version,2);assert.equal(result.state.runId,state.runId);assert.equal(JSON.stringify(old),original)
  assert.deepEqual(result.before.importedStateBackup,state)
  state=expected.state
 }
})
test('native execution has no production reference interpreter or compatibility module',()=>{
 assert.equal(fs.existsSync('public/engine/program.mjs'),false)
 assert.equal(fs.existsSync('public/engine/compatibility/runtime.mjs'),false)
 for(const file of fs.readdirSync('public/engine').filter(f=>f.endsWith('.mjs'))){const source=fs.readFileSync('public/engine/'+file,'utf8');assert.ok(!/(?:from|import\s*\()\s*['"][^'"]*(?:reference|program|compatibility)/.test(source),file)}
})

test('older version 2 compatibility snapshots retain their exercise and timed-stage selections',()=>{
 const id='recommended-routine',legacy=definitions[id],definition=JSON.parse(fs.readFileSync('src/assets/programms/'+id+'.json')).engine
 let state=O.initialize({definition:legacy,id,name:id,values:Object.fromEntries(O.inspect({definition:legacy,id,name:id}).map(f=>[f.key,{weightKg:f.bodyweight?0:40,maximumKg:100,incrementKg:f.increment}]))})
 for(let i=0;i<4;i++){const session=O.prepare({definition:legacy,state,sectionId:legacy.sections[0].id});state=O.finish({session,logs:log(session,'success'),effortScale:'rpe'}).state}
 const session=O.prepare({definition:legacy,state,sectionId:legacy.sections[0].id}),compatibilityDefinition={...structuredClone(definition),compatibility:{id,features:['exercise variations']}}
 delete compatibilityDefinition.rulePrograms;delete compatibilityDefinition.migration
 const updated=N.update({session:{...session,definition:compatibilityDefinition},migrationDefinition:definition,logs:{},effortScale:'rpe'})
 compare(session,updated)
 assert.equal(updated.definition.compatibility,undefined)
 assert.equal(updated.before.version,2)
 assert.ok(updated.before.importedStateBackup)
})

test('saved retest stages keep their selected program instructions',()=>{
 const id='gzclp',legacy=definitions[id],definition=JSON.parse(fs.readFileSync('src/assets/programms/'+id+'.json')).engine
 let state=O.initialize({definition:legacy,id,name:id,values:Object.fromEntries(O.inspect({definition:legacy,id,name:id}).map(f=>[f.key,{weightKg:f.bodyweight?0:40,maximumKg:100,incrementKg:f.increment}]))})
 for(let i=0;i<3;i++){const session=O.prepare({definition:legacy,state,sectionId:legacy.sections[0].id});state=O.finish({session,logs:log(session,'failure'),effortScale:'rpe'}).state}
 const before=O.prepare({definition:legacy,state,sectionId:legacy.sections[0].id}),after=N.prepare({definition:legacy,migrationDefinition:definition,state,sectionId:legacy.sections[0].id})
 assert.match(before.section.exercises[0].notes,/retest week/i)
 assert.equal(after.section.exercises[0].notes,before.section.exercises[0].notes)
})
