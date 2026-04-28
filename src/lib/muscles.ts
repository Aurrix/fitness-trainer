import type { ExtendedBodyPart, Slug } from '@mjcdev/react-body-highlighter'
import {
  ExerciseMuscleGroup,
  mapExerciseMuscleGroupToBodySlug,
  mapExerciseMuscleGroupsToBodySlugs,
  type ExerciseMuscleTarget,
} from '../entities/exercise-muscles'

type ExerciseMappingInput = {
  aliases?: string[]
  exerciseKey: string
  name: string
  substitutions?: string[]
}

type MuscleRule = {
  matchers: string[]
  muscles: ExerciseMuscleGroup[]
}

type ExerciseLookupLike = {
  aliases?: string[]
  exerciseKey: string
  id: string
  muscleGroups: string[]
  name: string
  primaryTargetMuscleGroups?: ExerciseMuscleTarget[]
  secondaryTargetMuscleGroups?: ExerciseMuscleTarget[]
}

type ExerciseReferenceLike = {
  duration?: string
  exerciseId?: string | null
  exerciseName: string
  muscleGroups?: string[]
  reps?: string
  resolvedExerciseId?: string | null
  sets?: string
  targetDuration?: string
  targetReps?: string
  targetSets?: string
}

type WorkoutSetLogLike = {
  duration?: string
  effort?: string
  reps?: string
  weightKg?: string
}

type WorkoutExerciseLogLike = ExerciseReferenceLike & {
  completed?: boolean
  completedSets?: string
  loadKg?: string
  setLogs?: WorkoutSetLogLike[]
  skipped?: boolean
  type?: string
}

type SectionLike = {
  id?: string
  name?: string
  exercises: ExerciseReferenceLike[]
}

type ProgramLike = {
  sections: SectionLike[]
}

export type MuscleSummary = {
  count: number
  slug: Slug
}

export type MuscleProfile = {
  data: ExtendedBodyPart[]
  muscles: MuscleSummary[]
  topMuscles: MuscleSummary[]
}

export type ProgramMuscleSectionBreakdown = {
  count: number
  exerciseNames: string[]
  sectionId: string
  sectionName: string
}

export type ProgramMuscleBreakdownEntry = {
  count: number
  exerciseNames: string[]
  sections: ProgramMuscleSectionBreakdown[]
  slug: Slug
}

export const muscleLabels: Record<Slug, string> = {
  abs: 'Abs',
  adductors: 'Adductors',
  ankles: 'Ankles',
  biceps: 'Biceps',
  calves: 'Calves',
  chest: 'Chest',
  deltoids: 'Deltoids',
  feet: 'Feet',
  forearm: 'Forearms',
  gluteal: 'Glutes',
  hamstring: 'Hamstrings',
  hands: 'Hands',
  hair: 'Hair',
  head: 'Head',
  knees: 'Knees',
  'lower-back': 'Lower Back',
  neck: 'Neck',
  obliques: 'Obliques',
  quadriceps: 'Quadriceps',
  tibialis: 'Tibialis',
  trapezius: 'Traps',
  triceps: 'Triceps',
  'upper-back': 'Upper Back',
}

