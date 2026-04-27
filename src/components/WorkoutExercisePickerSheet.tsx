import { useDeferredValue, useMemo, useState } from 'react'
import { Plus, RefreshCcw, Search } from 'lucide-react'
import BottomSheet from './BottomSheet'
import { formatExerciseMuscleGroup } from '../entities/exercise-muscles'
import type { Exercise } from '../lib/content'

type WorkoutExercisePickerSheetProps = {
  actionLabel?: string
  description?: string
  excludeExerciseIds?: string[]
  exercises: Exercise[]
  preferredReferences?: string[]
  onClose: () => void
  onSelectExercise: (exercise: Exercise) => void
  title?: string
}

function isCustomExercise(exercise: Exercise) {
  return /custom/i.test(`${exercise.source.label} ${exercise.source.group}`)
}

function normalizeExerciseReference(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function matchesExerciseReference(exercise: Exercise, reference: string) {
  const normalizedReference = normalizeExerciseReference(reference)

  return [exercise.id, exercise.exerciseKey, exercise.name, ...exercise.aliases].some(
    (candidate) => normalizeExerciseReference(candidate) === normalizedReference,
  )
}

export default function WorkoutExercisePickerSheet({
  actionLabel = 'Add',
  description = 'Add an extra exercise from your library to this training day.',
  excludeExerciseIds = [],
  exercises,
  preferredReferences = [],
  onClose,
  onSelectExercise,
  title = 'Add exercise',
}: WorkoutExercisePickerSheetProps) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const excludedExerciseIdSet = useMemo(() => new Set(excludeExerciseIds), [excludeExerciseIds])
  const preferredReferenceSet = useMemo(
    () => new Set(preferredReferences.map((entry) => normalizeExerciseReference(entry))),
    [preferredReferences],
  )
  const filteredExercises = exercises
    .filter((exercise) => {
      if (excludedExerciseIdSet.has(exercise.id)) {
        return false
      }

      if (!deferredQuery) {
        return true
      }

      const searchableText = [
        exercise.name,
        exercise.category,
        exercise.difficulty,
        exercise.muscleGroups.join(' '),
        exercise.equipment.join(' '),
        exercise.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(deferredQuery)
    })
    .sort((left, right) => {
      const leftIsPreferred =
        preferredReferenceSet.size > 0 &&
        [...preferredReferenceSet].some((reference) => matchesExerciseReference(left, reference))
      const rightIsPreferred =
        preferredReferenceSet.size > 0 &&
        [...preferredReferenceSet].some((reference) => matchesExerciseReference(right, reference))

      if (leftIsPreferred !== rightIsPreferred) {
        return leftIsPreferred ? -1 : 1
      }

      return left.name.localeCompare(right.name)
    })

  return (
    <BottomSheet
      description={description}
      kicker="Workout Day"
      onClose={onClose}
      title={title}
    >
      <label className="field-group workout-picker-search">
        <span className="field-label">Search exercises</span>
        <div className="input-like">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Chest press, squat, row..."
          />
        </div>
      </label>

      <div className="card-stack">
        {filteredExercises.map((exercise) => {
            const summaryParts = [
              exercise.category,
              exercise.difficulty || null,
              exercise.muscleGroups[0]
                ? formatExerciseMuscleGroup(exercise.muscleGroups[0])
                : null,
            ].filter((value): value is string => Boolean(value))

            return (
              <button
                key={exercise.id}
                type="button"
                className={`list-card workout-picker__exercise ${
                  isCustomExercise(exercise) ? 'workout-picker__exercise--custom' : ''
                }`}
                onClick={() => {
                  onSelectExercise(exercise)
                  onClose()
                }}
              >
                <div>
                  <strong>{exercise.name}</strong>
                  <p className="muted">{summaryParts.join(' / ')}</p>
                </div>
                <span className="chip-button workout-picker__exercise-action" aria-hidden="true">
                  {actionLabel === 'Substitute' ? <RefreshCcw size={14} /> : <Plus size={14} />}
                </span>
              </button>
            )
          })}
      </div>
    </BottomSheet>
  )
}
