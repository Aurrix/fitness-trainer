import type {
  FitnessActivityLevel,
  FitnessEffortScale,
  FitnessExperienceLevel,
  FitnessGoal,
  FitnessProfile,
} from '../entities/fitness-profile'

export type {
  FitnessActivityLevel,
  FitnessEffortScale,
  FitnessExperienceLevel,
  FitnessGoal,
  FitnessProfile,
  FitnessProfileGender,
} from '../entities/fitness-profile'

export const fitnessGoalOptions: Array<{ label: string; value: FitnessGoal }> = [
  { label: 'General Fitness', value: 'general-fitness' },
  { label: 'Strength', value: 'strength' },
  { label: 'Muscle Gain', value: 'muscle-gain' },
  { label: 'Fat Loss', value: 'fat-loss' },
  { label: 'Endurance', value: 'endurance' },
]

export const fitnessActivityLevelOptions: Array<{
  label: string
  value: FitnessActivityLevel
}> = [
  { label: 'Light', value: 'light' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'High', value: 'high' },
  { label: 'Athlete', value: 'athlete' },
]

export const fitnessExperienceOptions: Array<{
  label: string
  value: FitnessExperienceLevel
}> = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
]

export const fitnessEffortScaleOptions: Array<{
  label: string
  value: FitnessEffortScale
}> = [
  { label: 'RPE 1-10', value: 'rpe' },
  { label: 'RIR', value: 'rir' },
  { label: 'Easy / Hard / Failure', value: 'effort' },
]

export function createDefaultFitnessProfile(): FitnessProfile {
  return {
    activityLevel: 'moderate',
    age: null,
    bodyFatPercentage: null,
    effortScale: 'rpe',
    experienceLevel: 'beginner',
    gender: 'male',
    heightCm: null,
    notes: '',
    primaryGoal: 'general-fitness',
    weeklyWorkoutTarget: 3,
    weightKg: null,
  }
}

export function calculateBodyMassIndex(profile: FitnessProfile) {
  if (!profile.heightCm || !profile.weightKg) {
    return null
  }

  const heightMeters = profile.heightCm / 100

  if (!heightMeters) {
    return null
  }

  return profile.weightKg / (heightMeters * heightMeters)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsedValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN

  return Number.isFinite(parsedValue) ? parsedValue : null
}

export function normalizeFitnessProfile(value: unknown): FitnessProfile {
  const defaults = createDefaultFitnessProfile()

  if (!isRecord(value)) {
    return defaults
  }

  return {
    activityLevel:
      value.activityLevel === 'light' ||
      value.activityLevel === 'moderate' ||
      value.activityLevel === 'high' ||
      value.activityLevel === 'athlete'
        ? value.activityLevel
        : defaults.activityLevel,
    age: normalizeNullableNumber(value.age),
    bodyFatPercentage: normalizeNullableNumber(value.bodyFatPercentage),
    effortScale:
      value.effortScale === 'rir' || value.effortScale === 'effort'
        ? value.effortScale
        : defaults.effortScale,
    experienceLevel:
      value.experienceLevel === 'intermediate' || value.experienceLevel === 'advanced'
        ? value.experienceLevel
        : defaults.experienceLevel,
    gender: value.gender === 'female' ? 'female' : defaults.gender,
    heightCm: normalizeNullableNumber(value.heightCm),
    notes: typeof value.notes === 'string' ? value.notes : defaults.notes,
    primaryGoal:
      value.primaryGoal === 'strength' ||
      value.primaryGoal === 'muscle-gain' ||
      value.primaryGoal === 'fat-loss' ||
      value.primaryGoal === 'endurance'
        ? value.primaryGoal
        : defaults.primaryGoal,
    weeklyWorkoutTarget: normalizeNullableNumber(value.weeklyWorkoutTarget),
    weightKg: normalizeNullableNumber(value.weightKg),
  }
}