const muscleRules: MuscleRule[] = [
  {
    matchers: ['squat', 'leg press', 'leg extension', 'step-up', 'lunge', 'pistol'],
    muscles: [
      ExerciseMuscleGroup.RectusFemoris,
      ExerciseMuscleGroup.VastusLateralis,
      ExerciseMuscleGroup.GluteMax,
    ],
  },
  {
    matchers: ['deadlift', 'romanian', 'leg curl', 'glute ham', 'hip thrust'],
    muscles: [
      ExerciseMuscleGroup.BicepsFemoris,
      ExerciseMuscleGroup.Semitendinosus,
      ExerciseMuscleGroup.GluteMax,
      ExerciseMuscleGroup.SpinalErectors,
    ],
  },
  {
    matchers: ['bench', 'push-up', 'push up', 'flye', 'dip', 'chest press'],
    muscles: [
      ExerciseMuscleGroup.MiddleChest,
      ExerciseMuscleGroup.FrontDelts,
      ExerciseMuscleGroup.TricepsLateralHead,
    ],
  },
  {
    matchers: ['shoulder press', 'overhead press', 'arnold press'],
    muscles: [
      ExerciseMuscleGroup.FrontDelts,
      ExerciseMuscleGroup.SideDelts,
      ExerciseMuscleGroup.TricepsLongHead,
    ],
  },
  {
    matchers: ['lateral raise', 'upright row'],
    muscles: [
      ExerciseMuscleGroup.SideDelts,
      ExerciseMuscleGroup.UpperTraps,
    ],
  },
  {
    matchers: ['face pull', 'rear delt', 'reverse flye', 'reverse fly'],
    muscles: [
      ExerciseMuscleGroup.RearDelts,
      ExerciseMuscleGroup.LowerTraps,
      ExerciseMuscleGroup.Rhomboids,
    ],
  },
  {
    matchers: [
      'row',
      'pulldown',
      'pull-up',
      'pull up',
      'chin-up',
      'chin up',
      'pull-over',
      'pullover',
    ],
    muscles: [
      ExerciseMuscleGroup.Lats,
      ExerciseMuscleGroup.Rhomboids,
      ExerciseMuscleGroup.BicepsShortHead,
      ExerciseMuscleGroup.Brachialis,
    ],
  },
  {
    matchers: ['curl'],
    muscles: [
      ExerciseMuscleGroup.BicepsShortHead,
      ExerciseMuscleGroup.Brachialis,
      ExerciseMuscleGroup.Brachioradialis,
    ],
  },
  {
    matchers: [
      'skull crusher',
      'skullcrusher',
      'tricep',
      'triceps',
      'pressdown',
      'kickback',
    ],
    muscles: [
      ExerciseMuscleGroup.TricepsLongHead,
      ExerciseMuscleGroup.TricepsLateralHead,
      ExerciseMuscleGroup.TricepsMedialHead,
    ],
  },
  {
    matchers: ['crunch', 'sit-up', 'sit up', 'situp'],
    muscles: [
      ExerciseMuscleGroup.UpperAbs,
      ExerciseMuscleGroup.LowerAbs,
      ExerciseMuscleGroup.Obliques,
    ],
  },
  {
    matchers: ['leg raise', 'v-sit', 'v sit'],
    muscles: [
      ExerciseMuscleGroup.LowerAbs,
      ExerciseMuscleGroup.HipFlexors,
      ExerciseMuscleGroup.UpperAbs,
    ],
  },
  {
    matchers: ['rollout', 'plank', 'hollow body'],
    muscles: [
      ExerciseMuscleGroup.TransverseAbdominis,
      ExerciseMuscleGroup.UpperAbs,
      ExerciseMuscleGroup.Obliques,
    ],
  },
  {
    matchers: ['calf', 'toe press'],
    muscles: [
      ExerciseMuscleGroup.Gastrocnemius,
      ExerciseMuscleGroup.Soleus,
    ],
  },
  {
    matchers: ['shrug'],
    muscles: [ExerciseMuscleGroup.UpperTraps],
  },
  {
    matchers: ['abduction', 'band walk'],
    muscles: [ExerciseMuscleGroup.GluteMed, ExerciseMuscleGroup.GluteMin],
  },
  {
    matchers: ['adductor'],
    muscles: [
      ExerciseMuscleGroup.AdductorMagnus,
      ExerciseMuscleGroup.AdductorLongus,
    ],
  },
]

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function inferExerciseMuscleGroups({
  exerciseKey,
  name,
  aliases = [],
  substitutions = [],
}: ExerciseMappingInput): ExerciseMuscleGroup[] {
  const searchableText = [exerciseKey, name, ...aliases, ...substitutions]
    .map((entry) => normalizeText(entry))
    .join(' ')

  const matchedMuscles = muscleRules.flatMap((rule) => {
    return rule.matchers.some((matcher) => searchableText.includes(matcher))
      ? rule.muscles
      : []
  })

  return [...new Set(matchedMuscles)]
}

export function buildExerciseLookup(exercises: ExerciseLookupLike[]) {
  const lookup = new Map<string, ExerciseLookupLike>()

  for (const exercise of exercises) {
    const references = [
      exercise.id,
      exercise.exerciseKey,
      exercise.name,
      ...(exercise.aliases ?? []),
    ].map((entry) => slugify(entry))

    for (const reference of references) {
      if (!lookup.has(reference)) {
        lookup.set(reference, exercise)
      }
    }
  }

  return lookup
}

