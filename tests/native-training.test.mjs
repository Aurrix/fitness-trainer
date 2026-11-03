import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import * as N from '../public/engine/native.mjs'
const catalog=fs.readdirSync('src/assets/programms').filter(f=>f.endsWith('.json')&&f!=='index.json').map(f=>JSON.parse(fs.readFileSync('src/assets/programms/'+f)))
const program=catalog.find(p=>p.id==='upper-lower-intermediate')
const seed=definition=>N.initialize({definition,values:Object.fromEntries(N.inspect({definition}).map(f=>[f.key,{weightKg:f.bodyweight?0:40,maximumKg:100,incrementKg:f.increment}]))})
const logsFor=session=>Object.fromEntries(session.section.exercises.map(slot=>[slot.id,{exerciseId:slot.exerciseId,setLogs:slot.prescriptions.map(p=>({reps:String(p.reps??1),weightKg:String(p.weightKg??0),duration:String((p.durationSeconds??30)/60),effort:String(p.effort??7),completedAt:'2026-11-02T12:00:00Z'}))}]))
test('the complete catalog uses native structured data',()=>{
 assert.equal(catalog.length,75)
 for(const p of catalog){
  assert.equal(p.engine.version,2)
  assert.equal(p.engine.source,undefined)
  assert.equal(p.engine.customExercises,undefined)
  assert.equal(p.engine.bindings,undefined)
  assert.equal(p.weeks.reduce((n,w)=>n+w.days.length,0),p.engine.sections.length)
  for(const section of p.engine.sections)for(const slot of section.exercises){assert.ok(slot.prescriptions.length);assert.ok(p.engine.loads[slot.exerciseId]);assert.ok(slot.progression.kind)}
 }
})
test('native programs execute without loading compatibility modules',()=>{
 assert.ok(!/from .*compatibility|from .*program/.test(fs.readFileSync('public/engine/native.mjs','utf8')))
 const p=catalog.find(p=>p.id==='phul')
 const session=N.prepare({definition:p.engine,state:seed(p.engine),sectionId:p.engine.sections[0].id})
 const done=N.finish({session,logs:logsFor(session),effortScale:'rpe'})
 assert.equal(done.state.version,2)
 assert.ok(done.explanations.some(s=>s.includes('4 reps')))
})
test('partial and substituted exercises cannot progress; negative assistance stays negative',()=>{
 const session=N.prepare({definition:program.engine,state:seed(program.engine),sectionId:program.engine.sections[0].id})
 const logs=logsFor(session),slot=session.section.exercises[0]
 logs[slot.id].setLogs.pop()
 const partial=N.finish({session,logs,effortScale:'rpe'})
 assert.equal(partial.state.program.slots[slot.progressionKey],undefined)
 logs[slot.id].exerciseId='substitute'
 const substitute=N.finish({session,logs,effortScale:'rpe'})
 assert.equal(substitute.state.program.slots[slot.progressionKey],undefined)
 assert.ok(substitute.explanations.some(s=>s.includes('substituted')))
 const definition=structuredClone(program.engine)
 definition.loads[slot.exerciseId].bodyweight=true
 const state=seed(definition);state.settings.loads[slot.exerciseId].weightKg=-40
 let current=state
 for(let i=0;i<3;i++){
  const s=N.prepare({definition,state:current,sectionId:definition.sections[0].id}),ls=logsFor(s)
  ls[slot.id].setLogs.forEach(set=>{set.reps='0';set.weightKg='-40'})
  current=N.finish({session:s,logs:ls,effortScale:'rpe'}).state
 }
 assert.ok(current.program.slots[slot.progressionKey].weights[0]<-40)
})
test('native JSON definitions validate on save and round-trip without changing metadata',()=>{
 const definition=program.engine
 const source=JSON.stringify({sections:definition.sections,loads:definition.loads})
 const compiled=N.compile({definition,source})
 assert.deepEqual(compiled.sections,definition.sections)
 assert.equal(compiled.source,undefined)
 assert.throws(()=>N.compile({definition,source:'{}'}),/workout sections/)
 const broken=JSON.parse(source);broken.sections[0].exercises[0].progression.kind='unknown'
 assert.throws(()=>N.compile({definition,source:JSON.stringify(broken)}),/Unsupported progression/)
})

test('linear progression counts successes and applies configured failure deloads',()=>{
 const definition=structuredClone(program.engine)
 definition.sections=[definition.sections[0]]
 definition.sections[0].exercises=[definition.sections[0].exercises[0]]
 const slot=definition.sections[0].exercises[0]
 slot.progression={kind:'linear',incrementKg:2.5,successes:2,failures:2,decrement:{percent:10}}
 let state=seed(definition)
 for(let i=0;i<2;i++){
  const session=N.prepare({definition,state,sectionId:definition.sections[0].id})
  state=N.finish({session,logs:logsFor(session),effortScale:'rpe'}).state
  assert.equal(state.program.slots[slot.progressionKey].weights[0],i===0?40:42.5)
 }
 for(let i=0;i<2;i++){
  const session=N.prepare({definition,state,sectionId:definition.sections[0].id}),logs=logsFor(session)
  logs[slot.id].setLogs.forEach(set=>{set.reps='0'})
  state=N.finish({session,logs,effortScale:'rpe'}).state
 }
 assert.ok(state.program.slots[slot.progressionKey].weights[0]<42.5)
})

