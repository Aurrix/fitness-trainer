import type { Slug } from '@mjcdev/react-body-highlighter'

export const MUSCLE_SURFACES = {
  Back: 'back',
  Front: 'front',
} as const

export type MuscleSurface = (typeof MUSCLE_SURFACES)[keyof typeof MUSCLE_SURFACES]

export const MUSCLE_GROUP_FAMILIES = {
  Adductors: 'adductors',
  Back: 'back',
  Biceps: 'biceps',
  Calves: 'calves',
  Chest: 'chest',
  Core: 'core',
  Forearms: 'forearms',
  Glutes: 'glutes',
  Hamstrings: 'hamstrings',
  LowerLegs: 'lower-legs',
  Neck: 'neck',
  Quadriceps: 'quadriceps',
  Shoulders: 'shoulders',
  Triceps: 'triceps',
} as const

export type MuscleGroupFamily =
  (typeof MUSCLE_GROUP_FAMILIES)[keyof typeof MUSCLE_GROUP_FAMILIES]

export const MUSCLE_GROUPS = {
  AdductorLongus: 'adductor-longus',
  AdductorMagnus: 'adductor-magnus',
  BicepsFemoris: 'biceps-femoris',
  BicepsLongHead: 'biceps-long-head',
  BicepsShortHead: 'biceps-short-head',
  Brachialis: 'brachialis',
  Brachioradialis: 'brachioradialis',
  ForearmExtensors: 'forearm-extensors',
  ForearmFlexors: 'forearm-flexors',
  FrontDelts: 'front-delts',
  Gastrocnemius: 'gastrocnemius',
  GluteMax: 'glute-max',
  GluteMed: 'glute-med',
  GluteMin: 'glute-min',
  HipFlexors: 'hip-flexors',
  Infraspinatus: 'infraspinatus',
  InnerChest: 'inner-chest',
  Lats: 'lats',
  LowerAbs: 'lower-abs',
  LowerChest: 'lower-chest',
  LowerTraps: 'lower-traps',
  MidTraps: 'mid-traps',
  MiddleChest: 'middle-chest',
  Obliques: 'obliques',
  Omohyoid: 'omohyoid',
  Pectineus: 'pectineus',
  RearDelts: 'rear-delts',
  RectusFemoris: 'rectus-femoris',
  Rhomboids: 'rhomboids',
  Sartorius: 'sartorius',
  Semimembranosus: 'semimembranosus',
  Semitendinosus: 'semitendinosus',
  SerratusAnterior: 'serratus-anterior',
  SideDelts: 'side-delts',
  Soleus: 'soleus',
  SpinalErectors: 'spinal-erectors',
  Sternocleidomastoid: 'sternocleidomastoid',
  TensorFasciaeLatae: 'tensor-fasciae-latae',
  TeresMajor: 'teres-major',
  TibialisAnterior: 'tibialis-anterior',
  TransverseAbdominis: 'transverse-abdominis',
  TricepsLateralHead: 'triceps-lateral-head',
  TricepsLongHead: 'triceps-long-head',
  TricepsMedialHead: 'triceps-medial-head',
  UpperAbs: 'upper-abs',
  UpperChest: 'upper-chest',
  UpperTraps: 'upper-traps',
  VastusIntermedius: 'vastus-intermedius',
  VastusLateralis: 'vastus-lateralis',
  VastusMedialis: 'vastus-medialis',
} as const

export type MuscleGroup = (typeof MUSCLE_GROUPS)[keyof typeof MUSCLE_GROUPS]

export type MuscleGroupDefinition = {
  aliases: readonly string[]
  assetFileNames: readonly string[]
  family: MuscleGroupFamily
  label: string
  surfaces: readonly MuscleSurface[]
  visualizerSlug: Slug
}