function resolveExerciseReference(
  exercise: ExerciseReferenceLike,
  exerciseLookup: Map<string, ExerciseLookupLike>,
) {
  return (
    (exercise.exerciseId &&
      exerciseLookup.get(slugify(exercise.exerciseId))) ||
    (exercise.resolvedExerciseId &&
      exerciseLookup.get(slugify(exercise.resolvedExerciseId))) ||
    exerciseLookup.get(slugify(exercise.exerciseName)) ||
    null
  )
}

function clampTargetFactor(value: number) {
  if (!Number.isFinite(value)) {
    return 1
  }

  return Math.min(1, Math.max(0.1, value))
}

function addTargetFactor(
  targetsBySlug: Map<Slug, number>,
  slug: Slug | null,
  factor: number,
) {
  if (!slug) {
    return
  }

  const nextFactor = clampTargetFactor(factor)
  const currentFactor = targetsBySlug.get(slug) ?? 0

  if (nextFactor > currentFactor) {
    targetsBySlug.set(slug, nextFactor)
  }
}

function resolveExerciseTargets(
  exercise: ExerciseReferenceLike,
  exerciseLookup: Map<string, ExerciseLookupLike>,
) {
  const resolvedExercise = resolveExerciseReference(exercise, exerciseLookup)
  const targetMuscleGroups = [
    ...(resolvedExercise?.primaryTargetMuscleGroups ?? []),
    ...(resolvedExercise?.secondaryTargetMuscleGroups ?? []),
  ]
  const targetsBySlug = new Map<Slug, number>()

  if (targetMuscleGroups.length) {
    for (const target of targetMuscleGroups) {
      addTargetFactor(
        targetsBySlug,
        mapExerciseMuscleGroupToBodySlug(target.muscleGroup),
        target.factor,
      )
    }

    return [...targetsBySlug.entries()].map(([slug, factor]) => ({ factor, slug }))
  }

  const muscleGroups = resolvedExercise?.muscleGroups.length
    ? resolvedExercise.muscleGroups
    : exercise.muscleGroups?.length
      ? exercise.muscleGroups
      : inferExerciseMuscleGroups({
          exerciseKey: exercise.exerciseId ?? exercise.exerciseName,
          name: exercise.exerciseName,
        })

  for (const muscleGroup of muscleGroups) {
    addTargetFactor(targetsBySlug, mapExerciseMuscleGroupToBodySlug(muscleGroup), 1)
  }

  return [...targetsBySlug.entries()].map(([slug, factor]) => ({ factor, slug }))
}

export function resolveExerciseMuscleGroups(
  exercise: ExerciseReferenceLike,
  exerciseLookup: Map<string, ExerciseLookupLike>,
) {
  return resolveExerciseTargets(exercise, exerciseLookup).map((target) => target.slug)
}

function parseNumberTokens(value: string | null | undefined) {
  if (!value) {
    return [] as number[]
  }

  return (
    value
      .replace(/,/g, '.')
      .match(/\d+(?:\.\d+)?/g)
      ?.map(Number)
      .filter((entry) => Number.isFinite(entry)) ?? []
  )
}

function parseFirstNumber(value: string | null | undefined) {
  return parseNumberTokens(value)[0] ?? null
}

function parseAverageNumber(value: string | null | undefined) {
  const values = parseNumberTokens(value)

  if (!values.length) {
    return null
  }

  return values.reduce((total, entry) => total + entry, 0) / values.length
}

function parseTargetSetCount(value: string | null | undefined, fallback = 3) {
  const values = parseNumberTokens(value)

  if (!values.length) {
    return fallback
  }

  return Math.min(8, Math.max(1, Math.max(...values)))
}

function parseDurationMinutes(value: string | null | undefined) {
  const text = value?.trim().toLowerCase()

  if (!text) {
    return null
  }

  const clockMatch = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)

  if (clockMatch) {
    const first = Number(clockMatch[1])
    const second = Number(clockMatch[2])
    const third = clockMatch[3] ? Number(clockMatch[3]) : null

    if (third !== null) {
      return first * 60 + second + third / 60
    }

    return first + second / 60
  }

  const hours =
    [...text.matchAll(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/g)]
      .map((match) => Number(match[1]))
      .filter(Number.isFinite)
      .reduce((total, entry) => total + entry, 0) * 60
  const minutes = [
    ...text.matchAll(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)\b/g),
  ]
    .map((match) => Number(match[1]))
    .filter(Number.isFinite)
    .reduce((total, entry) => total + entry, 0)
  const seconds =
    [...text.matchAll(/(\d+(?:\.\d+)?)\s*(?:s|sec|secs|second|seconds)\b/g)]
      .map((match) => Number(match[1]))
      .filter(Number.isFinite)
      .reduce((total, entry) => total + entry, 0) / 60

  if (hours || minutes || seconds) {
    return hours + minutes + seconds
  }

  return parseFirstNumber(text)
}

