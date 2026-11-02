import { normalizeExerciseMuscleGroup } from '../entities/exercise-muscles'
import type { Exercise } from './content'

export const muscleGroups = [
  ['abs', 'Abs', 'abs upper-abs lower-abs transverse-abdominis obliques'],
  ['chest', 'Chest', 'chest upper-chest middle-chest lower-chest inner-chest serratus-anterior'],
  ['back', 'Back', 'upper-back lats rhomboids teres-major trapezius upper-traps mid-traps lower-traps lower-back spinal-erectors infraspinatus'],
  ['shoulders', 'Shoulders', 'deltoids front-delts side-delts rear-delts infraspinatus'],
  ['arms', 'Arms', 'biceps biceps-long-head biceps-short-head brachialis brachioradialis triceps triceps-long-head triceps-lateral-head triceps-medial-head forearm forearm-flexors forearm-extensors'],
  ['legs', 'Legs', 'hip-flexors adductors adductor-longus adductor-magnus pectineus quadriceps rectus-femoris sartorius vastus-lateralis vastus-medialis vastus-intermedius hamstring biceps-femoris semitendinosus semimembranosus calves gastrocnemius soleus tibialis tibialis-anterior'],
  ['glutes', 'Glutes', 'gluteal glute-max glute-med glute-min tensor-fasciae-latae'],
  ['neck', 'Neck', 'neck sternocleidomastoid omohyoid'],
] as const
export const equipmentGroups = [
  ['bodyweight', 'Bodyweight', ['bodyweight', 'body only', 'bodyweight only', 'none']],
  ['dumbbells', 'Dumbbells', ['dumbbell', 'dumbbells']],
  ['barbell', 'Barbell', ['barbell', 'barbells']],
  ['cable', 'Cable', ['cable', 'cables', 'cable machine', 'pulley']],
  ['machine', 'Machine', ['machine', 'leverage machine', 'smith machine']],
  ['bands', 'Bands', ['band', 'bands', 'resistance band', 'resistance bands']],
] as const
export type ExerciseFacets = { muscle: string; specificMuscle: string; equipment: string }
export const emptyExerciseFacets: ExerciseFacets = { muscle: '', specificMuscle: '', equipment: '' }
const muscleKey = (value: string) => normalizeExerciseMuscleGroup(value) ?? value
const equipmentKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')
export function muscleInGroup(muscle: string, group: string) {
  return !group || muscleGroups.find(([id]) => id === group)?.[2].split(' ').includes(muscleKey(muscle)) === true
}
export function matchesExerciseFacets(exercise: Pick<Exercise, 'muscleGroups' | 'equipment'>, facets: ExerciseFacets) {
  return (!facets.muscle || exercise.muscleGroups.some(muscle => muscleInGroup(muscle, facets.muscle))) &&
    (!facets.specificMuscle || exercise.muscleGroups.some(muscle => muscleKey(muscle) === muscleKey(facets.specificMuscle))) &&
    (!facets.equipment || exercise.equipment.some(gear => facets.equipment.startsWith('exact:')
      ? gear === facets.equipment.slice(6)
      : equipmentGroups.find(([id]) => id === facets.equipment)?.[2].some(alias => equipmentKey(alias) === equipmentKey(gear))))
}
export function exerciseFacetCount(facets: ExerciseFacets) { return Number(Boolean(facets.muscle || facets.specificMuscle)) + Number(Boolean(facets.equipment)) }