export const muscleGroupDefinitions = {
  [MUSCLE_GROUPS.AdductorLongus]: {
    aliases: ['adductor longus'],
    assetFileNames: ['Adductor longus and pectineus'],
    family: MUSCLE_GROUP_FAMILIES.Adductors,
    label: 'Adductor Longus',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'adductors',
  },
  [MUSCLE_GROUPS.AdductorMagnus]: {
    aliases: ['adductor magnus'],
    assetFileNames: ['Adductor magnus'],
    family: MUSCLE_GROUP_FAMILIES.Adductors,
    label: 'Adductor Magnus',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'adductors',
  },
  [MUSCLE_GROUPS.BicepsFemoris]: {
    aliases: ['biceps femoris'],
    assetFileNames: ['Biceps femoris'],
    family: MUSCLE_GROUP_FAMILIES.Hamstrings,
    label: 'Biceps Femoris',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'hamstring',
  },
  [MUSCLE_GROUPS.BicepsLongHead]: {
    aliases: ['biceps brachii long head', 'long head biceps', 'outer biceps'],
    assetFileNames: ['Biceps brachii'],
    family: MUSCLE_GROUP_FAMILIES.Biceps,
    label: 'Biceps Long Head',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'biceps',
  },
  [MUSCLE_GROUPS.BicepsShortHead]: {
    aliases: ['biceps brachii short head', 'inner biceps', 'short head biceps'],
    assetFileNames: ['Biceps brachii'],
    family: MUSCLE_GROUP_FAMILIES.Biceps,
    label: 'Biceps Short Head',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'biceps',
  },
  [MUSCLE_GROUPS.Brachialis]: {
    aliases: ['biceps third head', 'brachialis'],
    assetFileNames: ['Brachialis'],
    family: MUSCLE_GROUP_FAMILIES.Biceps,
    label: 'Brachialis',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'biceps',
  },
  [MUSCLE_GROUPS.Brachioradialis]: {
    aliases: ['brachioradialis'],
    assetFileNames: ['Brachioradialis'],
    family: MUSCLE_GROUP_FAMILIES.Forearms,
    label: 'Brachioradialis',
    surfaces: [MUSCLE_SURFACES.Back, MUSCLE_SURFACES.Front],
    visualizerSlug: 'forearm',
  },
  [MUSCLE_GROUPS.ForearmExtensors]: {
    aliases: ['extensor carpi radialis', 'extensor digitorum longus', 'forearm extensors'],
    assetFileNames: ['Extensor carpi radialis', 'extensor digitorum longus'],
    family: MUSCLE_GROUP_FAMILIES.Forearms,
    label: 'Forearm Extensors',
    surfaces: [MUSCLE_SURFACES.Back, MUSCLE_SURFACES.Front],
    visualizerSlug: 'forearm',
  },
  [MUSCLE_GROUPS.ForearmFlexors]: {
    aliases: ['flexor carpi radialis', 'flexor carpi ulnaris', 'forearm flexors'],
    assetFileNames: ['Flexor carpi radialis', 'Flexor carpi ulnaris'],
    family: MUSCLE_GROUP_FAMILIES.Forearms,
    label: 'Forearm Flexors',
    surfaces: [MUSCLE_SURFACES.Back, MUSCLE_SURFACES.Front],
    visualizerSlug: 'forearm',
  },
  [MUSCLE_GROUPS.FrontDelts]: {
    aliases: ['anterior deltoid', 'anterior delts', 'front delt', 'front deltoid'],
    assetFileNames: ['Deltoids'],
    family: MUSCLE_GROUP_FAMILIES.Shoulders,
    label: 'Front Delts',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'deltoids',
  },
  [MUSCLE_GROUPS.Gastrocnemius]: {
    aliases: [
      'calf',
      'calves',
      'gastrocnemius',
      'gastrocnemius lateral head',
      'gastrocnemius medial head',
    ],
    assetFileNames: ['Gastrocnemius, lateral head', 'Gastrocnemius, medial head'],
    family: MUSCLE_GROUP_FAMILIES.Calves,
    label: 'Gastrocnemius',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'calves',
  },
  [MUSCLE_GROUPS.GluteMax]: {
    aliases: ['glute max', 'gluteus maximus'],
    assetFileNames: ['Gluteus maximus'],
    family: MUSCLE_GROUP_FAMILIES.Glutes,
    label: 'Glute Max',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'gluteal',
  },
  [MUSCLE_GROUPS.GluteMed]: {
    aliases: ['glute med', 'gluteus medius'],
    assetFileNames: ['Gluteus medius'],
    family: MUSCLE_GROUP_FAMILIES.Glutes,
    label: 'Glute Med',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'gluteal',
  },
  [MUSCLE_GROUPS.GluteMin]: {
    aliases: ['glute min', 'gluteus minimus'],
    assetFileNames: [],
    family: MUSCLE_GROUP_FAMILIES.Glutes,
    label: 'Glute Min',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'gluteal',
  },
  [MUSCLE_GROUPS.HipFlexors]: {
    aliases: ['hip flexors', 'iliopsoas'],
    assetFileNames: [],
    family: MUSCLE_GROUP_FAMILIES.Quadriceps,
    label: 'Hip Flexors',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'quadriceps',
  },
  [MUSCLE_GROUPS.Infraspinatus]: {
    aliases: ['infraspinatus'],
    assetFileNames: ['Infraspinatus'],
    family: MUSCLE_GROUP_FAMILIES.Back,
    label: 'Infraspinatus',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'upper-back',
  },
  [MUSCLE_GROUPS.InnerChest]: {
    aliases: ['inner chest', 'inner pecs', 'sternocostal chest'],
    assetFileNames: ['Pectoralis major'],
    family: MUSCLE_GROUP_FAMILIES.Chest,
    label: 'Inner Chest',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'chest',
  },
  [MUSCLE_GROUPS.Lats]: {
    aliases: ['latissimus dorsi', 'lats'],
    assetFileNames: ['Latissimus dorsi'],
    family: MUSCLE_GROUP_FAMILIES.Back,
    label: 'Lats',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'upper-back',
  },
  [MUSCLE_GROUPS.LowerAbs]: {
    aliases: ['lower abs', 'lower rectus abdominis'],
    assetFileNames: ['Rectus abdominis (lower)'],
    family: MUSCLE_GROUP_FAMILIES.Core,
    label: 'Lower Abs',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'abs',
  },
  [MUSCLE_GROUPS.LowerChest]: {
    aliases: ['lower chest', 'lower pecs', 'sternocostal pec'],
    assetFileNames: ['Pectoralis major'],
    family: MUSCLE_GROUP_FAMILIES.Chest,
    label: 'Lower Chest',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'chest',
  },
  [MUSCLE_GROUPS.LowerTraps]: {
    aliases: ['lower trapezius', 'lower traps'],
    assetFileNames: ['Lower trapezius'],
    family: MUSCLE_GROUP_FAMILIES.Back,
    label: 'Lower Traps',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'trapezius',
  },
  [MUSCLE_GROUPS.MidTraps]: {
    aliases: ['middle traps', 'mid traps', 'mid trapezius'],
    assetFileNames: ['Trapezius (UpperMiddle focus)'],
    family: MUSCLE_GROUP_FAMILIES.Back,
    label: 'Mid Traps',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'trapezius',
  },
  [MUSCLE_GROUPS.MiddleChest]: {
    aliases: ['chest', 'middle chest', 'mid chest', 'pecs', 'pectoralis major'],
    assetFileNames: ['Pectoralis major'],
    family: MUSCLE_GROUP_FAMILIES.Chest,
    label: 'Middle Chest',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'chest',
  },
  [MUSCLE_GROUPS.Obliques]: {
    aliases: ['external obliques', 'obliques'],
    assetFileNames: ['External obliques'],
    family: MUSCLE_GROUP_FAMILIES.Core,
    label: 'Obliques',
    surfaces: [MUSCLE_SURFACES.Back, MUSCLE_SURFACES.Front],
    visualizerSlug: 'obliques',
  },
  [MUSCLE_GROUPS.Omohyoid]: {
    aliases: ['omohyoid'],
    assetFileNames: ['Omohyoid'],
    family: MUSCLE_GROUP_FAMILIES.Neck,
    label: 'Omohyoid',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'neck',
  },
  [MUSCLE_GROUPS.Pectineus]: {
    aliases: ['pectineus'],
    assetFileNames: ['Adductor longus and pectineus'],
    family: MUSCLE_GROUP_FAMILIES.Adductors,
    label: 'Pectineus',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'adductors',
  },
  [MUSCLE_GROUPS.RearDelts]: {
    aliases: ['posterior deltoid', 'posterior delts', 'rear delt', 'rear deltoid'],
    assetFileNames: ['Deltoids'],
    family: MUSCLE_GROUP_FAMILIES.Shoulders,
    label: 'Rear Delts',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'deltoids',
  },
  [MUSCLE_GROUPS.RectusFemoris]: {
    aliases: ['rectus femoris'],
    assetFileNames: ['Rectus femoris'],
    family: MUSCLE_GROUP_FAMILIES.Quadriceps,
    label: 'Rectus Femoris',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'quadriceps',
  },
  [MUSCLE_GROUPS.Rhomboids]: {
    aliases: ['rhomboids'],
    assetFileNames: [],
    family: MUSCLE_GROUP_FAMILIES.Back,
    label: 'Rhomboids',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'upper-back',
  },
  [MUSCLE_GROUPS.Sartorius]: {
    aliases: ['sartorius'],
    assetFileNames: ['Sartorius'],
    family: MUSCLE_GROUP_FAMILIES.Quadriceps,
    label: 'Sartorius',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'quadriceps',
  },
  [MUSCLE_GROUPS.Semimembranosus]: {
    aliases: ['semimembranosus'],
    assetFileNames: [],
    family: MUSCLE_GROUP_FAMILIES.Hamstrings,
    label: 'Semimembranosus',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'hamstring',
  },
  [MUSCLE_GROUPS.Semitendinosus]: {
    aliases: ['semitendinosus'],
    assetFileNames: ['Semitendinosus', 'semitendinosus_'],
    family: MUSCLE_GROUP_FAMILIES.Hamstrings,
    label: 'Semitendinosus',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'hamstring',
  },
  [MUSCLE_GROUPS.SerratusAnterior]: {
    aliases: ['serratus anterior', 'serratus'],
    assetFileNames: ['Serratus anterior'],
    family: MUSCLE_GROUP_FAMILIES.Core,
    label: 'Serratus Anterior',
    surfaces: [MUSCLE_SURFACES.Back, MUSCLE_SURFACES.Front],
    visualizerSlug: 'obliques',
  },
  [MUSCLE_GROUPS.SideDelts]: {
    aliases: ['lateral deltoid', 'lateral delts', 'side delt', 'side deltoid'],
    assetFileNames: ['Deltoids'],
    family: MUSCLE_GROUP_FAMILIES.Shoulders,
    label: 'Side Delts',
    surfaces: [MUSCLE_SURFACES.Back, MUSCLE_SURFACES.Front],
    visualizerSlug: 'deltoids',
  },
  [MUSCLE_GROUPS.Soleus]: {
    aliases: ['soleus'],
    assetFileNames: ['Soleus'],
    family: MUSCLE_GROUP_FAMILIES.Calves,
    label: 'Soleus',
    surfaces: [MUSCLE_SURFACES.Back, MUSCLE_SURFACES.Front],
    visualizerSlug: 'calves',
  },
  [MUSCLE_GROUPS.SpinalErectors]: {
    aliases: ['erector spinae', 'lower back', 'spinal erectors', 'thoracolumbar fascia'],
    assetFileNames: ['Thoracolumbar fascia'],
    family: MUSCLE_GROUP_FAMILIES.Back,
    label: 'Spinal Erectors',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'lower-back',
  },
  [MUSCLE_GROUPS.Sternocleidomastoid]: {
    aliases: ['scm', 'sternocleidomastoid'],
    assetFileNames: ['Sternocleidomastoid'],
    family: MUSCLE_GROUP_FAMILIES.Neck,
    label: 'Sternocleidomastoid',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'neck',
  },
  [MUSCLE_GROUPS.TensorFasciaeLatae]: {
    aliases: ['tensor fasciae latae', 'tfl'],
    assetFileNames: ['Tensor fasciae latae'],
    family: MUSCLE_GROUP_FAMILIES.Glutes,
    label: 'Tensor Fasciae Latae',
    surfaces: [MUSCLE_SURFACES.Back, MUSCLE_SURFACES.Front],
    visualizerSlug: 'gluteal',
  },
  [MUSCLE_GROUPS.TeresMajor]: {
    aliases: ['teres major'],
    assetFileNames: ['Teres major'],
    family: MUSCLE_GROUP_FAMILIES.Back,
    label: 'Teres Major',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'upper-back',
  },
  [MUSCLE_GROUPS.TibialisAnterior]: {
    aliases: ['shin', 'tibialis anterior'],
    assetFileNames: [],
    family: MUSCLE_GROUP_FAMILIES.LowerLegs,
    label: 'Tibialis Anterior',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'tibialis',
  },
  [MUSCLE_GROUPS.TransverseAbdominis]: {
    aliases: ['deep core', 'transverse abdominis', 'transverse abs'],
    assetFileNames: [],
    family: MUSCLE_GROUP_FAMILIES.Core,
    label: 'Transverse Abdominis',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'abs',
  },
  [MUSCLE_GROUPS.TricepsLateralHead]: {
    aliases: ['lateral head triceps', 'triceps lateral head'],
    assetFileNames: ['Triceps brachii, long head, lateral head and medial head'],
    family: MUSCLE_GROUP_FAMILIES.Triceps,
    label: 'Triceps Lateral Head',
    surfaces: [MUSCLE_SURFACES.Back],
    visualizerSlug: 'triceps',
  },
  [MUSCLE_GROUPS.TricepsLongHead]: {
    aliases: ['long head triceps', 'triceps long head'],
    assetFileNames: [
      'Triceps brachii, long head',
      'Triceps brachii, long head, lateral head and medial head',
    ],
    family: MUSCLE_GROUP_FAMILIES.Triceps,
    label: 'Triceps Long Head',
    surfaces: [MUSCLE_SURFACES.Back, MUSCLE_SURFACES.Front],
    visualizerSlug: 'triceps',
  },
  [MUSCLE_GROUPS.TricepsMedialHead]: {
    aliases: ['medial head triceps', 'triceps medial head'],
    assetFileNames: [
      'Triceps brachii, medial head',
      'Triceps brachii, long head, lateral head and medial head',
    ],
    family: MUSCLE_GROUP_FAMILIES.Triceps,
    label: 'Triceps Medial Head',
    surfaces: [MUSCLE_SURFACES.Back, MUSCLE_SURFACES.Front],
    visualizerSlug: 'triceps',
  },
  [MUSCLE_GROUPS.UpperAbs]: {
    aliases: ['abs', 'rectus abdominis', 'upper abs'],
    assetFileNames: ['Rectus abdominis'],
    family: MUSCLE_GROUP_FAMILIES.Core,
    label: 'Upper Abs',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'abs',
  },
  [MUSCLE_GROUPS.UpperChest]: {
    aliases: ['clavicular chest', 'upper chest', 'upper pecs'],
    assetFileNames: ['Pectoralis major'],
    family: MUSCLE_GROUP_FAMILIES.Chest,
    label: 'Upper Chest',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'chest',
  },
  [MUSCLE_GROUPS.UpperTraps]: {
    aliases: ['traps', 'upper trapezius', 'upper traps'],
    assetFileNames: ['Trapezius', 'Trapezius (UpperMiddle focus)'],
    family: MUSCLE_GROUP_FAMILIES.Back,
    label: 'Upper Traps',
    surfaces: [MUSCLE_SURFACES.Back, MUSCLE_SURFACES.Front],
    visualizerSlug: 'trapezius',
  },
  [MUSCLE_GROUPS.VastusIntermedius]: {
    aliases: ['vastus intermedius'],
    assetFileNames: [],
    family: MUSCLE_GROUP_FAMILIES.Quadriceps,
    label: 'Vastus Intermedius',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'quadriceps',
  },
  [MUSCLE_GROUPS.VastusLateralis]: {
    aliases: ['vastus lateralis'],
    assetFileNames: ['Vastus lateralis'],
    family: MUSCLE_GROUP_FAMILIES.Quadriceps,
    label: 'Vastus Lateralis',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'quadriceps',
  },
  [MUSCLE_GROUPS.VastusMedialis]: {
    aliases: ['vastus medialis'],
    assetFileNames: ['Vastus medialis'],
    family: MUSCLE_GROUP_FAMILIES.Quadriceps,
    label: 'Vastus Medialis',
    surfaces: [MUSCLE_SURFACES.Front],
    visualizerSlug: 'quadriceps',
  },
} as const satisfies Record<MuscleGroup, MuscleGroupDefinition>

