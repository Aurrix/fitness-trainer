// Offline conversion only: preserve source attribution, export data-only native rules.
import fs from 'node:fs'
import {createHash} from 'node:crypto'
import * as E from '../../tests/reference/liftosaur.mjs'
import {definitions} from '../../tests/reference/legacy/definitions.mjs'
import * as legacy from '../../tests/reference/legacy/runtime.mjs'
import {legacyHints} from '../../public/engine/migrate.mjs'
import {compileRule} from '../../public/engine/rules.mjs'
const dry=process.argv.includes('--dry-run'),report=[]
function inherited(exercise,kind,visited=new Set()){
 if(!exercise||visited.has(exercise))return null
 visited.add(exercise)
 const rule=exercise[kind]
 if(rule?.type==='none')return null
 const parent=rule?.reuse?.exercise??exercise.reuse?.exercise
 const base=inherited(parent,kind,visited)
 return rule||base?{...base,...rule,script:rule?.script??base?.script,state:{...base?.state,...rule?.state},stateMetadata:{...base?.stateMetadata,...rule?.stateMetadata}}:null
}
for(const file of fs.readdirSync('src/assets/programms').filter(f=>f.endsWith('.json')&&f!=='index.json')){
 const path='src/assets/programms/'+file,raw=JSON.parse(fs.readFileSync(path)),definition=raw.engine
 if(!definition.compatibility&&!definition.rulePrograms){raw.engine.migration=legacyHints(definitions[raw.id]);for(const section of raw.engine.sections)if(!section.exercises.length)section.restDay=true;if(!dry)fs.writeFileSync(path,JSON.stringify(raw,null,2)+'\n');report.push({id:raw.id,execution:'native',features:[],sections:definition.sections.length});continue}
 const original=definitions[definition.compatibility?.id??raw.id];if(!original)throw new Error(`No conversion input for ${raw.id}`)
 const settings=E.Settings_build('kg');settings.exercises=structuredClone(original.customExercises??{})
 const program={...E.Program_create(raw.displayLabel,raw.id),planner:{vtype:'planner',name:raw.displayLabel,weeks:E.PlannerProgram_evaluateText(original.source)}}
 const evaluated=E.Program_forceEvaluate(program,settings);if(evaluated.errors.length)throw new Error(JSON.stringify(evaluated.errors))
 const all=E.Program_getAllProgramExercises(evaluated).filter(x=>!x.notused)
 const initial=legacy.initialize({definition:original,id:raw.id,name:raw.displayLabel})
 const effective=E.Program_getAllProgramExercises(E.Program_forceEvaluate(initial.program,initial.settings)).filter(x=>!x.notused)
 const families=[...new Set(all.map(x=>x.key))],reference={},rulePrograms={},ruleIds=new Map()
 for(const x of all)for(const variation of x.evaluatedSetVariations)for(const set of variation.sets){if(set.weight&&set.weight.unit!=='%'&&set.weight.value!==0)reference[x.key]??=E.Weight_convertTo(set.weight,'kg').value}
 const ruleId=script=>{if(!script)return null;if(!ruleIds.has(script)){const id='rule-'+ruleIds.size;ruleIds.set(script,id);rulePrograms[id]=compileRule(script)}return ruleIds.get(script)}
 const sections=definition.sections.map((section,si)=>{
  const oldSection=original.sections[si],day=oldSection.engineDay??si+1
  const xs=all.filter(x=>x.dayData.day===day)
  const baselineRecord=legacy.prepare({definition:original,state:initial,sectionId:oldSection.id}).record
  if(xs.length!==section.exercises.length)throw new Error(`${raw.id} ${section.id}: exercise schedule mismatch`)
  return {...section,...(!section.exercises.length?{restDay:true}:{}),exercises:section.exercises.map((slot,i)=>{
   const legacyKey=oldSection.exercises[i]?.engineKey
   const matches=xs.filter(e=>original.bindings[E.Exercise_toKey(e.exerciseType)]===slot.exerciseId)
   const x=xs.find(e=>e.key===legacyKey&&original.bindings[E.Exercise_toKey(e.exerciseType)]===slot.exerciseId)??matches[section.exercises.slice(0,i).filter(e=>e.exerciseId===slot.exerciseId).length]??xs[i]
   const current=effective.find(e=>e.key===x.key&&e.dayData.day===day)??x,baseline=baselineRecord.entries.find(e=>e.programExerciseId===x.key)??baselineRecord.entries[i],progress=inherited(x,'progress'),update=inherited(x,'update')
   const stages=current.evaluatedSetVariations.map(variation=>variation.sets.map(set=>({
    reps:set.maxrep??null,minReps:set.minrep??null,weightKg:null,formula:set.weight?.unit==='%'?`${set.weight.value}% of 1RM`:null,
    percentage:set.weight?.unit==='%'?set.weight.value:null,loadFactor:set.weight&&set.weight.unit!=='%'?(reference[x.key]?E.Weight_convertTo(set.weight,'kg').value/reference[x.key]:1):1,
    unloaded:!set.weight&&set.rpe==null,effort:set.rpe??null,deriveEffortWeight:!set.weight&&set.rpe!=null,logEffort:Boolean(set.logRpe),amrap:Boolean(set.isAmrap),
    durationSeconds:set.setTimer??null,restSeconds:set.timer??null,label:set.label??'',kind:'work',unilateral:Boolean(slot.unilateral||set.isUnilateral||baseline.sets[0]?.isUnilateral)
   })))
   const choices=x.exerciseVariations.filter(v=>v.exerciseType).map(v=>{const id=original.bindings[E.Exercise_toKey(v.exerciseType)];if(!id)throw new Error(`Missing local exercise mapping for ${raw.id} ${v.name}`);return {exerciseId:id,name:E.Exercise_fullName(E.Exercise_get(v.exerciseType,settings.exercises),settings),bodyweight:v.exerciseType.equipment==='bodyweight',legacyKey:E.Exercise_toKey(v.exerciseType),unilateral:v.exerciseType.equipment==='dumbbell'}})
   const advanced={family:`family-${families.indexOf(x.key)}`,phase:`phase-${day}`,context:x.dayData,stages,choices,
    selection:{stage:Math.max(0,current.evaluatedSetVariations.findIndex(v=>v.isCurrent))+1,exercise:Math.max(0,x.exerciseVariations.findIndex(v=>v.isCurrent))+1,description:Math.max(0,x.descriptions?.values?.findIndex(v=>v.isCurrent)??0)+1},
    descriptions:(x.descriptions?.values??[]).map(v=>typeof v==='string'?v:v.value??''),variables:progress?.state??{},prompts:Object.entries(progress?.stateMetadata??{}).filter(([,meta])=>meta.userPrompted).map(([key])=>key),finish:ruleId(progress?.script),update:ruleId(update?.script),
    migration:{key:x.key,name:x.fullName,day:x.dayData.day,template:progress?.reuse?.fullName??x.reuse?.fullName}}
   return {...slot,progression:{kind:'rule'},advanced,prescriptions:stages[advanced.selection.stage-1]}
  })}
 })
 const next={...definition,sections,rulePrograms,migration:legacyHints(original),revision:'native-rules:'+createHash('sha256').update(JSON.stringify({sections,rulePrograms})).digest('hex').slice(0,16)}
 delete next.compatibility
 raw.engine=next
 for(const w of raw.weeks)for(const day of w.days){const section=sections.find(s=>s.weekIndex===w.week&&s.dayIndex===day.day);if(section)day.items=section.exercises}
 if(!dry)fs.writeFileSync(path,JSON.stringify(raw,null,2)+'\n')
 report.push({id:raw.id,execution:'native',features:[],sections:sections.length,nativeFeatures:['stateful rules','within-session rules','set variations','exercise variations','program inputs','effort-based loads']})
}
if(!dry)fs.writeFileSync('scripts/program-import/native-migration-report.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({programs:report.length,native:report.length,compatibility:0,dry}))
