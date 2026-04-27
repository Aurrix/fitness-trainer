import {
  clampExerciseMuscleTargetFactor,
  normalizeExerciseMuscleGroup,
  type ExerciseMuscleGroup,
  type ExerciseMuscleTarget,
} from '../entities/exercise-muscles'
import type {
  FitnessExperienceLevel,
  FitnessProfileGender,
} from '../entities/fitness-profile'
import { inferExerciseMuscleGroups } from './muscles'

type JsonRecord = Record<string, unknown>

const exerciseModules = import.meta.glob('../assets/exercises/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

const programmModules = import.meta.glob('../assets/programms/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

type ContentBucket = 'exercises' | 'programms'

type IndexedContentManifestEntry = {
  displayLabel: string
  duration?: string
  file: string
  goal?: string
  id: string
  level?: string
  shortDescription: string
}

type IndexedContentManifest = {
  manifests: IndexedContentManifestEntry[]
}

type ContentManifestEntry = {
  id: string
  bucket: ContentBucket
  label: string
  fileName: string
  group: string
  relativePath: string
  sourceFile: string
}

export type ContentManifest = {
  exercises: ContentManifestEntry[]
  programms: ContentManifestEntry[]
  totals: {
    exerciseFiles: number
    programmFiles: number
  }
}

type ContentSource = {
  id: string
  label: string
  group: string
  relativePath: string
  sourceFile: string
}

export type DetailField = {
  key: string
  value: string
}

export type StrengthBenchmarkAgeGroup = '18-29' | '30-44' | '45+'

export type StrengthBenchmarkKind =
  | 'assistanceKg'
  | 'bodyweightReps'
  | 'durationMinutes'
  | 'externalLoadKg'
  | 'holdSeconds'
  | 'loadKg'

export type StrengthBenchmarkMeasurement = {
  basis: string
  unit: 'kg' | 'minutes' | 'reps' | 'seconds'
}

export type StrengthBenchmarkProfile = {
  assistanceRangeKg?: [number, number]
  durationMinutesRange?: [number, number]
  externalLoadRangeKg?: [number, number]
  holdSecondsRange?: [number, number]
  loadRangeKg?: [number, number]
  repRange?: [number, number]
}

export type StrengthBenchmarks = {
  kind: StrengthBenchmarkKind
  measurement: StrengthBenchmarkMeasurement
  profiles: Record<
    FitnessProfileGender,
    Record<
      StrengthBenchmarkAgeGroup,
      Record<FitnessExperienceLevel, StrengthBenchmarkProfile>
    >
  >
}

export type Exercise = {
  id: string
  exerciseKey: string
  name: string
  aliases: string[]
  substitutions: string[]
  description: string
  descriptionHtml: string
  category: string
  difficulty: string
  type: string | null
  equipment: string[]
  muscleGroups: string[]
  primaryTargetMuscleGroups: ExerciseMuscleTarget[]
  secondaryTargetMuscleGroups: ExerciseMuscleTarget[]
  strengthBenchmarks: StrengthBenchmarks | null
  instructions: string[]
  tags: string[]
  notes: string
  source: ContentSource
  details: DetailField[]
}

export type ProgramExerciseRef = {
  id: string
  exerciseId: string | null
  exerciseName: string
  sets: string
  reps: string
  duration: string
  rest: string
  notes: string
  resolvedExerciseId: string | null
}

export type ProgramSection = {
  id: string
  dayIndex: number
  dayLabel: string
  name: string
  notes: string
  shortName: string
  exercises: ProgramExerciseRef[]
  weekIndex: number
  weekLabel: string
}

export type Program = {
  id: string
  name: string
  description: string
  descriptionHtml: string
  goal: string
  level: string
  duration: string
  weekCount: number
  phaseNames: string[]
  tags: string[]
  sections: ProgramSection[]
  source: ContentSource
  details: DetailField[]
}

export type ContentLibrary = {
  manifest: ContentManifest
  exercises: Exercise[]
  programs: Program[]
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildContentManifestEntries(
  bucket: ContentBucket,
  index: IndexedContentManifest,
) {
  return index.manifests.map<ContentManifestEntry>((entry) => {
    const relativePath = entry.file.replace(/\\/g, '/')
    const pathSegments = relativePath.split('/').filter(Boolean)
    const fileName = pathSegments.at(-1) ?? relativePath
    const group =
      pathSegments.length > 1 ? pathSegments.slice(0, -1).join('/') : bucket

    return {
      id: entry.id || slugify(`${bucket}-${relativePath}`),
      bucket,
      label: fileName.replace(/\.json$/i, ''),
      fileName,
      group,
      relativePath,
      sourceFile: `src/assets/${bucket}/${relativePath}`,
    }
  })
}

const exerciseIndex = parseIndexedContentManifest(
  exerciseModules['../assets/exercises/index.json'],
)
const programmIndex = parseIndexedContentManifest(
  programmModules['../assets/programms/index.json'],
)

const contentManifest: ContentManifest = {
  exercises: buildContentManifestEntries('exercises', exerciseIndex),
  programms: buildContentManifestEntries('programms', programmIndex),
  totals: {
    exerciseFiles: exerciseIndex.manifests.length,
    programmFiles: programmIndex.manifests.length,
  },
}

function toSentenceCase(value: string) {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])]
}

