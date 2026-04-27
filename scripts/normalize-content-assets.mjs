import { readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

const EXERCISES_DIR = join(process.cwd(), 'src', 'assets', 'exercises')
const PROGRAMMS_DIR = join(process.cwd(), 'src', 'assets', 'programms')
const EXCLUDED_FILES = new Set(['index.json'])

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function titleCaseFromSlug(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => {
      if (part.length <= 3 && /^[a-z0-9]+$/i.test(part)) {
        return part.toUpperCase()
      }

      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(' ')
}

function uniqueStrings(values) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean))]
}

function sentenceList(values) {
  if (values.length === 0) {
    return ''
  }

  if (values.length === 1) {
    return values[0]
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`
  }

  return `${values.slice(0, -1).join(', ')}, and ${values.at(-1)}`
}

function buildExerciseDescriptionHtml(exercise, exerciseLabelById) {
  const shortDescription =
    exercise.shortDescription?.trim() ||
    'Resistance training exercise used across the imported workout books.'
  const aliases = uniqueStrings(exercise.aliases ?? []).slice(0, 5)
  const substitutions = uniqueStrings(
    (exercise.substitutionExerciseIds ?? []).map((exerciseId) => {
      return exerciseLabelById.get(exerciseId) ?? titleCaseFromSlug(exerciseId)
    }),
  ).slice(0, 6)

  const parts = [`<p>${escapeHtml(shortDescription)}</p>`]

  if (aliases.length > 0 || substitutions.length > 0) {
    const items = []

    if (aliases.length > 0) {
      items.push(
        `<li><strong>Also listed as:</strong> ${escapeHtml(sentenceList(aliases))}</li>`,
      )
    }

    if (substitutions.length > 0) {
      items.push(
        `<li><strong>Common substitutions:</strong> ${escapeHtml(sentenceList(substitutions))}</li>`,
      )
    }

    parts.push(`<ul>${items.join('')}</ul>`)
  } else {
    parts.push(
      `<p>Reference this movement in program files with the exercise id <code>${escapeHtml(exercise.id)}</code>.</p>`,
    )
  }

  return parts.join('')
}

function buildProgramDescriptionHtml(program) {
  const shortDescription =
    program.shortDescription?.trim() ||
    'Structured training plan imported from the workout books in tmp.'
  const weeks = Array.isArray(program.weeks) ? program.weeks : []
  const firstWeekDays = Array.isArray(weeks[0]?.days) ? weeks[0].days : []
  const sessionsPerWeek = firstWeekDays.length
  const uniqueExerciseIds = new Set()

  for (const week of weeks) {
    for (const day of Array.isArray(week.days) ? week.days : []) {
      for (const item of Array.isArray(day.items) ? day.items : []) {
        if (typeof item.exerciseId === 'string' && item.exerciseId.trim()) {
          uniqueExerciseIds.add(item.exerciseId.trim())
        }
      }
    }
  }

  const dayLabels = firstWeekDays
    .map((day, index) => {
      return (
        day.displayLabel?.trim() ||
        day.label?.trim() ||
        day.name?.trim() ||
        `Day ${day.day ?? index + 1}`
      )
    })
    .filter(Boolean)

  const infoItems = []

  if (program.goal) {
    infoItems.push(`<li><strong>Goal:</strong> ${escapeHtml(program.goal)}</li>`)
  }

  if (program.level) {
    infoItems.push(`<li><strong>Level:</strong> ${escapeHtml(program.level)}</li>`)
  }

  if (program.duration) {
    infoItems.push(`<li><strong>Duration:</strong> ${escapeHtml(program.duration)}</li>`)
  }

  if (Array.isArray(program.tags) && program.tags.length > 0) {
    infoItems.push(
      `<li><strong>Tags:</strong> ${escapeHtml(sentenceList(program.tags))}</li>`,
    )
  }

  const parts = [`<p>${escapeHtml(shortDescription)}</p>`]

  if (program.duration || sessionsPerWeek || uniqueExerciseIds.size) {
    const structureBits = []

    if (program.duration) {
      structureBits.push(program.duration)
    }

    if (sessionsPerWeek) {
      structureBits.push(`${sessionsPerWeek} scheduled sessions per week`)
    }

    if (uniqueExerciseIds.size) {
      structureBits.push(`${uniqueExerciseIds.size} referenced exercise ids`)
    }

    parts.push(`<p><strong>Structure:</strong> ${escapeHtml(structureBits.join(', '))}.</p>`)
  }

  if (dayLabels.length > 0) {
    parts.push(
      `<p><strong>Weekly split:</strong> ${escapeHtml(sentenceList(dayLabels))}.</p>`,
    )
  }

  if (infoItems.length > 0) {
    parts.push(`<ul>${infoItems.join('')}</ul>`)
  }

  return parts.join('')
}

function sortObjectEntries(value, orderedKeys) {
  const ordered = {}

  for (const key of orderedKeys) {
    if (key in value) {
      ordered[key] = value[key]
    }
  }

  for (const [key, entry] of Object.entries(value)) {
    if (!(key in ordered)) {
      ordered[key] = entry
    }
  }

  return ordered
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function main() {
  const exerciseFiles = (await readdir(EXERCISES_DIR))
    .filter((fileName) => fileName.endsWith('.json') && !EXCLUDED_FILES.has(fileName))
    .sort()
  const programmFiles = (await readdir(PROGRAMMS_DIR))
    .filter((fileName) => fileName.endsWith('.json') && !EXCLUDED_FILES.has(fileName))
    .sort()

  const exercises = await Promise.all(
    exerciseFiles.map(async (fileName) => {
      const filePath = join(EXERCISES_DIR, fileName)
      const exercise = await readJson(filePath)

      return {
        fileName,
        filePath,
        exercise,
      }
    }),
  )

  const exerciseLabelById = new Map(
    exercises.map(({ exercise, fileName }) => {
      const id = exercise.id ?? basename(fileName, '.json')
      const displayLabel =
        exercise.displayLabel?.trim() || titleCaseFromSlug(id)

      return [id, displayLabel]
    }),
  )

  for (const entry of exercises) {
    const id = entry.exercise.id ?? basename(entry.fileName, '.json')
    const displayLabel = entry.exercise.displayLabel?.trim() || exerciseLabelById.get(id)
    const aliases = uniqueStrings(entry.exercise.aliases ?? [])
    const substitutionExerciseIds = uniqueStrings(entry.exercise.substitutionExerciseIds ?? [])
    const shortDescription =
      entry.exercise.shortDescription?.trim() ||
      'Resistance training exercise used across the imported workout books.'

    const normalizedExercise = sortObjectEntries(
      {
        ...entry.exercise,
        id,
        displayLabel,
        shortDescription,
        descriptionHtml: buildExerciseDescriptionHtml(
          {
            ...entry.exercise,
            id,
            displayLabel,
            shortDescription,
            aliases,
            substitutionExerciseIds,
          },
          exerciseLabelById,
        ),
        aliases,
        substitutionExerciseIds,
      },
      [
        'id',
        'displayLabel',
        'shortDescription',
        'descriptionHtml',
        'aliases',
        'substitutionExerciseIds',
        'primaryTargetMuscleGroups',
        'secondaryTargetMuscleGroups',
        'difficulty',
      ],
    )

    await writeJson(entry.filePath, normalizedExercise)
  }

  const exerciseIndex = {
    manifests: exercises.map(({ fileName, exercise }) => {
      const id = exercise.id ?? basename(fileName, '.json')
      return {
        id,
        displayLabel: exercise.displayLabel?.trim() || exerciseLabelById.get(id),
        shortDescription:
          exercise.shortDescription?.trim() ||
          'Resistance training exercise used across the imported workout books.',
        file: fileName,
      }
    }),
  }

  await writeJson(join(EXERCISES_DIR, 'index.json'), exerciseIndex)

  const normalizedPrograms = []

  for (const fileName of programmFiles) {
    const filePath = join(PROGRAMMS_DIR, fileName)
    const programm = await readJson(filePath)
    const weeks = Array.isArray(programm.weeks)
      ? programm.weeks.map((week) => {
          return {
            ...week,
            days: Array.isArray(week.days)
              ? week.days.map((day) => {
                  return {
                    ...day,
                    items: Array.isArray(day.items)
                      ? day.items.map((item) => {
                          const normalizedItem = sortObjectEntries(
                            Object.fromEntries(
                              Object.entries(item).filter(([key]) => {
                                return ![
                                  'displayLabel',
                                  'label',
                                  'exerciseName',
                                  'name',
                                  'title',
                                ].includes(key)
                              }),
                            ),
                            ['exerciseId', 'sets', 'reps', 'duration', 'rest', 'notes'],
                          )

                          return normalizedItem
                        })
                      : [],
                  }
                })
              : [],
          }
        })
      : []

    const shortDescription =
      programm.shortDescription?.trim() ||
      'Structured training plan imported from the workout books in tmp.'

    const normalizedProgramm = sortObjectEntries(
      {
        ...programm,
        shortDescription,
        descriptionHtml: buildProgramDescriptionHtml({
          ...programm,
          shortDescription,
          weeks,
        }),
        weeks,
      },
      [
        'id',
        'displayLabel',
        'shortDescription',
        'descriptionHtml',
        'goal',
        'level',
        'duration',
        'tags',
        'weeks',
      ],
    )

    await writeJson(filePath, normalizedProgramm)
    normalizedPrograms.push({
      fileName,
      programm: normalizedProgramm,
    })
  }

  const programmIndex = {
    manifests: normalizedPrograms.map(({ fileName, programm }) => ({
      id: programm.id,
      displayLabel: programm.displayLabel?.trim() || titleCaseFromSlug(programm.id),
      shortDescription:
        programm.shortDescription?.trim() ||
        'Structured training plan imported from the workout books in tmp.',
      goal: programm.goal ?? '',
      level: programm.level ?? '',
      duration: programm.duration ?? '',
      file: fileName,
    })),
  }

  await writeJson(join(PROGRAMMS_DIR, 'index.json'), programmIndex)
}

await main()
