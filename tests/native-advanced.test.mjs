import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import * as N from '../public/engine/native.mjs'
import {compileRule,validateRuleProgram} from '../public/engine/rules.mjs'
const definition=id=>JSON.parse(fs.readFileSync(`src/assets/programms/${id}.json`)).engine
const seed=d=>N.initialize({definition:d,values:Object.fromEntries(N.inspect({definition:d}).map(f=>[f.key,{weightKg:f.bodyweight?0:40,maximumKg:100,incrementKg:f.increment}]))})
const prepare=(d,state,section=d.sections[0])=>N.prepare({definition:d,state,sectionId:section.id})
const logs=s=>Object.fromEntries(s.section.exercises.map(ex=>[ex.id,{exerciseId:ex.exerciseId,setLogs:ex.prescriptions.map(p=>({reps:String(p.reps??1),weightKg:String(p.weightKg??0),effort:String(p.effort??7),duration:String((p.durationSeconds??30)/60),completedAt:'2026-11-02T12:00:00Z'}))}]))
function onlyFirst(d){const result=structuredClone(d);result.sections=[result.sections[0]];result.sections[0].exercises=[result.sections[0].exercises[0]];return result}
test('GZCLP failures move through all rep schemes and retest resets the cycle',()=>{
 const d=onlyFirst(definition('liftosaur-gzclp'));let state=seed(d)
 const expected=[6,10,1]
 for(const count of expected){const s=prepare(d,state),ls=logs(s);Object.values(ls).forEach(e=>e.setLogs.forEach(set=>{set.reps='0'}));state=N.finish({session:s,logs:ls,effortScale:'rpe'}).state;assert.equal(prepare(d,state).section.exercises[0].prescriptions.length,count)}
 const s=prepare(d,state),ls=logs(s);Object.values(ls).forEach(e=>e.setLogs.forEach(set=>{set.reps='5';set.weightKg='100'}));state=N.finish({session:s,logs:ls,effortScale:'rpe'}).state
 assert.equal(prepare(d,state).section.exercises[0].prescriptions.length,5)
 assert.ok(state.settings.loads[d.sections[0].exercises[0].exerciseId].maximumKg>100)
})
test('within-session rules add follow-up sets deterministically after the first RM set',()=>{
 const d=definition('liftosaur-gzcl-general-gainz'),state=seed(d),s=prepare(d,state),id=s.section.exercises[0].id
 const ls={[id]:{exerciseId:s.section.exercises[0].exerciseId,setLogs:[{reps:'5',weightKg:'70',effort:'8',completedAt:'2026-11-02T12:00:00Z'}]}}
 const before=JSON.stringify(s),a=N.update({session:s,logs:ls,effortScale:'rpe'}),b=N.update({session:a,logs:ls,effortScale:'rpe'})
 assert.equal(a.initialSection.exercises[0].prescriptions.length,1)
 assert.deepEqual(b.initialSection,a.initialSection)
 assert.equal(a.section.exercises[0].prescriptions.length,6)
 assert.ok(a.section.exercises[0].prescriptions.slice(1).every(p=>p.reps===1&&p.weightKg===70))
 assert.deepEqual(a.section,b.section);assert.equal(JSON.stringify(s),before)
})
test('cross-week changes apply to the selected future week without rewriting the current week',()=>{
 const d=definition('liftosaur-gzcl-general-gainz-riptide'),state=seed(d),s=prepare(d,state),ls=logs(s),first=s.section.exercises[0]
 ls[first.id].setLogs.forEach(set=>{set.weightKg='70'})
 const result=N.finish({session:s,logs:ls,effortScale:'rpe'})
 const future=d.sections.find(sec=>sec.exercises.some(e=>e.advanced.family===first.advanced.family&&e.advanced.context.week===2))
 const next=prepare(d,result.state,future).section.exercises.find(e=>e.advanced.family===first.advanced.family)
 assert.ok(next.prescriptions.every(p=>p.weightKg===70))
 assert.notEqual(prepare(d,result.state).section.exercises[0].prescriptions[0].weightKg,70)
})
test('exercise ladders advance into timed holds and back into repetition work',()=>{
 const d=definition('liftosaur-recommended-routine'),chosen=d.sections[0].exercises.find(e=>e.advanced.choices.some(c=>/arch hang/i.test(c.name)))
 d.sections=[{...d.sections[0],exercises:[chosen]}];let state=seed(d)
 for(let i=0;i<4;i++){const s=prepare(d,state),ls=logs(s);state=N.finish({session:s,logs:ls,effortScale:'rpe'}).state}
 let s=prepare(d,state)
 assert.match(s.section.exercises[0].exerciseName,/arch hang/i)
 assert.equal(s.section.exercises[0].prescriptions[0].durationSeconds,20)
 for(let i=0;i<3;i++){const ls=logs(s);state=N.finish({session:s,logs:ls,effortScale:'rpe'}).state;s=prepare(d,state)}
 assert.match(s.section.exercises[0].exerciseName,/negative pull/i)
 assert.equal(s.section.exercises[0].prescriptions[0].reps,5)
})
test('prompted rule variables are required, saved, and used to select the next stage',()=>{
 const d=onlyFirst(definition('liftosaur-pzerofullbody')),slot=d.sections[0].exercises[0]
 slot.advanced.prompts=['nextstage'];slot.advanced.finish='prompted';d.rulePrograms.prompted=compileRule('if (state.nextstage > 0) { setVariationIndex += 1 }')
 const s=prepare(d,seed(d)),ls=logs(s)
 assert.equal(s.prompts.length,1)
 assert.throws(()=>N.finish({session:s,logs:ls,effortScale:'rpe'}),/program input/)
 const done=N.finish({session:{...s,answers:{[s.prompts[0].id]:1}},logs:ls,effortScale:'rpe'})
 assert.equal(done.state.program.ruleState.families[slot.advanced.family].stage,2)
 assert.equal(done.state.program.ruleState.families[slot.advanced.family].variables.nextstage,1)
})
test('RPE-derived targets respond to maxima and rules are bounded and validated',()=>{
 const d=definition('liftosaur-barbell-medicine-the-bridge'),state=seed(d),a=prepare(d,state)
 const id=a.section.exercises[0].exerciseId;state.settings.loads[id].maximumKg=200
 const b=prepare(d,state)
 assert.ok(b.section.exercises[0].prescriptions[0].weightKg>a.section.exercises[0].prescriptions[0].weightKg)
 assert.throws(()=>validateRuleProgram(compileRule('fetch(1)')),/Unsupported rule function/)
 assert.throws(()=>validateRuleProgram(compileRule('state.__proto__ = 1')),/Unsupported rule field/)
 const broken=onlyFirst(definition('liftosaur-gzclp'));broken.sections[0].exercises[0].advanced.update='oversized';broken.rulePrograms.oversized=compileRule('numberOfSets = 10000')
 assert.throws(()=>prepare(broken,seed(broken)),/invalid number of sets/)
})

test('automatic advanced setup hides unknown loads until completed work provides them',()=>{
 const d=definition('liftosaur-phat'),state=N.initialize({definition:d})
 for(const section of d.sections){const session=prepare(d,state,section);assert.ok(session.section.exercises.every(ex=>ex.prescriptions.every(p=>p.weightKg==null)))}
})
