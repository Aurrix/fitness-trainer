import type { Slug } from '@mjcdev/react-body-highlighter'

export enum ExerciseMuscleGroup {
  Abs = 'abs',
  UpperAbs = 'upper-abs',
  LowerAbs = 'lower-abs',
  TransverseAbdominis = 'transverse-abdominis',
  Obliques = 'obliques',
  HipFlexors = 'hip-flexors',
  Adductors = 'adductors',
  AdductorLongus = 'adductor-longus',
  AdductorMagnus = 'adductor-magnus',
  Pectineus = 'pectineus',
  Biceps = 'biceps',
  BicepsLongHead = 'biceps-long-head',
  BicepsShortHead = 'biceps-short-head',
  Brachialis = 'brachialis',
  Brachioradialis = 'brachioradialis',
  Calves = 'calves',
  Gastrocnemius = 'gastrocnemius',
  Soleus = 'soleus',
  Chest = 'chest',
  UpperChest = 'upper-chest',
  MiddleChest = 'middle-chest',
  LowerChest = 'lower-chest',
  InnerChest = 'inner-chest',
  Deltoids = 'deltoids',
  FrontDelts = 'front-delts',
  SideDelts = 'side-delts',
  RearDelts = 'rear-delts',
  Forearm = 'forearm',
  ForearmFlexors = 'forearm-flexors',
  ForearmExtensors = 'forearm-extensors',
  Gluteal = 'gluteal',
  GluteMax = 'glute-max',
  GluteMed = 'glute-med',
  GluteMin = 'glute-min',
  TensorFasciaeLatae = 'tensor-fasciae-latae',
  Hamstring = 'hamstring',
  BicepsFemoris = 'biceps-femoris',
  Semitendinosus = 'semitendinosus',
  Semimembranosus = 'semimembranosus',
  LowerBack = 'lower-back',
  Infraspinatus = 'infraspinatus',
  SpinalErectors = 'spinal-erectors',
  Neck = 'neck',
  Omohyoid = 'omohyoid',
  Quadriceps = 'quadriceps',
  RectusFemoris = 'rectus-femoris',
  Sartorius = 'sartorius',
  VastusLateralis = 'vastus-lateralis',
  VastusMedialis = 'vastus-medialis',
  VastusIntermedius = 'vastus-intermedius',
  SerratusAnterior = 'serratus-anterior',
  Sternocleidomastoid = 'sternocleidomastoid',
  Trapezius = 'trapezius',
  UpperTraps = 'upper-traps',
  MidTraps = 'mid-traps',
  LowerTraps = 'lower-traps',
  Triceps = 'triceps',
  TricepsLongHead = 'triceps-long-head',
  TricepsLateralHead = 'triceps-lateral-head',
  TricepsMedialHead = 'triceps-medial-head',
  UpperBack = 'upper-back',
  Lats = 'lats',
  Rhomboids = 'rhomboids',
  TeresMajor = 'teres-major',
  Tibialis = 'tibialis',
  TibialisAnterior = 'tibialis-anterior',
}

export type ExerciseMuscleTarget = {
  factor: number
  muscleGroup: ExerciseMuscleGroup
}

