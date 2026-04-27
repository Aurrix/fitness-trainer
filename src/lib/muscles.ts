import type { ExtendedBodyPart, Slug } from '@mjcdev/react-body-highlighter'
import {
  ExerciseMuscleGroup,
  mapExerciseMuscleGroupsToBodySlugs,
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
  aliases: string[]
  exerciseKey: string
  id: string
  muscleGroups: string[]
  name: string
}

type ExerciseReferenceLike = {
  exerciseId?: string | null
  exerciseName: string
  resolvedExerciseId?: string | null
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
      ...exercise.aliases,
    ].map((entry) => slugify(entry))

    for (const reference of references) {
      if (!lookup.has(reference)) {
        lookup.set(reference, exercise)
      }
    }
  }

  return lookup
}

export function resolveExerciseMuscleGroups(
  exercise: ExerciseReferenceLike,
  exerciseLookup: Map<string, ExerciseLookupLike>,
) {
  const resolvedExercise =
    (exercise.exerciseId &&
      exerciseLookup.get(slugify(exercise.exerciseId))) ||
    (exercise.resolvedExerciseId &&
      exerciseLookup.get(slugify(exercise.resolvedExerciseId))) ||
    exerciseLookup.get(slugify(exercise.exerciseName)) ||
    null

  const muscleGroups = resolvedExercise?.muscleGroups.length
    ? resolvedExercise.muscleGroups
    : inferExerciseMuscleGroups({
        exerciseKey: exercise.exerciseId ?? exercise.exerciseName,
        name: exercise.exerciseName,
      })

  return mapExerciseMuscleGroupsToBodySlugs(muscleGroups, { dedupe: true })
}

function buildMuscleProfileFromCounts(
  muscleCounts: Map<Slug, number>,
): MuscleProfile {
  const sortedMuscles = [...muscleCounts.entries()]
    .map(([slug, count]) => ({ slug, count }))
    .sort((left, right) => right.count - left.count)

  const highestCount = sortedMuscles[0]?.count ?? 0
  const data = sortedMuscles.map<ExtendedBodyPart>(({ slug, count }) => ({
    slug,
    intensity:
      highestCount <= 1
        ? 1
        : count >= highestCount
          ? 4
          : count >= highestCount * 0.66
            ? 3
            : count >= highestCount * 0.33
              ? 2
              : 1,
  }))

  return {
    data,
    muscles: sortedMuscles,
    topMuscles: sortedMuscles.slice(0, 6),
  }
}

export function createMuscleProfile(muscles: string[]): MuscleProfile {
  const muscleCounts = new Map<Slug, number>()

  for (const slug of mapExerciseMuscleGroupsToBodySlugs(muscles)) {
    muscleCounts.set(slug, (muscleCounts.get(slug) ?? 0) + 1)
  }

  return buildMuscleProfileFromCounts(muscleCounts)
}

export function buildSectionMuscleProfile(
  section: SectionLike | null,
  exercises: ExerciseLookupLike[],
) {
  if (!section) {
    return createMuscleProfile([])
  }

  const exerciseLookup = buildExerciseLookup(exercises)
  const muscleCounts = new Map<Slug, number>()

  for (const sectionExercise of section.exercises) {
    for (const muscleGroup of resolveExerciseMuscleGroups(
      sectionExercise,
      exerciseLookup,
    )) {
      const slug = muscleGroup as Slug
      muscleCounts.set(slug, (muscleCounts.get(slug) ?? 0) + 1)
    }
  }

  return buildMuscleProfileFromCounts(muscleCounts)
}

export function buildProgramMuscleProfile(
  program: ProgramLike | null,
  exercises: ExerciseLookupLike[],
) {
  if (!program) {
    return createMuscleProfile([])
  }

  const exerciseLookup = buildExerciseLookup(exercises)
  const muscleCounts = new Map<Slug, number>()

  for (const section of program.sections) {
    for (const sectionExercise of section.exercises) {
      for (const muscleGroup of resolveExerciseMuscleGroups(
        sectionExercise,
        exerciseLookup,
      )) {
        const slug = muscleGroup as Slug
        muscleCounts.set(slug, (muscleCounts.get(slug) ?? 0) + 1)
      }
    }
  }

  return buildMuscleProfileFromCounts(muscleCounts)
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