test('percentage loads are estimated from actual sets and history edits recalibrate from the original snapshot',()=>{
 const definition=structuredClone(program.engine)
 definition.sections=[definition.sections[0]]
 definition.sections[0].exercises=[definition.sections[0].exercises[0]]
 const slot=definition.sections[0].exercises[0]
 slot.prescriptions.forEach(p=>{p.percentage=75;p.formula='75% of 1RM'})
 definition.loads[slot.exerciseId].maximum=true
 const state=N.initialize({definition})
 const session=N.prepare({definition,state,sectionId:definition.sections[0].id}),logs=logsFor(session)
 logs[slot.id].setLogs.forEach(s=>{s.weightKg='60';s.reps='10'})
 const updated=N.update({session,logs,effortScale:'rpe'})
 assert.deepEqual(updated.before,state)
 assert.equal(updated.section.exercises[0].prescriptions[0].weightKg,60)
 logs[slot.id].setLogs.forEach(s=>{s.weightKg='80'})
 const revised=N.update({session:updated,logs,effortScale:'rpe'})
 assert.equal(revised.section.exercises[0].prescriptions[0].weightKg,80)
 assert.deepEqual(session.before,state)
})

test('failed double-progression sets retain prescribed targets after a temporary load override',()=>{
 const p=catalog.find(p=>p.id==='phul')
 const session=N.prepare({definition:p.engine,state:seed(p.engine),sectionId:p.engine.sections[0].id}),logs=logsFor(session)
 const slot=session.section.exercises[0]
 logs[slot.id].setLogs.forEach(s=>{s.weightKg='20';s.reps='0'})
 const result=N.finish({session,logs,effortScale:'rpe'})
 const next=N.prepare({definition:p.engine,state:result.state,sectionId:session.section.id})
 assert.equal(next.section.exercises[0].prescriptions[0].weightKg,40)
})

test('small linear increments accumulate across equipment rounding',()=>{
 const definition=structuredClone(program.engine)
 definition.sections=[definition.sections[0]]
 definition.sections[0].exercises=[definition.sections[0].exercises[0]]
 const slot=definition.sections[0].exercises[0]
 slot.progression={kind:'linear',incrementKg:1,successes:1}
 let state=seed(definition)
 for(let i=0;i<2;i++){
  const session=N.prepare({definition,state,sectionId:definition.sections[0].id})
  state=N.finish({session,logs:logsFor(session),effortScale:'rpe'}).state
  const next=N.prepare({definition,state,sectionId:session.section.id})
  assert.equal(next.section.exercises[0].prescriptions[0].weightKg,i===0?40:42.5)
 }
})

test('the earliest completed work set establishes a durable baseline without setup',()=>{
 const d=structuredClone(program.engine),section=d.sections[0],slot=section.exercises[0],id=slot.exerciseId
 const initial=N.initialize({definition:d}),s=N.prepare({definition:d,state:initial,sectionId:section.id})
 const ls={[slot.id]:{exerciseId:id,setLogs:[{reps:'8',weightKg:'50',effort:'8'},{reps:'6',weightKg:'40',effort:'8',completedAt:'2026-11-02T12:00:00Z'}]}}
 const updated=N.update({session:s,logs:ls,effortScale:'rpe'})
 assert.equal(updated.baselines[id].weightKg,40)
 assert.equal(updated.baselines[id].reps,6)
 assert.equal(updated.baselines[id].setIndex,1)
 assert.deepEqual(initial.settings.loads,{})
 ls[slot.id].setLogs[0].completedAt='2026-11-02T12:01:00Z'
 const finished=N.finish({session:updated,logs:ls,effortScale:'rpe'})
 assert.equal(finished.state.settings.baselines[id].weightKg,40)
 assert.deepEqual(finished.baselines,finished.state.settings.baselines)
 const next=N.prepare({definition:d,state:finished.state,sectionId:section.id})
 ls[slot.id].setLogs[0].weightKg='80'
 assert.deepEqual(N.finish({session:next,logs:ls,effortScale:'rpe'}).baselines[id],finished.baselines[id])
})

test('uncompleted, warmup, skipped and substituted sets do not establish baselines',()=>{
 for(const mode of ['uncompleted','warmup','skipped','substitute']){
  const d=structuredClone(program.engine),section=d.sections[0],slot=section.exercises[0]
  if(mode==='warmup')slot.prescriptions[0].kind='warmup'
  const s=N.prepare({definition:d,state:N.initialize({definition:d}),sectionId:section.id})
  const ls={[slot.id]:{exerciseId:mode==='substitute'?'other':slot.exerciseId,skipped:mode==='skipped',setLogs:[{reps:'6',weightKg:'40',effort:'8',completedAt:mode==='uncompleted'?undefined:'2026-11-02T12:00:00Z'}]}}
  assert.deepEqual(N.update({session:s,logs:ls,effortScale:'rpe'}).baselines,{})
 }
})

test('unloaded and timed exercises record their actual baseline',()=>{
 for(const timed of [false,true]){
  const d=structuredClone(program.engine),section=d.sections[0],slot=section.exercises[0]
  section.exercises=[slot];slot.prescriptions=[{...slot.prescriptions[0],unloaded:true,effort:null,...(timed?{durationSeconds:30}:{})}]
  const s=N.prepare({definition:d,state:N.initialize({definition:d}),sectionId:section.id})
  const ls={[slot.id]:{exerciseId:slot.exerciseId,setLogs:[{reps:'12',duration:'0.5',completedAt:'2026-11-02T12:00:00Z'}]}}
  const updated=N.update({session:s,logs:ls,effortScale:'rpe'})
  assert.equal(updated.baselines[slot.exerciseId].weightKg,null)
  assert.equal(updated.baselines[slot.exerciseId].durationSeconds,timed?30:null)
  assert.equal(updated.baselines[slot.exerciseId].reps,12)
 }
})
