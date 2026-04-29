import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const exercisesDirectory = path.resolve('src/assets/exercises')

const MG = Object.freeze({
  upperAbs: 'upper-abs',
  lowerAbs: 'lower-abs',
  transverseAbdominis: 'transverse-abdominis',
  obliques: 'obliques',
  hipFlexors: 'hip-flexors',
  adductorLongus: 'adductor-longus',
  adductorMagnus: 'adductor-magnus',
  bicepsLongHead: 'biceps-long-head',
  bicepsShortHead: 'biceps-short-head',
  brachialis: 'brachialis',
  brachioradialis: 'brachioradialis',
  gastrocnemius: 'gastrocnemius',
  soleus: 'soleus',
  upperChest: 'upper-chest',
  middleChest: 'middle-chest',
  lowerChest: 'lower-chest',
  frontDelts: 'front-delts',
  sideDelts: 'side-delts',
  rearDelts: 'rear-delts',
  forearmFlexors: 'forearm-flexors',
  forearmExtensors: 'forearm-extensors',
  gluteMax: 'glute-max',
  gluteMed: 'glute-med',
  gluteMin: 'glute-min',
  bicepsFemoris: 'biceps-femoris',
  semitendinosus: 'semitendinosus',
  semimembranosus: 'semimembranosus',
  spinalErectors: 'spinal-erectors',
  rectusFemoris: 'rectus-femoris',
  vastusLateralis: 'vastus-lateralis',
  vastusMedialis: 'vastus-medialis',
  vastusIntermedius: 'vastus-intermedius',
  upperTraps: 'upper-traps',
  midTraps: 'mid-traps',
  lowerTraps: 'lower-traps',
  tricepsLongHead: 'triceps-long-head',
  tricepsLateralHead: 'triceps-lateral-head',
  tricepsMedialHead: 'triceps-medial-head',
  lats: 'lats',
  rhomboids: 'rhomboids',
  teresMajor: 'teres-major',
  tibialisAnterior: 'tibialis-anterior',
})

function normalizeText(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === 'string')
  }

  if (typeof value === 'string') {
    return [value]
  }

  return []
}

function uniqueStrings(values) {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.trim()))]
}

function includesAny(text, matchers) {
  return matchers.some((matcher) => text.includes(matcher))
}

function includesAll(text, matchers) {
  return matchers.every((matcher) => text.includes(matcher))
}

function buildSearchText(record) {
  return normalizeText(
    [
      record.id,
      record.displayLabel,
      ...toStringArray(record.aliases),
    ].join(' '),
  )
}

function clampFactor(value) {
  if (!Number.isFinite(value)) {
    return 1
  }

  return Math.min(1, Math.max(0.1, Math.round(value * 10) / 10))
}

function target(muscleGroup, factor) {
  return {
    muscleGroup,
    factor: clampFactor(factor),
  }
}

function uniqueTargets(targets) {
  const groupedTargets = new Map()

  for (const entry of targets) {
    if (!entry?.muscleGroup) {
      continue
    }

    const existingTarget = groupedTargets.get(entry.muscleGroup)

    if (!existingTarget || entry.factor > existingTarget.factor) {
      groupedTargets.set(entry.muscleGroup, entry)
    }
  }

  return [...groupedTargets.values()]
}

function withTargets(primary, secondary = []) {
  return {
    primaryTargetMuscleGroups: uniqueTargets(primary),
    secondaryTargetMuscleGroups: uniqueTargets(secondary),
  }
}

