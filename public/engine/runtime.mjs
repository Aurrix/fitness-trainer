// All workout execution is native. Legacy text is converted into bounded native rule data.
import * as native from './native.mjs'
import {migrateDefinition,migrateState} from './migrate.mjs'
function definitionFor(definition,replacement){return definition.version===1||definition.compatibility?migrateDefinition(replacement,definition):definition}
function sessionFor(args){
 const original=args.session,definition=original.before.version===2&&original.definition.version===2&&!original.definition.compatibility?original.definition:structuredClone(definitionFor(original.definition,args.migrationDefinition))
 if(original.before.version===2&&original.definition===definition)return {session:original,migrated:false}
 const before=migrateState(definition,original.before,original.definition,native.initialize,original.record,original.section.id)
 const active=definition.sections.find(s=>s.id===original.section.id)
 if(active){
  const used=new Set()
  const aligned=original.section.exercises.map((oldSlot,i)=>{
   const key=original.record?.entries?.[i]?.programExerciseId
   const index=active.exercises.findIndex((slot,j)=>!used.has(j)&&(key&&slot.advanced?.migration.key===key||slot.exerciseId===oldSlot.exerciseId))
   if(index<0)throw new Error('A saved exercise could not be matched to its native definition. Original workout data is retained.')
   used.add(index);return {...active.exercises[index],id:oldSlot.id}
  })
  definition.sections=definition.sections.map(section=>section.id===active.id?{...section,exercises:aligned}:section)
 }
 const session=native.prepare({definition,state:before,sectionId:original.section.id})
 session.answers={...original.answers}
 for(const slot of session.section.exercises)for(const key of slot.advanced?.prompts??[]){const id=slot.advanced.family+'|'+key,oldId=slot.advanced.migration?.key+'|'+key;if(session.answers[id]==null&&original.answers?.[oldId]!=null)session.answers[id]=original.answers[oldId]}
 return {session,migrated:true}
}
export function inspect(args){return native.inspect({...args,definition:definitionFor(args.definition,args.migrationDefinition)})}
export function initialize(args){return native.initialize({...args,definition:definitionFor(args.definition,args.migrationDefinition)})}
export function prepare(args){
 const definition=definitionFor(args.definition,args.migrationDefinition)
 const state=args.state.version===2?args.state:migrateState(definition,args.state,args.legacyDefinition??args.definition,native.initialize)
 return native.prepare({...args,definition,state})
}
export function update(args){const {session}=sessionFor(args);return native.update({...args,session})}
export function finish(args){const {session,migrated}=sessionFor(args);return {...native.finish({...args,session}),...(migrated?{definition:session.definition,before:session.before}:{})}}
export function adapt(args){return native.adapt(args)}
export function compile(args){return native.compile({...args,definition:definitionFor(args.definition,args.migrationDefinition),...(args.definition.version===1||args.definition.compatibility?{source:undefined}:{})})}
