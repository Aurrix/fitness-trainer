import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const exercisesDirectory = path.resolve('src/assets/exercises')

const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced']
const AGE_GROUPS = ['18-29', '30-44', '45+']
const GENDERS = ['male', 'female']

const LOAD_AGE_FACTORS = Object.freeze({
  '18-29': 1,
  '30-44': 1,
  '45+': 0.9,
})

const REP_AGE_FACTORS = Object.freeze({
  '18-29': 1,
  '30-44': 1,
  '45+': 0.85,
})

const HOLD_AGE_FACTORS = Object.freeze({
  '18-29': 1,
  '30-44': 0.95,
  '45+': 0.8,
})

const DURATION_AGE_FACTORS = Object.freeze({
  '18-29': 1,
  '30-44': 0.95,
  '45+': 0.85,
})

const ASSISTANCE_AGE_FACTORS = Object.freeze({
  '18-29': 1,
  '30-44': 1.05,
  '45+': 1.2,
})

const SCHEMES = Object.freeze({
  heavyBarbell: {
    beginner: { repRange: [6, 10], pct: [0.65, 0.78] },
    intermediate: { repRange: [5, 8], pct: [0.72, 0.82] },
    advanced: { repRange: [3, 6], pct: [0.8, 0.9] },
  },
  moderateCompound: {
    beginner: { repRange: [8, 12], pct: [0.58, 0.72] },
    intermediate: { repRange: [6, 10], pct: [0.65, 0.78] },
    advanced: { repRange: [5, 8], pct: [0.72, 0.82] },
  },
  machineCompound: {
    beginner: { repRange: [8, 12], pct: [0.6, 0.72] },
    intermediate: { repRange: [6, 10], pct: [0.67, 0.78] },
    advanced: { repRange: [5, 8], pct: [0.72, 0.84] },
  },
  isolation: {
    beginner: { repRange: [10, 15], pct: [0.45, 0.62] },
    intermediate: { repRange: [8, 12], pct: [0.55, 0.7] },
    advanced: { repRange: [6, 10], pct: [0.62, 0.78] },
  },
  highRepIsolation: {
    beginner: { repRange: [12, 18], pct: [0.38, 0.55] },
    intermediate: { repRange: [10, 15], pct: [0.45, 0.62] },
    advanced: { repRange: [8, 12], pct: [0.55, 0.7] },
  },
  calfLoad: {
    beginner: { repRange: [12, 20], pct: [0.4, 0.55] },
    intermediate: { repRange: [10, 15], pct: [0.48, 0.62] },
    advanced: { repRange: [8, 12], pct: [0.55, 0.7] },
  },
  fixed21s: {
    beginner: { repRange: [21, 21], pct: [0.3, 0.4] },
    intermediate: { repRange: [21, 21], pct: [0.35, 0.45] },
    advanced: { repRange: [21, 21], pct: [0.4, 0.5] },
  },
  weightedBodyweight: {
    beginner: { repRange: [4, 6] },
    intermediate: { repRange: [4, 6] },
    advanced: { repRange: [3, 5] },
  },
  assistedBodyweight: {
    beginner: { repRange: [4, 8] },
    intermediate: { repRange: [6, 10] },
    advanced: { repRange: [8, 12] },
  },
})

const ANCHORS = Object.freeze({
  squat: {
    male: { beginner: 64, intermediate: 130, advanced: 173 },
    female: { beginner: 30, intermediate: 73, advanced: 103 },
  },
  hackSquat: {
    male: { beginner: 54, intermediate: 157, advanced: 231 },
    female: { beginner: 22, intermediate: 94, advanced: 149 },
  },
  legPress: {
    male: { beginner: 86, intermediate: 226, advanced: 324 },
    female: { beginner: 41, intermediate: 141, advanced: 214 },
  },
  singleLegPress: {
    male: { beginner: 33, intermediate: 142, advanced: 228 },
    female: { beginner: 20, intermediate: 80, advanced: 126 },
  },
  deadlift: {
    male: { beginner: 78, intermediate: 152, advanced: 200 },
    female: { beginner: 38, intermediate: 87, advanced: 120 },
  },
  hipThrust: {
    male: { beginner: 38, intermediate: 129, advanced: 196 },
    female: { beginner: 30, intermediate: 93, advanced: 139 },
  },
  benchPress: {
    male: { beginner: 47, intermediate: 98, advanced: 132 },
    female: { beginner: 17, intermediate: 51, advanced: 74 },
  },
  inclineBenchPress: {
    male: { beginner: 44, intermediate: 89, advanced: 118 },
    female: { beginner: 16, intermediate: 44, advanced: 64 },
  },
  chestPressMachine: {
    male: { beginner: 32, intermediate: 90, advanced: 131 },
    female: { beginner: 10, intermediate: 38, advanced: 59 },
  },
  shoulderPress: {
    male: { beginner: 30, intermediate: 64, advanced: 87 },
    female: { beginner: 13, intermediate: 34, advanced: 48 },
  },
  machineShoulderPress: {
    male: { beginner: 24, intermediate: 77, advanced: 115 },
    female: { beginner: 8, intermediate: 34, advanced: 56 },
  },
  dumbbellBenchPress: {
    male: { beginner: 16, intermediate: 41, advanced: 58 },
    female: { beginner: 6, intermediate: 21, advanced: 32 },
  },
  inclineDumbbellBenchPress: {
    male: { beginner: 19, intermediate: 39, advanced: 53 },
    female: { beginner: 7, intermediate: 19, advanced: 29 },
  },
  dumbbellShoulderPress: {
    male: { beginner: 13, intermediate: 32, advanced: 45 },
    female: { beginner: 6, intermediate: 16, advanced: 23 },
  },
  barbellRow: {
    male: { beginner: 41, intermediate: 85, advanced: 115 },
    female: { beginner: 15, intermediate: 41, advanced: 59 },
  },
  dumbbellRow: {
    male: { beginner: 16, intermediate: 43, advanced: 62 },
    female: { beginner: 8, intermediate: 21, advanced: 31 },
  },
  latPulldown: {
    male: { beginner: 38, intermediate: 82, advanced: 110 },
    female: { beginner: 19, intermediate: 46, advanced: 64 },
  },
  cableRow: {
    male: { beginner: 41, intermediate: 86, advanced: 115 },
    female: { beginner: 20, intermediate: 47, advanced: 66 },
  },
  machineRow: {
    male: { beginner: 38, intermediate: 101, advanced: 144 },
    female: { beginner: 17, intermediate: 53, advanced: 79 },
  },
  cableFly: {
    male: { beginner: 5, intermediate: 39, advanced: 68 },
    female: { beginner: 3, intermediate: 20, advanced: 35 },
  },
  dumbbellLateralRaise: {
    male: { beginner: 4, intermediate: 15, advanced: 25 },
    female: { beginner: 3, intermediate: 9, advanced: 14 },
  },
  machineLateralRaise: {
    male: { beginner: 15, intermediate: 57, advanced: 89 },
    female: { beginner: 6, intermediate: 22, advanced: 34 },
  },
  barbellCurl: {
    male: { beginner: 17, intermediate: 47, advanced: 68 },
    female: { beginner: 6, intermediate: 25, advanced: 39 },
  },
  dumbbellCurl: {
    male: { beginner: 6, intermediate: 23, advanced: 36 },
    female: { beginner: 3, intermediate: 14, advanced: 21 },
  },
  tricepPushdown: {
    male: { beginner: 17, intermediate: 57, advanced: 86 },
    female: { beginner: 8, intermediate: 31, advanced: 49 },
  },
  ropePushdown: {
    male: { beginner: 15, intermediate: 47, advanced: 71 },
    female: { beginner: 8, intermediate: 26, advanced: 40 },
  },
  facePull: {
    male: { beginner: 12, intermediate: 46, advanced: 71 },
    female: { beginner: 10, intermediate: 33, advanced: 50 },
  },
  legExtension: {
    male: { beginner: 35, intermediate: 96, advanced: 139 },
    female: { beginner: 18, intermediate: 58, advanced: 88 },
  },
  legCurl: {
    male: { beginner: 23, intermediate: 64, advanced: 93 },
    female: { beginner: 12, intermediate: 39, advanced: 61 },
  },
  machineCalfRaise: {
    male: { beginner: 31, intermediate: 134, advanced: 214 },
    female: { beginner: 15, intermediate: 83, advanced: 139 },
  },
  seatedCalfRaise: {
    male: { beginner: 22, intermediate: 100, advanced: 162 },
    female: { beginner: 13, intermediate: 69, advanced: 115 },
  },
  hipMachineAccessory: {
    male: { beginner: 20, intermediate: 60, advanced: 95 },
    female: { beginner: 12, intermediate: 40, advanced: 68 },
  },
  cableHipAccessory: {
    male: { beginner: 8, intermediate: 22, advanced: 38 },
    female: { beginner: 4, intermediate: 12, advanced: 22 },
  },
})