function getPlannedExerciseWorkUnits(exercise: ExerciseReferenceLike) {
  const setCount = parseTargetSetCount(exercise.targetSets ?? exercise.sets)
  const reps = parseAverageNumber(exercise.targetReps ?? exercise.reps)

  if (reps !== null) {
    return setCount * Math.min(120, Math.max(1, reps))
  }

  const durationMinutes = parseDurationMinutes(
    exercise.targetDuration ?? exercise.duration,
  )

  if (durationMinutes !== null) {
    return setCount * Math.min(240, Math.max(1, durationMinutes * 8))
  }

  return setCount * 10
}

function getPlannedExerciseScore(exercise: ExerciseReferenceLike) {
  return Math.log1p(getPlannedExerciseWorkUnits(exercise))
}

function hasLoggedSetContent(setLog: WorkoutSetLogLike) {
  return Boolean(
    setLog.duration?.trim() ||
      setLog.weightKg?.trim() ||
      setLog.reps?.trim() ||
      setLog.effort?.trim(),
  )
}

function getWorkoutExerciseScore(entry: WorkoutExerciseLogLike) {
  let performedSetCount = 0
  let totalDurationMinutes = 0
  let totalReps = 0
  let totalVolumeKg = 0
  let maxWeightKg = 0

  for (const setLog of entry.setLogs ?? []) {
    const durationMinutes = parseDurationMinutes(setLog.duration)
    const reps = parseAverageNumber(setLog.reps)
    const weightKg = parseFirstNumber(setLog.weightKg)

    if (hasLoggedSetContent(setLog)) {
      performedSetCount += 1
    }

    if (durationMinutes !== null) {
      totalDurationMinutes += durationMinutes
    }

    if (reps !== null) {
      totalReps += reps
    }

    if (weightKg !== null) {
      maxWeightKg = Math.max(maxWeightKg, weightKg)
    }

    if (weightKg !== null && reps !== null) {
      totalVolumeKg += weightKg * reps
    } else if (weightKg !== null) {
      totalVolumeKg += weightKg
    }
  }

  const topLevelLoadKg = parseFirstNumber(entry.loadKg)
  const topLevelCompletedSets = parseFirstNumber(entry.completedSets)
  const topLevelDurationMinutes = parseDurationMinutes(entry.duration)

  if (topLevelLoadKg !== null) {
    maxWeightKg = Math.max(maxWeightKg, topLevelLoadKg)

    if (!totalVolumeKg) {
      totalVolumeKg += topLevelLoadKg * Math.max(totalReps, topLevelCompletedSets ?? 1)
    }
  }

  if (topLevelCompletedSets !== null && !performedSetCount) {
    performedSetCount = topLevelCompletedSets
  }

  if (topLevelDurationMinutes !== null && !totalDurationMinutes) {
    totalDurationMinutes = topLevelDurationMinutes
  }

  const workUnits =
    totalVolumeKg ||
    totalReps ||
    totalDurationMinutes * 8 ||
    performedSetCount * 8 ||
    (entry.completed ? getPlannedExerciseWorkUnits(entry) : 0)

  if (!workUnits) {
    return 0
  }

  const loadBonus = maxWeightKg ? Math.log1p(maxWeightKg) * 0.35 : 0

  return Math.log1p(workUnits) + loadBonus
}

function addMuscleScore(
  muscleScores: Map<Slug, number>,
  slug: Slug,
  score: number,
) {
  if (!Number.isFinite(score) || score <= 0) {
    return
  }

  muscleScores.set(slug, (muscleScores.get(slug) ?? 0) + score)
}

function percentile(values: number[], ratio: number) {
  if (!values.length) {
    return 0
  }

  const index = Math.min(
    values.length - 1,
    Math.max(0, Math.floor((values.length - 1) * ratio)),
  )

  return values[index]
}

