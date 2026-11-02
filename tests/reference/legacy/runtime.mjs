import * as E from '../liftosaur.mjs'
import { exerciseDescription } from '../descriptions.mjs'
const clone=x=>structuredClone(x)
const kg=w=>w==null?null:E.Weight_convertTo(w,'kg').value
function evaluated(state){const p=E.Program_forceEvaluate(state.program,state.settings);if(p.errors.length)throw new Error(JSON.stringify(p.errors));return p}
function create(definition,id,name){const settings=E.Settings_build('kg');settings.exercises=clone(definition.customExercises??{});return {program:{...E.Program_create(name,id),planner:{vtype:'planner',name,weeks:E.PlannerProgram_evaluateText(definition.source)}},settings}}
export function inspect({definition,id,name}){
 const state=create(definition,id,name),fields=new Map()
 for(const x of E.Program_getAllProgramExercises(evaluated(state))){
  for(const v of x.exerciseVariations??[]){
   if(!v.exerciseType||x.notused)continue
   const type=v.exerciseType,key=E.Exercise_toKey(type),localId=definition.bindings[key],bodyweight=type.equipment==='bodyweight',maximum=E.ProgramExercise_doesUse1RM(x)
   const old=fields.get(key)
   fields.set(key,{key,exerciseId:localId,name:E.Exercise_fullName(E.Exercise_get(type,state.settings.exercises),state.settings).replace(/^Native /,''),bodyweight,maximum:maximum||old?.maximum,increment:type.equipment==='dumbbell'?1:2.5})
  }
 }
 return [...fields.values()]
}
export function initialize({definition,id,name,values,existing}){
 let state=existing?clone(existing):create(definition,id,name)
 const automatic=values==null
 values??={}
 const fields=inspect({definition,id:id??state.program.id,name:name??state.program.name})
 for(const f of fields){const input=values[f.key];if(!input&&(automatic||existing))continue;if(!input||!Number.isFinite(input.weightKg)||(!f.bodyweight&&input.weightKg<=0)||!Number.isFinite(input.incrementKg)||input.incrementKg<=0||f.maximum&&!(input.maximumKg>0))throw new Error(`Confirm starting values for ${f.name}`)
  state.settings.exerciseData[f.key]={rounding:input.incrementKg,...(input.maximumKg>0?{rm1:{value:input.maximumKg,unit:'kg'}}:{})}
 }
 let ev=evaluated(state)
 const keys=[...new Set(E.Program_getAllProgramExercises(ev).filter(x=>!x.notused).map(x=>x.key))]
 for(const key of keys){const x=E.Program_getAllProgramExercises(ev).find(x=>x.key===key),input=values[E.Exercise_toKey(x.exerciseType)];if(!input)continue
  const changes=E.ProgramExercise_weightChanges(ev,key),absolute=changes.filter(c=>c.originalWeight.unit!=='%')
  const reference=absolute.find(c=>Math.abs(kg(c.originalWeight))>0)?.originalWeight
  if(absolute.length){ev=E.PlannerProgram_replaceWeight(ev,key,changes.map(c=>c.originalWeight.unit==='%'?c:{...c,weight:{value:reference?input.weightKg*kg(c.originalWeight)/kg(reference):input.weightKg,unit:'kg'}}))}
 }
 state.program=E.Program_applyEvaluatedProgram(state.program,ev,state.settings)
 if(definition.origin==='native'){
  ev=evaluated(state)
  for(const x of E.Program_getAllProgramExercises(ev)){const input=x.exerciseType&&values[E.Exercise_toKey(x.exerciseType)];if(input&&x.progress?.state.increment)x.progress.state.increment={value:input.incrementKg,unit:'kg'}}
  state.program=E.Program_applyEvaluatedProgram(state.program,ev,state.settings)
 }
 state.runId??=crypto.randomUUID()
 if(automatic)state.pendingLoads=fields.map(f=>f.key)
 return state
}
function prescribed(set,kind='work'){
 return {reps:set.reps??null,minReps:set.minReps??null,weightKg:kg(set.weight),formula:set.originalWeight?.unit==='%'?`${set.originalWeight.value}% of 1RM`:null,effort:set.rpe??null,amrap:Boolean(set.isAmrap),durationSeconds:set.setTimer??null,restSeconds:set.timer??null,label:set.label??'',kind,unilateral:Boolean(set.isUnilateral)}
}
export function prepare({definition,state,sectionId}){
 const base=definition.sections.find(s=>s.id===sectionId);if(!base)throw new Error('Workout day is missing from this definition')
 const record=E.Program_nextHistoryRecord(clone(state.program),clone(state.settings),E.Stats_getEmpty(),base.engineDay??definition.sections.indexOf(base)+1)
 for(let i=0;i<record.entries.length;i++)if(base.exercises[i]?.unilateral)for(const set of record.entries[i].sets)set.isUnilateral=true
 const evaluatedExercises=E.Program_getAllProgramExercises(evaluated(state))
 const section={...clone(base),exercises:record.entries.map((entry,i)=>{
  const id=definition.bindings[E.Exercise_toKey(entry.exercise)];if(!id)throw new Error(`Missing exercise mapping: ${entry.exercise.id}`)
  const old=base.exercises[i]??{}
  const descriptionExercise=evaluatedExercises.find(exercise=>exercise.key===entry.programExerciseId&&exercise.dayData.day===record.day)
  return {...old,notes:exerciseDescription(descriptionExercise)||old.notes?.replace(/\[object Object\]/g,''),id:`engine-${definition.sections.indexOf(base)+1}-${i}`,exerciseId:id,resolvedExerciseId:id,exerciseName:definition.origin==='native'?old.exerciseName:E.Exercise_fullName(E.Exercise_get(entry.exercise,state.settings.exercises),state.settings),engineKey:entry.programExerciseId,sets:String(entry.sets.length),prescriptions:entry.sets.map(s=>({...prescribed(s),...(state.pendingLoads?.includes(E.Exercise_toKey(entry.exercise))?{weightKg:null}: {})})),warmups:state.pendingLoads?.includes(E.Exercise_toKey(entry.exercise))?[]:(entry.warmupSets??[]).map(s=>prescribed(s,'warmup')),superset:entry.superset??null}
 })}
 const prompts=[]
 for(const x of evaluatedExercises){if(x.dayData.day!==record.day||x.notused)continue;for(const [key,meta] of Object.entries(x.progress?.stateMetadata??{})){if(meta.userPrompted)prompts.push({id:x.key+'|'+key,exerciseKey:x.key,key,label:x.fullName+' — '+key})}}
 return {definition:clone(definition),before:clone(state),record,section,events:[],version:1,explanations:[],prompts,answers:{}}
}
function calibrate(session,logs){
 const pending=session.before.pendingLoads??[]
 if(!pending.length)return session
 const values={}
 for(let i=0;i<session.record.entries.length;i++){
  const entry=session.record.entries[i],slot=session.section.exercises[i],key=E.Exercise_toKey(entry.exercise),log=logs[slot.id]
  if(!pending.includes(key)||values[key]||!log||log.skipped||log.exerciseId&&log.exerciseId!==slot.exerciseId)continue
  const first=log.setLogs?.find(s=>s.completedAt&&String(s.weightKg??'').trim()!==''&&Number.isFinite(Number(s.weightKg))&&Number(s.reps)>0)
  if(!first)continue
  const weight=Number(first.weightKg),bodyweight=entry.exercise.equipment==='bodyweight'
  if(!bodyweight&&weight<=0)continue
  const maximum=weight>0?weight*(1+Number(first.reps)/30):undefined
  values[key]={weightKg:weight,maximumKg:maximum,incrementKg:entry.exercise.equipment==='dumbbell'?1:2.5}
 }
 if(!Object.keys(values).length)return session
 const before=initialize({definition:session.definition,values,existing:session.before})
 before.pendingLoads=pending.filter(key=>!values[key])
 const prepared=prepare({definition:session.definition,state:before,sectionId:session.section.id})
 return {...prepared,answers:session.answers}
}
function fillResults(session,logs,effortScale){
 const record=clone(session.record),state=session.before,ev=evaluated(state),events=[]
 for(let i=0;i<record.entries.length;i++){
  const entry=record.entries[i],slot=session.section.exercises[i],log=logs[slot.id]
  if(!log||log.skipped||log.exerciseId&&log.exerciseId!==slot.exerciseId){entry.isSuppressed=true;continue}
  for(let j=0;j<(log.setLogs??[]).length;j++){const actual=log.setLogs[j];if(actual.completedAt)events.push({i,j,actual,at:actual.completedAt})}
 }
 events.sort((a,b)=>a.at.localeCompare(b.at)||a.i-b.i||a.j-b.j)
 for(const event of events){const entry=record.entries[event.i],a=event.actual
  if(!entry.sets[event.j]){const previous=entry.sets.at(-1);entry.sets.push({...clone(previous),index:event.j,id:`extra-${event.j}`,isCompleted:false,completedReps:undefined,completedWeight:undefined})}
  const set=entry.sets[event.j]
  if(session.definition.origin==='native'&&set.minReps==null)set.minReps=set.reps
  const n=v=>String(v??'').trim()===''?undefined:Number(v)
  set.completedReps=n(a.reps);set.completedWeight=n(a.weightKg)===undefined?(set.weight?.value===0?{value:0,unit:'kg'}:undefined):{value:n(a.weightKg),unit:'kg'}
  if(!Number.isFinite(set.completedReps)&&!set.setTimer)throw new Error('Enter actual reps before completing a prescribed set.')
  if(set.weight?.value!==0&&!set.completedWeight&& !set.setTimer)throw new Error('Enter actual weight before completing a loaded set.')
  const effort=n(String(a.effort??'').match(/\d+(?:\.\d+)?/)?.[0])
  if(effort!==undefined&&(set.rpe!=null||set.logRpe))set.completedRpe=effortScale==='rir'?10-effort:effort
  if((set.logRpe||set.rpe!=null)&&set.completedRpe===undefined)throw new Error('This program requires actual RPE for the completed set.')
  if(set.setTimer){const text=String(a.duration??'');const duration=n(text);set.completedSetTimer=duration===undefined?undefined:/sec/i.test(text)?duration:duration*60;if(!(set.completedSetTimer>=0))throw new Error('Enter the actual duration of the timed set.')}
  if(set.isUnilateral){set.completedRepsLeft=set.completedReps;set.completedSetTimerLeft=set.completedSetTimer}
  set.isCompleted=true
  const ex=E.Program_getAllProgramExercises(ev).find(x=>x.key===entry.programExerciseId&&x.dayData.day===record.day)
  if(ex)record.entries[event.i]=E.Progress_runUpdateScriptForEntry(entry,E.Progress_getDayData(record),ex,ev.states,event.j,state.settings,E.Stats_getEmpty())
 }
 return {record,events}
}
export function update({session,logs,effortScale}){
 session=calibrate(session,logs)
 const {record,events}=fillResults(session,logs,effortScale)
 return {...session,events:events.map(({i,j,at})=>({i,j,at})),section:{...session.section,exercises:session.section.exercises.map((e,i)=>({...e,prescriptions:record.entries[i].sets.map(s=>({...prescribed(s),...(session.before.pendingLoads?.includes(E.Exercise_toKey(record.entries[i].exercise))?{weightKg:null}:{})})),warmups:session.before.pendingLoads?.includes(E.Exercise_toKey(record.entries[i].exercise))?[]:(record.entries[i].warmupSets??[]).map(s=>prescribed(s,'warmup'))}))}}
}
export function finish({session,logs,effortScale}){
 session=calibrate(session,logs)
 const {record,events}=fillResults(session,logs,effortScale),before=clone(session.before)
 for(const prompt of session.prompts??[]){const answer=session.answers?.[prompt.id];if(!Number.isFinite(answer))throw new Error(`Enter the program input: ${prompt.label}`);record.userPromptedStateVars??={};record.userPromptedStateVars[prompt.exerciseKey]??={};record.userPromptedStateVars[prompt.exerciseKey][prompt.key]=answer}
 // Upstream's reusable-script lookup falls through to the template even for progress:none.
 // Suppress finish callbacks for these entries; their actual results remain in our history.
 const finishProgram=evaluated(before)
 for(const entry of record.entries){const ex=E.Program_getAllProgramExercises(finishProgram).find(x=>x.key===entry.programExerciseId&&x.dayData.day===record.day);if(ex?.progress?.type==='none')entry.isSuppressed=true}
 const result=E.Program_runAllFinishDayScripts(before.program,record,E.Stats_getEmpty(),before.settings,message=>{throw new Error(message)})
 const state={pendingLoads:before.pendingLoads,runId:before.runId,program:result.program,settings:{...before.settings,exerciseData:{...before.settings.exerciseData}}}
 for(const [key,value] of Object.entries(result.exerciseData))state.settings.exerciseData[key]={...state.settings.exerciseData[key],...value}
 const nextDay=state.program.nextDay,explanations=[]
 for(const slot of session.section.exercises){const log=logs[slot.id];if(log?.exerciseId&&log.exerciseId!==slot.exerciseId)explanations.push(`${slot.exerciseName}: kept future targets unchanged because this exercise was substituted.`)}
 const after=E.Program_nextHistoryRecord(state.program,state.settings,E.Stats_getEmpty(),record.day)
 for(let i=0;i<record.entries.length;i++){
  const old=session.record.entries[i],next=after.entries[i];if(!next||!old)continue
  const a=old.sets.map(s=>`${s.reps}${s.isAmrap?'+':''} reps${s.weight?` @ ${kg(s.weight)} kg`:''}`).join(', ')
  const b=next.sets.map(s=>`${s.reps}${s.isAmrap?'+':''} reps${s.weight?` @ ${kg(s.weight)} kg`:''}`).join(', ')
  if(next.exercise.id!==old.exercise.id)explanations.push(`${session.section.exercises[i].exerciseName}: advanced to ${next.exercise.name} under this program's variation rule.`)
  if(a!==b)explanations.push(`${session.section.exercises[i].exerciseName}: ${a} → ${b}. Applied this program's progression rule to your completed sets.`)
 }
 return {state,nextDay,explanations,events:events.map(({i,j,at})=>({i,j,at}))}
}
export function compile({definition,source,id,name,names={}}){
 const def={...clone(definition),source}
 const state=create(def,id,name),ev=evaluated(state),sections=[]
 for(const [wi,week] of ev.weeks.entries())for(const [di,day] of week.days.entries()){
  const n=sections.length+1,record=E.Program_nextHistoryRecord(state.program,state.settings,E.Stats_getEmpty(),n)
  sections.push({id:`engine-day-${n}`,engineDay:n,name:`${week.name} — ${day.name}`,shortName:day.name,weekIndex:wi+1,weekLabel:week.name,dayIndex:di+1,dayLabel:`Day ${di+1}`,optional:/accessory/i.test(day.name),notes:day.description??'',exercises:record.entries.map((entry,i)=>{
   const local=def.bindings[E.Exercise_toKey(entry.exercise)];if(!local)throw new Error(`No verified exercise mapping for ${entry.exercise.name}. Use an exercise already available in this automatic program.`)
   return {id:`engine-${n}-${i}`,exerciseId:local,resolvedExerciseId:local,exerciseName:names[local]??entry.exercise.name,engineKey:entry.programExerciseId,sets:String(entry.sets.length),reps:entry.sets.map(s=>s.reps+(s.isAmrap?'+':'')).join('/'),duration:'',rest:entry.sets[0]?.timer?`${entry.sets[0].timer} sec`:'',notes:exerciseDescription(day.exercises.find(exercise=>exercise.key===entry.programExerciseId))}
  })})
 }
 if(ev.weeks.length===1 && sections.length<definition.frequency){const base=[...sections],n=base.length,freq=definition.frequency;let length=n;while(length%freq)length+=n;sections.splice(0,sections.length,...Array.from({length},(_,i)=>({...clone(base[i%n]),id:`engine-day-${i+1}`,weekIndex:Math.floor(i/freq)+1,weekLabel:`Week ${Math.floor(i/freq)+1}`,dayIndex:i%freq+1,exercises:base[i%n].exercises.map((ex,j)=>({...ex,id:`engine-${i+1}-${j}`}))})))}
 let hash=2166136261;for(const char of source)hash=Math.imul(hash^char.charCodeAt(0),16777619)
 return {...def,sections,revision:definition.revision.split(':')[0]+':'+(hash>>>0).toString(16)}
}
export function adapt({program,exercises,revision}){
 const customExercises={},bindings={},lines=[]
 const weeks=[...new Set(program.sections.map(s=>s.weekIndex??1))].sort((a,b)=>a-b)
 for(const week of weeks){lines.push(`# Week ${week}`);for(const section of program.sections.filter(s=>(s.weekIndex??1)===week)){
  lines.push(`## ${section.name.replace(/[\n\r]/g,' ')}`)
  for(const [i,item] of section.exercises.entries()){
   const ex=exercises.find(e=>e.id===item.exerciseId||e.id===item.resolvedExerciseId||[e.name,...e.aliases].some(n=>n.toLowerCase()===item.exerciseName.toLowerCase()))
   if(!ex)throw new Error(`Select a library exercise for ${item.exerciseName} before enabling automatic progression.`)
   const cid=`custom-${ex.id}`,name=`Local ${ex.id}`,basis=ex.strengthBenchmarks?.measurement?.basis??'',gear=/per dumbbell/.test(basis)?'dumbbell':/stack|machine/.test(basis)?'leverageMachine':/externalLoadKg|bodyweight|hold|reps/.test(ex.strengthBenchmarks?.kind??'')?'bodyweight':'barbell'
   customExercises[cid]={vtype:'custom_exercise',id:cid,name,isDeleted:false,defaultEquipment:gear,types:[],meta:{targetMuscles:[],synergistMuscles:[],bodyParts:[],sortedEquipment:[gear]}}
   bindings[`${cid}_${gear}`]=ex.id
   const sets=Number(String(item.sets).match(/\d+/)?.[0]??3),reps=item.reps.match(/^\d+(?:-\d+)?$/)?.[0],seconds=item.duration?Number(item.duration.match(/\d+/)?.[0])*(/min/i.test(item.duration)?60:1):null
   if(!reps&&!seconds)throw new Error(`Specify a numeric rep range or duration for ${item.exerciseName}; review complex prescriptions in the automatic definition editor.`)
   const rest=Number(item.rest.match(/\d+/)?.[0]??2)*(/sec/i.test(item.rest)?1:60),inc=gear==='dumbbell'?1:2.5
   const rule=seconds||(gear==='bodyweight'&&ex.strengthBenchmarks?.kind!=='externalLoadKg')?'':` / progress: custom(failures: 0, increment: ${inc}kg) {~
if (completedReps >= minReps) {
 state.failures = 0
 for (var.i in completedReps) { weights[var.i] = completedWeights[var.i]; if (completedReps >= reps) { weights[var.i] += state.increment } }
} else {
 state.failures += 1
 for (var.i in completedReps) { weights[var.i] = completedWeights[var.i]; if (state.failures >= 3) { if (weights[var.i] < 0) { weights[var.i] *= 1.1 } else { weights[var.i] *= 0.9 } } }
 if (state.failures >= 3) { state.failures = 0 }
}
~}`
   lines.push(`// ${(item.notes??'').replace(/[\n\r]/g,' ')}\nslot${section.dayIndex??1}x${i}: ${name} / ${seconds?`${sets}x1 0kg ${seconds}s|${rest}s`:`${sets}x${reps} 0kg ${rest}s`} / warmup: none${rule}`)
  }
 }}
 return compile({definition:{version:1,revision,origin:'native',frequency:program.sections.filter(s=>(s.weekIndex??1)===weeks[0]).length,customExercises,bindings,sections:[]},source:lines.join('\n'),id:program.id??'custom',name:program.name,names:Object.fromEntries(exercises.map(e=>[e.id,e.name]))})
}