function legacyTargets(record) {
  const legacyGroups = uniqueStrings([
    ...toStringArray(record.targetMuscleGroup),
    ...toStringArray(record.targetMuscleGroups),
    ...toStringArray(record.muscleGroups),
  ])
  const primary = []
  const secondary = []

  for (const group of legacyGroups) {
    switch (group) {
      case 'abs':
        primary.push(target(MG.upperAbs, 0.9), target(MG.lowerAbs, 0.7))
        break
      case 'adductors':
        primary.push(target(MG.adductorMagnus, 1), target(MG.adductorLongus, 0.8))
        break
      case 'biceps':
        primary.push(target(MG.bicepsShortHead, 0.9), target(MG.bicepsLongHead, 0.8))
        secondary.push(target(MG.brachialis, 0.6))
        break
      case 'calves':
        primary.push(target(MG.gastrocnemius, 0.9))
        secondary.push(target(MG.soleus, 0.7))
        break
      case 'chest':
        primary.push(target(MG.middleChest, 1))
        break
      case 'deltoids':
        primary.push(target(MG.frontDelts, 0.8), target(MG.sideDelts, 0.7))
        break
      case 'forearm':
        primary.push(target(MG.forearmFlexors, 0.8), target(MG.brachioradialis, 0.7))
        break
      case 'gluteal':
        primary.push(target(MG.gluteMax, 1))
        secondary.push(target(MG.gluteMed, 0.6))
        break
      case 'hamstring':
        primary.push(target(MG.bicepsFemoris, 1), target(MG.semitendinosus, 0.9))
        break
      case 'lower-back':
        primary.push(target(MG.spinalErectors, 1))
        break
      case 'obliques':
        primary.push(target(MG.obliques, 1))
        break
      case 'quadriceps':
        primary.push(
          target(MG.rectusFemoris, 1),
          target(MG.vastusLateralis, 0.9),
          target(MG.vastusMedialis, 0.9),
        )
        break
      case 'trapezius':
        primary.push(target(MG.upperTraps, 1), target(MG.midTraps, 0.7))
        break
      case 'triceps':
        primary.push(
          target(MG.tricepsLateralHead, 0.9),
          target(MG.tricepsLongHead, 0.8),
          target(MG.tricepsMedialHead, 0.7),
        )
        break
      case 'upper-back':
        primary.push(target(MG.lats, 0.9), target(MG.rhomboids, 0.9))
        secondary.push(target(MG.midTraps, 0.7))
        break
      default:
        break
    }
  }

  return withTargets(primary, secondary)
}