function stringifyValue(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => stringifyValue(entry))
      .filter(Boolean)
      .join(', ')
  }

  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, entry]) => `${toSentenceCase(key)}: ${stringifyValue(entry)}`)
      .filter(Boolean)
      .join(' / ')
  }

  return ''
}

function toStringArray(value: unknown): string[] {
  if (typeof value === 'string') {
    return value
      .split(/,|\n/)
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  if (Array.isArray(value)) {
    return uniqueStrings(
      value.map((entry) => {
        if (typeof entry === 'string') {
          return entry
        }

        if (typeof entry === 'number' || typeof entry === 'boolean') {
          return String(entry)
        }

        if (isRecord(entry)) {
          return pickFirstText(entry.name, entry.title) ?? stringifyValue(entry)
        }

        return null
      }),
    )
  }

  return []
}

function pickFirstText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
  }

  return undefined
}

function normalizeIndexedContentManifestEntry(
  value: unknown,
): IndexedContentManifestEntry | null {
  if (!isRecord(value)) {
    return null
  }

  const id = pickFirstText(value.id)?.trim()
  const file = pickFirstText(value.file)?.trim()

  if (!id || !file) {
    return null
  }

  return {
    id,
    file,
    displayLabel: pickFirstText(value.displayLabel, value.label, value.name, id) ?? id,
    shortDescription: pickFirstText(value.shortDescription, value.description) ?? '',
    goal: pickFirstText(value.goal),
    level: pickFirstText(value.level),
    duration: pickFirstText(value.duration),
  }
}

function parseIndexedContentManifest(value: unknown): IndexedContentManifest {
  if (!isRecord(value) || !Array.isArray(value.manifests)) {
    return { manifests: [] }
  }

  return {
    manifests: value.manifests.flatMap((entry) => {
      const normalizedEntry = normalizeIndexedContentManifestEntry(entry)
      return normalizedEntry ? [normalizedEntry] : []
    }),
  }
}

function toNumberValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsedValue = Number(value)

    if (Number.isFinite(parsedValue)) {
      return parsedValue
    }
  }

  return undefined
}

function normalizeRangeTuple(value: unknown): [number, number] | undefined {
  if (!Array.isArray(value) || value.length !== 2) {
    return undefined
  }

  const start = toNumberValue(value[0])
  const end = toNumberValue(value[1])

  if (start === undefined || end === undefined) {
    return undefined
  }

  return start <= end ? [start, end] : [end, start]
}

function joinTextParts(...values: Array<string | undefined>) {
  return values
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' / ')
}

