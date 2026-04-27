import type { Slug } from '@mjcdev/react-body-highlighter'
import { muscleGroupDefinitions, normalizeMuscleGroup } from './muscle-groups'

export function mapMuscleGroupToVisualizerSlug(value: string) {
  const muscleGroup = normalizeMuscleGroup(value)

  return muscleGroup ? muscleGroupDefinitions[muscleGroup].visualizerSlug : null
}

export function mapMuscleGroupsToVisualizerSlugs(
  muscleGroups: readonly string[],
  { dedupe = false }: { dedupe?: boolean } = {},
) {
  const slugs: Slug[] = []
  const seen = new Set<Slug>()

  for (const muscleGroup of muscleGroups) {
    const slug = mapMuscleGroupToVisualizerSlug(muscleGroup)

    if (!slug) {
      continue
    }

    if (dedupe) {
      if (seen.has(slug)) {
        continue
      }

      seen.add(slug)
    }

    slugs.push(slug)
  }

  return slugs
}