const MUSCLE_INTENSITY_LEVELS = 9
const MUSCLE_NORMALIZATION_PERCENTILE = 0.85
const MUSCLE_INTENSITY_HEADROOM = 1.2
const MUSCLE_MEDIAN_SPREAD = 2.5
const MUSCLE_DOMINANCE_WEIGHT = 0.34

function getMuscleNormalizationScore(scores: number[]) {
  const sortedScores = scores
    .filter((score) => Number.isFinite(score) && score > 0)
    .sort((left, right) => left - right)
  const highestScore = sortedScores.at(-1) ?? 0

  if (!highestScore) {
    return 1
  }

  const percentileScore = percentile(sortedScores, MUSCLE_NORMALIZATION_PERCENTILE)
  const medianScore = percentile(sortedScores, 0.5)

  return Math.max(percentileScore, medianScore * MUSCLE_MEDIAN_SPREAD, 0.0001)
}

function getMuscleIntensity(
  score: number,
  normalizationScore: number,
  highestScore: number,
) {
  if (!Number.isFinite(score) || score <= 0) {
    return 1
  }

  const logNormalized =
    Math.log1p(score) / Math.max(Math.log1p(normalizationScore), 0.0001)
  const relativeNormalized = highestScore > 0 ? Math.sqrt(score / highestScore) : 0
  const dominanceWeight =
    highestScore > normalizationScore
      ? Math.min(
          MUSCLE_DOMINANCE_WEIGHT,
          (highestScore / normalizationScore - 1) * MUSCLE_DOMINANCE_WEIGHT,
        )
      : 0
  const blended =
    (Math.min(MUSCLE_INTENSITY_HEADROOM, logNormalized) /
      MUSCLE_INTENSITY_HEADROOM) *
      (1 - dominanceWeight) +
    relativeNormalized * dominanceWeight
  const curved = Math.pow(Math.min(1, blended), 1.15)

  return Math.min(
    MUSCLE_INTENSITY_LEVELS,
    Math.max(1, Math.round(1 + curved * (MUSCLE_INTENSITY_LEVELS - 1))),
  )
}

function buildMuscleProfileFromScores(
  muscleScores: Map<Slug, number>,
): MuscleProfile {
  const sortedMuscles = [...muscleScores.entries()]
    .filter(([, count]) => Number.isFinite(count) && count > 0)
    .map(([slug, count]) => ({ slug, count }))
    .sort((left, right) => right.count - left.count)

  const normalizationScore = getMuscleNormalizationScore(
    sortedMuscles.map((muscle) => muscle.count),
  )
  const highestScore = sortedMuscles[0]?.count ?? 0
  const data = sortedMuscles.map<ExtendedBodyPart>(({ slug, count }) => ({
    slug,
    intensity: getMuscleIntensity(count, normalizationScore, highestScore),
  }))

  return {
    data,
    muscles: sortedMuscles,
    topMuscles: sortedMuscles.slice(0, 6),
  }
}

export function createMuscleProfile(muscles: string[]): MuscleProfile {
  const muscleScores = new Map<Slug, number>()

  for (const slug of mapExerciseMuscleGroupsToBodySlugs(muscles)) {
    addMuscleScore(muscleScores, slug, 1)
  }

  return buildMuscleProfileFromScores(muscleScores)
}

export function buildExerciseMuscleProfile(
  exercise: ExerciseLookupLike | null,
): MuscleProfile {
  if (!exercise) {
    return createMuscleProfile([])
  }

  const muscleScores = new Map<Slug, number>()
  const exerciseLookup = buildExerciseLookup([exercise])

  for (const target of resolveExerciseTargets(
    {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroups: exercise.muscleGroups,
    },
    exerciseLookup,
  )) {
    addMuscleScore(muscleScores, target.slug, target.factor)
  }

  return buildMuscleProfileFromScores(muscleScores)
}

export function buildSectionMuscleProfile(
  section: SectionLike | null,
  exercises: ExerciseLookupLike[],
) {
  if (!section) {
    return createMuscleProfile([])
  }

  const exerciseLookup = buildExerciseLookup(exercises)
  const muscleScores = new Map<Slug, number>()

  for (const sectionExercise of section.exercises) {
    const exerciseScore = getPlannedExerciseScore(sectionExercise)

    for (const target of resolveExerciseTargets(sectionExercise, exerciseLookup)) {
      addMuscleScore(muscleScores, target.slug, exerciseScore * target.factor)
    }
  }

  return buildMuscleProfileFromScores(muscleScores)
}

