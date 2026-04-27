export type WorkoutSetLogEntry = {
  duration: string
  effort: string
  loggedAt: string | null
  reps: string
  weightKg: string
}

export type WorkoutExerciseLogType = 'planned' | 'extra-exercise' | 'cardio'

export type WorkoutExerciseLogEntry = {
  completed: boolean
  completedAt: string | null
  completedSets: string
  distanceKm: string
  duration: string
  effort: string
  exerciseId: string | null
  exerciseName: string
  firstLoggedAt: string | null
  logId: string
  lastLoggedAt: string | null
  loadKg: string
  muscleGroups: string[]
  notes: string
  plannedExerciseId: string | null
  setLogs: WorkoutSetLogEntry[]
  skippedAt: string | null
  skipped: boolean
  type: WorkoutExerciseLogType
}

export type WorkoutLog = {
  cardioEntryCount: number
  completedAt: string
  completedExerciseCount: number
  durationMinutes: number
  exerciseLogs: WorkoutExerciseLogEntry[]
  exertionScale: 'rpe' | 'rir' | 'effort'
  id: string
  notes: string
  programId: string
  programName: string
  programSource: 'library' | 'custom'
  sessionDate: string
  sectionId: string
  sectionName: string
  startedAt: string
  totalExerciseCount: number
}

export type ActiveWorkout = {
  completedExerciseIds: string[]
  exerciseLogs: Record<string, WorkoutExerciseLogEntry>
  exerciseOrder: string[]
  exertionScale: 'rpe' | 'rir' | 'effort'
  extraEntries: WorkoutExerciseLogEntry[]
  notes: string
  programId: string
  programName: string
  programSource: 'library' | 'custom'
  sectionId: string
  sectionName: string
  sessionId: string
  startedAt: string
  updatedAt: string
}