function containsHtml(value: string) {
  return /<[^>]+>/.test(value)
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function wrapTextAsHtml(value: string) {
  const paragraphs = value
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (!paragraphs.length) {
    return ''
  }

  return paragraphs.map((part) => `<p>${escapeHtml(part)}</p>`).join('')
}

function normalizeDescriptionHtml(...values: unknown[]) {
  for (const value of values) {
    if (typeof value !== 'string' || !value.trim()) {
      continue
    }

    const text = value.trim()
    return containsHtml(text) ? text : wrapTextAsHtml(text)
  }

  return ''
}

function normalizeExerciseMuscleTarget(value: unknown): ExerciseMuscleTarget | null {
  if (typeof value === 'string') {
    const muscleGroup = normalizeExerciseMuscleGroup(value)

    return muscleGroup
      ? {
          factor: 1,
          muscleGroup,
        }
      : null
  }

  if (!isRecord(value)) {
    return null
  }

  const muscleGroupValue = pickFirstText(
    value.muscleGroup,
    value.muscle,
    value.group,
    value.key,
    value.id,
    value.name,
  )

  if (!muscleGroupValue) {
    return null
  }

  const muscleGroup = normalizeExerciseMuscleGroup(muscleGroupValue)

  if (!muscleGroup) {
    return null
  }

  return {
    factor: clampExerciseMuscleTargetFactor(
      toNumberValue(value.factor ?? value.weight ?? value.intensity ?? value.value) ??
        1,
    ),
    muscleGroup,
  }
}

function normalizeExerciseMuscleTargets(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as ExerciseMuscleTarget[]
  }

  const targets = new Map<ExerciseMuscleGroup, ExerciseMuscleTarget>()

  for (const entry of value) {
    const target = normalizeExerciseMuscleTarget(entry)

    if (!target) {
      continue
    }

    const existingTarget = targets.get(target.muscleGroup)

    if (!existingTarget || target.factor > existingTarget.factor) {
      targets.set(target.muscleGroup, target)
    }
  }

  return [...targets.values()]
}

function pickNonHtmlText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value !== 'string' || !value.trim()) {
      continue
    }

    const text = value.trim()

    if (!containsHtml(text)) {
      return text
    }
  }

  return undefined
}

function createSource(
  entry: ContentManifestEntry | undefined,
  bucket: ContentBucket,
  relativePath: string,
): ContentSource {
  const label = relativePath.replace(/\.json$/i, '').split('/').pop() ?? relativePath

  return {
    id: entry?.id ?? slugify(`${bucket}-${relativePath}`),
    label: entry?.label ?? label,
    group: entry?.group ?? bucket,
    relativePath: entry?.relativePath ?? relativePath,
    sourceFile: entry?.sourceFile ?? `src/assets/${bucket}/${relativePath}`,
  }
}

function moduleRelativePath(modulePath: string, bucket: ContentBucket) {
  const normalizedPath = modulePath.replace(/\\/g, '/')
  return normalizedPath.replace(new RegExp(`^\\.\\./assets/${bucket}/`), '')
}

function normalizeStrengthBenchmarkProfile(
  value: unknown,
): StrengthBenchmarkProfile | null {
  if (!isRecord(value)) {
    return null
  }

  const profile: StrengthBenchmarkProfile = {}

  const repRange = normalizeRangeTuple(value.repRange)
  const loadRangeKg = normalizeRangeTuple(value.loadRangeKg)
  const assistanceRangeKg = normalizeRangeTuple(value.assistanceRangeKg)
  const externalLoadRangeKg = normalizeRangeTuple(value.externalLoadRangeKg)
  const holdSecondsRange = normalizeRangeTuple(value.holdSecondsRange)
  const durationMinutesRange = normalizeRangeTuple(value.durationMinutesRange)

  if (repRange) {
    profile.repRange = repRange
  }

  if (loadRangeKg) {
    profile.loadRangeKg = loadRangeKg
  }

  if (assistanceRangeKg) {
    profile.assistanceRangeKg = assistanceRangeKg
  }

  if (externalLoadRangeKg) {
    profile.externalLoadRangeKg = externalLoadRangeKg
  }

  if (holdSecondsRange) {
    profile.holdSecondsRange = holdSecondsRange
  }

  if (durationMinutesRange) {
    profile.durationMinutesRange = durationMinutesRange
  }

  return Object.keys(profile).length ? profile : null
}