export const exerciseMuscleGroupLabels: Record<ExerciseMuscleGroup, string> = {
  [ExerciseMuscleGroup.Abs]: 'Abs',
  [ExerciseMuscleGroup.UpperAbs]: 'Upper Abs',
  [ExerciseMuscleGroup.LowerAbs]: 'Lower Abs',
  [ExerciseMuscleGroup.TransverseAbdominis]: 'Transverse Abdominis',
  [ExerciseMuscleGroup.Obliques]: 'Obliques',
  [ExerciseMuscleGroup.HipFlexors]: 'Hip Flexors',
  [ExerciseMuscleGroup.Adductors]: 'Adductors',
  [ExerciseMuscleGroup.AdductorLongus]: 'Adductor Longus',
  [ExerciseMuscleGroup.AdductorMagnus]: 'Adductor Magnus',
  [ExerciseMuscleGroup.Pectineus]: 'Pectineus',
  [ExerciseMuscleGroup.Biceps]: 'Biceps',
  [ExerciseMuscleGroup.BicepsLongHead]: 'Biceps Long Head',
  [ExerciseMuscleGroup.BicepsShortHead]: 'Biceps Short Head',
  [ExerciseMuscleGroup.Brachialis]: 'Brachialis',
  [ExerciseMuscleGroup.Brachioradialis]: 'Brachioradialis',
  [ExerciseMuscleGroup.Calves]: 'Calves',
  [ExerciseMuscleGroup.Gastrocnemius]: 'Gastrocnemius',
  [ExerciseMuscleGroup.Soleus]: 'Soleus',
  [ExerciseMuscleGroup.Chest]: 'Chest',
  [ExerciseMuscleGroup.UpperChest]: 'Upper Chest',
  [ExerciseMuscleGroup.MiddleChest]: 'Middle Chest',
  [ExerciseMuscleGroup.LowerChest]: 'Lower Chest',
  [ExerciseMuscleGroup.InnerChest]: 'Inner Chest',
  [ExerciseMuscleGroup.Deltoids]: 'Deltoids',
  [ExerciseMuscleGroup.FrontDelts]: 'Front Delts',
  [ExerciseMuscleGroup.SideDelts]: 'Side Delts',
  [ExerciseMuscleGroup.RearDelts]: 'Rear Delts',
  [ExerciseMuscleGroup.Forearm]: 'Forearm',
  [ExerciseMuscleGroup.ForearmFlexors]: 'Forearm Flexors',
  [ExerciseMuscleGroup.ForearmExtensors]: 'Forearm Extensors',
  [ExerciseMuscleGroup.Gluteal]: 'Glutes',
  [ExerciseMuscleGroup.GluteMax]: 'Glute Max',
  [ExerciseMuscleGroup.GluteMed]: 'Glute Med',
  [ExerciseMuscleGroup.GluteMin]: 'Glute Min',
  [ExerciseMuscleGroup.TensorFasciaeLatae]: 'Tensor Fasciae Latae',
  [ExerciseMuscleGroup.Hamstring]: 'Hamstrings',
  [ExerciseMuscleGroup.BicepsFemoris]: 'Biceps Femoris',
  [ExerciseMuscleGroup.Semitendinosus]: 'Semitendinosus',
  [ExerciseMuscleGroup.Semimembranosus]: 'Semimembranosus',
  [ExerciseMuscleGroup.LowerBack]: 'Lower Back',
  [ExerciseMuscleGroup.Infraspinatus]: 'Infraspinatus',
  [ExerciseMuscleGroup.SpinalErectors]: 'Spinal Erectors',
  [ExerciseMuscleGroup.Neck]: 'Neck',
  [ExerciseMuscleGroup.Omohyoid]: 'Omohyoid',
  [ExerciseMuscleGroup.Quadriceps]: 'Quadriceps',
  [ExerciseMuscleGroup.RectusFemoris]: 'Rectus Femoris',
  [ExerciseMuscleGroup.Sartorius]: 'Sartorius',
  [ExerciseMuscleGroup.VastusLateralis]: 'Vastus Lateralis',
  [ExerciseMuscleGroup.VastusMedialis]: 'Vastus Medialis',
  [ExerciseMuscleGroup.VastusIntermedius]: 'Vastus Intermedius',
  [ExerciseMuscleGroup.SerratusAnterior]: 'Serratus Anterior',
  [ExerciseMuscleGroup.Sternocleidomastoid]: 'Sternocleidomastoid',
  [ExerciseMuscleGroup.Trapezius]: 'Trapezius',
  [ExerciseMuscleGroup.UpperTraps]: 'Upper Traps',
  [ExerciseMuscleGroup.MidTraps]: 'Mid Traps',
  [ExerciseMuscleGroup.LowerTraps]: 'Lower Traps',
  [ExerciseMuscleGroup.Triceps]: 'Triceps',
  [ExerciseMuscleGroup.TricepsLongHead]: 'Triceps Long Head',
  [ExerciseMuscleGroup.TricepsLateralHead]: 'Triceps Lateral Head',
  [ExerciseMuscleGroup.TricepsMedialHead]: 'Triceps Medial Head',
  [ExerciseMuscleGroup.UpperBack]: 'Upper Back',
  [ExerciseMuscleGroup.Lats]: 'Lats',
  [ExerciseMuscleGroup.Rhomboids]: 'Rhomboids',
  [ExerciseMuscleGroup.TeresMajor]: 'Teres Major',
  [ExerciseMuscleGroup.Tibialis]: 'Tibialis',
  [ExerciseMuscleGroup.TibialisAnterior]: 'Tibialis Anterior',
}