const BARBELL_BENCH_IDS = new Set([
  'barbell-bench-press',
  'close-grip-bench-press',
  'decline-barbell-press',
  'decline-bench-press',
  'floor-press',
  'low-incline-barbell-press',
  'pin-press',
])

const INCLINE_BARBELL_IDS = new Set(['barbell-incline-press'])

const DUMBBELL_BENCH_IDS = new Set([
  'dumbbell-bench-press',
  'dumbbell-floor-press',
  'flat-dumbbell-press',
])

const INCLINE_DUMBBELL_IDS = new Set([
  'decline-dumbbell-press',
  'dumbbell-incline-press',
  'incline-dumbbell-press',
  'low-incline-dumbbell-press',
])

const MACHINE_CHEST_PRESS_IDS = new Set([
  'hammer-strength-decline-press',
  'hammer-strength-machine-incline-press',
  'hammer-strength-machine-press',
  'low-incline-machine-press',
  'machine-chest-press',
  'machine-incline-chest-press',
  'smith-machine-bench-press',
])

const BARBELL_SHOULDER_PRESS_IDS = new Set([
  'overhead-press',
  'seated-barbell-overhead-press',
])

const DUMBBELL_SHOULDER_PRESS_IDS = new Set([
  'arnold-press',
  'dumbbell-press',
  'dumbbell-seated-shoulder-press',
  'laterally-dumbbell-seated-shoulder-press',
  'standing-dumbbell-shoulder-press',
])

const MACHINE_SHOULDER_PRESS_IDS = new Set([
  'machine-shoulder-press',
  'seated-smith-press',
  'shoulder-press-machine',
])

const BARBELL_ROW_IDS = new Set([
  'barbell-bent-over-row',
  'pendlay-row',
  'seal-row',
  'smith-machine-pendlay-row',
])

const TBAR_ROW_IDS = new Set([
  'bent-over-smith-row',
  'chest-supported-row',
  'chest-supported-t-bar-row',
  'chest-supported-t-bar-row-pronated-grip',
  'helms-row',
  'humble-row',
  't-bar-row',
])

const DUMBBELL_ROW_IDS = new Set([
  'chest-supported-dumbbell-row',
  'dumbbell-chest-supported-row',
  'dumbbell-row',
  'dumbbell-seal-row',
])

const MACHINE_ROW_IDS = new Set([
  'machine-row-both-with-chest-support',
  'single-arm-machine-row',
])

const PULLDOWN_IDS = new Set([
  'lat-pulldown',
  'neutral-grip-pulldown',
  'pronated-pulldown',
  'reverse-grip-lat-pulldown',
  'supinated-pulldown',
  'wide-grip-lat-pulldown',
])

const STRAIGHT_ARM_PULL_IDS = new Set(['cable-pull-over', 'lat-prayer'])

const SHRUG_BARBELL_IDS = new Set([
  'barbell-shrug',
  'hex-bar-or-smith-machine-shrug',
  'hex-bar-shrug',
  'smith-machine-shrug',
])

const SHRUG_DUMBBELL_IDS = new Set(['dumbbell-monkey-shrug', 'dumbbell-shrug'])

const FACE_PULL_IDS = new Set(['face-pull', 'rope-face-pull', 'seated-face-pull'])

const UPRIGHT_ROW_CABLE_IDS = new Set([
  'cable-rope-upright-row',
  'upright-row-cable',
])

const UPRIGHT_ROW_EZ_IDS = new Set(['upright-row-ez-bar'])

const CABLE_CURL_IDS = new Set([
  'behind-the-back-cable-curl',
  'cable-concentration-curl',
  'cable-curl',
  'cable-single-arm-curl',
  'ez-concentration-curl',
])

const CABLE_CURL_21_IDS = new Set(['cable-curl-21s'])

const DUMBBELL_CURL_IDS = new Set([
  'dumbbell-concentration-curl',
  'dumbbell-curl',
  'dumbbell-preacher-curl',
  'dumbbell-supinated-curl',
  'hammer-curl',
  'incline-dumbbell-curl',
  'seated-hammer-curl',
  'single-arm-dumbbell-curl',
])

const DUMBBELL_CURL_21_IDS = new Set(['dumbbell-curl-21s'])

const BARBELL_CURL_IDS = new Set([
  'barbell-concentration-curl',
  'ez-bar-curl',
  'ez-bar-pronated-curl',
  'ez-preacher-curl',
  'supinated-ez-bar-curl',
])

const BARBELL_CURL_21_IDS = new Set(['ez-bar-curl-21s'])

const MACHINE_CURL_IDS = new Set([
  'machine-biceps-curl',
  'machine-hammer-curl',
  'machine-seated-preacher-curl',
  'single-arm-machine-biceps-curl',
])

const TRICEP_CABLE_IDS = new Set([
  'cable-tricep-kickback',
  'overhead-cable-extension',
  'overhead-tricep-extension',
  'rope-overhead-triceps-extension',
  'single-arm-rope-tricep-extension',
  'tricep-pressdown',
])

const TRICEP_MACHINE_IDS = new Set([
  'machine-overhead-triceps-extension',
  'machine-triceps-press',
  'single-arm-triceps-extension-machine',
  'tricep-extension-machine',
])

const TRICEP_DUMBBELL_IDS = new Set([
  'dumbbell-kickback',
  'dumbbell-skull-crusher',
])

const TRICEP_SINGLE_DUMBBELL_IDS = new Set(['dumbbell-overhead-triceps-extension'])

const TRICEP_BARBELL_IDS = new Set(['ez-bar-skull-crusher', 'french-press', 'jm-press'])

const FLYE_CABLE_IDS = new Set([
  'cable-flye',
  'incline-pectoral-flye-cable',
  'low-to-high-cable-flye',
  'pectoral-flye-cable',
  'standing-cable-flye',
])

const FLYE_DUMBBELL_IDS = new Set([
  'dumbbell-fly',
  'dumbbell-flye',
  'incline-pectoral-flye-dumbbell',
])

const FLYE_MACHINE_IDS = new Set(['pec-deck', 'pectoral-flye-machine'])

const REAR_DELT_CABLE_IDS = new Set([
  'cable-reverse-flye',
  'rear-delt-flye-cable',
  'reverse-cable-crossover',
  'reverse-cable-flye',
])

const REAR_DELT_DUMBBELL_IDS = new Set([
  'dumbbell-bent-over-lateral-raise',
  'rear-delt-flye-dumbbell',
  'reverse-dumbbell-flye',
])

const REAR_DELT_MACHINE_IDS = new Set([
  'rear-delt-flye-machine',
  'reverse-pec-deck',
])

