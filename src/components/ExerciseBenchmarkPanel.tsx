import type { Exercise } from '../lib/content'
import {
  formatBenchmarkProfileLabel,
  formatBenchmarkRange,
  formatBenchmarkValue,
  getExerciseBenchmarkSummary,
} from '../lib/exercise-benchmarks'
import type { FitnessProfile } from '../lib/fitness-profile'

type ExerciseBenchmarkPanelProps = {
  exercise: Exercise
  fitnessProfile: FitnessProfile
}

export default function ExerciseBenchmarkPanel({
  exercise,
  fitnessProfile,
}: ExerciseBenchmarkPanelProps) {
  const benchmarkSummary = getExerciseBenchmarkSummary(exercise, fitnessProfile)

  return (
    <section className="section-card exercise-detail-section exercise-benchmark-panel">
      <div className="section-header">
        <div>
          <p className="kicker">Average Benchmarks</p>
          <h3>{benchmarkSummary ? 'Profile averages' : 'No benchmark mapped'}</h3>
          <p className="muted">
            {benchmarkSummary
              ? `${formatBenchmarkProfileLabel(benchmarkSummary)} / ${exercise.category || 'general'}`
              : 'This exercise does not have an age, gender, and experience benchmark yet.'}
          </p>
        </div>
      </div>

      {benchmarkSummary ? (
        <>
          <div className="exercise-benchmark-grid">
            {benchmarkSummary.metrics.map((metric) => (
              <article key={metric.key} className="stat-card exercise-benchmark-card">
                <span className="stat-label">{metric.label} average</span>
                <strong>{formatBenchmarkValue(metric.average, metric.unit)}</strong>
                <span className="exercise-benchmark-card__range">
                  {formatBenchmarkRange(metric)}
                </span>
              </article>
            ))}
          </div>

          <p className="muted exercise-benchmark-panel__basis">
            Basis: {benchmarkSummary.basis}
          </p>
        </>
      ) : null}
    </section>
  )
}