function deriveMuscleTargets(record) {
  const searchText = buildSearchText(record)
  const descriptionText = normalizeText(record.shortDescription)
  const has = (...matchers) => includesAny(searchText, matchers)
  const hasAll = (...matchers) => includesAll(searchText, matchers)
  const describes = (...matchers) => includesAny(descriptionText, matchers)

  if (has('stationary bike')) {
    return withTargets(
      [
        target(MG.rectusFemoris, 1),
        target(MG.vastusLateralis, 0.9),
        target(MG.vastusMedialis, 0.9),
      ],
      [
        target(MG.gluteMax, 0.6),
        target(MG.bicepsFemoris, 0.5),
        target(MG.gastrocnemius, 0.4),
      ],
    )
  }

  if (has('running')) {
    return withTargets(
      [
        target(MG.rectusFemoris, 0.8),
        target(MG.gluteMax, 0.8),
        target(MG.gastrocnemius, 0.8),
      ],
      [
        target(MG.bicepsFemoris, 0.6),
        target(MG.soleus, 0.6),
        target(MG.gluteMed, 0.5),
      ],
    )
  }

  if (has('elliptical trainer')) {
    return withTargets(
      [
        target(MG.rectusFemoris, 0.8),
        target(MG.gluteMax, 0.7),
        target(MG.gastrocnemius, 0.6),
      ],
      [
        target(MG.bicepsFemoris, 0.5),
        target(MG.soleus, 0.5),
        target(MG.gluteMed, 0.4),
      ],
    )
  }

  if (has('rowing ergometer')) {
    return withTargets(
      [
        target(MG.lats, 0.8),
        target(MG.rhomboids, 0.7),
        target(MG.rectusFemoris, 0.7),
      ],
      [
        target(MG.gluteMax, 0.6),
        target(MG.bicepsFemoris, 0.5),
        target(MG.forearmFlexors, 0.5),
      ],
    )
  }

  if (has('toe press', 'calf press') || (has('standing calf raise') && !has('bent leg'))) {
    return withTargets(
      [target(MG.gastrocnemius, 1)],
      [target(MG.soleus, 0.7)],
    )
  }

  if (has('bent leg calf raise', 'seated calf raise')) {
    return withTargets(
      [target(MG.soleus, 1)],
      [target(MG.gastrocnemius, 0.6)],
    )
  }

  if (has('calf')) {
    return withTargets(
      [target(MG.gastrocnemius, 0.9)],
      [target(MG.soleus, 0.7)],
    )
  }

  if (has('adductor')) {
    return withTargets(
      [target(MG.adductorMagnus, 1), target(MG.adductorLongus, 0.8)],
      [target(MG.gluteMed, 0.3)],
    )
  }

  if (has('abduction', 'band walk')) {
    return withTargets(
      [target(MG.gluteMed, 1), target(MG.gluteMin, 0.9)],
      [target(MG.gluteMax, 0.5)],
    )
  }

  if (has('leg extension')) {
    return withTargets([
      target(MG.rectusFemoris, 1),
      target(MG.vastusLateralis, 1),
      target(MG.vastusMedialis, 0.9),
      target(MG.vastusIntermedius, 0.8),
    ])
  }

  if (has('leg curl', 'glute ham')) {
    return withTargets(
      [
        target(MG.bicepsFemoris, 1),
        target(MG.semitendinosus, 0.9),
        target(MG.semimembranosus, 0.8),
      ],
      [target(MG.gastrocnemius, 0.3)],
    )
  }

  if (has('barbell hip thrust or romanian deadlift')) {
    return withTargets(
      [
        target(MG.gluteMax, 1),
        target(MG.bicepsFemoris, 0.9),
        target(MG.semitendinosus, 0.8),
      ],
      [target(MG.spinalErectors, 0.6)],
    )
  }

  if (has('hip thrust', 'glute bridge', 'pull through')) {
    return withTargets(
      [target(MG.gluteMax, 1), target(MG.gluteMed, 0.6)],
      [target(MG.bicepsFemoris, 0.7), target(MG.spinalErectors, 0.4)],
    )
  }

  if (has('reverse hyper', 'hyperextension', 'back extension', 'lower back machine')) {
    return withTargets(
      [target(MG.spinalErectors, 1), target(MG.gluteMax, 0.8)],
      [target(MG.bicepsFemoris, 0.6)],
    )
  }

  if (has('sumo deadlift')) {
    return withTargets(
      [
        target(MG.gluteMax, 0.9),
        target(MG.adductorMagnus, 0.9),
        target(MG.spinalErectors, 0.8),
      ],
      [
        target(MG.bicepsFemoris, 0.7),
        target(MG.rectusFemoris, 0.5),
        target(MG.forearmFlexors, 0.4),
      ],
    )
  }

  if (has('romanian deadlift')) {
    return withTargets(
      [
        target(MG.bicepsFemoris, 1),
        target(MG.semitendinosus, 0.9),
        target(MG.gluteMax, 0.8),
      ],
      [target(MG.spinalErectors, 0.7)],
    )
  }

  if (has('deadlift')) {
    return withTargets(
      [
        target(MG.spinalErectors, 0.9),
        target(MG.gluteMax, 0.9),
        target(MG.bicepsFemoris, 0.8),
      ],
      [
        target(MG.upperTraps, 0.6),
        target(MG.forearmFlexors, 0.5),
        target(MG.vastusLateralis, 0.4),
      ],
    )
  }

  if (has('sissy squat')) {
    return withTargets(
      [
        target(MG.rectusFemoris, 1),
        target(MG.vastusLateralis, 0.9),
        target(MG.vastusMedialis, 0.9),
      ],
      [target(MG.gluteMax, 0.3)],
    )
  }

  if (has('front squat')) {
    return withTargets(
      [
        target(MG.rectusFemoris, 0.9),
        target(MG.vastusLateralis, 0.9),
        target(MG.vastusMedialis, 0.8),
      ],
      [target(MG.gluteMax, 0.7), target(MG.spinalErectors, 0.5)],
    )
  }

  if (has('hack squat')) {
    return withTargets(
      [
        target(MG.vastusLateralis, 1),
        target(MG.rectusFemoris, 0.9),
        target(MG.vastusMedialis, 0.8),
      ],
      [target(MG.gluteMax, 0.5)],
    )
  }

  if (has('leg press')) {
    return withTargets(
      [
        target(MG.vastusLateralis, 1),
        target(MG.rectusFemoris, 0.9),
        target(MG.vastusMedialis, 0.8),
      ],
      [target(MG.gluteMax, 0.6), target(MG.adductorMagnus, 0.4)],
    )
  }

  if (has('step up', 'lunge', 'split squat', 'bulgarian')) {
    return withTargets(
      [
        target(MG.rectusFemoris, 0.9),
        target(MG.gluteMax, 0.9),
        target(MG.vastusLateralis, 0.8),
      ],
      [
        target(MG.gluteMed, 0.7),
        target(MG.vastusMedialis, 0.6),
        target(MG.adductorMagnus, 0.5),
      ],
    )
  }

  if (has('squat', 'pistol')) {
    return withTargets(
      [
        target(MG.rectusFemoris, 0.9),
        target(MG.vastusLateralis, 0.9),
        target(MG.gluteMax, 0.8),
      ],
      [
        target(MG.vastusMedialis, 0.7),
        target(MG.gluteMed, 0.6),
        target(MG.spinalErectors, 0.5),
      ],
    )
  }

  if (has('side plank')) {
    return withTargets(
      [target(MG.obliques, 1), target(MG.transverseAbdominis, 0.8)],
      [target(MG.gluteMed, 0.3)],
    )
  }

  if (has('oblique')) {
    return withTargets(
      [target(MG.obliques, 1)],
      [target(MG.upperAbs, 0.6), target(MG.lowerAbs, 0.4)],
    )
  }

  if (has('bicycle crunch')) {
    return withTargets(
      [target(MG.obliques, 0.9), target(MG.upperAbs, 0.8)],
      [target(MG.lowerAbs, 0.5), target(MG.hipFlexors, 0.4)],
    )
  }

  if (has('rollout', 'plank', 'hollow body')) {
    return withTargets(
      [target(MG.transverseAbdominis, 1), target(MG.upperAbs, 0.7)],
      [target(MG.obliques, 0.6), target(MG.lowerAbs, 0.5)],
    )
  }

  if (has('ab coaster', 'leg raise', 'v sit')) {
    return withTargets(
      [target(MG.lowerAbs, 1), target(MG.hipFlexors, 0.8)],
      [target(MG.upperAbs, 0.5), target(MG.obliques, 0.3)],
    )
  }

  if (has('crunch', 'sit up', 'sit-up', 'situp')) {
    return withTargets(
      [target(MG.upperAbs, 1), target(MG.lowerAbs, 0.6)],
      [target(MG.obliques, 0.4)],
    )
  }

  if (
    has('overhead tricep extension', 'overhead triceps extension') ||
    (has('overhead') && has('tricep', 'triceps', 'extension')) ||
    has('french press')
  ) {
    return withTargets(
      [
        target(MG.tricepsLongHead, 1),
        target(MG.tricepsLateralHead, 0.8),
        target(MG.tricepsMedialHead, 0.7),
      ],
      [target(MG.frontDelts, 0.2)],
    )
  }

  if (has('skull crusher', 'skullcrusher')) {
    return withTargets(
      [
        target(MG.tricepsLongHead, 0.9),
        target(MG.tricepsLateralHead, 0.9),
        target(MG.tricepsMedialHead, 0.8),
      ],
      [target(MG.frontDelts, 0.2)],
    )
  }

  if (
    has(
      'pressdown',
      'kickback',
      'tricep extension machine',
      'tricep press',
      'triceps extension machine',
      'triceps press',
    )
  ) {
    return withTargets(
      [
        target(MG.tricepsLateralHead, 1),
        target(MG.tricepsMedialHead, 0.9),
      ],
      [target(MG.tricepsLongHead, 0.6)],
    )
  }

  if (has('tricep', 'triceps')) {
    return withTargets(
      [
        target(MG.tricepsLongHead, 0.9),
        target(MG.tricepsLateralHead, 0.9),
        target(MG.tricepsMedialHead, 0.8),
      ],
      [target(MG.frontDelts, 0.3)],
    )
  }

  if (has('hammer curl')) {
    return withTargets(
      [target(MG.brachialis, 1), target(MG.brachioradialis, 0.9)],
      [target(MG.bicepsLongHead, 0.6), target(MG.forearmFlexors, 0.5)],
    )
  }

  if (has('pronated curl')) {
    return withTargets(
      [target(MG.brachioradialis, 1), target(MG.forearmExtensors, 0.8)],
      [target(MG.brachialis, 0.6), target(MG.bicepsShortHead, 0.3)],
    )
  }

  if (has('incline') && has('curl')) {
    return withTargets(
      [target(MG.bicepsLongHead, 1), target(MG.brachialis, 0.7)],
      [target(MG.brachioradialis, 0.5)],
    )
  }

  if (has('behind the back cable curl')) {
    return withTargets(
      [target(MG.bicepsLongHead, 0.9), target(MG.bicepsShortHead, 0.8)],
      [target(MG.brachialis, 0.6), target(MG.brachioradialis, 0.4)],
    )
  }

  if (has('preacher', 'concentration')) {
    return withTargets(
      [target(MG.bicepsShortHead, 1), target(MG.brachialis, 0.7)],
      [target(MG.brachioradialis, 0.4)],
    )
  }

  if (has('curl')) {
    return withTargets(
      [target(MG.bicepsShortHead, 0.9), target(MG.bicepsLongHead, 0.8)],
      [target(MG.brachialis, 0.6), target(MG.brachioradialis, 0.5)],
    )
  }

  if (has('lat prayer', 'pull over', 'pullover')) {
    return withTargets(
      [target(MG.lats, 1), target(MG.teresMajor, 0.8)],
      [target(MG.tricepsLongHead, 0.3), target(MG.upperAbs, 0.2)],
    )
  }

  if (has('face pull')) {
    return withTargets(
      [target(MG.rearDelts, 1), target(MG.lowerTraps, 0.8)],
      [target(MG.midTraps, 0.7), target(MG.rhomboids, 0.6)],
    )
  }

  if (
    has(
      'reverse cable crossover',
      'reverse cable flye',
      'reverse dumbbell flye',
      'reverse pec deck',
      'rear delt',
      'bent over lateral raise',
    )
  ) {
    return withTargets(
      [target(MG.rearDelts, 1)],
      [target(MG.rhomboids, 0.6), target(MG.midTraps, 0.5)],
    )
  }

  if (has('shrug')) {
    return withTargets(
      [target(MG.upperTraps, 1)],
      [target(MG.midTraps, 0.5), target(MG.forearmFlexors, 0.3)],
    )
  }

  if (has('upright row')) {
    return withTargets(
      [target(MG.sideDelts, 0.9), target(MG.upperTraps, 0.8)],
      [target(MG.frontDelts, 0.4)],
    )
  }

  if (has('lateral raise', 'egyptian')) {
    return withTargets(
      [target(MG.sideDelts, 1)],
      [target(MG.upperTraps, 0.3)],
    )
  }

  if (has('arnold press')) {
    return withTargets(
      [target(MG.frontDelts, 0.9), target(MG.sideDelts, 0.9)],
      [target(MG.tricepsLongHead, 0.6), target(MG.upperChest, 0.3)],
    )
  }

  if (
    has('shoulder press', 'overhead press', 'machine shoulder press', 'seated smith press') ||
    (has('press') && describes('targeting the shoulders') && !has('incline'))
  ) {
    return withTargets(
      [target(MG.frontDelts, 1), target(MG.sideDelts, 0.8)],
      [
        target(MG.tricepsLongHead, 0.7),
        target(MG.tricepsLateralHead, 0.6),
        target(MG.upperChest, 0.3),
      ],
    )
  }

  if (
    has('chin up', 'chin-up', 'reverse grip pull up', 'reverse grip assisted pull up') ||
    (has('supinated') && has('pulldown'))
  ) {
    return withTargets(
      [target(MG.lats, 1), target(MG.teresMajor, 0.8)],
      [
        target(MG.bicepsShortHead, 0.8),
        target(MG.bicepsLongHead, 0.7),
        target(MG.brachialis, 0.6),
      ],
    )
  }

  if (has('pull up', 'pull-up', 'pulldown')) {
    return withTargets(
      [target(MG.lats, 1), target(MG.teresMajor, 0.8)],
      [
        target(MG.bicepsShortHead, 0.7),
        target(MG.brachialis, 0.6),
        target(MG.brachioradialis, 0.4),
      ],
    )
  }

  if (has('pendlay row', 'seal row', 't bar row', 't-bar row', 'row')) {
    return withTargets(
      [
        target(MG.lats, 0.9),
        target(MG.rhomboids, 0.9),
        target(MG.midTraps, 0.7),
      ],
      [
        target(MG.rearDelts, 0.5),
        target(MG.bicepsShortHead, 0.5),
        target(MG.brachialis, 0.4),
      ],
    )
  }

  if (has('low to high cable flye')) {
    return withTargets(
      [target(MG.upperChest, 1)],
      [target(MG.frontDelts, 0.3)],
    )
  }

  if (has('incline') && has('flye', 'fly', 'pec deck')) {
    return withTargets(
      [target(MG.upperChest, 1)],
      [target(MG.frontDelts, 0.3)],
    )
  }

  if (has('flye', 'fly', 'pec deck')) {
    return withTargets(
      [target(MG.middleChest, 1)],
      [target(MG.frontDelts, 0.3)],
    )
  }

  if (has('jm press', 'close grip bench')) {
    return withTargets(
      [
        target(MG.tricepsLongHead, 0.9),
        target(MG.tricepsLateralHead, 0.9),
        target(MG.tricepsMedialHead, 0.8),
      ],
      [target(MG.middleChest, 0.4), target(MG.frontDelts, 0.4)],
    )
  }

  if (has('dip')) {
    return withTargets(
      [target(MG.lowerChest, 1)],
      [
        target(MG.tricepsLateralHead, 0.8),
        target(MG.tricepsMedialHead, 0.7),
        target(MG.frontDelts, 0.4),
      ],
    )
  }

  if (has('push up', 'push-up')) {
    return withTargets(
      [target(MG.middleChest, 1)],
      [
        target(MG.frontDelts, 0.6),
        target(MG.tricepsLateralHead, 0.6),
        target(MG.tricepsMedialHead, 0.5),
      ],
    )
  }

  if (has('pin press')) {
    return withTargets(
      [target(MG.frontDelts, 0.9), target(MG.tricepsLongHead, 0.7)],
      [target(MG.middleChest, 0.3)],
    )
  }

  if (hasAll('decline', 'press') || hasAll('decline', 'bench')) {
    return withTargets(
      [target(MG.lowerChest, 1)],
      [
        target(MG.tricepsLateralHead, 0.7),
        target(MG.tricepsMedialHead, 0.6),
        target(MG.frontDelts, 0.4),
      ],
    )
  }

  if (
    hasAll('incline', 'press') ||
    hasAll('incline', 'bench') ||
    hasAll('incline', 'chest press')
  ) {
    return withTargets(
      [target(MG.upperChest, 1)],
      [
        target(MG.frontDelts, 0.7),
        target(MG.tricepsLateralHead, 0.6),
        target(MG.tricepsMedialHead, 0.5),
      ],
    )
  }

  if (has('floor press')) {
    return withTargets(
      [target(MG.middleChest, 0.9)],
      [target(MG.tricepsLateralHead, 0.7), target(MG.frontDelts, 0.4)],
    )
  }

  if (
    has('bench press', 'chest press') ||
    (has('press') && !has('leg press', 'shoulder press', 'overhead press', 'pressdown'))
  ) {
    return withTargets(
      [target(MG.middleChest, 1)],
      [
        target(MG.frontDelts, 0.6),
        target(MG.tricepsLateralHead, 0.6),
        target(MG.tricepsMedialHead, 0.5),
      ],
    )
  }

  return legacyTargets(record)
}