const HIP_MACHINE_ACCESSORY_IDS = new Set([
  'adductor-machine',
  'plate-loaded-hip-abduction',
  'seated-hip-abduction',
])

const HIP_CABLE_ACCESSORY_IDS = new Set([
  'cable-adductor-raises',
  'standing-cable-hip-abduction',
])

const GLUTE_KICKBACK_CABLE_IDS = new Set(['cable-glute-kickback'])
const GLUTE_KICKBACK_MACHINE_IDS = new Set(['machine-glute-kickback'])

const LATERAL_BAND_WALK_IDS = new Set(['lateral-band-walk'])

const WRIST_CURL_IDS = new Set(['wrist-curl'])
const REVERSE_WRIST_CURL_IDS = new Set(['reverse-wrist-curl'])
const WRIST_ROLLER_IDS = new Set(['wrist-roller'])

const NECK_FLEXION_IDS = new Set(['neck-flexion'])
const NECK_EXTENSION_IDS = new Set(['neck-extension'])
const NECK_LATERAL_IDS = new Set(['neck-lateral-flexion'])

const CALF_BODYWEIGHT_IDS = new Set([
  'any-bent-leg-calf-raise',
  'eccentric-accentuated-standing-calf-raise',
  'standing-calf-raise',
])

const CALF_MACHINE_IDS = new Set(['calf-raise-machine'])

const CALF_SLED_IDS = new Set([
  'calf-raise-on-leg-press-machine',
  'leg-press-calf-press',
  'slow-eccentric-leg-press-toe-press',
])

const CALF_SEATED_IDS = new Set(['seated-calf-raise'])

const CALF_DUMBBELL_IDS = new Set(['dumbbell-standing-calf-raise'])

const CALF_SMITH_IDS = new Set(['smith-machine-calf-raise'])

const BODYWEIGHT_CRUNCH_IDS = new Set([
  'bicycle-crunch',
  'bodyweight-crunch',
  'crunch',
  'decline-crunch',
  'standing-oblique-crunch',
])

const AB_MACHINE_CRUNCH_IDS = new Set([
  'ab-coaster-crunch-machine',
  'abdominal-crunch-machine',
  'machine-oblique-crunch',
  'plate-loaded-ab-crunch-machine',
  'seated-abdominal-crunch-machine',
])

const BODYWEIGHT_LEG_RAISE_IDS = new Set([
  'captain-s-chair-crunch',
  'decline-leg-raise',
  'hanging-leg-raise',
  'reverse-crunch',
  'roman-chair-leg-raise',
  'v-sit-up',
])

const PLANK_IDS = new Set(['long-lever-plank', 'plank'])
const SIDE_PLANK_IDS = new Set(['side-plank'])
const HOLD_CORE_IDS = new Set(['hollow-body-hold'])
const AB_WHEEL_IDS = new Set(['ab-wheel-rollout'])

const PUSH_UP_IDS = new Set(['push-up', 'deficit-push-up'])
const DIP_IDS = new Set(['dip'])
const ASSISTED_DIP_IDS = new Set(['assisted-dip'])
const MACHINE_DIP_IDS = new Set(['machine-dip'])
const WEIGHTED_DIP_IDS = new Set(['weighted-dip'])

const PULL_UP_IDS = new Set(['neutral-grip-pull-up', 'pull-up'])
const CHIN_UP_IDS = new Set(['chin-up'])
const ASSISTED_PULL_IDS = new Set(['assisted-pull-up', 'reverse-grip-assisted-pull-up'])
const WEIGHTED_PULL_IDS = new Set(['weighted-pull-up'])

const SQUAT_BARBELL_IDS = new Set(['back-squat', 'front-squat'])
const SQUAT_SMITH_IDS = new Set(['smith-machine-squat'])
const HACK_SQUAT_IDS = new Set(['hack-squat'])
const GOBLET_SQUAT_IDS = new Set(['goblet-squat'])
const SISSY_SQUAT_IDS = new Set(['sissy-squat'])
const ASSISTED_PISTOL_IDS = new Set(['assisted-pistol-squat'])
const LEG_PRESS_IDS = new Set(['horizontal-leg-press', 'leg-press', 'vertical-leg-press'])
const SINGLE_LEG_PRESS_IDS = new Set(['single-leg-leg-press', 'single-leg-press'])

const BODYWEIGHT_SINGLE_LEG_IDS = new Set([
  'bulgarian-split-squat',
  'reverse-lunge',
  'static-lunge',
  'walking-lunge',
])

const DUMBBELL_SINGLE_LEG_IDS = new Set([
  'dumbbell-step-up',
  'dumbbell-walking-lunge',
])

const SMITH_SINGLE_LEG_IDS = new Set(['smith-machine-split-squat'])

const DEADLIFT_IDS = new Set([
  'conventional-deadlift',
  'deadlift',
  'sumo-deadlift',
])

const RDL_IDS = new Set([
  'barbell-hip-thrust-or-romanian-deadlift',
  'romanian-deadlift',
])

const BARBELL_HIP_THRUST_IDS = new Set(['barbell-hip-thrust'])
const MACHINE_HIP_THRUST_IDS = new Set(['leg-extension-machine-hip-thrust'])
const DUMBBELL_HIP_THRUST_IDS = new Set(['dumbbell-single-leg-hip-thrust'])
const LOWER_BACK_MACHINE_IDS = new Set(['lower-back-machine'])

const BODYWEIGHT_HIP_HINGE_IDS = new Set([
  'back-extension',
  'glute-bridge',
  'glute-ham-raise',
  'hyperextension',
  'reverse-hyper',
])

const LEG_CURL_MACHINE_IDS = new Set([
  'leg-curl',
  'lying-leg-curl',
  'seated-leg-curl',
  'single-leg-leg-curl',
  'single-leg-lying-leg-curl',
])

const LEG_CURL_DUMBBELL_IDS = new Set(['dumbbell-leg-curl'])
const LEG_CURL_BODYWEIGHT_IDS = new Set(['sliding-leg-curl', 'swiss-ball-leg-curl'])

const LEG_EXTENSION_IDS = new Set([
  'leg-extension',
  'single-leg-extension',
  'single-leg-leg-extension',
])

const CABLE_PULL_THROUGH_IDS = new Set(['cable-pull-through'])

const CARDIO_IDS = new Set([
  'elliptical-trainer',
  'rowing-ergometer',
  'running',
  'stationary-bike',
])

function roundToKg(value) {
  return Math.max(0, Math.round(value))
}

function normalizeRange(start, end, minimum = 0) {
  const lower = Math.max(minimum, roundToKg(Math.min(start, end)))
  const upper = Math.max(lower, roundToKg(Math.max(start, end)))
  return [lower, upper]
}

function scaleRange(range, factor, minimum = 0) {
  return normalizeRange(range[0] * factor, range[1] * factor, minimum)
}

function scaleAnchors(anchor, factor) {
  return {
    male: Object.fromEntries(
      EXPERIENCE_LEVELS.map((level) => [level, anchor.male[level] * factor]),
    ),
    female: Object.fromEntries(
      EXPERIENCE_LEVELS.map((level) => [level, anchor.female[level] * factor]),
    ),
  }
}

function buildProfiles(factory) {
  return Object.fromEntries(
    GENDERS.map((gender) => [
      gender,
      Object.fromEntries(
        AGE_GROUPS.map((ageGroup) => [
          ageGroup,
          Object.fromEntries(
            EXPERIENCE_LEVELS.map((experienceLevel) => [
              experienceLevel,
              factory(gender, ageGroup, experienceLevel),
            ]),
          ),
        ]),
      ),
    ]),
  )
}

