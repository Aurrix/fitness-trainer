import { CheckCircle2, Sparkles } from 'lucide-react'
import type { ProgramExerciseRef } from '../lib/content'
import type { WorkoutExerciseLogEntry } from '../lib/user-data'
import type { EngineSession, ExerciseBaseline, SetPrescription } from '../lib/training/types'

type Props = { engine: EngineSession; exercise: ProgramExerciseRef; log: WorkoutExerciseLogEntry }
const format = (value: number) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)
function target(set: SetPrescription) {
  const amount = set.durationSeconds != null ? `${format(set.durationSeconds)} sec` : `${set.minReps && set.minReps !== set.reps ? `${set.minReps}–` : ''}${set.reps ?? 'Open'}${set.amrap ? '+' : ''} ${set.reps === 1 && (!set.minReps || set.minReps === 1) && !set.amrap ? 'rep' : 'reps'}`
  return amount + (set.weightKg != null ? ` at ${format(set.weightKg)} kg` : '')
}
function baselineText(baseline: ExerciseBaseline) {
  if (baseline.durationSeconds != null) return `${format(baseline.durationSeconds)} sec`
  return `${baseline.weightKg != null ? `${format(baseline.weightKg)} kg × ` : ''}${baseline.reps ?? ''} reps`
}
function sameTarget(a: SetPrescription | undefined, b: SetPrescription) {
  return a && a.reps === b.reps && a.minReps === b.minReps && a.weightKg === b.weightKg && a.durationSeconds === b.durationSeconds && a.effort === b.effort && a.amrap === b.amrap
}
export default function WorkoutProgressionCoach({ engine, exercise, log }: Props) {
  const rule = exercise.progression
  const id = exercise.exerciseId ?? exercise.resolvedExerciseId
  if (!id || !rule || rule.kind === 'none' || log.skipped || (log.exerciseId && log.exerciseId !== id)) return null
  const baseline = engine.baselines?.[id]
  const previous = (engine.before.settings as { baselines?: Record<string, ExerciseBaseline> }).baselines?.[id]
  const initial = engine.initialSection?.exercises.find(slot => slot.id === exercise.id)
  const upcoming = (exercise.prescriptions ?? []).flatMap((set, index) => !log.setLogs[index]?.completedAt && set.kind !== 'warmup' ? [{ set, index }] : [])
  const changed = Boolean(initial && upcoming.some(({ set, index }) => !sameTarget(initial.prescriptions?.[index], set)))
  const added = initial ? Math.max(0, (exercise.prescriptions?.length ?? 0) - (initial.prescriptions?.length ?? 0)) : 0
  const recorded = baseline && !previous
  const title = changed ? added ? `${upcoming.length} follow-up ${upcoming.length === 1 ? 'set' : 'sets'} ready` : 'Workout adapted' : recorded ? 'Baseline recorded' : !baseline ? 'Learning your starting point' : 'Program progression active'
  const uniform = upcoming.length > 0 && upcoming.every(({ set }) => sameTarget(upcoming[0].set, set))
  const description = changed && upcoming.length
    ? `Next: ${uniform ? `${upcoming.length} × ` : ''}${target(upcoming[0].set)}${uniform ? '' : ' · targets vary by set'}.`
    : recorded ? `${baselineText(baseline)}. Your starting point is saved for this exercise.`
      : !baseline ? 'Complete your first work set to personalise targets.'
        : 'Complete your work sets. Next workout targets follow your program’s progression rule.'
  const explanation = changed
    ? 'Your completed sets updated the remaining targets. Completed sets keep their original targets.'
    : 'Your first valid completed work set establishes the baseline. Later sets do not replace it.'
  const ruleText = rule.kind === 'double' || rule.kind === 'range'
    ? `Build reps within the prescribed range${rule.minReps && rule.maxReps ? ` (${rule.minReps}–${rule.maxReps})` : ''}; the program adjusts the next workout when its progression conditions are met.`
    : rule.kind === 'linear' ? 'The program adjusts next workout loads using its success and failure rules.'
      : 'The program can adapt remaining sets and next workout targets from your logged reps, load and effort.'
  const Icon = changed || !baseline ? Sparkles : CheckCircle2
  return <aside className={`workout-progression-coach${baseline ? ' is-recorded' : ''}`} aria-label={`Progression for ${exercise.exerciseName}`}>
    <Icon size={20} aria-hidden="true" />
    <div className="workout-progression-coach__body">
      <div role="status" aria-live="polite" aria-atomic="true"><strong>{title}</strong><p>{description}</p></div>
      {changed && recorded ? <span className="workout-progression-coach__baseline">Baseline recorded · {baselineText(baseline)}</span> : null}
      <details><summary>{changed ? 'Why this changed' : 'How progression works'}</summary><p>{explanation} {ruleText}</p></details>
    </div>
  </aside>
}