function normalizeStrengthBenchmarks(value: unknown): StrengthBenchmarks | null {
  if (!isRecord(value) || !isRecord(value.measurement) || !isRecord(value.profiles)) {
    return null
  }

  const kind =
    value.kind === 'assistanceKg' ||
    value.kind === 'bodyweightReps' ||
    value.kind === 'durationMinutes' ||
    value.kind === 'externalLoadKg' ||
    value.kind === 'holdSeconds' ||
    value.kind === 'loadKg'
      ? value.kind
      : null

  const unit =
    value.measurement.unit === 'kg' ||
    value.measurement.unit === 'minutes' ||
    value.measurement.unit === 'reps' ||
    value.measurement.unit === 'seconds'
      ? value.measurement.unit
      : null

  const basis = pickFirstText(value.measurement.basis)?.trim()

  if (!kind || !unit || !basis) {
    return null
  }

  const genders = ['male', 'female'] as const
  const ageGroups = ['18-29', '30-44', '45+'] as const
  const experienceLevels = ['beginner', 'intermediate', 'advanced'] as const
  const rawProfiles = value.profiles as JsonRecord

  const profiles = Object.fromEntries(
    genders.map((gender) => {
      const rawGenderProfiles = isRecord(rawProfiles[gender]) ? rawProfiles[gender] : {}

      return [
        gender,
        Object.fromEntries(
          ageGroups.map((ageGroup) => {
            const rawAgeProfiles = isRecord(rawGenderProfiles[ageGroup])
              ? rawGenderProfiles[ageGroup]
              : {}

            return [
              ageGroup,
              Object.fromEntries(
                experienceLevels.map((experienceLevel) => [
                  experienceLevel,
                  normalizeStrengthBenchmarkProfile(rawAgeProfiles[experienceLevel]) ?? {},
                ]),
              ) as Record<FitnessExperienceLevel, StrengthBenchmarkProfile>,
            ]
          }),
        ) as Record<
          StrengthBenchmarkAgeGroup,
          Record<FitnessExperienceLevel, StrengthBenchmarkProfile>
        >,
      ]
    }),
  ) as StrengthBenchmarks['profiles']

  return {
    kind,
    measurement: {
      basis,
      unit,
    },
    profiles,
  }
}

function normalizeDetailFields(record: JsonRecord, ignoredKeys: string[]) {
  const ignoredSet = new Set(ignoredKeys)

  return Object.entries(record)
    .filter(([key]) => !ignoredSet.has(key))
    .map(([key, value]) => ({
      key: toSentenceCase(key),
      value: stringifyValue(value),
    }))
    .filter((detail) => detail.value)
}

function extractExerciseEntries(payload: unknown): Array<[string | undefined, unknown]> {
  if (Array.isArray(payload)) {
    return payload.map((entry) => {
      if (isRecord(entry)) {
        return [pickFirstText(entry.displayLabel, entry.label, entry.name, entry.title), entry]
      }

      return [typeof entry === 'string' ? entry : undefined, entry]
    })
  }

  if (!isRecord(payload)) {
    return []
  }

  if (Array.isArray(payload.books) || Array.isArray(payload.manifests)) {
    return []
  }

  const nestedCollection = payload.exercises ?? payload.items ?? payload.list

  if (Array.isArray(nestedCollection)) {
    return extractExerciseEntries(nestedCollection)
  }

  if (
    typeof payload.displayLabel === 'string' ||
    typeof payload.label === 'string' ||
    typeof payload.name === 'string' ||
    typeof payload.id === 'string'
  ) {
    return [[pickFirstText(payload.displayLabel, payload.label, payload.name, payload.title, payload.id), payload]]
  }

  return Object.entries(payload)
}

