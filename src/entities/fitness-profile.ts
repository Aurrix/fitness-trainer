export type FitnessProfileGender = 'male' | 'female'
export type FitnessGoal =
  | 'general-fitness'
  | 'strength'
  | 'muscle-gain'
  | 'fat-loss'
  | 'endurance'
export type FitnessActivityLevel = 'light' | 'moderate' | 'high' | 'athlete'
export type FitnessExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type FitnessEffortScale = 'rpe' | 'rir' | 'effort'

export type FitnessProfile = {
  activityLevel: FitnessActivityLevel
  age: number | null
  bodyFatPercentage: number | null
  effortScale: FitnessEffortScale
  experienceLevel: FitnessExperienceLevel
  gender: FitnessProfileGender
  heightCm: number | null
  notes: string
  primaryGoal: FitnessGoal
  weeklyWorkoutTarget: number | null
  weightKg: number | null
}