export function buildProgramMuscleProfile(
  program: ProgramLike | null,
  exercises: ExerciseLookupLike[],
) {
  if (!program) {
    return createMuscleProfile([])
  }

  const exerciseLookup = buildExerciseLookup(exercises)
  const muscleScores = new Map<Slug, number>()

  for (const section of program.sections) {
    for (const sectionExercise of section.exercises) {
      const exerciseScore = getPlannedExerciseScore(sectionExercise)

      for (const target of resolveExerciseTargets(sectionExercise, exerciseLookup)) {
        addMuscleScore(muscleScores, target.slug, exerciseScore * target.factor)
      }
    }
  }

  return buildMuscleProfileFromScores(muscleScores)
}

export function buildWorkoutMuscleProfile(
  entries: WorkoutExerciseLogLike[],
  exercises: ExerciseLookupLike[],
) {
  const exerciseLookup = buildExerciseLookup(exercises)
  const muscleScores = new Map<Slug, number>()

  for (const entry of entries) {
    if (entry.type === 'cardio' || entry.skipped) {
      continue
    }

    const exerciseScore = getWorkoutExerciseScore(entry)

    if (!exerciseScore) {
      continue
    }

    for (const target of resolveExerciseTargets(entry, exerciseLookup)) {
      addMuscleScore(muscleScores, target.slug, exerciseScore * target.factor)
    }
  }

  return buildMuscleProfileFromScores(muscleScores)
}

export function buildProgramMuscleBreakdown(
  program: ProgramLike | null,
  exercises: ExerciseLookupLike[],
) {
  if (!program) {
    return [] as ProgramMuscleBreakdownEntry[]
  }

  const exerciseLookup = buildExerciseLookup(exercises)
  const breakdown = new Map<
    Slug,
    {
      count: number
      exerciseNames: Set<string>
      sections: Map<
        string,
        {
          count: number
          exerciseNames: Set<string>
          sectionId: string
          sectionName: string
        }
      >
    }
  >()

  for (const [sectionIndex, section] of program.sections.entries()) {
    const sectionId = section.id ?? `section-${sectionIndex + 1}`
    const sectionName = section.name ?? `Day ${sectionIndex + 1}`

    for (const sectionExercise of section.exercises) {
      const exerciseReference = [
        sectionExercise.exerciseId,
        sectionExercise.resolvedExerciseId,
        sectionExercise.exerciseName,
      ].find(Boolean)
      const resolvedExercise =
        (exerciseReference &&
          exerciseLookup.get(slugify(exerciseReference))) ||
        null
      const displayExerciseName = resolvedExercise?.name ?? sectionExercise.exerciseName
      const muscleGroups = resolveExerciseMuscleGroups(sectionExercise, exerciseLookup)

      for (const muscleGroup of muscleGroups) {
        const slug = muscleGroup as Slug
        const muscleBucket =
          breakdown.get(slug) ??
          {
            count: 0,
            exerciseNames: new Set<string>(),
            sections: new Map(),
          }

        const sectionBucket =
          muscleBucket.sections.get(sectionId) ??
          {
            count: 0,
            exerciseNames: new Set<string>(),
            sectionId,
            sectionName,
          }

        muscleBucket.count += 1
        muscleBucket.exerciseNames.add(displayExerciseName)
        sectionBucket.count += 1
        sectionBucket.exerciseNames.add(displayExerciseName)
        muscleBucket.sections.set(sectionId, sectionBucket)
        breakdown.set(slug, muscleBucket)
      }
    }
  }

  return [...breakdown.entries()]
    .map(([slug, entry]) => ({
      slug,
      count: entry.count,
      exerciseNames: [...entry.exerciseNames].sort(),
      sections: [...entry.sections.values()]
        .map((section) => ({
          count: section.count,
          exerciseNames: [...section.exerciseNames].sort(),
          sectionId: section.sectionId,
          sectionName: section.sectionName,
        }))
        .sort((left, right) => right.count - left.count),
    }))
    .sort((left, right) => right.count - left.count)
}
