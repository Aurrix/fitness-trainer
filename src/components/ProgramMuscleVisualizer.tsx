import { useState } from 'react'
import type { Slug } from '@mjcdev/react-body-highlighter'
import MuscleVisualizer from './MuscleVisualizer'
import type { Exercise, Program } from '../lib/content'
import type { FitnessProfileGender } from '../lib/fitness-profile'
import { buildCoverageMuscleProfile, buildProgramCoverage, coverageMetricValue, formatCoverageMetric, muscleLabels, type ProgramCoverageMetric } from '../lib/muscles'

const metrics = {
  sets: { label: 'Planned sets', title: 'Planned sets per muscle', description: 'Working sets targeting each muscle. Warm-up sets are excluded.' },
  exercises: { label: 'Exercises', title: 'Exercise slots per muscle', description: 'Exercise slots targeting each muscle. Repeated exercises on different days count again.' },
  sessions: { label: 'Sessions', title: 'Sessions per muscle', description: 'Sessions targeting each muscle, out of all sessions in the selected period.' },
}

type Props = { exercises: Exercise[]; gender?: FitnessProfileGender; program: Program | null }
export default function ProgramMuscleVisualizer({ exercises, gender, program }: Props) {
  const [week, setWeek] = useState('first')
  const [day, setDay] = useState('all')
  const [metric, setMetric] = useState<ProgramCoverageMetric>('sets')
  const [primaryOnly, setPrimaryOnly] = useState(false)
  const [optional, setOptional] = useState(false)
  const [selected, setSelected] = useState<Slug | null>(null)
  const weeks = [...new Set(program?.sections.map(section => section.weekIndex || 1))].sort((a, b) => a - b)
  const currentWeek = week === 'first' ? String(weeks[0]) : week
  const weekSections = program?.sections.filter(section => (optional || !section.optional) && (currentWeek === 'all' || String(section.weekIndex || 1) === currentWeek)) ?? []
  const selectedDay = weekSections.some(section => section.id === day) ? day : 'all'
  const sections = weekSections.filter(section => selectedDay === 'all' || section.id === selectedDay)
  const coverage = buildProgramCoverage(sections, exercises, primaryOnly)
  const profile = buildCoverageMuscleProfile(coverage.rows, metric)
  const rows = [...coverage.rows].sort((a, b) => coverageMetricValue(b, metric) - coverageMetricValue(a, metric) || muscleLabels[a.slug].localeCompare(muscleLabels[b.slug]))
  const currentMetric = metrics[metric]
  const highestCount = Math.max(1, ...rows.map(row => coverageMetricValue(row, metric)))
  const selectedRow = rows.find(row => row.slug === selected)
  if (!program) return null
  return <section className="program-coverage" aria-label="Program muscle coverage">
    <div className="section-header"><div><p className="kicker">Muscle coverage</p><h3>What this plan trains</h3></div></div>
    <div className="program-coverage-controls">
      <label className="field"><span>Period</span><select aria-label="Coverage period" value={currentWeek} onChange={event => { setWeek(event.target.value); setDay('all') }}><option value="all">Entire plan</option>{weeks.map(value => <option key={value} value={value}>Week {value}</option>)}</select></label>
      <label className="field"><span>Session</span><select aria-label="Coverage session" value={selectedDay} onChange={event => setDay(event.target.value)}><option value="all">All sessions</option>{weekSections.map(section => <option key={section.id} value={section.id}>{section.name}</option>)}</select></label>
    </div>
    <div className="program-coverage-checks"><label><input type="checkbox" checked={primaryOnly} onChange={event => setPrimaryOnly(event.target.checked)} />Primary targets only</label>{program.sections.some(section => section.optional) ? <label><input type="checkbox" checked={optional} onChange={event => setOptional(event.target.checked)} />Include optional days</label> : null}</div>
    <div className="segmented-control" aria-label="Muscle coverage metric">{(['sets', 'exercises', 'sessions'] as const).map(value => <button type="button" key={value} aria-pressed={metric === value} className={metric === value ? 'is-active' : ''} onClick={() => setMetric(value)}>{metrics[value].label}</button>)}</div>
    <p className="muted">{currentWeek === 'all' ? 'Entire plan' : `Week ${currentWeek}`} · {sections.length} {sections.length === 1 ? 'session' : 'sessions'} · {sections.reduce((sum, section) => sum + section.exercises.length, 0)} exercise slots</p>
    <div className="program-coverage-metric-summary" role="status" aria-live="polite" aria-atomic="true">
      <h4>{currentMetric.title}</h4><p>{currentMetric.description}</p>
      <div className="program-coverage-metric-leaders">{rows.slice(0, 3).map(row => <div key={row.slug}><span>{muscleLabels[row.slug]}</span><strong>{formatCoverageMetric(row, metric, sections.length)}</strong></div>)}</div>
      {metric === 'sessions' && sections.length === 1 ? <p>Every targeted muscle appears in this one session, so each has a count of 1.</p> : null}
    </div>
    <MuscleVisualizer gender={gender} profile={profile} title={currentMetric.title} kicker="Muscle map" description="Tap a muscle to see the exercises that target it." onSelectMuscle={setSelected} selectedMuscle={selectedRow?.slug ?? null} showIntensityLegend intensityLegendLabel={metric === 'sets' ? 'Colors compare planned set counts within this selection. Set ranges use their midpoint on the map.' : `Colors compare ${metric === 'exercises' ? 'exercise slot' : 'session'} counts within this selection.`} />
    {selectedRow ? <div className="section-card program-coverage-detail"><strong>{muscleLabels[selectedRow.slug]}</strong><p>{selectedRow.exerciseNames.join(' · ')}</p><button type="button" className="ghost-button" onClick={() => setSelected(null)}>Clear muscle selection</button></div> : null}
    <div className="program-coverage-table-wrap"><table className="program-coverage-table" data-metric={metric}>
      <caption>{currentMetric.title} · {currentWeek === 'all' ? 'Entire plan' : `Week ${currentWeek}`}</caption>
      <thead><tr><th scope="col">Muscle</th><th scope="col">{currentMetric.label}</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.slug} className={row.slug === selected ? 'is-selected' : ''}>
        <th scope="row"><button type="button" onClick={() => setSelected(row.slug)}>{muscleLabels[row.slug]}</button></th>
        <td><strong>{formatCoverageMetric(row, metric, sections.length)}</strong><span className="program-coverage-count-bar" aria-hidden="true"><span style={{ width: `${coverageMetricValue(row, metric) / highestCount * 100}%` }} /></span></td>
      </tr>)}</tbody>
    </table></div>
    {!rows.length ? <p className="muted">No muscle targets are available for this selection.</p> : null}
    <p className="muted program-coverage-note">Each exercise slot counts once for each targeted muscle. Repeated exercises on different days count again. {primaryOnly ? 'Only explicitly marked primary targets are included.' : 'Primary and secondary targets both count; anatomical subregions are combined.'} Sets describe planned volume, not lifted kilograms or completed work.</p>
    {!primaryOnly && coverage.unmappedExercises > 0 ? <p className="muted">{coverage.unmappedExercises} exercise slots have no library mapping; available muscle estimates are used.</p> : null}
    {primaryOnly && coverage.unclassifiedExercises > 0 ? <p className="muted">{coverage.unclassifiedExercises} exercise slots lack primary-target data and are excluded.</p> : null}
  </section>
}
