import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const exercisesDirectory = path.resolve('src/assets/exercises')
const args = process.argv.slice(2)
const selectedLetters = expandLetterArgs(args.length ? args : ['a-j'])

const MAX_SUBSTITUTIONS = 4

const preferredSubstitutions = new Map([
  [
    'cable-glute-kickback',
    [
      'machine-glute-kickback',
      'barbell-hip-thrust',
      'glute-bridge',
      'standing-cable-hip-abduction',
    ],
  ],
  [
    'machine-glute-kickback',
    [
      'cable-glute-kickback',
      'leg-extension-machine-hip-thrust',
      'barbell-hip-thrust',
      'glute-bridge',
    ],
  ],
  [
    'sumo-deadlift',
    ['deadlift', 'conventional-deadlift', 'romanian-deadlift', 'barbell-hip-thrust'],
  ],
  [
    'deadlift',
    ['conventional-deadlift', 'sumo-deadlift', 'romanian-deadlift', 'barbell-hip-thrust'],
  ],
  [
    'conventional-deadlift',
    ['deadlift', 'sumo-deadlift', 'romanian-deadlift', 'back-extension'],
  ],
  [
    'romanian-deadlift',
    ['deadlift', 'sumo-deadlift', 'conventional-deadlift', 'barbell-hip-thrust'],
  ],
  [
    'wrist-curl',
    ['reverse-wrist-curl', 'wrist-roller', 'rope-hammer-curl', 'supinated-ez-bar-curl'],
  ],
  [
    'reverse-wrist-curl',
    ['wrist-curl', 'wrist-roller', 'ez-bar-pronated-curl', 'rope-hammer-curl'],
  ],
  [
    'wrist-roller',
    ['wrist-curl', 'reverse-wrist-curl', 'rope-hammer-curl', 'seated-hammer-curl'],
  ],
  [
    'neck-flexion',
    ['neck-extension', 'neck-lateral-flexion'],
  ],
  [
    'neck-extension',
    ['neck-flexion', 'neck-lateral-flexion'],
  ],
  [
    'neck-lateral-flexion',
    ['neck-flexion', 'neck-extension'],
  ],
])

async function main() {
  const fileNames = (await readdir(exercisesDirectory))
    .filter((fileName) => fileName.endsWith('.json') && fileName !== 'index.json')
    .sort()

  const records = await Promise.all(
    fileNames.map(async (fileName) => {
      const filePath = path.join(exercisesDirectory, fileName)
      const record = JSON.parse(await readFile(filePath, 'utf8'))
      return {
        fileName,
        filePath,
        record,
      }
    }),
  )

  const byId = new Map(records.map((entry) => [entry.record.id, entry.record]))
  let changedCount = 0

  for (const entry of records) {
    const { record } = entry
    const id = record.id

    if (!selectedLetters.has(id[0]?.toLowerCase())) {
      continue
    }

    const nextSubstitutions = recommendSubstitutions(record, records, byId)

    if (JSON.stringify(record.substitutionExerciseIds ?? []) === JSON.stringify(nextSubstitutions)) {
      continue
    }

    record.substitutionExerciseIds = nextSubstitutions
    await writeFile(entry.filePath, `${JSON.stringify(record, null, 2)}\n`, 'utf8')
    changedCount += 1
  }

  console.log(
    `Updated substitutions in ${changedCount} exercise files for letters ${[
      ...selectedLetters,
    ]
      .sort()
      .join('')}.`,
  )
}