const exerciseMuscleGroupAliases: Record<string, ExerciseMuscleGroup> = {
  'anterior-deltoid': ExerciseMuscleGroup.FrontDelts,
  'anterior-delts': ExerciseMuscleGroup.FrontDelts,
  'forearms': ExerciseMuscleGroup.Forearm,
  'front-delt': ExerciseMuscleGroup.FrontDelts,
  'front-delts': ExerciseMuscleGroup.FrontDelts,
  glutes: ExerciseMuscleGroup.Gluteal,
  hamstrings: ExerciseMuscleGroup.Hamstring,
  'inner-pecs': ExerciseMuscleGroup.InnerChest,
  lat: ExerciseMuscleGroup.Lats,
  'lateral-deltoid': ExerciseMuscleGroup.SideDelts,
  'lateral-delts': ExerciseMuscleGroup.SideDelts,
  'mid-back': ExerciseMuscleGroup.UpperBack,
  pecs: ExerciseMuscleGroup.Chest,
  'posterior-deltoid': ExerciseMuscleGroup.RearDelts,
  'posterior-delts': ExerciseMuscleGroup.RearDelts,
  quads: ExerciseMuscleGroup.Quadriceps,
  'rear-delt': ExerciseMuscleGroup.RearDelts,
  'rear-deltoid': ExerciseMuscleGroup.RearDelts,
  scm: ExerciseMuscleGroup.Sternocleidomastoid,
  serratus: ExerciseMuscleGroup.SerratusAnterior,
  tfl: ExerciseMuscleGroup.TensorFasciaeLatae,
  traps: ExerciseMuscleGroup.Trapezius,
}

const exerciseMuscleGroupValueSet = new Set<string>(
  Object.values(ExerciseMuscleGroup),
)

const bodySlugByExerciseMuscleGroup: Partial<
  Record<ExerciseMuscleGroup, Slug>
> = {
  [ExerciseMuscleGroup.Abs]: 'abs',
  [ExerciseMuscleGroup.UpperAbs]: 'abs',
  [ExerciseMuscleGroup.LowerAbs]: 'abs',
  [ExerciseMuscleGroup.TransverseAbdominis]: 'abs',
  [ExerciseMuscleGroup.Obliques]: 'obliques',
  [ExerciseMuscleGroup.Adductors]: 'adductors',
  [ExerciseMuscleGroup.AdductorLongus]: 'adductors',
  [ExerciseMuscleGroup.AdductorMagnus]: 'adductors',
  [ExerciseMuscleGroup.Pectineus]: 'adductors',
  [ExerciseMuscleGroup.Biceps]: 'biceps',
  [ExerciseMuscleGroup.BicepsLongHead]: 'biceps',
  [ExerciseMuscleGroup.BicepsShortHead]: 'biceps',
  [ExerciseMuscleGroup.Brachialis]: 'biceps',
  [ExerciseMuscleGroup.Brachioradialis]: 'forearm',
  [ExerciseMuscleGroup.Calves]: 'calves',
  [ExerciseMuscleGroup.Gastrocnemius]: 'calves',
  [ExerciseMuscleGroup.Soleus]: 'calves',
  [ExerciseMuscleGroup.Chest]: 'chest',
  [ExerciseMuscleGroup.UpperChest]: 'chest',
  [ExerciseMuscleGroup.MiddleChest]: 'chest',
  [ExerciseMuscleGroup.LowerChest]: 'chest',
  [ExerciseMuscleGroup.InnerChest]: 'chest',
  [ExerciseMuscleGroup.Deltoids]: 'deltoids',
  [ExerciseMuscleGroup.FrontDelts]: 'deltoids',
  [ExerciseMuscleGroup.SideDelts]: 'deltoids',
  [ExerciseMuscleGroup.RearDelts]: 'deltoids',
  [ExerciseMuscleGroup.Forearm]: 'forearm',
  [ExerciseMuscleGroup.ForearmFlexors]: 'forearm',
  [ExerciseMuscleGroup.ForearmExtensors]: 'forearm',
  [ExerciseMuscleGroup.Gluteal]: 'gluteal',
  [ExerciseMuscleGroup.GluteMax]: 'gluteal',
  [ExerciseMuscleGroup.GluteMed]: 'gluteal',
  [ExerciseMuscleGroup.GluteMin]: 'gluteal',
  [ExerciseMuscleGroup.TensorFasciaeLatae]: 'gluteal',
  [ExerciseMuscleGroup.Hamstring]: 'hamstring',
  [ExerciseMuscleGroup.BicepsFemoris]: 'hamstring',
  [ExerciseMuscleGroup.Semitendinosus]: 'hamstring',
  [ExerciseMuscleGroup.Semimembranosus]: 'hamstring',
  [ExerciseMuscleGroup.LowerBack]: 'lower-back',
  [ExerciseMuscleGroup.Infraspinatus]: 'upper-back',
  [ExerciseMuscleGroup.SpinalErectors]: 'lower-back',
  [ExerciseMuscleGroup.Neck]: 'neck',
  [ExerciseMuscleGroup.Omohyoid]: 'neck',
  [ExerciseMuscleGroup.Quadriceps]: 'quadriceps',
  [ExerciseMuscleGroup.RectusFemoris]: 'quadriceps',
  [ExerciseMuscleGroup.Sartorius]: 'quadriceps',
  [ExerciseMuscleGroup.VastusLateralis]: 'quadriceps',
  [ExerciseMuscleGroup.VastusMedialis]: 'quadriceps',
  [ExerciseMuscleGroup.VastusIntermedius]: 'quadriceps',
  [ExerciseMuscleGroup.SerratusAnterior]: 'obliques',
  [ExerciseMuscleGroup.Sternocleidomastoid]: 'neck',
  [ExerciseMuscleGroup.Trapezius]: 'trapezius',
  [ExerciseMuscleGroup.UpperTraps]: 'trapezius',
  [ExerciseMuscleGroup.MidTraps]: 'trapezius',
  [ExerciseMuscleGroup.LowerTraps]: 'trapezius',
  [ExerciseMuscleGroup.Triceps]: 'triceps',
  [ExerciseMuscleGroup.TricepsLongHead]: 'triceps',
  [ExerciseMuscleGroup.TricepsLateralHead]: 'triceps',
  [ExerciseMuscleGroup.TricepsMedialHead]: 'triceps',
  [ExerciseMuscleGroup.UpperBack]: 'upper-back',
  [ExerciseMuscleGroup.Lats]: 'upper-back',
  [ExerciseMuscleGroup.Rhomboids]: 'upper-back',
  [ExerciseMuscleGroup.TeresMajor]: 'upper-back',
  [ExerciseMuscleGroup.Tibialis]: 'tibialis',
  [ExerciseMuscleGroup.TibialisAnterior]: 'tibialis',
}