function deriveDifficulty(record) {
  const searchText = buildSearchText(record)
  const descriptionText = normalizeText(record.shortDescription)

  if (searchText.includes('assisted pistol squat')) {
    return 'Intermediate'
  }

  if (
    includesAny(searchText, [
      'weighted dip',
      'weighted pull up',
      'weighted pull-up',
      'pistol squat',
      'sissy squat',
      'ab wheel',
      'ab-wheel',
      'pendlay row',
      'nordic',
    ])
  ) {
    return 'Advanced'
  }

  if (
    includesAny(descriptionText, [
      'elbow flexion accessory',
      'triceps accessory movement',
      'knee flexion isolation',
      'knee extension isolation',
      'calf focused',
      'hip accessory movement',
      'core movement',
      'isolation movement',
    ]) ||
    includesAny(searchText, [
      'machine',
      'assisted',
      'cable',
      'curl',
      'kickback',
      'pressdown',
      'flye',
      'raise',
      'crunch',
      'plank',
      'calf raise',
      'leg extension',
      'leg curl',
      'adductor',
      'abduction',
      'shrug',
      'toe press',
      'stationary bike',
      'elliptical trainer',
      'running',
      'rowing ergometer',
    ])
  ) {
    return 'Beginner'
  }

  return 'Intermediate'
}

async function main() {
  const fileNames = (await readdir(exercisesDirectory))
    .filter((fileName) => fileName.endsWith('.json') && fileName !== 'index.json')
    .sort()
  let updatedCount = 0

  for (const fileName of fileNames) {
    const filePath = path.join(exercisesDirectory, fileName)
    const source = await readFile(filePath, 'utf8')
    const record = JSON.parse(source)
    const { primaryTargetMuscleGroups, secondaryTargetMuscleGroups } = deriveMuscleTargets(record)
    const nextRecord = {
      ...record,
      primaryTargetMuscleGroups,
      secondaryTargetMuscleGroups,
      difficulty: deriveDifficulty(record),
    }

    delete nextRecord.targetMuscleGroup
    delete nextRecord.targetMuscleGroups

    const nextSource = `${JSON.stringify(nextRecord, null, 2)}\n`

    if (nextSource !== source) {
      await writeFile(filePath, nextSource, 'utf8')
      updatedCount += 1
    }
  }

  console.log(`Updated ${updatedCount} exercise files.`)
}

void main()