function recommendSubstitutions(record, records, byId) {
  const explicit = preferredSubstitutions.get(record.id) ?? []
  const scoredCandidates = records
    .filter((entry) => entry.record.id !== record.id)
    .map((entry) => ({
      id: entry.record.id,
      score: scoreCandidate(record, entry.record),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
    .map((entry) => entry.id)

  const merged = uniqueStrings([
    ...explicit,
    ...(record.substitutionExerciseIds ?? []),
    ...scoredCandidates,
  ])
    .filter((exerciseId) => exerciseId !== record.id && byId.has(exerciseId))
    .slice(0, MAX_SUBSTITUTIONS)

  return merged
}

function scoreCandidate(source, candidate) {
  const sourceTags = inferMovementTags(source)
  const candidateTags = inferMovementTags(candidate)
  let score = 0

  if (sourceTags.subtype && sourceTags.subtype === candidateTags.subtype) {
    score += 8
  }

  if (sourceTags.family && sourceTags.family === candidateTags.family) {
    score += 4
  }

  if (sourceTags.emphasis && sourceTags.emphasis === candidateTags.emphasis) {
    score += 3
  }

  const sourcePrimary = new Set((source.primaryTargetMuscleGroups ?? []).map((entry) => entry.muscleGroup))
  const sourceSecondary = new Set(
    (source.secondaryTargetMuscleGroups ?? []).map((entry) => entry.muscleGroup),
  )
  const candidatePrimary = new Set(
    (candidate.primaryTargetMuscleGroups ?? []).map((entry) => entry.muscleGroup),
  )
  const candidateSecondary = new Set(
    (candidate.secondaryTargetMuscleGroups ?? []).map((entry) => entry.muscleGroup),
  )

  for (const muscleGroup of sourcePrimary) {
    if (candidatePrimary.has(muscleGroup)) {
      score += 2
    } else if (candidateSecondary.has(muscleGroup)) {
      score += 1
    }
  }

  for (const muscleGroup of sourceSecondary) {
    if (candidatePrimary.has(muscleGroup) || candidateSecondary.has(muscleGroup)) {
      score += 0.5
    }
  }

  if (sharesKeyword(source.id, candidate.id, ['single-leg', 'machine', 'dumbbell', 'barbell', 'cable', 'smith'])) {
    score += 0.5
  }

  if ((candidate.substitutionExerciseIds ?? []).includes(source.id)) {
    score += 1
  }

  return score
}

function inferMovementTags(record) {
  const id = record.id
  const primaryMuscles = (record.primaryTargetMuscleGroups ?? []).map((entry) => entry.muscleGroup)
  const isCardio = typeof record.category === 'string' && record.category.toLowerCase() === 'cardio'

  if (isCardio || /(running|bike|elliptical|rowing)/.test(id)) {
    return { family: 'cardio', subtype: 'conditioning', emphasis: primaryMuscles[0] ?? null }
  }

  if (/neck/.test(id)) {
    return { family: 'neck', subtype: 'neck', emphasis: primaryMuscles[0] ?? null }
  }

  if (/wrist/.test(id)) {
    return { family: 'forearms', subtype: 'wrist', emphasis: primaryMuscles[0] ?? null }
  }

  if (/roller/.test(id)) {
    return { family: 'forearms', subtype: 'wrist', emphasis: primaryMuscles[0] ?? null }
  }

  if (/(crunch|sit-up|situp)/.test(id)) {
    return { family: 'core', subtype: 'crunch', emphasis: primaryMuscles[0] ?? null }
  }

  if (/(leg-raise|v-sit|roman-chair)/.test(id)) {
    return { family: 'core', subtype: 'leg-raise', emphasis: primaryMuscles[0] ?? null }
  }

  if (/(plank|rollout|hollow)/.test(id)) {
    return { family: 'core', subtype: 'stability', emphasis: primaryMuscles[0] ?? null }
  }

  if (/(adductor)/.test(id)) {
    return { family: 'hips', subtype: 'adductors', emphasis: primaryMuscles[0] ?? null }
  }

  if (/(abduction|band-walk|glute-kickback)/.test(id)) {
    return {
      family: 'hips',
      subtype: /kickback/.test(id) ? 'glute-kickback' : 'hip-abduction',
      emphasis: primaryMuscles[0] ?? null,
    }
  }

  if (/(calf|toe-press)/.test(id)) {
    return {
      family: 'lower-leg',
      subtype: /seated/.test(id) ? 'seated-calf' : 'standing-calf',
      emphasis: primaryMuscles[0] ?? null,
    }
  }

  if (/(leg-curl)/.test(id)) {
    return { family: 'legs', subtype: 'leg-curl', emphasis: primaryMuscles[0] ?? null }
  }

  if (/(leg-extension)/.test(id) && !/hip-thrust/.test(id)) {
    return { family: 'legs', subtype: 'leg-extension', emphasis: primaryMuscles[0] ?? null }
  }

  if (/(leg-press)/.test(id) && !/(calf|toe-press)/.test(id)) {
    return { family: 'legs', subtype: 'leg-press', emphasis: primaryMuscles[0] ?? null }
  }

  if (/(squat|lunge|step-up|pistol)/.test(id)) {
    return {
      family: 'legs',
      subtype: /(lunge|step-up|pistol|split)/.test(id) ? 'single-leg' : 'squat',
      emphasis: primaryMuscles[0] ?? null,
    }
  }

  if (/(deadlift|hip-thrust|glute-bridge|hyper|back-extension|lower-back-machine|pull-through)/.test(id)) {
    return {
      family: 'hinge',
      subtype:
        /(hip-thrust|glute-bridge|kickback)/.test(id) ? 'hip-thrust' : 'deadlift',
      emphasis: primaryMuscles[0] ?? null,
    }
  }

  if (/(pull-up|pullup|chin-up|chinup|pulldown)/.test(id)) {
    return {
      family: 'back',
      subtype: /reverse-grip|supinated|chin/.test(id) ? 'vertical-pull-supinated' : 'vertical-pull',
      emphasis: primaryMuscles[0] ?? null,
    }
  }

  if (/(pullover|pull-over|lat-prayer)/.test(id)) {
    return { family: 'back', subtype: 'straight-arm-pull', emphasis: primaryMuscles[0] ?? null }
  }

  if (/row/.test(id)) {
    return { family: 'back', subtype: 'row', emphasis: primaryMuscles[0] ?? null }
  }

  if (/shrug/.test(id)) {
    return { family: 'traps', subtype: 'shrug', emphasis: primaryMuscles[0] ?? null }
  }

  if (/(rear-delt|reverse-cable|reverse-pec-deck|face-pull)/.test(id)) {
    return {
      family: 'shoulders',
      subtype: /face-pull/.test(id) ? 'face-pull' : 'rear-delt',
      emphasis: primaryMuscles[0] ?? null,
    }
  }

  if (/(lateral-raise|cable-raise|upright-row)/.test(id)) {
    return {
      family: 'shoulders',
      subtype: /upright-row/.test(id) ? 'upright-row' : 'lateral-raise',
      emphasis: primaryMuscles[0] ?? null,
    }
  }

  if (/(shoulder-press|overhead-press|arnold-press)/.test(id)) {
    return { family: 'shoulders', subtype: 'shoulder-press', emphasis: primaryMuscles[0] ?? null }
  }

  if (/(flye|fly|pec-deck)/.test(id)) {
    return {
      family: /rear-delt|reverse/.test(id) ? 'shoulders' : 'chest',
      subtype: /rear-delt|reverse/.test(id) ? 'rear-delt' : 'chest-fly',
      emphasis: primaryMuscles[0] ?? null,
    }
  }

  if (/(dip)/.test(id)) {
    return { family: 'chest', subtype: 'dip', emphasis: primaryMuscles[0] ?? null }
  }

  if (
    /(bench|press|push-up|pushup)/.test(id) &&
    !/(leg-press|shoulder-press|overhead-press|tricep|triceps)/.test(id)
  ) {
    return {
      family: 'chest',
      subtype: /incline/.test(id)
        ? 'incline-press'
        : /decline|dip/.test(id)
          ? 'decline-press'
          : /close-grip|jm|pin/.test(id)
            ? 'triceps-press'
            : 'flat-press',
      emphasis: primaryMuscles[0] ?? null,
    }
  }

  if (/(curl|hammer)/.test(id)) {
    return {
      family: 'arms',
      subtype: /concentration/.test(id)
        ? 'concentration-curl'
        : /incline/.test(id)
          ? 'incline-curl'
          : /hammer/.test(id)
            ? 'hammer-curl'
            : /pronated|reverse-wrist/.test(id)
              ? 'pronated-curl'
              : 'curl',
      emphasis: primaryMuscles[0] ?? null,
    }
  }

  if (/(tricep|triceps|skull|french-press|jm-press|kickback)/.test(id)) {
    return {
      family: 'triceps',
      subtype: /(pressdown|press)/.test(id)
        ? 'pressdown'
        : /overhead/.test(id)
          ? 'overhead-extension'
          : /kickback/.test(id)
            ? 'kickback'
            : 'extension',
      emphasis: primaryMuscles[0] ?? null,
    }
  }

  return { family: primaryMuscles[0] ?? 'general', subtype: 'general', emphasis: primaryMuscles[0] ?? null }
}

function sharesKeyword(left, right, keywords) {
  return keywords.some((keyword) => left.includes(keyword) && right.includes(keyword))
}

function uniqueStrings(values) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean))]
}

function expandLetterArgs(values) {
  const letters = new Set()

  for (const value of values) {
    const normalized = value.toLowerCase()

    if (/^[a-z]-[a-z]$/.test(normalized)) {
      const [start, end] = normalized.split('-')
      const startCode = start.charCodeAt(0)
      const endCode = end.charCodeAt(0)

      for (let code = Math.min(startCode, endCode); code <= Math.max(startCode, endCode); code += 1) {
        letters.add(String.fromCharCode(code))
      }

      continue
    }

    for (const letter of normalized.replace(/[^a-z]/g, '')) {
      letters.add(letter)
    }
  }

  return letters
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