function normalizeExercise(
  source: ContentSource,
  nameHint: string | undefined,
  rawValue: unknown,
): Exercise | null {
  const record = isRecord(rawValue) ? rawValue : {}
  const name = pickFirstText(
    nameHint,
    record.displayLabel,
    record.label,
    record.name,
    record.title,
    record.exercise,
  )

  if (!name) {
    return null
  }

  const exerciseKey = pickFirstText(record.id, record.exerciseKey, name) ?? name
  const aliases = uniqueStrings([
    ...toStringArray(record.aliases),
    ...toStringArray(record.alternativeNames),
    typeof nameHint === 'string' && nameHint !== name ? nameHint : null,
  ])
  const substitutions = toStringArray(
    record.substitutionExerciseIds ?? record.substitutions ?? record.options,
  )
  const inferredMuscles = inferExerciseMuscleGroups({
    exerciseKey,
    name,
    aliases,
    substitutions,
  })
  const legacyMuscleGroups = uniqueStrings([
    ...toStringArray(record.muscleGroups),
    ...toStringArray(record.targetMuscleGroup),
    ...toStringArray(record.targetMuscleGroups),
    ...toStringArray(record.muscles),
    ...toStringArray(record.targetMuscles),
    ...toStringArray(record.primaryMuscles),
    ...toStringArray(record.secondaryMuscles),
    ...inferredMuscles,
  ])
  let primaryTargetMuscleGroups = normalizeExerciseMuscleTargets(
    record.primaryTargetMuscleGroups ?? record.primaryMuscles,
  )
  let secondaryTargetMuscleGroups = normalizeExerciseMuscleTargets(
    record.secondaryTargetMuscleGroups ?? record.secondaryMuscles,
  )

  if (!primaryTargetMuscleGroups.length && !secondaryTargetMuscleGroups.length) {
    primaryTargetMuscleGroups = normalizeExerciseMuscleTargets(legacyMuscleGroups)
    secondaryTargetMuscleGroups = []
  }

  const muscleGroups = uniqueStrings([
    ...primaryTargetMuscleGroups.map((target) => target.muscleGroup),
    ...secondaryTargetMuscleGroups.map((target) => target.muscleGroup),
    ...legacyMuscleGroups
      .map((entry) => normalizeExerciseMuscleGroup(entry) ?? entry)
      .filter(Boolean),
  ])
  const descriptionHtml = normalizeDescriptionHtml(
    record.descriptionHtml,
    record.description,
    record.summary,
    record.overview,
    record.shortDescription,
  )
  const description =
    pickFirstText(
      record.shortDescription,
      pickNonHtmlText(record.description, record.summary, record.overview),
      descriptionHtml ? stripHtml(descriptionHtml) : undefined,
    ) ??
    (substitutions.length
      ? `Suggested substitutions: ${substitutions.slice(0, 3).join(', ')}`
      : '')
  const exerciseType =
    pickFirstText(record.exerciseType, record.movementType) ??
    (pickFirstText(record.type)?.trim().toLowerCase() === 'continues'
      ? 'continues'
      : null)
  const strengthBenchmarks = normalizeStrengthBenchmarks(record.strengthBenchmarks)

  return {
    id: slugify(exerciseKey),
    exerciseKey,
    name,
    aliases,
    substitutions,
    description,
    descriptionHtml,
    category: pickFirstText(record.category, record.focus) ?? '',
    difficulty: pickFirstText(record.difficulty, record.level) ?? '',
    type: exerciseType,
    equipment: uniqueStrings([
      ...toStringArray(record.equipment),
      ...toStringArray(record.tools),
      ...toStringArray(record.gear),
    ]),
    muscleGroups,
    primaryTargetMuscleGroups,
    secondaryTargetMuscleGroups,
    strengthBenchmarks,
    instructions: toStringArray(
      record.instructions ?? record.steps ?? record.howTo ?? record.execution,
    ),
    tags: uniqueStrings([
      ...toStringArray(record.tags),
      ...muscleGroups,
      pickFirstText(record.category),
      pickFirstText(record.difficulty),
      exerciseType,
    ]),
    notes:
      pickFirstText(record.notes, record.tips) ??
      (aliases.length ? `Aliases: ${aliases.join(', ')}` : ''),
    source,
    details: normalizeDetailFields(record, [
      'alternativeNames',
      'aliases',
      'category',
      'description',
      'descriptionHtml',
      'difficulty',
      'displayLabel',
      'equipment',
      'execution',
      'exerciseKey',
      'focus',
      'gear',
      'howTo',
      'id',
      'instructions',
      'label',
      'level',
      'muscleGroups',
      'muscles',
      'name',
      'notes',
      'options',
      'overview',
      'primaryTargetMuscleGroups',
      'primaryMuscles',
      'secondaryMuscles',
      'secondaryTargetMuscleGroups',
      'shortDescription',
      'steps',
      'strengthBenchmarks',
      'substitutionExerciseIds',
      'substitutions',
      'summary',
      'tags',
      'targetMuscleGroup',
      'targetMuscleGroups',
      'targetMuscles',
      'tips',
      'title',
      'tools',
      'type',
    ]),
  }
}