function buildLoadBenchmark({ basis, anchors, scheme }) {
  return {
    kind: 'loadKg',
    measurement: {
      basis,
      unit: 'kg',
    },
    profiles: buildProfiles((gender, ageGroup, experienceLevel) => {
      const plan = scheme[experienceLevel]
      const anchor = anchors[gender][experienceLevel] * LOAD_AGE_FACTORS[ageGroup]
      return {
        repRange: plan.repRange,
        loadRangeKg: normalizeRange(
          anchor * plan.pct[0],
          anchor * plan.pct[1],
          1,
        ),
      }
    }),
  }
}

function buildExternalLoadBenchmark({ basis, repScheme, ranges }) {
  return {
    kind: 'externalLoadKg',
    measurement: {
      basis,
      unit: 'kg',
    },
    profiles: buildProfiles((gender, ageGroup, experienceLevel) => ({
      repRange: repScheme[experienceLevel].repRange,
      externalLoadRangeKg: scaleRange(
        ranges[gender][experienceLevel],
        LOAD_AGE_FACTORS[ageGroup],
        0,
      ),
    })),
  }
}

function buildAssistanceBenchmark({ basis, repScheme, ranges }) {
  return {
    kind: 'assistanceKg',
    measurement: {
      basis,
      unit: 'kg',
    },
    profiles: buildProfiles((gender, ageGroup, experienceLevel) => ({
      repRange: repScheme[experienceLevel].repRange,
      assistanceRangeKg: scaleRange(
        ranges[gender][experienceLevel],
        ASSISTANCE_AGE_FACTORS[ageGroup],
        0,
      ),
    })),
  }
}

function buildBodyweightRepBenchmark({ basis, repProfiles }) {
  return {
    kind: 'bodyweightReps',
    measurement: {
      basis,
      unit: 'reps',
    },
    profiles: buildProfiles((gender, ageGroup, experienceLevel) => ({
      repRange: scaleRange(
        repProfiles[gender][experienceLevel],
        REP_AGE_FACTORS[ageGroup],
        1,
      ),
    })),
  }
}

function buildHoldBenchmark({ basis, holdProfiles }) {
  return {
    kind: 'holdSeconds',
    measurement: {
      basis,
      unit: 'seconds',
    },
    profiles: buildProfiles((gender, ageGroup, experienceLevel) => ({
      holdSecondsRange: scaleRange(
        holdProfiles[gender][experienceLevel],
        HOLD_AGE_FACTORS[ageGroup],
        5,
      ),
    })),
  }
}

function buildDurationBenchmark({ basis, durationProfiles }) {
  return {
    kind: 'durationMinutes',
    measurement: {
      basis,
      unit: 'minutes',
    },
    profiles: buildProfiles((gender, ageGroup, experienceLevel) => ({
      durationMinutesRange: scaleRange(
        durationProfiles[gender][experienceLevel],
        DURATION_AGE_FACTORS[ageGroup],
        5,
      ),
    })),
  }
}

function insertAfterKey(record, key, insertKey, insertValue) {
  const next = {}
  let inserted = false

  for (const [entryKey, entryValue] of Object.entries(record)) {
    next[entryKey] = entryValue

    if (entryKey === key) {
      next[insertKey] = insertValue
      inserted = true
    }
  }

  if (!inserted) {
    next[insertKey] = insertValue
  }

  return next
}

function isOneOf(id, set) {
  return set.has(id)
}

