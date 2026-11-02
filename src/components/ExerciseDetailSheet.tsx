import { useState } from 'react'
import type { Exercise } from '../lib/content'
import ExerciseDetailView, { type ExerciseDetailViewProps } from './ExerciseDetailView'
import WorkoutExercisePickerSheet from './WorkoutExercisePickerSheet'

type Props = Omit<ExerciseDetailViewProps, 'onRequestReplace' | 'onConfirm' | 'confirmLabel' | 'confirmDescription'> & {
  onSubstituteExercise?: (exerciseId: string) => void
  replacementExercises?: Exercise[]
  substitutionContext?: { currentExerciseId: string | null; targetLabel: string }
}

export default function ExerciseDetailSheet({ onSubstituteExercise, replacementExercises = [], substitutionContext, ...props }: Props) {
  const [replacing, setReplacing] = useState(false)
  const canUse = Boolean(onSubstituteExercise && substitutionContext?.currentExerciseId !== props.exercise.id)
  if (replacing) return <WorkoutExercisePickerSheet
    actionLabel="Substitute" title="Replace exercise" description={`Replacing ${substitutionContext?.targetLabel ?? props.exercise.name}`}
    exercises={replacementExercises} preferredReferences={props.exercise.substitutions}
    excludeExerciseIds={[substitutionContext?.currentExerciseId ?? props.exercise.id]}
    onClose={() => setReplacing(false)} onSelectExercise={exercise => onSubstituteExercise?.(exercise.id)}
  />
  return <ExerciseDetailView {...props} backLabel={substitutionContext ? 'Workout' : props.backLabel}
    onRequestReplace={onSubstituteExercise && replacementExercises.length ? () => setReplacing(true) : undefined}
    onConfirm={canUse ? () => onSubstituteExercise?.(props.exercise.id) : undefined}
    confirmLabel={canUse ? 'Use this exercise' : undefined}
    confirmDescription={canUse ? `Replaces ${substitutionContext?.targetLabel ?? 'the selected exercise'} in this workout only` : undefined}
  />
}