const exerciseMuscleGroupsByBodySlug = Object.values(ExerciseMuscleGroup).reduce<
  Partial<Record<Slug, ExerciseMuscleGroup[]>>
>((accumulator, muscleGroup) => {
  const slug = bodySlugByExerciseMuscleGroup[muscleGroup]

  if (!slug) {
    return accumulator
  }

  const currentGroups = accumulator[slug] ?? []

  if (!currentGroups.includes(muscleGroup)) {
    accumulator[slug] = [...currentGroups, muscleGroup]
  }

  return accumulator
}, {})

function slugifyMuscleGroup(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function clampExerciseMuscleTargetFactor(value: number) {
  if (!Number.isFinite(value)) {
    return 1
  }

  return Math.min(1, Math.max(0.1, Math.round(value * 10) / 10))
}

export function isExerciseMuscleGroup(value: string): value is ExerciseMuscleGroup {
  return exerciseMuscleGroupValueSet.has(value)
}

export function normalizeExerciseMuscleGroup(value: string) {
  const slug = slugifyMuscleGroup(value)

  if (isExerciseMuscleGroup(slug)) {
    return slug
  }

  return exerciseMuscleGroupAliases[slug] ?? null
}

export function formatExerciseMuscleGroup(value: string) {
  const muscleGroup = normalizeExerciseMuscleGroup(value)

  if (muscleGroup) {
    return exerciseMuscleGroupLabels[muscleGroup]
  }

  return value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export function formatExerciseMuscleTargetFactor(value: number) {
  return clampExerciseMuscleTargetFactor(value).toFixed(1)
}

export function mapExerciseMuscleGroupToBodySlug(value: string) {
  const muscleGroup = normalizeExerciseMuscleGroup(value)

  return muscleGroup ? (bodySlugByExerciseMuscleGroup[muscleGroup] ?? null) : null
}

export function mapExerciseMuscleGroupsToBodySlugs(
  muscleGroups: string[],
  { dedupe = false }: { dedupe?: boolean } = {},
) {
  const slugs: Slug[] = []
  const seen = new Set<Slug>()

  for (const muscleGroup of muscleGroups) {
    const slug = mapExerciseMuscleGroupToBodySlug(muscleGroup)

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

export function mapBodySlugToExerciseMuscleGroups(slug: Slug) {
  return exerciseMuscleGroupsByBodySlug[slug] ?? []
}