function createBenchmark(record) {
  const id = String(record.id ?? '').trim()

  if (!id) {
    throw new Error('Encountered an exercise file without an id.')
  }

  if (isOneOf(id, CARDIO_IDS)) {
    const durationProfiles =
      id === 'running'
        ? {
            male: {
              beginner: [15, 25],
              intermediate: [25, 45],
              advanced: [40, 70],
            },
            female: {
              beginner: [15, 25],
              intermediate: [25, 45],
              advanced: [40, 70],
            },
          }
        : id === 'rowing-ergometer'
          ? {
              male: {
                beginner: [10, 20],
                intermediate: [20, 35],
                advanced: [30, 50],
              },
              female: {
                beginner: [10, 20],
                intermediate: [20, 35],
                advanced: [30, 50],
              },
            }
          : {
              male: {
                beginner: [20, 30],
                intermediate: [30, 50],
                advanced: [45, 75],
              },
              female: {
                beginner: [20, 30],
                intermediate: [30, 50],
                advanced: [45, 75],
              },
            }

    return buildDurationBenchmark({
      basis: 'continuous work duration at a sustainable training pace',
      durationProfiles,
    })
  }

  if (isOneOf(id, PLANK_IDS)) {
    return buildHoldBenchmark({
      basis: 'strict bodyweight hold duration',
      holdProfiles: {
        male: {
          beginner: [30, 60],
          intermediate: [60, 120],
          advanced: [120, 180],
        },
        female: {
          beginner: [30, 60],
          intermediate: [60, 120],
          advanced: [120, 180],
        },
      },
    })
  }

  if (isOneOf(id, SIDE_PLANK_IDS)) {
    return buildHoldBenchmark({
      basis: 'strict bodyweight hold duration per side',
      holdProfiles: {
        male: {
          beginner: [20, 45],
          intermediate: [45, 90],
          advanced: [90, 150],
        },
        female: {
          beginner: [20, 45],
          intermediate: [45, 90],
          advanced: [90, 150],
        },
      },
    })
  }

  if (isOneOf(id, HOLD_CORE_IDS)) {
    return buildHoldBenchmark({
      basis: 'strict bodyweight hold duration',
      holdProfiles: {
        male: {
          beginner: [20, 40],
          intermediate: [40, 75],
          advanced: [75, 120],
        },
        female: {
          beginner: [20, 40],
          intermediate: [40, 75],
          advanced: [75, 120],
        },
      },
    })
  }

  if (isOneOf(id, AB_WHEEL_IDS)) {
    return buildBodyweightRepBenchmark({
      basis: 'full-range kneeling reps with no added load',
      repProfiles: {
        male: {
          beginner: [1, 4],
          intermediate: [10, 20],
          advanced: [20, 35],
        },
        female: {
          beginner: [1, 3],
          intermediate: [5, 10],
          advanced: [10, 18],
        },
      },
    })
  }

  if (isOneOf(id, PUSH_UP_IDS)) {
    return buildBodyweightRepBenchmark({
      basis: 'strict bodyweight reps',
      repProfiles: {
        male: {
          beginner: [8, 20],
          intermediate: [20, 40],
          advanced: [40, 60],
        },
        female: {
          beginner: [5, 15],
          intermediate: [15, 30],
          advanced: [30, 50],
        },
      },
    })
  }

  if (isOneOf(id, ASSISTED_PULL_IDS)) {
    return buildAssistanceBenchmark({
      basis: 'assistance load offset on the machine or band; higher values mean more help',
      repScheme: SCHEMES.assistedBodyweight,
      ranges: {
        male: {
          beginner: [18, 32],
          intermediate: [8, 18],
          advanced: [0, 8],
        },
        female: {
          beginner: [25, 40],
          intermediate: [12, 24],
          advanced: [2, 10],
        },
      },
    })
  }

  if (isOneOf(id, WEIGHTED_PULL_IDS)) {
    return buildExternalLoadBenchmark({
      basis: 'external load added to bodyweight with a belt or vest',
      repScheme: SCHEMES.weightedBodyweight,
      ranges: {
        male: {
          beginner: [0, 8],
          intermediate: [10, 22],
          advanced: [25, 45],
        },
        female: {
          beginner: [0, 4],
          intermediate: [5, 12],
          advanced: [12, 20],
        },
      },
    })
  }

  if (isOneOf(id, PULL_UP_IDS)) {
    return buildBodyweightRepBenchmark({
      basis: 'strict bodyweight reps',
      repProfiles: {
        male: {
          beginner: [1, 4],
          intermediate: [8, 14],
          advanced: [15, 25],
        },
        female: {
          beginner: [1, 3],
          intermediate: [4, 8],
          advanced: [8, 14],
        },
      },
    })
  }

  if (isOneOf(id, CHIN_UP_IDS)) {
    return buildBodyweightRepBenchmark({
      basis: 'strict bodyweight reps',
      repProfiles: {
        male: {
          beginner: [2, 5],
          intermediate: [8, 14],
          advanced: [14, 24],
        },
        female: {
          beginner: [1, 3],
          intermediate: [4, 8],
          advanced: [8, 13],
        },
      },
    })
  }

  if (isOneOf(id, ASSISTED_DIP_IDS)) {
    return buildAssistanceBenchmark({
      basis: 'assistance load offset on the machine or band; higher values mean more help',
      repScheme: SCHEMES.assistedBodyweight,
      ranges: {
        male: {
          beginner: [10, 24],
          intermediate: [2, 10],
          advanced: [0, 5],
        },
        female: {
          beginner: [18, 30],
          intermediate: [6, 16],
          advanced: [0, 6],
        },
      },
    })
  }

  if (isOneOf(id, WEIGHTED_DIP_IDS)) {
    return buildExternalLoadBenchmark({
      basis: 'external load added to bodyweight with a belt or vest',
      repScheme: SCHEMES.weightedBodyweight,
      ranges: {
        male: {
          beginner: [0, 12],
          intermediate: [15, 30],
          advanced: [30, 50],
        },
        female: {
          beginner: [0, 6],
          intermediate: [8, 18],
          advanced: [18, 30],
        },
      },
    })
  }

  if (isOneOf(id, DIP_IDS)) {
    return buildBodyweightRepBenchmark({
      basis: 'strict bodyweight reps',
      repProfiles: {
        male: {
          beginner: [2, 6],
          intermediate: [10, 18],
          advanced: [18, 30],
        },
        female: {
          beginner: [1, 4],
          intermediate: [6, 12],
          advanced: [12, 22],
        },
      },
    })
  }

  if (isOneOf(id, MACHINE_DIP_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected machine stack weight',
      anchors: scaleAnchors(ANCHORS.chestPressMachine, 1.15),
      scheme: SCHEMES.machineCompound,
    })
  }

  if (isOneOf(id, BODYWEIGHT_CRUNCH_IDS)) {
    return buildBodyweightRepBenchmark({
      basis: 'strict bodyweight reps',
      repProfiles: {
        male: {
          beginner: [12, 20],
          intermediate: [20, 35],
          advanced: [35, 50],
        },
        female: {
          beginner: [10, 18],
          intermediate: [18, 30],
          advanced: [30, 45],
        },
      },
    })
  }

  if (isOneOf(id, AB_MACHINE_CRUNCH_IDS)) {
    return buildLoadBenchmark({
      basis:
        id === 'plate-loaded-ab-crunch-machine'
          ? 'loaded plates on the crunch machine lever'
          : 'selected machine stack or plate-loaded resistance',
      anchors: scaleAnchors(
        ANCHORS.tricepPushdown,
        id === 'ab-coaster-crunch-machine' || id === 'machine-oblique-crunch' ? 0.65 : 0.85,
      ),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, BODYWEIGHT_LEG_RAISE_IDS)) {
    return buildBodyweightRepBenchmark({
      basis: 'strict bodyweight reps',
      repProfiles: {
        male: {
          beginner: [5, 10],
          intermediate: [10, 18],
          advanced: [18, 30],
        },
        female: {
          beginner: [3, 8],
          intermediate: [8, 15],
          advanced: [15, 25],
        },
      },
    })
  }

  if (id === 'cable-crunch' || id === 'kneeling-cable-crunch') {
    return buildLoadBenchmark({
      basis: 'selected cable stack weight',
      anchors: scaleAnchors(ANCHORS.tricepPushdown, 0.8),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, CALF_BODYWEIGHT_IDS)) {
    return buildBodyweightRepBenchmark({
      basis: 'strict bodyweight reps',
      repProfiles:
        id === 'eccentric-accentuated-standing-calf-raise'
          ? {
              male: {
                beginner: [8, 15],
                intermediate: [12, 20],
                advanced: [15, 30],
              },
              female: {
                beginner: [8, 15],
                intermediate: [12, 20],
                advanced: [15, 30],
              },
            }
          : {
              male: {
                beginner: [15, 30],
                intermediate: [30, 60],
                advanced: [60, 100],
              },
              female: {
                beginner: [15, 30],
                intermediate: [30, 55],
                advanced: [50, 90],
              },
            },
    })
  }

  if (isOneOf(id, CALF_MACHINE_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected machine load',
      anchors: ANCHORS.machineCalfRaise,
      scheme: SCHEMES.calfLoad,
    })
  }

  if (isOneOf(id, CALF_SLED_IDS)) {
    return buildLoadBenchmark({
      basis: 'loaded sled weight on the leg press, excluding the sled carriage',
      anchors: scaleAnchors(ANCHORS.legPress, 0.7),
      scheme: SCHEMES.calfLoad,
    })
  }

  if (isOneOf(id, CALF_SEATED_IDS)) {
    return buildLoadBenchmark({
      basis: 'total seated calf raise load on the lever or machine',
      anchors: ANCHORS.seatedCalfRaise,
      scheme: SCHEMES.calfLoad,
    })
  }

  if (isOneOf(id, CALF_DUMBBELL_IDS)) {
    return buildLoadBenchmark({
      basis: 'per dumbbell held in each hand',
      anchors: scaleAnchors(ANCHORS.machineCalfRaise, 0.18),
      scheme: SCHEMES.calfLoad,
    })
  }

  if (isOneOf(id, CALF_SMITH_IDS)) {
    return buildLoadBenchmark({
      basis: 'smith machine bar plus plates, as loaded',
      anchors: scaleAnchors(ANCHORS.machineCalfRaise, 0.9),
      scheme: SCHEMES.calfLoad,
    })
  }

  if (isOneOf(id, SQUAT_BARBELL_IDS)) {
    return buildLoadBenchmark({
      basis:
        id === 'front-squat'
          ? 'barbell total including the bar'
          : 'barbell total including the bar',
      anchors:
        id === 'front-squat'
          ? scaleAnchors(ANCHORS.squat, 0.85)
          : ANCHORS.squat,
      scheme: SCHEMES.heavyBarbell,
    })
  }

  if (isOneOf(id, SQUAT_SMITH_IDS)) {
    return buildLoadBenchmark({
      basis: 'smith machine bar plus plates, as loaded',
      anchors: scaleAnchors(ANCHORS.squat, 0.95),
      scheme: SCHEMES.machineCompound,
    })
  }

  if (isOneOf(id, HACK_SQUAT_IDS)) {
    return buildLoadBenchmark({
      basis: 'loaded machine or sled weight, excluding the carriage',
      anchors: ANCHORS.hackSquat,
      scheme: SCHEMES.machineCompound,
    })
  }

  if (isOneOf(id, GOBLET_SQUAT_IDS)) {
    return buildLoadBenchmark({
      basis: 'single dumbbell or kettlebell total load',
      anchors: scaleAnchors(ANCHORS.squat, 0.35),
      scheme: SCHEMES.moderateCompound,
    })
  }

  if (isOneOf(id, SISSY_SQUAT_IDS)) {
    return buildBodyweightRepBenchmark({
      basis: 'strict bodyweight reps',
      repProfiles: {
        male: {
          beginner: [5, 8],
          intermediate: [8, 15],
          advanced: [15, 25],
        },
        female: {
          beginner: [4, 8],
          intermediate: [8, 15],
          advanced: [12, 20],
        },
      },
    })
  }

  if (isOneOf(id, ASSISTED_PISTOL_IDS)) {
    return buildBodyweightRepBenchmark({
      basis: 'bodyweight reps with light hand assistance from a strap or support',
      repProfiles: {
        male: {
          beginner: [3, 6],
          intermediate: [6, 12],
          advanced: [12, 20],
        },
        female: {
          beginner: [3, 6],
          intermediate: [6, 12],
          advanced: [12, 20],
        },
      },
    })
  }

  if (isOneOf(id, LEG_PRESS_IDS)) {
    return buildLoadBenchmark({
      basis:
        id === 'horizontal-leg-press'
          ? 'selected machine stack or horizontal sled resistance'
          : id === 'vertical-leg-press'
            ? 'loaded sled weight on the vertical leg press, excluding the sled carriage'
            : 'loaded sled weight on the leg press, excluding the sled carriage',
      anchors:
        id === 'horizontal-leg-press'
          ? scaleAnchors(ANCHORS.legPress, 0.8)
          : id === 'vertical-leg-press'
            ? scaleAnchors(ANCHORS.legPress, 0.9)
            : ANCHORS.legPress,
      scheme: SCHEMES.machineCompound,
    })
  }

  if (isOneOf(id, SINGLE_LEG_PRESS_IDS)) {
    return buildLoadBenchmark({
      basis: 'loaded sled weight for the working leg, excluding the sled carriage',
      anchors: ANCHORS.singleLegPress,
      scheme: SCHEMES.machineCompound,
    })
  }

  if (isOneOf(id, BODYWEIGHT_SINGLE_LEG_IDS)) {
    return buildBodyweightRepBenchmark({
      basis: 'strict bodyweight reps per leg',
      repProfiles: {
        male: {
          beginner: [6, 10],
          intermediate: [10, 16],
          advanced: [16, 24],
        },
        female: {
          beginner: [6, 10],
          intermediate: [10, 16],
          advanced: [16, 24],
        },
      },
    })
  }

  if (isOneOf(id, DUMBBELL_SINGLE_LEG_IDS)) {
    return buildLoadBenchmark({
      basis: 'per dumbbell held in each hand',
      anchors: scaleAnchors(ANCHORS.singleLegPress, 0.18),
      scheme: SCHEMES.moderateCompound,
    })
  }

  if (isOneOf(id, SMITH_SINGLE_LEG_IDS)) {
    return buildLoadBenchmark({
      basis: 'smith machine bar plus plates, as loaded',
      anchors: scaleAnchors(ANCHORS.singleLegPress, 0.4),
      scheme: SCHEMES.machineCompound,
    })
  }

  if (isOneOf(id, DEADLIFT_IDS)) {
    return buildLoadBenchmark({
      basis: 'barbell total including the bar',
      anchors:
        id === 'sumo-deadlift'
          ? scaleAnchors(ANCHORS.deadlift, 1.05)
          : ANCHORS.deadlift,
      scheme: SCHEMES.heavyBarbell,
    })
  }

  if (isOneOf(id, RDL_IDS)) {
    return buildLoadBenchmark({
      basis: 'barbell total including the bar',
      anchors: scaleAnchors(ANCHORS.deadlift, 0.8),
      scheme: SCHEMES.heavyBarbell,
    })
  }

  if (isOneOf(id, BARBELL_HIP_THRUST_IDS)) {
    return buildLoadBenchmark({
      basis: 'barbell total including the bar',
      anchors: ANCHORS.hipThrust,
      scheme: SCHEMES.heavyBarbell,
    })
  }

  if (isOneOf(id, MACHINE_HIP_THRUST_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected machine load or lever load across the hips',
      anchors: scaleAnchors(ANCHORS.hipThrust, 0.65),
      scheme: SCHEMES.machineCompound,
    })
  }

  if (isOneOf(id, DUMBBELL_HIP_THRUST_IDS)) {
    return buildLoadBenchmark({
      basis: 'single dumbbell total load placed across the hips',
      anchors: scaleAnchors(ANCHORS.hipThrust, 0.22),
      scheme: SCHEMES.moderateCompound,
    })
  }

  if (isOneOf(id, LOWER_BACK_MACHINE_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected machine stack or plate-loaded lower-back extension resistance',
      anchors: scaleAnchors(ANCHORS.deadlift, 0.45),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, BODYWEIGHT_HIP_HINGE_IDS)) {
    return buildBodyweightRepBenchmark({
      basis: 'strict bodyweight reps',
      repProfiles:
        id === 'glute-bridge'
          ? {
              male: {
                beginner: [12, 20],
                intermediate: [20, 35],
                advanced: [35, 50],
              },
              female: {
                beginner: [12, 20],
                intermediate: [20, 35],
                advanced: [35, 50],
              },
            }
          : id === 'glute-ham-raise'
            ? {
                male: {
                  beginner: [3, 6],
                  intermediate: [6, 12],
                  advanced: [12, 20],
                },
                female: {
                  beginner: [1, 4],
                  intermediate: [4, 8],
                  advanced: [8, 15],
                },
              }
            : {
                male: {
                  beginner: [10, 15],
                  intermediate: [15, 25],
                  advanced: [25, 40],
                },
                female: {
                  beginner: [10, 15],
                  intermediate: [15, 25],
                  advanced: [25, 40],
                },
              },
    })
  }

  if (isOneOf(id, LEG_CURL_MACHINE_IDS)) {
    const anchorScale =
      id === 'single-leg-leg-curl' || id === 'single-leg-lying-leg-curl' ? 0.65 : 1

    return buildLoadBenchmark({
      basis: 'selected machine stack weight',
      anchors: anchorScale === 1 ? ANCHORS.legCurl : scaleAnchors(ANCHORS.legCurl, anchorScale),
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, LEG_CURL_DUMBBELL_IDS)) {
    return buildLoadBenchmark({
      basis: 'single dumbbell total load',
      anchors: scaleAnchors(ANCHORS.legCurl, 0.22),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, LEG_CURL_BODYWEIGHT_IDS)) {
    return buildBodyweightRepBenchmark({
      basis: 'strict bodyweight reps',
      repProfiles: {
        male: {
          beginner: [5, 8],
          intermediate: [8, 14],
          advanced: [14, 22],
        },
        female: {
          beginner: [4, 7],
          intermediate: [7, 12],
          advanced: [12, 18],
        },
      },
    })
  }

  if (isOneOf(id, LEG_EXTENSION_IDS)) {
    const anchorScale =
      id === 'single-leg-extension' || id === 'single-leg-leg-extension' ? 0.6 : 1

    return buildLoadBenchmark({
      basis: 'selected machine stack weight',
      anchors:
        anchorScale === 1
          ? ANCHORS.legExtension
          : scaleAnchors(ANCHORS.legExtension, anchorScale),
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, CABLE_PULL_THROUGH_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected cable stack weight',
      anchors: scaleAnchors(ANCHORS.hipThrust, 0.45),
      scheme: SCHEMES.moderateCompound,
    })
  }

  if (isOneOf(id, BARBELL_BENCH_IDS)) {
    return buildLoadBenchmark({
      basis: 'barbell total including the bar',
      anchors: id === 'decline-bench-press' ? scaleAnchors(ANCHORS.benchPress, 1.02) : ANCHORS.benchPress,
      scheme: SCHEMES.heavyBarbell,
    })
  }

  if (isOneOf(id, INCLINE_BARBELL_IDS)) {
    return buildLoadBenchmark({
      basis: 'barbell total including the bar',
      anchors: ANCHORS.inclineBenchPress,
      scheme: SCHEMES.heavyBarbell,
    })
  }

  if (isOneOf(id, DUMBBELL_BENCH_IDS)) {
    return buildLoadBenchmark({
      basis: 'per dumbbell',
      anchors: ANCHORS.dumbbellBenchPress,
      scheme: SCHEMES.moderateCompound,
    })
  }

  if (isOneOf(id, INCLINE_DUMBBELL_IDS)) {
    return buildLoadBenchmark({
      basis: 'per dumbbell',
      anchors: ANCHORS.inclineDumbbellBenchPress,
      scheme: SCHEMES.moderateCompound,
    })
  }

  if (isOneOf(id, MACHINE_CHEST_PRESS_IDS)) {
    return buildLoadBenchmark({
      basis:
        id === 'smith-machine-bench-press'
          ? 'smith machine bar plus plates, as loaded'
          : 'selected machine stack or plate-loaded resistance',
      anchors:
        id === 'hammer-strength-machine-incline-press' ||
        id === 'low-incline-machine-press' ||
        id === 'machine-incline-chest-press'
          ? scaleAnchors(ANCHORS.chestPressMachine, 0.95)
          : ANCHORS.chestPressMachine,
      scheme: SCHEMES.machineCompound,
    })
  }

  if (isOneOf(id, BARBELL_SHOULDER_PRESS_IDS)) {
    return buildLoadBenchmark({
      basis: 'barbell total including the bar',
      anchors: ANCHORS.shoulderPress,
      scheme: SCHEMES.heavyBarbell,
    })
  }

  if (isOneOf(id, DUMBBELL_SHOULDER_PRESS_IDS)) {
    return buildLoadBenchmark({
      basis: 'per dumbbell',
      anchors: ANCHORS.dumbbellShoulderPress,
      scheme: SCHEMES.moderateCompound,
    })
  }

  if (isOneOf(id, MACHINE_SHOULDER_PRESS_IDS)) {
    return buildLoadBenchmark({
      basis:
        id === 'seated-smith-press'
          ? 'smith machine bar plus plates, as loaded'
          : 'selected machine stack or plate-loaded resistance',
      anchors: ANCHORS.machineShoulderPress,
      scheme: SCHEMES.machineCompound,
    })
  }

  if (isOneOf(id, BARBELL_ROW_IDS)) {
    return buildLoadBenchmark({
      basis:
        id === 'smith-machine-pendlay-row'
          ? 'smith machine bar plus plates, as loaded'
          : 'barbell total including the bar',
      anchors:
        id === 'pendlay-row' || id === 'smith-machine-pendlay-row'
          ? scaleAnchors(ANCHORS.barbellRow, 1.05)
          : ANCHORS.barbellRow,
      scheme: SCHEMES.heavyBarbell,
    })
  }

  if (isOneOf(id, TBAR_ROW_IDS)) {
    return buildLoadBenchmark({
      basis: 'total loaded plates or implement weight',
      anchors: scaleAnchors(ANCHORS.barbellRow, 1.05),
      scheme: SCHEMES.moderateCompound,
    })
  }

  if (isOneOf(id, DUMBBELL_ROW_IDS)) {
    return buildLoadBenchmark({
      basis: 'per dumbbell',
      anchors: ANCHORS.dumbbellRow,
      scheme: SCHEMES.moderateCompound,
    })
  }

  if (id === 'cable-seated-row') {
    return buildLoadBenchmark({
      basis: 'selected cable stack weight',
      anchors: ANCHORS.cableRow,
      scheme: SCHEMES.machineCompound,
    })
  }

  if (id === 'cable-single-arm-row') {
    return buildLoadBenchmark({
      basis: 'selected cable stack weight for the working arm',
      anchors: scaleAnchors(ANCHORS.cableRow, 0.7),
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, MACHINE_ROW_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected machine stack or plate-loaded resistance',
      anchors:
        id === 'single-arm-machine-row'
          ? scaleAnchors(ANCHORS.machineRow, 0.6)
          : ANCHORS.machineRow,
      scheme: SCHEMES.machineCompound,
    })
  }

  if (isOneOf(id, PULLDOWN_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected cable or machine stack weight',
      anchors: ANCHORS.latPulldown,
      scheme: SCHEMES.machineCompound,
    })
  }

  if (id === 'single-arm-pulldown') {
    return buildLoadBenchmark({
      basis: 'selected cable stack weight for the working arm',
      anchors: scaleAnchors(ANCHORS.latPulldown, 0.65),
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, STRAIGHT_ARM_PULL_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected cable stack weight',
      anchors: scaleAnchors(ANCHORS.latPulldown, 0.7),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (id === 'lying-dumbbell-pullover') {
    return buildLoadBenchmark({
      basis: 'single dumbbell total load',
      anchors: scaleAnchors(ANCHORS.dumbbellBenchPress, 0.9),
      scheme: SCHEMES.moderateCompound,
    })
  }

  if (isOneOf(id, SHRUG_BARBELL_IDS)) {
    return buildLoadBenchmark({
      basis:
        id === 'smith-machine-shrug'
          ? 'smith machine bar plus plates, as loaded'
          : 'barbell or trap-bar total load including the implement',
      anchors: scaleAnchors(ANCHORS.barbellRow, 1.35),
      scheme: SCHEMES.moderateCompound,
    })
  }

  if (isOneOf(id, SHRUG_DUMBBELL_IDS)) {
    return buildLoadBenchmark({
      basis: 'per dumbbell',
      anchors: scaleAnchors(ANCHORS.dumbbellRow, 1.2),
      scheme: SCHEMES.moderateCompound,
    })
  }

  if (isOneOf(id, FACE_PULL_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected cable stack weight',
      anchors: ANCHORS.facePull,
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, UPRIGHT_ROW_CABLE_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected cable stack weight',
      anchors: scaleAnchors(ANCHORS.facePull, 0.95),
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, UPRIGHT_ROW_EZ_IDS)) {
    return buildLoadBenchmark({
      basis: 'barbell total including the EZ bar',
      anchors: scaleAnchors(ANCHORS.barbellCurl, 1.1),
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, MACHINE_CURL_IDS)) {
    return buildLoadBenchmark({
      basis:
        id === 'single-arm-machine-biceps-curl'
          ? 'selected machine stack or plate-loaded resistance for the working arm'
          : 'selected machine stack or plate-loaded resistance',
      anchors:
        id === 'single-arm-machine-biceps-curl'
          ? scaleAnchors(ANCHORS.barbellCurl, 0.45)
          : id === 'machine-hammer-curl'
            ? scaleAnchors(ANCHORS.barbellCurl, 0.85)
            : scaleAnchors(ANCHORS.barbellCurl, 0.75),
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, CABLE_CURL_IDS)) {
    return buildLoadBenchmark({
      basis:
        id === 'cable-single-arm-curl'
          ? 'selected cable stack weight for the working arm'
          : 'selected cable stack weight',
      anchors:
        id === 'cable-single-arm-curl'
          ? scaleAnchors(ANCHORS.barbellCurl, 0.45)
          : scaleAnchors(ANCHORS.barbellCurl, 0.8),
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, CABLE_CURL_21_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected cable stack weight',
      anchors: scaleAnchors(ANCHORS.barbellCurl, 0.75),
      scheme: SCHEMES.fixed21s,
    })
  }

  if (isOneOf(id, DUMBBELL_CURL_IDS)) {
    return buildLoadBenchmark({
      basis: 'per dumbbell',
      anchors:
        id === 'hammer-curl' || id === 'seated-hammer-curl'
          ? scaleAnchors(ANCHORS.dumbbellCurl, 1.05)
          : ANCHORS.dumbbellCurl,
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, DUMBBELL_CURL_21_IDS)) {
    return buildLoadBenchmark({
      basis: 'per dumbbell',
      anchors: ANCHORS.dumbbellCurl,
      scheme: SCHEMES.fixed21s,
    })
  }

  if (id === 'rope-hammer-curl') {
    return buildLoadBenchmark({
      basis: 'selected cable stack weight',
      anchors: scaleAnchors(ANCHORS.dumbbellCurl, 1.4),
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, BARBELL_CURL_IDS)) {
    return buildLoadBenchmark({
      basis: 'barbell total including the bar or EZ bar',
      anchors:
        id === 'barbell-concentration-curl'
          ? scaleAnchors(ANCHORS.barbellCurl, 0.7)
          : ANCHORS.barbellCurl,
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, BARBELL_CURL_21_IDS)) {
    return buildLoadBenchmark({
      basis: 'barbell total including the EZ bar',
      anchors: ANCHORS.barbellCurl,
      scheme: SCHEMES.fixed21s,
    })
  }

  if (isOneOf(id, TRICEP_CABLE_IDS)) {
    const basis =
      id === 'single-arm-rope-tricep-extension'
        ? 'selected cable stack weight for the working arm'
        : 'selected cable stack weight'
    const anchors =
      id === 'single-arm-rope-tricep-extension'
        ? scaleAnchors(ANCHORS.ropePushdown, 0.55)
        : id.includes('rope')
          ? ANCHORS.ropePushdown
          : ANCHORS.tricepPushdown

    return buildLoadBenchmark({
      basis,
      anchors,
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, TRICEP_MACHINE_IDS)) {
    return buildLoadBenchmark({
      basis:
        id === 'single-arm-triceps-extension-machine'
          ? 'selected machine stack or plate-loaded resistance for the working arm'
          : 'selected machine stack or plate-loaded resistance',
      anchors:
        id === 'single-arm-triceps-extension-machine'
          ? scaleAnchors(ANCHORS.tricepPushdown, 0.6)
          : id === 'machine-overhead-triceps-extension'
            ? scaleAnchors(ANCHORS.ropePushdown, 0.95)
            : scaleAnchors(ANCHORS.tricepPushdown, 1.1),
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, TRICEP_DUMBBELL_IDS)) {
    return buildLoadBenchmark({
      basis: 'per dumbbell',
      anchors: scaleAnchors(ANCHORS.dumbbellCurl, 0.95),
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, TRICEP_SINGLE_DUMBBELL_IDS)) {
    return buildLoadBenchmark({
      basis: 'single dumbbell total load',
      anchors: scaleAnchors(ANCHORS.barbellCurl, 0.75),
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, TRICEP_BARBELL_IDS)) {
    return buildLoadBenchmark({
      basis: 'barbell total including the bar or EZ bar',
      anchors: scaleAnchors(ANCHORS.benchPress, 0.55),
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, FLYE_CABLE_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected cable stack weight',
      anchors: ANCHORS.cableFly,
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, FLYE_DUMBBELL_IDS)) {
    return buildLoadBenchmark({
      basis: 'per dumbbell',
      anchors: scaleAnchors(ANCHORS.dumbbellBenchPress, 0.55),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, FLYE_MACHINE_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected machine stack or lever resistance',
      anchors: scaleAnchors(ANCHORS.cableFly, 1.15),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, REAR_DELT_CABLE_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected cable stack weight',
      anchors: scaleAnchors(ANCHORS.facePull, 0.7),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, REAR_DELT_DUMBBELL_IDS)) {
    return buildLoadBenchmark({
      basis: 'per dumbbell',
      anchors: scaleAnchors(ANCHORS.dumbbellLateralRaise, 0.95),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, REAR_DELT_MACHINE_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected machine stack or lever resistance',
      anchors: scaleAnchors(ANCHORS.machineLateralRaise, 0.8),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (id === 'cable-lateral-raise' || id === 'egyptian-cable-raise') {
    return buildLoadBenchmark({
      basis: 'selected cable stack weight',
      anchors: scaleAnchors(ANCHORS.dumbbellLateralRaise, 1.15),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (
    id === 'dumbbell-lateral-raise' ||
    id === 'egyptian-lateral-raise' ||
    id === 'lateral-raise-dumbbell'
  ) {
    return buildLoadBenchmark({
      basis: 'per dumbbell',
      anchors: ANCHORS.dumbbellLateralRaise,
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (id === 'lateral-raise-machine' || id === 'machine-lateral-raise') {
    return buildLoadBenchmark({
      basis: 'selected machine stack or lever resistance',
      anchors: ANCHORS.machineLateralRaise,
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, HIP_MACHINE_ACCESSORY_IDS)) {
    return buildLoadBenchmark({
      basis:
        id === 'plate-loaded-hip-abduction'
          ? 'total plates loaded on the lever'
          : 'selected machine stack weight',
      anchors: ANCHORS.hipMachineAccessory,
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, HIP_CABLE_ACCESSORY_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected cable stack weight for the working side',
      anchors: ANCHORS.cableHipAccessory,
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, GLUTE_KICKBACK_CABLE_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected cable stack weight for the working side',
      anchors: scaleAnchors(ANCHORS.hipThrust, 0.28),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, GLUTE_KICKBACK_MACHINE_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected machine stack or plate-loaded resistance for the working side',
      anchors: scaleAnchors(ANCHORS.hipThrust, 0.42),
      scheme: SCHEMES.isolation,
    })
  }

  if (isOneOf(id, LATERAL_BAND_WALK_IDS)) {
    return buildBodyweightRepBenchmark({
      basis: 'steps per side with a light-to-moderate loop band',
      repProfiles: {
        male: {
          beginner: [10, 16],
          intermediate: [16, 24],
          advanced: [24, 36],
        },
        female: {
          beginner: [10, 16],
          intermediate: [16, 24],
          advanced: [24, 36],
        },
      },
    })
  }

  if (isOneOf(id, WRIST_CURL_IDS)) {
    return buildLoadBenchmark({
      basis: 'barbell, EZ bar, or dumbbell total load held in the hands',
      anchors: scaleAnchors(ANCHORS.barbellCurl, 0.35),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, REVERSE_WRIST_CURL_IDS)) {
    return buildLoadBenchmark({
      basis: 'barbell, EZ bar, or dumbbell total load held in the hands',
      anchors: scaleAnchors(ANCHORS.barbellCurl, 0.28),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, WRIST_ROLLER_IDS)) {
    return buildLoadBenchmark({
      basis: 'hanging load attached to the wrist roller handle',
      anchors: scaleAnchors(ANCHORS.barbellCurl, 0.22),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, NECK_FLEXION_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected neck machine or head-harness load',
      anchors: scaleAnchors(ANCHORS.barbellCurl, 0.28),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, NECK_EXTENSION_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected neck machine or head-harness load',
      anchors: scaleAnchors(ANCHORS.barbellCurl, 0.32),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  if (isOneOf(id, NECK_LATERAL_IDS)) {
    return buildLoadBenchmark({
      basis: 'selected neck machine, cable, or plate load for one side',
      anchors: scaleAnchors(ANCHORS.barbellCurl, 0.22),
      scheme: SCHEMES.highRepIsolation,
    })
  }

  throw new Error(`No benchmark template mapped for exercise "${id}".`)
}

async function main() {
  const fileNames = (await readdir(exercisesDirectory))
    .filter((fileName) => fileName.endsWith('.json') && fileName !== 'index.json')
    .sort()

  for (const fileName of fileNames) {
    const filePath = path.join(exercisesDirectory, fileName)
    const source = await readFile(filePath, 'utf8')
    const record = JSON.parse(source)
    const strengthBenchmarks = createBenchmark(record)
    const nextRecord = insertAfterKey(
      record,
      'difficulty',
      'strengthBenchmarks',
      strengthBenchmarks,
    )

    await writeFile(filePath, `${JSON.stringify(nextRecord, null, 2)}\n`)
  }

  console.log(`Generated strength benchmarks for ${fileNames.length} exercises.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