function extractProgramEntries(payload: unknown): Array<[string | undefined, unknown]> {
  if (Array.isArray(payload)) {
    return payload.map((entry) => {
      if (isRecord(entry)) {
        return [pickFirstText(entry.displayLabel, entry.label, entry.name, entry.title), entry]
      }

      return [typeof entry === 'string' ? entry : undefined, entry]
    })
  }

  if (!isRecord(payload)) {
    return []
  }

  if (Array.isArray(payload.programms) || Array.isArray(payload.programs) || Array.isArray(payload.books)) {
    return []
  }

  if (
    Array.isArray(payload.weeks) ||
    typeof payload.displayLabel === 'string' ||
    typeof payload.label === 'string' ||
    typeof payload.name === 'string' ||
    typeof payload.id === 'string'
  ) {
    return [[pickFirstText(payload.displayLabel, payload.label, payload.name, payload.title, payload.id), payload]]
  }

  return Object.entries(payload)
}

function buildExerciseLookup(exercises: Exercise[]) {
  const exerciseLookup = new Map<string, Exercise>()

  for (const exercise of exercises) {
    const keys = [
      exercise.id,
      exercise.exerciseKey,
      exercise.name,
      ...exercise.aliases,
    ].map((entry) => slugify(entry))

    for (const key of keys) {
      if (!exerciseLookup.has(key)) {
        exerciseLookup.set(key, exercise)
      }
    }
  }

  return exerciseLookup
}

function resolveExercise(
  exerciseLookup: Map<string, Exercise>,
  ...references: Array<string | null | undefined>
) {
  for (const reference of references) {
    if (!reference) {
      continue
    }

    const normalizedReference = slugify(reference)
    const resolvedExercise = exerciseLookup.get(normalizedReference)

    if (resolvedExercise) {
      return resolvedExercise
    }
  }

  return null
}

function buildProgramNotes(record: JsonRecord) {
  return joinTextParts(
    record.warmupSets ? `Warm-up ${pickFirstText(record.warmupSets)} sets` : '',
    record.intensity ? `Intensity ${pickFirstText(record.intensity)}` : '',
    pickFirstText(record.notes, record.tip),
  )
}

function normalizeProgramExercise(
  value: unknown,
  exerciseLookup: Map<string, Exercise>,
  keyHint?: string,
): ProgramExerciseRef | null {
  if (typeof value === 'string') {
    const resolvedExercise = resolveExercise(exerciseLookup, value, keyHint)

    return {
      id: slugify(`${keyHint ?? value}-${value}`),
      exerciseId: keyHint ?? null,
      exerciseName: resolvedExercise?.name ?? value,
      sets: '',
      reps: '',
      duration: '',
      rest: '',
      notes: '',
      resolvedExerciseId: resolvedExercise?.id ?? null,
    }
  }

  if (!isRecord(value)) {
    return null
  }

  const exerciseId = pickFirstText(value.exerciseId, value.exerciseKey, keyHint) ?? null
  const explicitExerciseName = pickFirstText(
    value.exerciseName,
    value.displayLabel,
    value.label,
    value.exercise,
    value.name,
    value.title,
  )
  const resolvedExercise = resolveExercise(
    exerciseLookup,
    exerciseId,
    explicitExerciseName,
  )
  const exerciseName =
    pickFirstText(resolvedExercise?.name, explicitExerciseName, exerciseId) ?? 'Exercise'

  return {
    id: slugify(
      `${exerciseId ?? exerciseName}-${pickFirstText(value.target, value.reps, value.workingSets) ?? 'item'}`,
    ),
    exerciseId,
    exerciseName,
    sets: pickFirstText(value.sets, value.workingSets, value.rounds) ?? '',
    reps: pickFirstText(value.reps, value.target, value.targets, value.range) ?? '',
    duration: pickFirstText(value.duration, value.time) ?? '',
    rest: pickFirstText(value.rest, value.recovery) ?? '',
    notes: buildProgramNotes(value),
    resolvedExerciseId: resolvedExercise?.id ?? null,
  }
}

