import { create } from 'zustand'
import { readPersistedState, writePersistedState } from '../../services/app-db'
import type { EngineRun } from './types'
export const TRAINING_STORAGE_KEY = 'fitness-trainer.training-engine-v1'
type TrainingStore = {ready:boolean;runs:Record<string,EngineRun>;hydrate:()=>Promise<void>;setRun:(id:string,run:EngineRun)=>void}
export const useTrainingStore=create<TrainingStore>((set,get)=>({
  ready:false,runs:{},
  async hydrate(){if(get().ready)return;const value=await readPersistedState<Record<string,EngineRun>>(TRAINING_STORAGE_KEY);set({ready:true,runs:value??{}})},
  setRun(id,run){const runs={...get().runs,[id]:run};set({runs});void writePersistedState(TRAINING_STORAGE_KEY,runs)},
}))
