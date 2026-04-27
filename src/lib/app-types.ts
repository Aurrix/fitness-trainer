import type { Program } from './content'
import type { ProgramSource } from '../services/program-stats'

export type AppTab =
  | 'library'
  | 'progression'
  | 'workout'
  | 'insights'
  | 'settings'

export type ProgramFilter = 'all' | 'library' | 'custom' | 'favorites'
export type ExerciseFilter = 'all' | 'favorites'
export type BannerTone = 'error' | 'success'
export type LibraryView = 'home' | 'programs' | 'exercises'
export type InsightsView = 'home' | 'notifications' | 'advice' | 'analysis'

export type AppProgram = Program & {
  programSource: ProgramSource
}

export type AppProgramSession = {
  program: AppProgram
  section: AppProgram['sections'][number]
}

export type WorkoutDayOption = {
  dayIndex: number
  dayLabel: string
  label: string
  section: Program['sections'][number]
  weekIndex: number
  weekLabel: string
}

export type WorkoutDayExercisePreview = {
  completed: boolean
  exerciseId: string
  hasLoggedSets: boolean
  name: string
  performedSetCount: number
  skipped: boolean
  type: 'planned' | 'extra-exercise' | 'cardio'
}

export type WorkoutDayPreview = {
  completedAt: string | null
  completedExerciseCount: number
  exercisePreviews: WorkoutDayExercisePreview[]
  extraEntryCount: number
  isActive: boolean
  isComplete: boolean
  performedExerciseCount: number
  plannedExerciseCount: number
  skippedExerciseCount: number
}

export type WorkoutWeekGroup = {
  dayOptions: WorkoutDayOption[]
  label: string
  weekIndex: number
}