function normalizeProgramSectionFromDay(
  dayRecord: JsonRecord,
  exerciseLookup: Map<string, Exercise>,
  dayIndex: number,
  weekIndex: number,
  weekLabel?: string,
): ProgramSection {
  const dayItems = Array.isArray(dayRecord.items)
    ? dayRecord.items
    : Array.isArray(dayRecord.exercises)
      ? dayRecord.exercises
      : []
  const exercises = dayItems.flatMap((entry) => {
    const normalizedExercise = normalizeProgramExercise(entry, exerciseLookup)
    return normalizedExercise ? [normalizedExercise] : []
  })

  const baseName =
    pickFirstText(
      dayRecord.displayLabel,
      dayRecord.label,
      dayRecord.title,
      dayRecord.name,
    ) ??
    `Day ${pickFirstText(dayRecord.day) ?? '1'}`
  const name = weekLabel ? `${weekLabel} - ${baseName}` : baseName
  const noteParts = [pickFirstText(dayRecord.focus), pickFirstText(dayRecord.notes)].filter(
    Boolean,
  )

  return {
    id: slugify(name),
    dayIndex,
    dayLabel: `Day ${dayIndex}`,
    name,
    notes: noteParts.join(' / '),
    shortName: baseName,
    exercises,
    weekIndex,
    weekLabel: weekLabel ?? 'Week 1',
  }
}

function normalizeProgramSections(
  record: JsonRecord,
  exerciseLookup: Map<string, Exercise>,
): ProgramSection[] {
  if (Array.isArray(record.weeks)) {
    return record.weeks
      .filter(isRecord)
      .flatMap((weekRecord, weekIndex) => {
        if (!Array.isArray(weekRecord.days)) {
          return []
        }

        const weekNumber = pickFirstText(weekRecord.week) ?? String(weekIndex + 1)
        const weekLabel = joinTextParts(
          `Week ${weekNumber}`,
          pickFirstText(weekRecord.phase, weekRecord.displayLabel, weekRecord.label),
        )

        return weekRecord.days
          .filter(isRecord)
          .map((dayRecord, dayIndex) =>
            normalizeProgramSectionFromDay(
              dayRecord,
              exerciseLookup,
              dayIndex + 1,
              weekIndex + 1,
              weekLabel,
            ),
          )
      })
      .filter((section) => section.exercises.length > 0)
  }

  const groupedSections =
    record.sections ??
    record.days ??
    record.workouts ??
    record.sessions ??
    record.blocks

  if (Array.isArray(groupedSections)) {
    return groupedSections
      .filter(isRecord)
      .map((sectionRecord, index) => {
        const sectionName =
          pickFirstText(sectionRecord.name, sectionRecord.title, sectionRecord.day) ??
          `Session ${index + 1}`
        const items = Array.isArray(sectionRecord.items)
          ? sectionRecord.items
          : Array.isArray(sectionRecord.exercises)
            ? sectionRecord.exercises
            : []
        const exercises = items.flatMap((entry) => {
          const normalizedExercise = normalizeProgramExercise(entry, exerciseLookup)
          return normalizedExercise ? [normalizedExercise] : []
        })

        return {
          id: slugify(sectionName),
          dayIndex: index + 1,
          dayLabel: `Day ${index + 1}`,
          name: sectionName,
          notes: pickFirstText(sectionRecord.notes, sectionRecord.description) ?? '',
          shortName: sectionName,
          exercises,
          weekIndex: 1,
          weekLabel: 'Week 1',
        }
      })
      .filter((section) => section.exercises.length > 0)
  }

  return []
}

