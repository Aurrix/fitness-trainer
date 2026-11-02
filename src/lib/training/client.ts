import { getContentLibrary } from '../content'
import type { EngineDefinition, EngineSession, EngineState } from './types'
let worker: Worker | undefined
let sequence = 0
const pending = new Map<number, {resolve:(value:unknown)=>void;reject:(reason:Error)=>void;timer:ReturnType<typeof setTimeout>}>()
export function trainingEngine<T>(operation: 'adapt'|'compile'|'inspect'|'initialize'|'prepare'|'update'|'finish', payload: unknown): Promise<T> {
  const request = payload as {definition?:EngineDefinition;session?:EngineSession;state?:EngineState;id?:string}
  const definition=request.definition??request.session?.definition
  if(definition&&(definition.version===1||definition.compatibility)){
    const state=request.state??request.session?.before
    const oldProgram=state?.program as {id?:string}|undefined
    const ids=new Set([request.id,oldProgram?.id,definition.compatibility?.id])
    const candidate=getContentLibrary().programs.find(program=>program.engine?.version===2&&(ids.has(program.id)||definition.provenance?.sourceUrl&&program.engine.provenance?.sourceUrl===definition.provenance.sourceUrl))
    if(candidate?.engine)payload={...request,migrationDefinition:candidate.engine}
  }
  if (!worker) {
    worker = new Worker(new URL('engine/worker.mjs', new URL(import.meta.env.BASE_URL, window.location.origin)), {type:'module'})
    worker.onmessage = ({data}) => {
      const request=pending.get(data.id);if(!request)return
      clearTimeout(request.timer);pending.delete(data.id)
      if(data.error)request.reject(new Error(data.error));else request.resolve(data.result)
    }
    worker.onerror = () => { worker?.terminate();worker=undefined; for(const request of pending.values()){clearTimeout(request.timer);request.reject(new Error('The training engine could not run. Your saved workout is unchanged.'))}pending.clear() }
  }
  const id=++sequence
  return new Promise<T>((resolve,reject)=>{
    const timer=setTimeout(()=>{worker?.terminate();worker=undefined;for(const request of pending.values()){clearTimeout(request.timer);request.reject(new Error('Training calculation timed out. Your saved workout is unchanged.'))}pending.clear()},20000)
    pending.set(id,{resolve:value=>resolve(value as T),reject,timer})
    worker!.postMessage({id,operation,payload})
  })
}
