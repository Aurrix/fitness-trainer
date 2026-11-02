import { useId, useState } from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import type { ExerciseStatsRecord } from '../entities/exercise-stats'
import type { Exercise } from '../lib/content'
import { exerciseDate, exerciseHistory, exerciseNumber, exerciseSessionSummary } from '../lib/exercise-performance'

type Props = { exercise: Exercise; statsRecord: ExerciseStatsRecord | null }
type Metric = 'weight' | 'volume' | 'reps' | 'duration' | 'effort'
const metrics: Record<Metric, { label: string; unit: string }> = {
  weight: { label: 'Top-set weight', unit: 'kg' }, volume: { label: 'Volume', unit: 'kg' }, reps: { label: 'Total reps', unit: 'reps' }, duration: { label: 'Duration', unit: 'min' }, effort: { label: 'Effort', unit: 'effort' },
}

export default function ExerciseStatsPanel({ exercise, statsRecord }: Props) {
  const [metricChoice, setMetricChoice] = useState<Metric | null>(null)
  const [period, setPeriod] = useState('6')
  const [limit, setLimit] = useState(6)
  const id = useId()
  const history = exerciseHistory(statsRecord)
  const actual = history.filter(sample => !sample.skipped)
  const values = (metric: Metric, sample: (typeof history)[number]) => {
    if (metric === 'weight') return sample.maxWeightKg
    if (metric === 'volume') return sample.totalVolumeKg
    if (metric === 'reps') return sample.totalReps
    if (metric === 'duration') return sample.totalDurationMinutes
    const effort = sample.difficultySamples.at(-1)?.trim()
    return effort && Number.isFinite(Number(effort)) ? Number(effort) : null
  }
  const available = (Object.keys(metrics) as Metric[]).filter(metric => actual.some(sample => values(metric, sample) !== null))
  const defaultMetric = available.find(metric => metric !== 'weight' || actual.some(sample => (sample.maxWeightKg ?? 0) > 0)) ?? available[0]
  const metric = metricChoice && available.includes(metricChoice) ? metricChoice : defaultMetric
  const trend = [...actual].reverse().slice(period === 'all' ? 0 : -Number(period))
  const hasWeight = actual.some(sample => (sample.maxWeightKg ?? 0) > 0)
  const bestMetric: Metric = hasWeight ? 'weight' : actual.some(sample => sample.totalDurationMinutes !== null) ? 'duration' : 'reps'
  const best = [...actual].filter(sample => values(bestMetric, sample) !== null).sort((a, b) => (values(bestMetric, b) ?? 0) - (values(bestMetric, a) ?? 0))[0]

  if (!history.length) return <section className="exercise-performance-empty"><h3>No sessions yet</h3><p>Log this exercise during a workout to see your set history and trends here.</p></section>
  return <section className="exercise-performance" aria-label={`Performance history for ${exercise.name}`}>
    <div className="exercise-performance__metrics">
      <article><span>{bestMetric === 'weight' ? 'Best top load' : bestMetric === 'duration' ? 'Longest session' : 'Most reps in a session'}</span><strong>{best ? `${exerciseNumber(values(bestMetric, best)!)} ${metrics[bestMetric].unit}` : '—'}</strong><small>{best ? exerciseDate(best.recordedAt) : 'No values logged'}</small></article>
      <article><span>Sessions logged</span><strong>{statsRecord?.totalLoggedSessions ?? history.length}</strong><small>Last trained {exerciseDate(history[0].recordedAt)}</small></article>
    </div>
    {metric ? <>
      <div className="exercise-performance__chart-controls"><label><span className="sr-only">Performance metric</span><select aria-label="Performance metric" value={metric} onChange={event => setMetricChoice(event.target.value as Metric)}>{available.map(key => <option key={key} value={key}>{metrics[key].label}</option>)}</select></label><label><span className="sr-only">History period</span><select aria-label="History period" value={period} onChange={event => setPeriod(event.target.value)}><option value="6">Last 6 sessions</option><option value="12">Last 12 sessions</option><option value="all">All sessions</option></select></label></div>
      <div className="exercise-performance__chart" role="group" aria-label={`${metrics[metric].label} trend in ${metrics[metric].unit}`}>
        <LineChart skipAnimation height={180} colors={['#f97341']} margin={{ top: 12, right: 10, bottom: 12, left: 0 }} series={[{ data: trend.map(sample => values(metric, sample)), label: `${metrics[metric].label} (${metrics[metric].unit})` }]} xAxis={[{ data: trend.map((_, index) => index), scaleType: 'point', valueFormatter: value => trend[Number(value)] ? new Date(trend[Number(value)].recordedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '' }]} yAxis={[{ width: 42 }]} hideLegend />
      </div>
      <p className="exercise-performance__chart-note">{metrics[metric].unit} · Actual logged values</p>
    </> : null}
    <h3 className="exercise-performance__sessions-title" id={id}>Recent sessions</h3>
    <div aria-labelledby={id}>{history.slice(0, limit).map(sample => <details className="exercise-performance__session" key={sample.id}>
      <summary><span><strong>{exerciseDate(sample.recordedAt)}</strong><small>{sample.sectionName || sample.programName || 'Workout'}{sample.skipped ? ' · Skipped' : sample.completed ? '' : ' · Partial'}</small></span><span>{exerciseSessionSummary(sample)}<span aria-hidden="true">⌄</span></span></summary>
      {sample.sets.length ? <div className="exercise-performance__set-table"><table><caption className="sr-only">Logged sets on {exerciseDate(sample.recordedAt)}</caption><thead><tr><th>Set</th>{sample.sets.some(set => set.durationMinutes !== null) ? <th>Minutes</th> : <><th>kg</th><th>Reps</th></>}<th>Effort</th></tr></thead><tbody>{sample.sets.map((set, index) => <tr key={`${set.setIndex}-${index}`}><td>{set.setIndex}</td>{sample.sets.some(entry => entry.durationMinutes !== null) ? <td>{set.durationMinutes !== null ? exerciseNumber(set.durationMinutes) : '—'}</td> : <><td>{set.weightKg !== null ? exerciseNumber(set.weightKg) : '—'}</td><td>{set.reps !== null ? exerciseNumber(set.reps) : '—'}</td></>}<td>{set.difficulty || '—'}{set.progression ? <small>{set.progression === 'hold' ? 'Keep weight' : `${set.progression} weight`}</small> : null}</td></tr>)}</tbody></table></div> : <p className="muted">No individual set values saved for this session.</p>}
      {sample.notes ? <p className="exercise-performance__notes">{sample.notes}</p> : null}
    </details>)}</div>
    {history.length > limit ? <button type="button" className="ghost-button" onClick={() => setLimit(current => current + 6)}>Load more sessions</button> : null}
  </section>
}
