import {validateRuleProgram} from './rules.mjs'
import * as advanced from './advanced.mjs'
/** Fitness Trainer's declarative progression engine. No external interpreter imports. */
const copy=value=>structuredClone(value)
const number=value=>String(value??'').trim()===''?null:Number(value)
const finite=value=>typeof value==='number'&&Number.isFinite(value)
const round=(value,step)=>Math.round(Math.round(value/step)*step*10000)/10000
const key=slot=>slot.progressionKey??slot.id
const loadKey=slot=>slot.exerciseId??slot.resolvedExerciseId
const hash=text=>{let h=2166136261;for(const char of text)h=Math.imul(h^char.charCodeAt(0),16777619);return (h>>>0).toString(16)}

export function inspect({definition}){
 return Object.entries(definition.loads).map(([exerciseId,load])=>({key:exerciseId,exerciseId,name:load.name,bodyweight:load.bodyweight,maximum:load.maximum,increment:load.incrementKg}))
}
export function initialize({definition,values}){
 const loads={}
 for(const f of inspect({definition})){
  const value=values?.[f.key]
  if(!value)continue
  if(!finite(value.weightKg)||(!f.bodyweight&&value.weightKg<=0)||!finite(value.incrementKg)||value.incrementKg<=0||f.maximum&&!(value.maximumKg>0))throw new Error(`Enter valid starting values for ${f.name}`)
  const reps=definition.sections.flatMap(s=>s.exercises).find(slot=>loadKey(slot)===f.key)?.prescriptions[0]?.reps??5
  loads[f.key]={...copy(value),maximumKg:value.maximumKg??(value.weightKg>0?value.weightKg*(1+reps/30):undefined)}
 }
 return {version:2,runId:crypto.randomUUID(),program:{nextDay:1,slots:{}},settings:{loads,baselines:{}}}
}
function requireState(state){if(state?.version!==2)throw new Error('This session uses an older training engine. Start a new run to use native progression.')}
function prescription(set,slot,state){
 const load=state.settings.loads[loadKey(slot)],progress=state.program.slots[key(slot)]
 const index=slot.prescriptions.indexOf(set),step=load?.incrementKg??2.5
 let weight=load?(set.percentage!=null?load.maximumKg*set.percentage/100:load.weightKg*(set.loadFactor??1)):null
 if(progress?.weights?.[index]!=null)weight=progress.weights[index]
 const unloaded=set.unloaded&&progress?.weights?.[index]==null
 return {...set,unloaded,minReps:progress?.minReps?.[index]??set.minReps,reps:progress?.reps?.[index]??set.reps,weightKg:!unloaded&&finite(weight)?round(weight,step):null}
}
export function prepare({definition,state,sectionId}){
 if(definition.rulePrograms)return advanced.prepare({definition,state,sectionId})
 requireState(state)
 const template=definition.sections.find(s=>s.id===sectionId)
 if(!template)throw new Error('Workout day is missing from this definition')
 const section=copy(template)
 section.exercises=section.exercises.map(slot=>({...slot,prescriptions:slot.prescriptions.map(set=>prescription(set,slot,state)),warmups:slot.warmups?.length&&state.settings.loads[loadKey(slot)]?slot.warmups.map(set=>({...set,weightKg:round((prescription(slot.prescriptions[0],slot,state).weightKg??0)*(set.workFraction??0),state.settings.loads[loadKey(slot)].incrementKg)})):[]}))
 // The record is our immutable prepared snapshot; actual results remain in the workout logs.
 const record={day:definition.sections.indexOf(template)+1,entries:section.exercises.map(slot=>({sets:slot.prescriptions.map(p=>({reps:p.reps,minReps:p.minReps,setTimer:p.durationSeconds,weight:p.weightKg==null?null:{value:p.weightKg,unit:'kg'}}))}))}
 return {version:1,definition:copy(definition),before:copy(state),initialSection:copy(section),section,record,events:[],explanations:[],prompts:[],answers:{},baselines:copy(state.settings.baselines??{})}
}
function calibrate(session,logs,effortScale){
 const state=copy(session.before)
 const baselines=state.settings.baselines??={}
 const events=session.section.exercises.flatMap((slot,i)=>{
  const log=logs[slot.id]
  if(!log||log.skipped||log.exerciseId&&log.exerciseId!==loadKey(slot))return []
  return (log.setLogs??[]).flatMap((actual,j)=>actual.completedAt?[{slot,i,j,actual}]:[])
 }).sort((a,b)=>a.actual.completedAt.localeCompare(b.actual.completedAt)||a.i-b.i||a.j-b.j)
 for(const {slot,j,actual} of events){
  const id=loadKey(slot),config=session.definition.loads[id],p=slot.prescriptions[j]??slot.prescriptions.at(-1)
  if(!p||p.kind==='warmup')continue
  const reps=number(actual.reps),weight=number(actual.weightKg),duration=String(actual.duration??'')
  const seconds=number(duration.match(/\d+(?:\.\d+)?/)?.[0])
  const durationSeconds=seconds==null?null:seconds*(/sec/i.test(duration)?1:60)
  const effort=number(String(actual.effort??'').match(/\d+(?:\.\d+)?/)?.[0])
  const validWeight=weight==null||finite(weight)&&(config.bodyweight||weight>=0)
  const valid=p.durationSeconds!=null?finite(durationSeconds)&&durationSeconds>0:finite(reps)&&reps>0&&validWeight&&(p.unloaded||config.bodyweight||finite(weight)&&weight>0)
  if(!baselines[id]&&valid)baselines[id]={exerciseId:id,sectionId:session.section.id,setIndex:j,completedAt:actual.completedAt,reps:finite(reps)?reps:null,weightKg:finite(weight)?weight:null,durationSeconds:p.durationSeconds!=null?durationSeconds:null,effortRpe:finite(effort)?effortScale==='rir'?10-effort:effort:null}
  if(state.settings.loads[id]||!valid||p.unloaded||p.durationSeconds!=null||!finite(weight)||!finite(reps)||reps<=0||!config.bodyweight&&weight<=0)continue
  state.settings.loads[id]={weightKg:weight/(p.loadFactor||1),maximumKg:weight>0?weight*(1+reps/30):undefined,incrementKg:config.incrementKg}
 }
 return state
}
function results(session,logs,effortScale){
 const events=[]
 for(const [i,slot] of session.section.exercises.entries()){
  const log=logs[slot.id]
  if(!log||log.skipped||log.exerciseId&&log.exerciseId!==loadKey(slot))continue
  for(const [j,actual] of (log.setLogs??[]).entries()){
   if(!actual.completedAt)continue
   const p=slot.prescriptions[j]??slot.prescriptions.at(-1)
   const reps=number(actual.reps),weight=number(actual.weightKg)??(session.definition.loads[loadKey(slot)].bodyweight?0:null),duration=number(String(actual.duration??'').match(/\d+(?:\.\d+)?/)?.[0])
   if(p.durationSeconds==null&&(!finite(reps)||reps<0))throw new Error('Enter actual reps before completing a prescribed set.')
   if(!p.unloaded&&p.durationSeconds==null&&(!finite(weight)||!session.definition.loads[loadKey(slot)].bodyweight&&weight<0))throw new Error('Enter actual weight before completing a loaded set.')
   if(p.durationSeconds!=null&&(!finite(duration)||duration<0))throw new Error('Enter the actual duration of the timed set.')
   let effort=number(String(actual.effort??'').match(/\d+(?:\.\d+)?/)?.[0])
   if(effortScale==='rir'&&effort!=null)effort=10-effort
   if(p.effort!=null&&(!finite(effort)||effort<0||effort>10))throw new Error('This program requires actual RPE for the completed set.')
   events.push({i,j,at:actual.completedAt,reps,weight,effort})
  }
 }
 return events.sort((a,b)=>a.at.localeCompare(b.at)||a.i-b.i||a.j-b.j)
}
export function update({session,logs,effortScale}){
 if(session.definition.rulePrograms)return advanced.update({session,logs,effortScale},calibrate(session,logs,effortScale))
 const state=calibrate(session,logs,effortScale)
 const prepared=prepare({definition:session.definition,state,sectionId:session.section.id})
 return {...prepared,initialSection:copy(session.initialSection??session.section),before:copy(session.before),answers:session.answers,events:results(prepared,logs,effortScale).map(({i,j,at})=>({i,j,at}))}
}
export function finish({session,logs,effortScale}){
 if(session.definition.rulePrograms)return advanced.finish({session,logs,effortScale},calibrate(session,logs,effortScale))
 const state=calibrate(session,logs,effortScale),prepared=prepare({definition:session.definition,state,sectionId:session.section.id})
 const events=results(prepared,logs,effortScale),explanations=[]
 for(const [i,slot] of prepared.section.exercises.entries()){
  const log=logs[slot.id]
  if(log?.exerciseId&&log.exerciseId!==loadKey(slot)){explanations.push(`${slot.exerciseName}: kept future targets unchanged because this exercise was substituted.`);continue}
  const rule=slot.progression??{kind:'none'},actual=events.filter(e=>e.i===i)
  if(rule.kind==='none'||actual.length<slot.prescriptions.length)continue
  const work=slot.prescriptions.map((p,j)=>({p,a:actual.find(a=>a.j===j)}))
  if(work.some(({p,a})=>!a||p.durationSeconds!=null||a.weight==null))continue
  const previous=state.program.slots[key(slot)]??{},next=copy(previous)
  const successful=work.every(({p,a})=>a.reps>=(p.minReps??p.reps??0)&&(p.effort==null||a.effort<=p.effort))
  const ceiling=work.every(({p,a})=>a.reps>=(p.reps??0)&&(p.effort==null||a.effort<=p.effort))
  const step=state.settings.loads[loadKey(slot)]?.incrementKg??rule.incrementKg??2.5
  const increment=rule.kind==='range'?step:rule.incrementKg??step
  next.weights=work.map(({p,a})=>rule.kind==='range'||p.weightKg==null||p.weightKg===0&&a.weight!==0?a.weight:p.weightKg)
  if(rule.kind==='range'){
   next.failures=successful?0:(previous.failures??0)+1
   if(ceiling)next.weights=next.weights.map(w=>w+increment)
  }else if(rule.kind==='double'){
   if(ceiling){
    const max=work.every(({a})=>a.reps>=rule.maxReps)
    next.reps=work.map(({a})=>max?rule.minReps:Math.min(rule.maxReps,a.reps+1))
    if(max)next.weights=work.map(({a})=>a.weight+increment)
   }
  }else if(rule.kind==='linear'){
   next.successes=(previous.successes??0)+(ceiling?1:0)
   next.failures=(previous.failures??0)+(successful?0:1)
   if(ceiling&&next.successes>=(rule.successes??1)){next.weights=work.map(({a})=>a.weight+increment);next.successes=0;next.failures=0}
  }
  if(rule.failures>0&&next.failures>=rule.failures){
   next.weights=next.weights.map(w=>rule.decrement?.percent!=null?rule.decrement.basis==='maximum'?w-(state.settings.loads[loadKey(slot)]?.maximumKg??0)*rule.decrement.percent/100:w*(1+(w<0?1:-1)*rule.decrement.percent/100):w-(rule.decrement?.kg??0))
   next.failures=0;next.successes=0
  }
  // Keep sub-step changes so small increments accumulate instead of disappearing.
  next.weights=next.weights.map((w,j)=>rule.kind==='range'?w:(previous.weights?.[j]??work[j].p.weightKg??work[j].a.weight)+(w-(work[j].p.weightKg??work[j].a.weight)))
  state.program.slots[key(slot)]=next
  const changed=next.weights.some((w,j)=>round(w,step)!==slot.prescriptions[j].weightKg)||next.reps?.some((r,j)=>r!==slot.prescriptions[j].reps)
  if(changed)explanations.push(`${slot.exerciseName}: ${next.reps?.[0]??slot.prescriptions[0].reps} reps @ ${round(next.weights[0],step)} kg. Applied ${rule.kind} progression to your completed work sets.`)
 }
 state.program.nextDay=prepared.record.day%session.definition.sections.length+1
 return {state,baselines:copy(state.settings.baselines??{}),nextDay:state.program.nextDay,explanations,events:events.map(({i,j,at})=>({i,j,at}))}
}
export function compile({definition,source}){
 const data=source?JSON.parse(source):{sections:definition.sections,loads:definition.loads,...(definition.rulePrograms?{rulePrograms:definition.rulePrograms}:{})}
 const programs=data.rulePrograms??definition.rulePrograms
 if(programs)Object.values(programs).forEach(validateRuleProgram)
 if(!Array.isArray(data.sections)||!data.sections.length||!data.loads)throw new Error('The definition needs workout sections and exercise load settings.')
 for(const [id,load] of Object.entries(data.loads)){if(!load||!finite(load.incrementKg)||load.incrementKg<=0||typeof load.bodyweight!=='boolean')throw new Error(`Invalid load settings for ${id}`)}
 if(!data.sections.some(section=>section.exercises?.length))throw new Error('A program needs at least one training day.')
 const ids=new Set()
 for(const section of data.sections){
  if(!section.id||ids.has(section.id)||!Array.isArray(section.exercises)||!section.exercises.length&&!section.restDay)throw new Error('Each workout needs a unique ID and at least one exercise.')
  ids.add(section.id)
  const slotIds=new Set()
  for(const slot of section.exercises){
   if(!slot.id||slotIds.has(slot.id))throw new Error('Each exercise slot needs a unique ID within its workout.')
   slotIds.add(slot.id)
   if(!data.loads[slot.exerciseId]||!slot.prescriptions?.length)throw new Error(`Missing load settings or sets for ${slot.exerciseName}`)
   if(!['none','range','double','linear','rule'].includes(slot.progression?.kind??'none'))throw new Error(`Unsupported progression rule for ${slot.exerciseName}`)
   if(slot.progression?.kind==='rule'){
    const a=slot.advanced
    if(!a||typeof a.family!=='string'||['__proto__','constructor','prototype'].includes(a.family)||!a.stages?.length||!a.choices?.length)throw new Error(`Missing native rule configuration for ${slot.exerciseName}`)
    for(const choice of a.choices)if(!data.loads[choice.exerciseId])throw new Error(`Missing load settings for ${choice.name}`)
    for(const id of [a.finish,a.update])if(id&&!programs?.[id])throw new Error(`Missing native rule program ${id}`)
    if(a.stages.some(stage=>!Array.isArray(stage)||!stage.length||stage.length>200))throw new Error('Invalid native set variation')
   }
   const rule=slot.progression
   if(rule?.kind==='double'&&(!finite(rule.minReps)||!finite(rule.maxReps)||rule.minReps<=0||rule.maxReps<rule.minReps))throw new Error(`Invalid progression rep range for ${slot.exerciseName}`)
   if(rule?.incrementKg!=null&&(!finite(rule.incrementKg)||rule.incrementKg<=0))throw new Error(`Invalid progression increment for ${slot.exerciseName}`)
   for(const p of slot.prescriptions)if(p.loadFactor!=null&&(!finite(p.loadFactor)||p.loadFactor<0)||p.reps!=null&&(!finite(p.reps)||p.reps<0)||p.percentage!=null&&(!finite(p.percentage)||p.percentage<0))throw new Error(`Invalid set prescription for ${slot.exerciseName}`)
  }
 }
 const unchanged=JSON.stringify({sections:definition.sections,loads:definition.loads,...(definition.rulePrograms?{rulePrograms:definition.rulePrograms}:{})})===JSON.stringify(data)
 const result={...copy(definition),sections:data.sections,loads:data.loads,...(programs?{rulePrograms:programs}:{}),revision:unchanged?definition.revision:'native-v2:'+hash(JSON.stringify(data))}
 delete result.source
 return result
}
export function adapt({program,exercises}){
 const loads={}
 const sections=program.sections.map((section,si)=>({...copy(section),id:`engine-day-${si+1}`,exercises:section.exercises.map((item,i)=>{
  const ex=exercises.find(e=>e.id===item.exerciseId||e.id===item.resolvedExerciseId||[e.name,...(e.aliases??[])].some(n=>n.toLowerCase()===item.exerciseName.toLowerCase()))
  if(!ex)throw new Error(`Select a library exercise for ${item.exerciseName} before enabling automatic progression.`)
  const basis=ex.strengthBenchmarks?.measurement?.basis??'',bodyweight=/externalLoadKg|bodyweight|hold|reps/.test(ex.strengthBenchmarks?.kind??''),incrementKg=/per dumbbell/.test(basis)?1:2.5
  loads[ex.id]={name:ex.name,bodyweight,maximum:false,incrementKg}
  const count=number(String(item.sets).match(/\d+/)?.[0])??3,range=String(item.reps).match(/^(\d+)(?:-(\d+))?$/),duration=String(item.duration??'').match(/(\d+(?:\.\d+)?)/)
  if(!range&&!duration)throw new Error(`Specify a numeric rep range or duration for ${item.exerciseName}.`)
  const seconds=duration?Number(duration[1])*(/min/i.test(item.duration)?60:1):null
  const rest=Number(String(item.rest).match(/\d+/)?.[0]??2)*(/sec/i.test(item.rest)?1:60)
  return {...copy(item),id:`engine-${si+1}-${i}`,exerciseId:ex.id,resolvedExerciseId:ex.id,exerciseName:ex.name,progressionKey:`${ex.id}:day-${section.dayIndex??si+1}:slot-${i}`,progression:{kind:seconds||bodyweight&&ex.strengthBenchmarks?.kind!=='externalLoadKg'?'none':'range',incrementKg,failures:3,decrement:{percent:10}},prescriptions:Array.from({length:count},()=>({reps:range?Number(range[2]??range[1]):null,minReps:range?Number(range[1]):null,weightKg:null,loadFactor:1,percentage:null,formula:null,effort:null,amrap:false,durationSeconds:seconds,restSeconds:rest,label:'',kind:'work',unilateral:false})),warmups:[]}
 })}))
 return compile({definition:{version:2,revision:'native-v2:'+hash(JSON.stringify(sections)),sections,loads,frequency:sections.filter(s=>(s.weekIndex??1)===1).length}})
}
