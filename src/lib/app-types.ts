import type { Program } from './content'
import type { ProgramSource } from '../services/program-stats'

export type AppTab =
  | 'library'
  | 'progression'
  | 'workout'
  | 'my-programs'
  | 'settings'

export type ProgramFilter = 'all' | 'library' | 'custom'
export type BannerTone = 'error' | 'success'
export type LibraryView = 'home' | 'programs' | 'exercises'

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

export type WorkoutWeekGroup = {
  dayOptions: WorkoutDayOption[]
  label: string
  weekIndex: number
}