export const allMuscleGroups = Object.freeze(
  Object.values(MUSCLE_GROUPS),
) as readonly MuscleGroup[]

export const muscleGroupLabels = Object.freeze(
  Object.fromEntries(
    allMuscleGroups.map((muscleGroup) => [
      muscleGroup,
      muscleGroupDefinitions[muscleGroup].label,
    ]),
  ) as Record<MuscleGroup, string>,
)

export const muscleGroupsByFamily = Object.freeze(
  Object.values(MUSCLE_GROUP_FAMILIES).reduce<Record<MuscleGroupFamily, MuscleGroup[]>>(
    (accumulator, family) => {
      accumulator[family] = allMuscleGroups.filter(
        (muscleGroup) => muscleGroupDefinitions[muscleGroup].family === family,
      )
      return accumulator
    },
    {
      [MUSCLE_GROUP_FAMILIES.Adductors]: [],
      [MUSCLE_GROUP_FAMILIES.Back]: [],
      [MUSCLE_GROUP_FAMILIES.Biceps]: [],
      [MUSCLE_GROUP_FAMILIES.Calves]: [],
      [MUSCLE_GROUP_FAMILIES.Chest]: [],
      [MUSCLE_GROUP_FAMILIES.Core]: [],
      [MUSCLE_GROUP_FAMILIES.Forearms]: [],
      [MUSCLE_GROUP_FAMILIES.Glutes]: [],
      [MUSCLE_GROUP_FAMILIES.Hamstrings]: [],
      [MUSCLE_GROUP_FAMILIES.LowerLegs]: [],
      [MUSCLE_GROUP_FAMILIES.Neck]: [],
      [MUSCLE_GROUP_FAMILIES.Quadriceps]: [],
      [MUSCLE_GROUP_FAMILIES.Shoulders]: [],
      [MUSCLE_GROUP_FAMILIES.Triceps]: [],
    },
  ),
) as Readonly<Record<MuscleGroupFamily, readonly MuscleGroup[]>>

