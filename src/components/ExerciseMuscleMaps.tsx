import { useMemo } from 'react'
import Body, { type ExtendedBodyPart, type Slug } from '@mjcdev/react-body-highlighter'
import { mapExerciseMuscleGroupToBodySlug } from '../entities/exercise-muscles'
import type { Exercise } from '../lib/content'
import { buildExerciseMuscleProfile, muscleLabels } from '../lib/muscles'

type Props = { exercise: Exercise; gender?: 'male' | 'female'; side?: 'front' | 'back'; miniature?: boolean }

export default function ExerciseMuscleMaps({ exercise, gender = 'male', side, miniature = false }: Props) {
  const data = useMemo(() => {
    const primary = new Set(exercise.primaryTargetMuscleGroups.filter(target => target.factor > 0).map(target => mapExerciseMuscleGroupToBodySlug(target.muscleGroup)).filter(Boolean))
    const secondary = new Set(exercise.secondaryTargetMuscleGroups.filter(target => target.factor > 0).map(target => mapExerciseMuscleGroupToBodySlug(target.muscleGroup)).filter(Boolean))
    if (!primary.size && !secondary.size) buildExerciseMuscleProfile(exercise).muscles.forEach(muscle => primary.add(muscle.slug))
    return (Object.keys(muscleLabels) as Slug[]).map(slug => ({ slug, intensity: primary.has(slug) ? 3 : secondary.has(slug) ? 2 : 1 })) satisfies ExtendedBodyPart[]
  }, [exercise])
  return (
    <span className={miniature ? 'exercise-muscle-maps exercise-muscle-maps--mini' : 'exercise-muscle-maps'} role="img" aria-label={`${exercise.name} ${side ?? 'front and back'} muscle targets`}>
      {(side ? [side] : ['front', 'back'] as const).map(view => <Body key={view} side={view} gender={gender} data={data} colors={['#d5dce0', '#78a7c7', '#f97341']} border="none" />)}
    </span>
  )
}
