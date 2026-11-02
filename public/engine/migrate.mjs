/** Import saved planner data into native state. Never execute legacy source. */
import {compileRule,kilograms} from './rules.mjs'
const clone=x=>structuredClone(x)
const hash=s=>{let h=2166136261;for(const c of String(s??''))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0).toString(16)}
const normalize=s=>String(s??'').replace(/\[[^\]]*\]/g,'').replace(/!/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase()
const quantity=text=>{const m=String(text).trim().match(/^(-?\d+(?:\.\d+)?)\s*(kg|lb|%)?$/);return m?m[2]?{value:Number(m[1]),unit:m[2]}:Number(m[1]):null}
function split(text,separator='/'){
 const out=[];let start=0,depth=0,script=false
 for(let i=0;i<text.length;i++){
  if(text.slice(i,i+2)==='{~'){script=true;i++;continue}
  if(script){if(text.slice(i,i+2)==='~}'){script=false;i++}continue}
  if('({'.includes(text[i]))depth++
  if(')}'.includes(text[i]))depth--
  if(text[i]===separator&&depth===0){out.push(text.slice(start,i).trim());start=i+1}
 }
 out.push(text.slice(start).trim());return out
}
function rowsFromSource(source){
 let week=1,day=0,index=0,buffer='',script=false,comment=[],activeComment=false,activeDescription;const out=[]
 for(const line of String(source??'').split('\n')){
  if(!script&&/^\s*\//.test(line)){
   const text=line.replace(/^\s*\/\/\/?\s?/, '')
   if(text.startsWith('!'))activeComment=true
   comment.push(text.replace(/^!\s?/,''));continue
  }
  if(!script&&comment.length){if(activeComment)activeDescription=comment.join('\n');comment=[];activeComment=false}
  if(!script&&/^#\s/.test(line)){const n=line.match(/\d+/);week=n?Number(n[0]):week+1;day=0;continue}
  if(!script&&/^##\s/.test(line)){day++;index++;continue}
  buffer+=(buffer?'\n':'')+line
  if(line.includes('{~'))script=true
  if(line.includes('~}'))script=false
  if(script)continue
  if(buffer.trim()){
   const parts=split(buffer),name=parts.shift();if(parts.length)out.push({week,day:Math.max(day,1),index:Math.max(index,1),name,parts,activeDescription,unused:parts.some(p=>/^used:\s*none/.test(p))})
  }
  if(buffer.trim())activeDescription=undefined
  buffer=''
 }
 return out
}
function plannerSource(state){return (state.program?.planner?.weeks??[]).map((w,wi)=>`# Week ${wi+1}\n`+w.days.map(d=>`## ${d.name}\n${d.exerciseText}`).join('\n')).join('\n')}
function parseSet(text){
 const m=text.trim().match(/^(\d+)x(\d+)(?:-(\d+))?(\+)?/);if(!m)return []
 const rest=text.slice(m[0].length),weight=rest.match(/(-?\d+(?:\.\d+)?)\s*(kg|lb|%)/),effort=rest.match(/@(\d+(?:\.\d+)?)/),times=[...rest.matchAll(/(\d+(?:\.\d+)?)s(\|)?/g)]
 return Array.from({length:Number(m[1])},()=>({reps:Number(m[3]??m[2]),minReps:m[3]?Number(m[2]):null,amrap:Boolean(m[4]),...(weight?{weight:quantity(weight[0])}:{}),...(effort?{effort:Number(effort[1])}:{}),...(times.length?times[0][2]?{durationSeconds:Number(times[0][1]),...(times[1]?{restSeconds:Number(times[1][1])}:{})}:{restSeconds:Number(times[0][1])}:{})}))
}
function describe(row,rows,visited=new Set()){
 if(!row||visited.has(row))return {stages:[],variables:{},stage:1,exercise:1}
 visited.add(row)
 const reuse=row.parts.find(p=>p.startsWith('...'))?.slice(3).replace(/\[[^\]]*\]/g,'').trim()
 const ref=rows.find(r=>normalize(r.name)===normalize(reuse)&&r.week===row.week&&r.day===row.day)??rows.find(r=>normalize(r.name)===normalize(reuse))
 const inherited=reuse?describe(ref,rows,visited):{stages:[],variables:{},stage:1,exercise:1}
 const result=clone(inherited),stages=[];let selected=1
 if(row.activeDescription)result.activeDescription=row.activeDescription
 const globals={}
 for(const part of row.parts){
  const sets=split(part.replace(/^!\s*/,''),',').flatMap(parseSet)
  if(sets.length){if(part.trim().startsWith('!'))selected=stages.length+1;stages.push(sets);continue}
  if(!/^(progress|update|warmup|superset|used):|^\.\.\./.test(part)){
   const w=part.match(/(-?\d+(?:\.\d+)?)(kg|lb|%)/),e=part.match(/@(\d+(?:\.\d+)?)/),t=part.match(/(\d+)s/)
   if(w)globals.weight=quantity(w[0]);if(e)globals.effort=Number(e[1]);if(t)globals.restSeconds=Number(t[1])
  }
  const progress=part.match(/^progress:\s*(custom|lp|dp|sum)\(([^)]*)\)/)
  if(progress){
   if(progress[1]==='custom')for(const pair of progress[2].split(',')){const m=pair.match(/^\s*(\w+)\+?:\s*(.*)$/);if(m){const value=quantity(m[2]);if(value!=null)result.variables[m[1]]=value}}
   else if(progress[1]==='lp'){const values=progress[2].split(',').map(quantity);result.variables.successCounter=values[2]??0;result.variables.failureCounter=values[5]??0}
   const script=part.match(/\{~([\s\S]*)~\}/)?.[0];if(script)result.script=script
   const template=part.match(/\{\s*\.\.\.([^}]+)\}/)?.[1];if(template){const target=rows.find(r=>normalize(r.name)===normalize(template));const parent=describe(target,rows,new Set(visited));result.variables={...parent.variables,...result.variables};result.script??=parent.script}
  }
 }
 if(stages.length){result.stages=stages.map(stage=>stage.map(set=>({...globals,...set})));result.stage=selected}
 else if(Object.keys(globals).length)result.stages=result.stages.map(stage=>stage.map(set=>({...set,...globals})))
 const choices=row.name.split('|');const active=choices.findIndex(name=>name.trim().startsWith('!'));result.exercise=active>=0?active+1:inherited.exercise??1
 return result
}
function findRow(rows,slot,section,legacySlot){
 const metadata=slot.advanced?.migration,context=slot.advanced?.context??{week:section.weekIndex,dayInWeek:section.dayIndex}
 const names=[slot.migrationName,metadata?.name,legacySlot?.exerciseName,slot.exerciseName].filter(Boolean).map(normalize)
 const matches=row=>names.includes(normalize(row.name))||names.includes(normalize(row.name.split(':').at(-1)))||metadata?.name&&normalize(row.name)===normalize(metadata.name)
 const candidates=rows.filter(r=>!r.unused&&matches(r))
 return candidates.find(r=>r.week===context.week&&r.day===context.dayInWeek)??candidates[0]
}
function descriptorsEqual(a,b){return JSON.stringify(a)===JSON.stringify(b)}
export function migrateState(definition,old,legacyDefinition,initialize,record,sectionId){
 if(old.version===2)return clone(old)
 const state=initialize({definition});state.runId=old.runId??state.runId;state.program.nextDay=old.program?.nextDay??1
 const originalRows=rowsFromSource(legacyDefinition?.source),rows=rowsFromSource(plannerSource(old)||legacyDefinition?.source)
 const data=old.settings?.exerciseData??{},pending=new Set(old.pendingLoads??[])
 for(const [key,exerciseId] of Object.entries(legacyDefinition?.bindings??definition.migration?.bindings??{})){
  if(pending.has(key)||!definition.loads[exerciseId])continue
  const saved=data[key]??{},rm1=saved.rm1?kilograms(saved.rm1):100
  state.settings.loads[exerciseId]={weightKg:0,maximumKg:rm1,incrementKg:saved.rounding??definition.loads[exerciseId].incrementKg}
 }
 const seen=new Set()
 for(const section of definition.sections)for(const [i,slot] of section.exercises.entries()){
  const legacySection=legacyDefinition?.sections?.find(s=>s.id===section.id),legacySlot=legacySection?.exercises?.[i]
  const hint=definition.migration?.phases?.[section.id+'|'+slot.id]
  const lookup={...slot,migrationName:hint?.name}
  const row=findRow(rows,lookup,section,legacySlot),initialRow=findRow(originalRows,lookup,section,legacySlot)
  if(!row)continue
  const value=describe(row,rows),initial=hint?.descriptor??describe(initialRow,originalRows)
  const id=slot.exerciseId,load=state.settings.loads[id]
  const first=value.stages.flat().find(s=>s.weight&&s.weight.unit!=='%')
  if(load&&first)load.weightKg=kilograms(first.weight)/(slot.prescriptions[0]?.loadFactor||1)
  if(slot.advanced){
   const a=slot.advanced,families=(state.program.ruleState??={families:{},phases:{}}).families,f=families[a.family]??={variables:{}}
   for(const [key,current] of Object.entries(value.variables))if(!descriptorsEqual(current,initial.variables[key]))f.variables[key]=clone(current)
   if(value.activeDescription){const selected=a.descriptions.findIndex(text=>normalize(text)===normalize(value.activeDescription));if(selected>=0)f.description=selected+1}
   if(value.stage!==initial.stage)f.stage=value.stage
   if(value.exercise!==initial.exercise)f.exercise=value.exercise
   const phaseId=a.family+'|'+a.phase;if(seen.has(phaseId))continue;seen.add(phaseId)
   const stages=clone(a.stages)
   value.stages.forEach((stage,v)=>stage.forEach((set,j)=>{
    const target=stages[v]?.[j],baseline=initial.stages[v]?.[j];if(!target)return
    for(const key of ['reps','minReps','effort','amrap','durationSeconds','restSeconds'])if(set[key]!==undefined&&!descriptorsEqual(set[key],baseline?.[key]))target[key]=set[key]
    if(set.weight&&!descriptorsEqual(set.weight,baseline?.weight)){
     if(set.weight.unit==='%'){target.percentage=set.weight.value;delete target.weightOverrideKg}
     else {target.weightOverrideKg=kilograms(set.weight);target.unloaded=false}
    }
   }))
   state.program.ruleState.phases[phaseId]=stages
  }else{
   const changed=value.stages[0]?.some((s,j)=>!descriptorsEqual(s,initial.stages[0]?.[j]))
   const vars=value.variables
   if(changed||vars.failureCounter||vars.successCounter||vars.failures){
    const sets=value.stages[0]??[],repChanged=sets.some((s,j)=>s.reps!==initial.stages[0]?.[j]?.reps),minChanged=sets.some((s,j)=>s.minReps!==initial.stages[0]?.[j]?.minReps)
    state.program.slots[slot.progressionKey??slot.id]={...state.program.slots[slot.progressionKey??slot.id],failures:kilograms(vars.failureCounter??vars.failures??0),successes:kilograms(vars.successCounter??0),...(repChanged?{reps:sets.map(s=>s.reps)}:{}),...(minChanged?{minReps:sets.map(s=>s.minReps)}:{}),...(sets.length&&sets.every(s=>s.weight&&s.weight.unit!=='%')?{weights:sets.map(s=>kilograms(s.weight))}:{})}
   }
  }
 }
 // A saved active snapshot identifies the exact exercise rung even when old source
 // omitted explicit variation markers. Its logged sets are retained separately.
 const active=definition.sections.find(s=>s.id===sectionId)
 if(active&&record?.entries)for(const [i,slot] of active.exercises.entries()){
  if(!slot.advanced)continue
  const entry=record.entries[i],local=entry?.exercise&&(legacyDefinition?.bindings??definition.migration?.bindings)?.[entry.exercise.id+'_'+entry.exercise.equipment]
  const choice=slot.advanced.choices.findIndex(c=>c.exerciseId===local)
  if(choice>=0){const f=(state.program.ruleState??={families:{},phases:{}}).families[slot.advanced.family]??={variables:{}};f.exercise=choice+1}
 }
 state.importedStateBackup=clone(old)
 return state
}
export function migrateDefinition(current,legacy){
 if(current){
  const result=clone(current)
  if(!legacy?.source||result.migration?.sourceHash===hash(legacy.source))return result
  if(!result.rulePrograms)return legacy.origin==='native'?migrateDefinition(null,legacy):result
  const rows=rowsFromSource(legacy.source),references={}
  for(const section of result.sections)for(const slot of section.exercises){
   const hint=result.migration?.phases?.[section.id+'|'+slot.id]
   const row=findRow(rows,{...slot,migrationName:hint?.name},section),descriptor=describe(row,rows)
   if(!row||!descriptor.stages.length)continue
   const a=slot.advanced,first=descriptor.stages.flat().find(s=>s.weight&&s.weight.unit!=='%'&&kilograms(s.weight)>0)
   if(first)references[a.family]??=kilograms(first.weight)
   a.stages=descriptor.stages.map((sets,v)=>sets.map((set,j)=>{
    const old=a.stages[v]?.[j]??a.stages[0][0]
    return {...old,reps:set.reps,minReps:set.minReps??null,amrap:set.amrap,effort:set.effort??null,deriveEffortWeight:!set.weight&&set.effort!=null,unloaded:!set.weight&&set.effort==null,percentage:set.weight?.unit==='%'?set.weight.value:null,loadFactor:set.weight&&set.weight.unit!=='%'?kilograms(set.weight)/(references[a.family]||1):1,...(set.durationSeconds!=null?{durationSeconds:set.durationSeconds}:{}),...(set.restSeconds!=null?{restSeconds:set.restSeconds}:{})}
   }))
   a.variables={...a.variables,...descriptor.variables};a.selection.stage=descriptor.stage;a.selection.exercise=descriptor.exercise
   if(descriptor.script){const id='imported-'+a.family+'-'+a.phase;result.rulePrograms[id]=compileRule(descriptor.script);a.finish=id}
   slot.prescriptions=clone(a.stages[a.selection.stage-1])
  }
  return result
 }
 // Old custom programs created by the app have fully expanded preview sections.
 // Import their own rule blocks as data instead of requiring the old interpreter.
 const rows=rowsFromSource(legacy.source),loads={},programs={},sections=legacy.sections.map((section,si)=>({...clone(section),exercises:section.exercises.map((slot,i)=>{
  const candidates=rows.filter(r=>!r.unused&&r.index===(section.engineDay??si+1)),row=candidates[i]
  if(!row)throw new Error(`Cannot locate the saved definition for ${slot.exerciseName}. Your original data is retained.`)
  const descriptor=describe(row,rows),stage=descriptor.stages[0]
  if(!stage?.length)throw new Error(`Cannot import the saved sets for ${slot.exerciseName}. Your original data is retained.`)
  const exerciseId=slot.exerciseId??slot.resolvedExerciseId,key=Object.keys(legacy.bindings??{}).find(k=>legacy.bindings[k]===exerciseId),bodyweight=key?.endsWith('_bodyweight')??false,incrementKg=key?.endsWith('_dumbbell')?1:2.5
  loads[exerciseId]={name:slot.exerciseName,bodyweight,maximum:descriptor.stages.flat().some(s=>s.weight?.unit==='%'),incrementKg}
  const convert=s=>({reps:s.reps,minReps:s.minReps??null,weightKg:null,percentage:s.weight?.unit==='%'?s.weight.value:null,loadFactor:1,unloaded:!s.weight&&s.effort==null,deriveEffortWeight:!s.weight&&s.effort!=null,effort:s.effort??null,amrap:s.amrap,durationSeconds:s.durationSeconds??null,restSeconds:s.restSeconds??null,formula:s.weight?.unit==='%'?`${s.weight.value}% of 1RM`:null,label:'',kind:'work',unilateral:Boolean(slot.unilateral)})
  const stages=descriptor.stages.map(s=>s.map(convert)),id=`rule-${si}-${i}`
  if(descriptor.script)programs[id]=compileRule(descriptor.script)
  return {...clone(slot),exerciseId,resolvedExerciseId:exerciseId,prescriptions:stages[descriptor.stage-1],warmups:[],progression:{kind:'rule'},advanced:{family:slot.engineKey??`custom-${si}-${i}`,phase:`phase-${section.engineDay??si+1}`,context:{week:section.weekIndex??1,dayInWeek:section.dayIndex??si+1,day:section.engineDay??si+1},stages,choices:[{exerciseId,name:slot.exerciseName,bodyweight,legacyKey:key}],selection:{stage:descriptor.stage,exercise:1,description:1},descriptions:[slot.notes??''],variables:descriptor.variables,prompts:[],finish:descriptor.script?id:null,update:null,migration:{name:row.name,key:slot.engineKey,day:section.engineDay??si+1}}}
 })}))
 return {version:2,revision:'native-import:'+legacy.revision,sections,loads,frequency:legacy.frequency,rulePrograms:programs,...(legacy.provenance?{provenance:legacy.provenance}:{})}
}

export function legacyHints(legacy){
 const rows=rowsFromSource(legacy.source),phases={}
 for(const section of legacy.sections)for(const [i,slot] of section.exercises.entries()){
  const candidates=rows.filter(r=>!r.unused&&r.index===(section.engineDay??legacy.sections.indexOf(section)+1))
  const row=findRow(rows,slot,section,slot)??candidates[i]
  if(row){const descriptor=describe(row,rows);delete descriptor.script;phases[section.id+'|'+slot.id]={name:row.name,descriptor}}
 }
 return {sourceHash:hash(legacy.source),bindings:clone(legacy.bindings??{}),phases}
}