const muscleGroupValueSet = new Set<string>(allMuscleGroups)

function slugifyMuscleGroup(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const muscleGroupAliasLookup = Object.freeze(
  allMuscleGroups.reduce<Record<string, MuscleGroup>>((accumulator, muscleGroup) => {
    const definition = muscleGroupDefinitions[muscleGroup]

    accumulator[muscleGroup] = muscleGroup
    accumulator[slugifyMuscleGroup(definition.label)] = muscleGroup

    for (const alias of definition.aliases) {
      accumulator[slugifyMuscleGroup(alias)] = muscleGroup
    }

    for (const assetFileName of definition.assetFileNames) {
      accumulator[slugifyMuscleGroup(assetFileName)] = muscleGroup
    }

    return accumulator
  }, {}),
)

export function isMuscleGroup(value: string): value is MuscleGroup {
  return muscleGroupValueSet.has(value)
}

export function normalizeMuscleGroup(value: string) {
  const slug = slugifyMuscleGroup(value)

  if (isMuscleGroup(slug)) {
    return slug
  }

  return muscleGroupAliasLookup[slug] ?? null
}

export function getMuscleGroupDefinition(value: string) {
  const muscleGroup = normalizeMuscleGroup(value)

  return muscleGroup ? muscleGroupDefinitions[muscleGroup] : null
}

export function formatMuscleGroup(value: string) {
  const muscleGroup = normalizeMuscleGroup(value)

  if (muscleGroup) {
    return muscleGroupDefinitions[muscleGroup].label
  }

  return value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}
