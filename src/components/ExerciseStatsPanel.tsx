import { BarChart3, Clock3, Dumbbell, TrendingUp } from 'lucide-react'
import { LineChart } from '@mui/x-charts/LineChart'
import type { ExerciseStatsRecord } from '../entities/exercise-stats'
import type { Exercise } from '../lib/content'
import { formatRelativeDate } from '../lib/app-utils'

type ExerciseStatsPanelProps = {
  exercise: Exercise
  statsRecord: ExerciseStatsRecord | null
}

function formatShortDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
}

function getMaxValue(values: Array<number | null>) {
  return values.reduce<number | null>((currentMax, value) => {
    if (value === null || Number.isNaN(value)) {
      return currentMax
    }

    return currentMax === null ? value : Math.max(currentMax, value)
  }, null)
}

export default function ExerciseStatsPanel({
  exercise,
  statsRecord,
}: ExerciseStatsPanelProps) {
  if (!statsRecord || !statsRecord.progressionHistory.length) {
    return (
      <section className="section-card exercise-detail-section">
        <div className="section-header">
          <div>
            <p className="kicker">Exercise Stats</p>
            <h3>No logged history yet</h3>
          </div>
        </div>
        <div className="empty-state compact-empty-state">
          <p>
            Log this exercise during workouts to unlock weight, reps, duration, and
            effort trends here.
          </p>
        </div>
      </section>
    )
  }

  const history = [...statsRecord.progressionHistory]
    .sort((left, right) => left.recordedAt.localeCompare(right.recordedAt))
    .slice(-12)
  const labels = history.map((entry) => formatShortDate(entry.recordedAt))
  const weightTrend = history.map((entry) => entry.maxWeightKg)
  const volumeTrend = history.map((entry) => entry.totalVolumeKg)
  const repsTrend = history.map((entry) => entry.totalReps)
  const durationTrend = history.map((entry) => entry.totalDurationMinutes)
  const latestEntry = history.at(-1) ?? null
  const bestWeight = getMaxValue(weightTrend)
  const bestVolume = getMaxValue(volumeTrend)
  const bestDuration = getMaxValue(durationTrend)
  const usesDuration =
    exercise.type === 'continues' || durationTrend.some((entry) => entry !== null)

  return (
    <section className="section-card exercise-detail-section">
      <div className="section-header">
        <div>
          <p className="kicker">Exercise Stats</p>
          <h3>Progression for {exercise.name}</h3>
          <p className="muted">
            {statsRecord.totalLoggedSessions} logged sessions / last performed{' '}
            {formatRelativeDate(statsRecord.lastRecordedAt)}
          </p>
        </div>
      </div>

      <div className="stats-grid exercise-stats-grid">
        <article className="stat-card">
          <span className="stat-card__icon" aria-hidden="true">
            <Dumbbell size={18} />
          </span>
          <span className="stat-label">Best weight</span>
          <strong>{bestWeight !== null ? `${bestWeight.toFixed(1)} kg` : 'No load yet'}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__icon" aria-hidden="true">
            <BarChart3 size={18} />
          </span>
          <span className="stat-label">Best volume</span>
          <strong>{bestVolume !== null ? `${Math.round(bestVolume)} kg` : 'No volume yet'}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__icon" aria-hidden="true">
            <Clock3 size={18} />
          </span>
          <span className="stat-label">Best duration</span>
          <strong>
            {bestDuration !== null ? `${bestDuration.toFixed(0)} min` : 'No duration yet'}
          </strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__icon" aria-hidden="true">
            <TrendingUp size={18} />
          </span>
          <span className="stat-label">Latest effort</span>
          <strong>{latestEntry?.difficultySamples.at(-1) ?? 'Not logged'}</strong>
        </article>
      </div>

      {bestWeight !== null ? (
        <article className="chart-card">
          <div className="chart-card__header">
            <div>
              <p className="kicker">Load Trend</p>
              <h4>Top-set weight over time</h4>
            </div>
          </div>
          <LineChart
            className="chart-card__chart chart-card__chart--flush"
            colors={['#f97316']}
            height={220}
            margin={{ top: 8, right: 0, bottom: 18, left: 0 }}
            series={[{ data: weightTrend, label: 'Max Weight (kg)' }]}
            xAxis={[{ data: labels, scaleType: 'point' }]}
            yAxis={[{ width: 32 }]}
          />
        </article>
      ) : null}

      <article className="chart-card">
        <div className="chart-card__header">
          <div>
            <p className="kicker">{usesDuration ? 'Session Time' : 'Work Output'}</p>
            <h4>{usesDuration ? 'Duration trend' : 'Volume and reps trend'}</h4>
          </div>
        </div>
        <LineChart
          className="chart-card__chart chart-card__chart--flush"
          colors={usesDuration ? ['#0ea5e9'] : ['#2563eb', '#10b981']}
          height={220}
          margin={{ top: 8, right: 0, bottom: 18, left: 0 }}
          series={
            usesDuration
              ? [{ data: durationTrend, label: 'Duration (min)' }]
              : [
                  { data: volumeTrend, label: 'Volume (kg)' },
                  { data: repsTrend, label: 'Reps' },
                ]
          }
          xAxis={[{ data: labels, scaleType: 'point' }]}
          yAxis={[{ width: 32 }]}
        />
      </article>
    </section>
  )
}
