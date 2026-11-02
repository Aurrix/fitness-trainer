import {executeRule,kilograms} from './rules.mjs'
import {effortTable} from './effort-table.mjs'
const clone=x=>structuredClone(x)
const round=(n,step)=>Math.round(Math.round(n/step)*step*10000)/10000
const numeric=x=>String(x??'').trim()===''?null:Number(x)
const safe=name=>{if(['__proto__','prototype','constructor'].includes(name))throw new Error('Invalid rule state name');return name}
export function effortMultiplier(reps,effort){
 const row=effortTable[Math.max(1,Math.min(200,Math.round(reps)))],position=Math.max(0,Math.min(12,effort*2-8)),lo=Math.floor(position),hi=Math.ceil(position)
 return row[lo]+(row[hi]-row[lo])*(position-lo)
}
function storage(state){return state.program.ruleState??={families:{},phases:{}}}
function family(state,slot){return storage(state).families[slot.advanced.family]??={variables:{}}}
function phase(state,slot,write=false){
 const id=slot.advanced.family+'|'+slot.advanced.phase,phases=storage(state).phases
 if(write)return phases[id]??=clone(slot.advanced.stages)
 return phases[id]??slot.advanced.stages
}
function selection(state,slot){const f=family(state,slot),a=slot.advanced;return {stage:Math.max(1,Math.min(a.stages.length,f.stage??a.selection.stage)),exercise:Math.max(1,Math.min(a.choices.length,f.exercise??a.selection.exercise)),description:f.description??a.selection.description}}
function maximum(state,slot){return state.settings.loads[slot.exerciseId]?.maximumKg??0}
function rawWeight(spec,state,slot){
 if(spec.weightOverrideKg!=null)return spec.weightOverrideKg
 if(spec.unloaded)return 0
 const load=state.settings.loads[slot.exerciseId]
 if(!load)return 0
 if(spec.percentage!=null)return (load.maximumKg??0)*spec.percentage/100
 if(spec.deriveEffortWeight)return (load.maximumKg??0)*effortMultiplier(spec.reps??1,spec.effort??10)
 return load.weightKg*(spec.loadFactor??1)
}
function renderSpec(spec,state,slot){
 const load=state.settings.loads[slot.exerciseId],unloaded=spec.unloaded&&spec.weightOverrideKg==null
 return {...spec,unloaded,weightKg:!unloaded&&(load||spec.weightOverrideKg!=null)?round(rawWeight(spec,state,slot),load?.incrementKg??slot.loadIncrementKg??2.5):null,formula:spec.percentage!=null&&spec.weightOverrideKg==null?`${spec.percentage}% of 1RM`:null}
}
function makeEntry(template,state,definition){
 const selected=selection(state,template),choice=template.advanced.choices[selected.exercise-1]
 const slot={...clone(template),loadIncrementKg:definition.loads[choice.exerciseId].incrementKg,exerciseId:choice.exerciseId,resolvedExerciseId:choice.exerciseId,exerciseName:choice.name,notes:template.advanced.descriptions[selected.description-1]??template.notes}
 return {slot,selected,sets:phase(state,template)[selected.stage-1].map(spec=>renderSpec(spec,state,slot)),actual:[],programSets:phase(state,template)[selected.stage-1].length}
}
const arrayFields={weights:'weightKg',reps:'reps',minReps:'minReps',RPE:'effort',setTime:'durationSeconds'}
function environment(definition,state,entry,mode,setIndex=0){
 const {slot}=entry,a=slot.advanced,f=family(state,slot)
 const max=()=>maximum(state,slot)
 const step=()=>state.settings.loads[slot.exerciseId]?.incrementKg??definition.loads[slot.exerciseId].incrementKg
 const quantity=value=>value&&typeof value==='object'&&value.unit==='%'?max()*value.value/100:kilograms(value)
 const numberOfSets=()=>entry.sets.length
 const fieldValues=name=>{
  if(arrayFields[name])return entry.sets.map(s=>s[arrayFields[name]]??(name==='RPE'?10:name==='minReps'?s.reps??0:0))
  const fields={completedReps:'reps',completedWeights:'weight',completedRPE:'effort',completedSetTime:'seconds'}
  if(fields[name])return entry.sets.map((_,i)=>entry.actual[i]?.[fields[name]]??0)
  return null
 }
 const get=(name,selectors)=>{
  if(name.startsWith('state.')){const property=safe(name.slice(6));return Object.hasOwn(f.variables,property)?f.variables[property]:a.variables[property]??0}
  const values=fieldValues(name)
  if(values)return selectors.length?values[(selectors.at(-1)??1)-1]??0:values
  const vars={ns:numberOfSets(),numberOfSets:numberOfSets(),programNumberOfSets:entry.programSets,completedNumberOfSets:entry.actual.filter(Boolean).length,setIndex,week:a.context.week,dayInWeek:a.context.dayInWeek,day:a.context.day,rm1:max(),setVariationIndex:entry.selected.stage,exerciseVariationIndex:entry.selected.exercise,descriptionIndex:entry.selected.description}
  if(!Object.hasOwn(vars,name))throw new Error(`Unknown training-rule field: ${name}`)
  return vars[name]
 }
 function resize(count){
  count=Math.floor(quantity(count));if(count<1||count>200)throw new Error('A training rule requested an invalid number of sets.')
  while(entry.sets.length<count)entry.sets.push({...clone(entry.sets.at(-1)),label:'',amrap:false})
  entry.sets.length=count
 }
 function setField(spec,name,value,operator,binary,slotForWeight){
  const field=arrayFields[name]
  const before=name==='weights'?rawWeight(spec,state,slotForWeight):spec[field]??(name==='RPE'?10:0)
  const after=operator==='='?quantity(value):binary(operator[0],before,value)
  if(!Number.isFinite(after))throw new Error('A training rule produced a non-finite target.')
  if(name==='weights'){
   // Multiplication retains percentage prescriptions; explicit loads become kg overrides.
   if((operator==='*='||operator==='/=')&&spec.percentage!=null&&spec.weightOverrideKg==null)spec.percentage=operator==='*='?spec.percentage*quantity(value):spec.percentage/quantity(value)
   else {spec.weightOverrideKg=after;spec.unloaded=false}
  }else spec[field]=after
 }
 const write=(name,selectors,operator,value,binary)=>{
  if(name.startsWith('state.')){const property=safe(name.slice(6));f.variables[property]=operator==='='?clone(value):binary(operator[0],get(name,[]),value);return}
  if(name==='rm1'){
   const load=state.settings.loads[slot.exerciseId]??={weightKg:0,incrementKg:definition.loads[slot.exerciseId].incrementKg}
   const after=operator==='='?quantity(value):binary(operator[0],max(),value)
   if(!(after>0)||!Number.isFinite(after))throw new Error('A training rule produced an invalid maximum.')
   load.maximumKg=after;return
  }
  if(name==='numberOfSets'){resize(operator==='='?value:binary(operator[0],numberOfSets(),value));return}
  if(['setVariationIndex','exerciseVariationIndex','descriptionIndex'].includes(name)){
   const target={setVariationIndex:'stage',exerciseVariationIndex:'exercise',descriptionIndex:'description'}[name]
   const count=target==='stage'?a.stages.length:target==='exercise'?a.choices.length:Math.max(1,a.descriptions.length)
   const n=Math.floor(operator==='='?quantity(value):binary(operator[0],entry.selected[target],value))
   if(n<1||n>count)throw new Error(`A training rule selected an unavailable ${target}.`)
   entry.selected[target]=n;if(mode==='finish')f[target]=n;return
  }
  if(!arrayFields[name])throw new Error(`Rule field ${name} is read-only.`)
  const setSelector=selectors.length?selectors.at(-1):null
  const values=Array.isArray(value)?value:null
  // Update the current working vectors for subsequent instructions in this rule.
  entry.sets.forEach((spec,i)=>{if((setSelector==null||setSelector===i+1)&&!(mode==='update'&&entry.actual[i])){const desired=values?values[i]??values.at(-1):value;const field=arrayFields[name];const old=spec[field]??(name==='RPE'?10:0);spec[field]=operator==='='?quantity(desired):binary(operator[0],old,desired);if(name==='weights'){spec.unloaded=false;spec.formula=null}}})
  if(mode==='update')return
  const seen=new Set()
  for(const section of definition.sections)for(const template of section.exercises){
   if(template.advanced?.family!==a.family)continue
   const phaseId=template.advanced.phase;if(seen.has(phaseId))continue;seen.add(phaseId)
   const context=template.advanced.context
   if(selectors.length===4&&((selectors[0]!=null&&selectors[0]!==context.week)||(selectors[1]!=null&&selectors[1]!==context.dayInWeek)))continue
   phase(state,template,true).forEach((stage,v)=>{
    if(selectors.length===4&&selectors[2]!=null&&selectors[2]!==v+1)return
    stage.forEach((spec,i)=>{if(setSelector==null||setSelector===i+1)setField(spec,name,values?values[i]??values.at(-1):value,operator,binary,{...slot,exerciseId:slot.exerciseId})})
   })
  }
 }
 return {read:get,write,maximum:max,round:n=>round(n,step()),effortMultiplier,sets:(from,to,min,reps,amrap,weight,rest,rpe,log)=>{
  for(let j=Math.max(1,Math.floor(from));j<=Math.min(numberOfSets(),Math.floor(to));j++)if(!entry.actual[j-1])entry.sets[j-1]={...entry.sets[j-1],minReps:min,reps,amrap:Boolean(amrap),weightKg:weight,unloaded:false,formula:null,restSeconds:rest,effort:rpe||null,logEffort:Boolean(log)}
  return 0
 }}
}
function run(definition,state,entry,mode,setIndex=0){const id=entry.slot.advanced[mode==='update'?'update':'finish'];if(id)executeRule(definition.rulePrograms[id],environment(definition,state,entry,mode,setIndex))}
function finalize(entry,state){
 const step=state.settings.loads[entry.slot.exerciseId]?.incrementKg??entry.slot.loadIncrementKg??2.5
 return {...entry.slot,sets:String(entry.sets.length),prescriptions:entry.sets.map(set=>({...set,minReps:set.minReps===set.reps?null:set.minReps,weightKg:set.weightKg==null||!state.settings.loads[entry.slot.exerciseId]&&set.weightOverrideKg==null?null:round(set.weightKg,step)})),warmups:entry.slot.warmups?.length&&state.settings.loads[entry.slot.exerciseId]?entry.slot.warmups.map(s=>({...s,weightKg:round(round(entry.sets[0].weightKg??0,step)*(s.workFraction??0),step)})):[]}
}
function snapshot(definition,state,sectionId){
 const template=definition.sections.find(s=>s.id===sectionId);if(!template)throw new Error('Workout day is missing from this definition')
 const entries=template.exercises.map(slot=>makeEntry(slot,state,definition))
 entries.forEach(entry=>run(definition,state,entry,'update',0))
 return {template,entries}
}
function sessionFrom(definition,state,template,entries,before=state){
 const section={...clone(template),exercises:entries.map(e=>finalize(e,state))},prompts=[],seen=new Set()
 for(const entry of entries)for(const key of entry.slot.advanced.prompts){const id=entry.slot.advanced.family+'|'+key;if(!seen.has(id)){prompts.push({id,label:entry.slot.exerciseName+' — '+key});seen.add(id)}}
 const record={day:definition.sections.indexOf(template)+1,entries:section.exercises.map(slot=>({sets:slot.prescriptions.map(s=>({reps:s.reps,minReps:s.minReps,setTimer:s.durationSeconds,weight:s.weightKg==null?null:{value:s.weightKg,unit:'kg'}}))}))}
 return {version:1,definition:clone(definition),before:clone(before),initialSection:clone(section),section,record,prompts,answers:{},events:[],explanations:[],baselines:clone(state.settings.baselines??{})}
}
export function prepare({definition,state,sectionId}){const working=clone(state),{template,entries}=snapshot(definition,working,sectionId);return sessionFrom(definition,working,template,entries,state)}
function replay(session,logs,effortScale,state){
 const definition=session.definition,{template,entries}=snapshot(definition,state,session.section.id),events=[]
 for(const [i,entry] of entries.entries()){
  const log=logs[entry.slot.id]
  if(!log||log.skipped||log.exerciseId&&log.exerciseId!==entry.slot.exerciseId){entry.suppressed=true;continue}
  for(const [j,actual] of (log.setLogs??[]).entries())if(actual.completedAt)events.push({i,j,actual,at:actual.completedAt})
 }
 events.sort((a,b)=>a.at.localeCompare(b.at)||a.i-b.i||a.j-b.j)
 for(const event of events){
  const entry=entries[event.i],a=event.actual
  if(event.j>=200)throw new Error('Too many sets in a workout.')
  while(entry.sets.length<=event.j)entry.sets.push(clone(entry.sets.at(-1)))
  const set=entry.sets[event.j],reps=numeric(a.reps),weight=numeric(a.weightKg)??(set.weightKg===0?0:null)
  const effortValue=String(a.effort??'').match(/\d+(?:\.\d+)?/)?.[0],effort=effortValue==null?null:effortScale==='rir'?10-Number(effortValue):Number(effortValue)
  const durationValue=String(a.duration??'').match(/\d+(?:\.\d+)?/)?.[0],seconds=durationValue==null?null:Number(durationValue)*(/sec/i.test(a.duration)?1:60)
  if(set.durationSeconds==null&&(!Number.isFinite(reps)||reps<0))throw new Error('Enter actual reps before completing a prescribed set.')
  if(!set.unloaded&&set.durationSeconds==null&&!Number.isFinite(weight))throw new Error('Enter actual weight before completing a loaded set.')
  if((set.effort!=null||set.logEffort)&&(!Number.isFinite(effort)||effort<0||effort>10))throw new Error('This program requires actual RPE for the completed set.')
  if(set.durationSeconds!=null&&(!Number.isFinite(seconds)||seconds<0))throw new Error('Enter the actual duration of the timed set.')
  entry.actual[event.j]={reps:reps??0,weight:weight??0,effort:effort??0,seconds:seconds??0}
  run(definition,state,entry,'update',event.j+1)
 }
 return {template,entries,events:events.map(({i,j,at})=>({i,j,at}))}
}
export function update({session,logs,effortScale},state){const result=replay(session,logs,effortScale,state);return {...sessionFrom(session.definition,state,result.template,result.entries,session.before),initialSection:clone(session.initialSection??session.section),answers:session.answers,events:result.events}}
export function finish({session,logs,effortScale},state){
 const {template,entries,events}=replay(session,logs,effortScale,state),explanations=[]
 for(const entry of entries){
  if(entry.suppressed||!entry.actual.some(Boolean))continue
  const f=family(state,entry.slot)
  for(const key of entry.slot.advanced.prompts){const value=session.answers?.[entry.slot.advanced.family+'|'+key];if(!Number.isFinite(value))throw new Error(`Enter the program input: ${entry.slot.exerciseName} — ${key}`);f.variables[key]=value}
  run(session.definition,state,entry,'finish')
 }
 const after=prepare({definition:session.definition,state,sectionId:session.section.id})
 for(const [i,entry] of entries.entries()){
  const next=after.section.exercises[i],previous=session.section.exercises[i]
  if(entry.suppressed&&logs[entry.slot.id]?.exerciseId&&logs[entry.slot.id].exerciseId!==entry.slot.exerciseId){explanations.push(`${entry.slot.exerciseName}: kept future targets unchanged because this exercise was substituted.`);continue}
  if(JSON.stringify(next.prescriptions)!==JSON.stringify(previous.prescriptions)||next.exerciseId!==previous.exerciseId)explanations.push(`${entry.slot.exerciseName}: applied its native progression rules; next target ${next.prescriptions[0]?.reps??'timed'} reps @ ${next.prescriptions[0]?.weightKg??'unloaded'} kg${next.exerciseId!==previous.exerciseId?`, advancing to ${next.exerciseName}`:''}.`)
 }
 state.program.nextDay=session.definition.sections.indexOf(template)%session.definition.sections.length+2
 if(state.program.nextDay>session.definition.sections.length)state.program.nextDay=1
 return {state,baselines:clone(state.settings.baselines??{}),nextDay:state.program.nextDay,explanations,events}
}
