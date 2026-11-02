export type ExerciseBaseline = {exerciseId:string;sectionId:string;setIndex:number;completedAt:string;reps:number|null;weightKg:number|null;durationSeconds:number|null;effortRpe:number|null}
import type { ProgramSection } from '../content'
export type ProgressionRule = {kind:'none'|'range'|'double'|'linear'|'rule';incrementKg?:number;minReps?:number;maxReps?:number;successes?:number;failures?:number;decrement?:{percent?:number;kg?:number;basis?:'maximum'}}
export type SetPrescription = {
  logEffort?:boolean; deriveEffortWeight?:boolean; workFraction?:number; unloaded?:boolean; loadFactor?:number; percentage?:number|null
  reps: number | null; minReps: number | null; weightKg: number | null
  formula: string | null; effort: number | null; amrap: boolean
  durationSeconds: number | null; restSeconds: number | null
  label: string; kind: 'work' | 'warmup'; unilateral: boolean
}
export type EngineDefinition = {
  provenance?: {author?:string;license?:string;sourceUrl?:string;commit:string}
  version: 1 | 2; revision: string; source?: string; customExercises?: Record<string, unknown>
  bindings?: Record<string, string>; sections: ProgramSection[]; origin?: string; frequency: number
  rulePrograms?: Record<string, unknown[]>
  loads?: Record<string, {name:string;bodyweight:boolean;maximum:boolean;incrementKg:number}>
  compatibility?: {id:string;features:string[]}
}
export type EngineState = { version?:2; runId?:string; program: unknown; settings: unknown }
export type EngineSession = {
  initialSection?:ProgramSection
  baselines?:Record<string,ExerciseBaseline>
  prompts?: Array<{id:string;label:string}>; answers?:Record<string,number>
  version: 1; definition: EngineDefinition; before: EngineState; record: unknown
  section: ProgramSection; events: Array<{i:number;j:number;at:string}>; explanations: string[]
}
export type EngineField = { key: string; exerciseId: string; name: string; bodyweight: boolean; maximum: boolean; increment: number }
export type EngineInput = {weightKg:number; maximumKg?:number; incrementKg:number}
export type EngineFinish = {baselines?:Record<string,ExerciseBaseline>;definition?:EngineDefinition;before?:EngineState;state:EngineState;nextDay:number;explanations:string[];events:EngineSession['events']}
export type EngineRun = {state:EngineState; revision:string; explanations:string[]}