function normalizeProgram(
  source: ContentSource,
  nameHint: string | undefined,
  rawValue: unknown,
  exerciseLookup: Map<string, Exercise>,
): Program | null {
  const record = isRecord(rawValue) ? rawValue : {}
  const name = pickFirstText(
    nameHint,
    record.displayLabel,
    record.label,
    record.name,
    record.title,
  )

  if (!name) {
    return null
  }

  const sections = normalizeProgramSections(record, exerciseLookup)
  const phaseNames = Array.isArray(record.phases)
    ? uniqueStrings(
        record.phases.map((phase) => {
          return isRecord(phase) ? pickFirstText(phase.name) ?? null : null
        }),
      )
    : []
  const weekCount = Array.isArray(record.weeks) ? record.weeks.length : 0
  const duration =
    pickFirstText(record.duration, record.length) ??
    (weekCount ? `${weekCount} weeks` : '')
  const descriptionHtml = normalizeDescriptionHtml(
    record.descriptionHtml,
    record.description,
    record.summary,
    record.overview,
    record.shortDescription,
  )
  const description =
    pickFirstText(
      record.shortDescription,
      pickNonHtmlText(record.description, record.summary, record.overview),
      descriptionHtml ? stripHtml(descriptionHtml) : undefined,
    ) ??
    (weekCount ? `Progressive training plan mapped across ${weekCount} weeks.` : '')

  return {
    id: slugify(pickFirstText(record.id, name) ?? name),
    name,
    description,
    descriptionHtml,
    goal: pickFirstText(record.goal, record.focus) ?? '',
    level: pickFirstText(record.level, record.difficulty) ?? '',
    duration,
    weekCount,
    phaseNames,
    tags: uniqueStrings([
      ...toStringArray(record.tags),
      ...phaseNames,
      pickFirstText(record.goal),
      pickFirstText(record.level),
      pickFirstText(record.author),
    ]),
    sections,
    source,
    details: normalizeDetailFields(record, [
      'author',
      'blocks',
      'bookId',
      'days',
      'description',
      'descriptionHtml',
      'difficulty',
      'displayLabel',
      'duration',
      'exerciseFile',
      'focus',
      'goal',
      'id',
      'items',
      'label',
      'length',
      'level',
      'manuallyCurated',
      'name',
      'overview',
      'phases',
      'programms',
      'programs',
      'sections',
      'sessions',
      'shortDescription',
      'sourcePdf',
      'summary',
      'tags',
      'title',
      'weeks',
      'workouts',
    ]),
  }
}

function buildExercises() {
  const manifestEntries = new Map(
    contentManifest.exercises.map((entry) => [entry.relativePath, entry]),
  )

  return Object.entries(exerciseModules)
    .flatMap(([modulePath, payload]) => {
      const relativePath = moduleRelativePath(modulePath, 'exercises')
      const source = createSource(
        manifestEntries.get(relativePath),
        'exercises',
        relativePath,
      )

      return extractExerciseEntries(payload).flatMap(([nameHint, value]) => {
        const exercise = normalizeExercise(source, nameHint, value)
        return exercise ? [exercise] : []
      })
    })
    .sort((left, right) => left.name.localeCompare(right.name))
}

function buildPrograms(exerciseLookup: Map<string, Exercise>) {
  const manifestEntries = new Map(
    contentManifest.programms.map((entry) => [entry.relativePath, entry]),
  )

  return Object.entries(programmModules)
    .flatMap(([modulePath, payload]) => {
      const relativePath = moduleRelativePath(modulePath, 'programms')
      const source = createSource(
        manifestEntries.get(relativePath),
        'programms',
        relativePath,
      )

      return extractProgramEntries(payload).flatMap(([nameHint, value]) => {
        const program = normalizeProgram(source, nameHint, value, exerciseLookup)
        return program ? [program] : []
      })
    })
    .filter((program) => program.sections.length > 0)
    .sort((left, right) => left.name.localeCompare(right.name))
}

function buildLibrary(): ContentLibrary {
  const exercises = buildExercises()
  const exerciseLookup = buildExerciseLookup(exercises)
  const programs = buildPrograms(exerciseLookup)

  return {
    manifest: contentManifest,
    exercises,
    programs,
  }
}

const contentLibrary = buildLibrary()

export function getContentLibrary() {
  return contentLibrary
}
