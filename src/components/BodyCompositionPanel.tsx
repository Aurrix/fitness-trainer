import {
  Activity,
  Minus,
  Plus,
  Ruler,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { LineChart } from '@mui/x-charts/LineChart'
import { useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import armsImage from '../assets/images/bodyparts/arms.png'
import calvesImage from '../assets/images/bodyparts/calves.png'
import chestImage from '../assets/images/bodyparts/chest.png'
import forearmsImage from '../assets/images/bodyparts/forearms.png'
import hipsImage from '../assets/images/bodyparts/hips.png'
import shouldersImage from '../assets/images/bodyparts/shoulders.png'
import thighsImage from '../assets/images/bodyparts/thighs.png'
import waistImage from '../assets/images/bodyparts/waist.png'
import type {
  BodyMeasurementKey,
  BodyMeasurements,
  BodyStatEntry,
  BodyStatEntryInput,
} from '../entities/body-stats'
import {
  bodyMeasurementLabels,
  bodyMeasurementKeys,
  countRecordedMeasurements,
  createEmptyBodyMeasurements,
} from '../entities/body-stats'
import type {
  StatsPreferences,
  StatsRangePreset,
} from '../entities/stats-preferences'
import { statsRangePresetOptions } from '../entities/stats-preferences'
import type { FitnessProfile } from '../lib/fitness-profile'
import {
  bodyMetricLabels,
  bodyMetricUnits,
  bodyPartProgressLabels,
  buildBodyMetricSeries,
  buildBodyPartSeries,
  filterPointsByRange,
  formatShortDate,
  formatSignedNumber,
  getFallbackBodyMetricValue,
  summarizeBodyMetricTrend,
  summarizeBodyPartTrend,
  type BodyMetricKey,
  type BodyPartProgressKey,
} from '../lib/progression'
import BottomSheet from './BottomSheet'

type BodyCompositionPanelProps = {
  bodyStatsEntries: BodyStatEntry[]
  fitnessProfile: FitnessProfile
  onAddBodyStatsEntry: (entry: BodyStatEntryInput) => void
  onRemoveBodyStatsEntry: (entryId: string) => void
  onUpdateStatsPreferences: (
    updater: StatsPreferences | ((current: StatsPreferences) => StatsPreferences),
  ) => void
  statsPreferences: StatsPreferences
}

type DrilldownState =
  | {
      key: BodyMetricKey
      kind: 'metric'
    }
  | {
      key: BodyPartProgressKey
      kind: 'part'
    }
  | null

const bodyMetricTileKeys: BodyMetricKey[] = [
  'weightKg',
  'bodyFatPercentage',
  'leanMassKg',
  'bmi',
]

const bodyPartTileKeys: BodyPartProgressKey[] = [
  'shouldersCm',
  'chestCm',
  'armsCm',
  'forearmsCm',
  'waistCm',
  'hipsCm',
  'thighsCm',
  'calvesCm',
]

const bodyPartImages: Record<BodyPartProgressKey, string> = {
  armsCm: armsImage,
  calvesCm: calvesImage,
  chestCm: chestImage,
  forearmsCm: forearmsImage,
  hipsCm: hipsImage,
  shouldersCm: shouldersImage,
  thighsCm: thighsImage,
  waistCm: waistImage,
}

function parseNullableNumber(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

function formatMetricValue(key: BodyMetricKey, value: number | null) {
  if (value === null) {
    return 'N/A'
  }

  const digits = key === 'bmi' || key === 'bodyFatPercentage' ? 1 : 1
  const unit = bodyMetricUnits[key]
  return `${value.toFixed(digits)}${unit ? ` ${unit}` : ''}`
}

function formatBodyPartValue(value: number | null) {
  return value !== null ? `${value.toFixed(1)} cm` : 'N/A'
}

function formatDeltaWithUnit(value: number | null, unit: string) {
  if (value === null) {
    return 'No change yet'
  }

  return `${formatSignedNumber(value, 1)}${unit ? ` ${unit}` : ''}`
}

function formatMonthlyRate(value: number | null) {
  if (value === null) {
    return 'Need at least 2 entries'
  }

  return `${formatSignedNumber(value, 2)} cm/mo`
}

function TrendGlyph({
  direction,
}: {
  direction: 'declining' | 'growing' | 'stable'
}) {
  if (direction === 'growing') {
    return <TrendingUp size={16} />
  }

  if (direction === 'declining') {
    return <TrendingDown size={16} />
  }

  return <Minus size={16} />
}

function getMetricIcon(key: BodyMetricKey) {
  switch (key) {
    case 'bodyFatPercentage':
      return <Activity size={16} />
    case 'leanMassKg':
      return <Plus size={16} />
    case 'bmi':
      return <Ruler size={16} />
    case 'weightKg':
    default:
      return <Scale size={16} />
  }
}

export default function BodyCompositionPanel({
  bodyStatsEntries,
  fitnessProfile,
  onAddBodyStatsEntry,
  onRemoveBodyStatsEntry,
  onUpdateStatsPreferences,
  statsPreferences,
}: BodyCompositionPanelProps) {
  const [activeDrilldown, setActiveDrilldown] = useState<DrilldownState>(null)
  const [isEntrySheetOpen, setIsEntrySheetOpen] = useState(false)
  const [bodyStatsDate, setBodyStatsDate] = useState(new Date().toISOString().slice(0, 10))
  const [bodyStatsWeight, setBodyStatsWeight] = useState('')
  const [bodyStatsBodyFat, setBodyStatsBodyFat] = useState('')
  const [bodyStatsMeasurements, setBodyStatsMeasurements] = useState<BodyMeasurements>(() =>
    createEmptyBodyMeasurements(),
  )
  const [bodyStatsNotes, setBodyStatsNotes] = useState('')
  const measurementFields = useMemo(() => bodyMeasurementKeys, [])
  const sortedEntries = useMemo(() => {
    return [...bodyStatsEntries].sort((left, right) => right.recordedAt.localeCompare(left.recordedAt))
  }, [bodyStatsEntries])
  const latestEntry = sortedEntries[0] ?? null
  const latestRecordedAt = latestEntry?.recordedAt ?? null
  const entryCoverage = latestEntry ? countRecordedMeasurements(latestEntry) : 0

  function updateBodyMetricRange(key: BodyMetricKey, range: StatsRangePreset) {
    onUpdateStatsPreferences((currentPreferences) => ({
      ...currentPreferences,
      bodyMetricRanges: {
        ...currentPreferences.bodyMetricRanges,
        [key]: range,
      },
    }))
  }

  function updateBodyPartRange(key: BodyPartProgressKey, range: StatsRangePreset) {
    onUpdateStatsPreferences((currentPreferences) => ({
      ...currentPreferences,
      bodyPartRanges: {
        ...currentPreferences.bodyPartRanges,
        [key]: range,
      },
    }))
  }

  function handleBodyStatsMeasurementChange(
    key: BodyMeasurementKey,
    rawValue: string,
  ) {
    setBodyStatsMeasurements((currentMeasurements) => ({
      ...currentMeasurements,
      [key]: parseNullableNumber(rawValue),
    }))
  }

  function resetEntryForm() {
    setBodyStatsBodyFat('')
    setBodyStatsDate(new Date().toISOString().slice(0, 10))
    setBodyStatsMeasurements(createEmptyBodyMeasurements())
    setBodyStatsNotes('')
    setBodyStatsWeight('')
  }

  function handleBodyStatsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextEntry: BodyStatEntryInput = {
      bodyFatPercentage: parseNullableNumber(bodyStatsBodyFat),
      measurements: bodyStatsMeasurements,
      notes: bodyStatsNotes.trim(),
      recordedAt: bodyStatsDate,
      weightKg: parseNullableNumber(bodyStatsWeight),
    }

    const hasMeasurement = Object.values(nextEntry.measurements).some((value) => value !== null)

    if (
      nextEntry.weightKg === null &&
      nextEntry.bodyFatPercentage === null &&
      !hasMeasurement
    ) {
      return
    }

    onAddBodyStatsEntry(nextEntry)
    resetEntryForm()
    setIsEntrySheetOpen(false)
  }

  const metricTiles = bodyMetricTileKeys.map((metricKey) => {
    const range = statsPreferences.bodyMetricRanges[metricKey] ?? '180d'
    const series = filterPointsByRange(
      buildBodyMetricSeries(sortedEntries, fitnessProfile, metricKey),
      range,
    )
    const summary = summarizeBodyMetricTrend(metricKey, series, fitnessProfile)

    return {
      currentValue: summary.current ?? getFallbackBodyMetricValue(fitnessProfile, metricKey),
      metricKey,
      range,
      series,
      summary,
    }
  })

  const bodyPartTiles = bodyPartTileKeys.map((bodyPartKey) => {
    const range = statsPreferences.bodyPartRanges[bodyPartKey] ?? '180d'
    const series = filterPointsByRange(buildBodyPartSeries(sortedEntries, bodyPartKey), range)
    const summary = summarizeBodyPartTrend(bodyPartKey, series, fitnessProfile)

    return {
      bodyPartKey,
      range,
      series,
      summary,
    }
  })

  const activeMetricTile =
    activeDrilldown?.kind === 'metric'
      ? metricTiles.find((tile) => tile.metricKey === activeDrilldown.key) ?? null
      : null
  const activeBodyPartTile =
    activeDrilldown?.kind === 'part'
      ? bodyPartTiles.find((tile) => tile.bodyPartKey === activeDrilldown.key) ?? null
      : null

  return (
    <>
      <section className="section-card stats-section-card">
        <div className="section-header">
          <div>
            <p className="kicker">Body</p>
            <h3>Body composition</h3>
            <p className="muted">
              {latestRecordedAt
                ? `Last snapshot ${latestRecordedAt} / ${sortedEntries.length} entries`
                : 'Log snapshots to track weight, body fat, and body-part changes over time.'}
            </p>
          </div>
          <button
            type="button"
            className="primary-button icon-button stats-panel__action"
            onClick={() => setIsEntrySheetOpen(true)}
          >
            <Plus size={16} />
            <span>Log</span>
          </button>
        </div>

        <div className="trend-tile-grid">
          {metricTiles.map(({ currentValue, metricKey, summary }) => (
            <button
              key={metricKey}
              type="button"
              className={`trend-tile trend-tile--${summary.tone}`}
              onClick={() => setActiveDrilldown({ key: metricKey, kind: 'metric' })}
            >
              <span className="trend-tile__icon" aria-hidden="true">
                {getMetricIcon(metricKey)}
              </span>
              <span className="trend-tile__label">{bodyMetricLabels[metricKey]}</span>
              <strong>{formatMetricValue(metricKey, currentValue)}</strong>
              <div className="trend-tile__footer">
                <span className="trend-tile__delta">
                  <TrendGlyph direction={summary.direction} />
                  <span>{formatDeltaWithUnit(summary.change, bodyMetricUnits[metricKey])}</span>
                </span>
                <span className="trend-tile__status">{summary.label}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="section-card stats-section-card">
        <div className="section-header">
          <div>
            <p className="kicker">Body Parts</p>
            <h3>Growth map</h3>
            <p className="muted">
              Compare circumference trends against the saved age, gender, and experience profile.
            </p>
          </div>
          <span className="pill pill--subtle">{entryCoverage} areas tracked</span>
        </div>

        <div className="body-part-grid">
          {bodyPartTiles.map(({ bodyPartKey, summary }) => {
            const tileStyle = {
              '--body-part-image': `url("${bodyPartImages[bodyPartKey]}")`,
            } as CSSProperties

            return (
              <button
                key={bodyPartKey}
                type="button"
                className={`body-part-tile body-part-tile--${summary.tone}`}
                style={tileStyle}
                onClick={() => setActiveDrilldown({ key: bodyPartKey, kind: 'part' })}
              >
                <div className="body-part-tile__backdrop" aria-hidden="true" />
                <div className="body-part-tile__content">
                  <div className="body-part-tile__header">
                    <span>{bodyPartProgressLabels[bodyPartKey]}</span>
                    <TrendGlyph direction={summary.direction} />
                  </div>
                  <strong>{formatBodyPartValue(summary.current)}</strong>
                  <div className="body-part-tile__footer">
                    <span>{formatMonthlyRate(summary.monthlyRate)}</span>
                    <span>{summary.label}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {activeMetricTile ? (
        <BottomSheet
          description="Pick a time window to inspect the metric trend on this device."
          kicker="Body Trend"
          onClose={() => setActiveDrilldown(null)}
          title={bodyMetricLabels[activeMetricTile.metricKey]}
        >
          <div className="sheet-segmented-control">
            {statsRangePresetOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  option.value === activeMetricTile.range
                    ? 'chip-button is-active'
                    : 'chip-button'
                }
                onClick={() => updateBodyMetricRange(activeMetricTile.metricKey, option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className={`trend-tile trend-tile--${activeMetricTile.summary.tone}`}>
            <span className="trend-tile__label">{bodyMetricLabels[activeMetricTile.metricKey]}</span>
            <strong>
              {formatMetricValue(activeMetricTile.metricKey, activeMetricTile.currentValue)}
            </strong>
            <div className="trend-tile__footer">
              <span className="trend-tile__delta">
                <TrendGlyph direction={activeMetricTile.summary.direction} />
                <span>
                  {formatDeltaWithUnit(
                    activeMetricTile.summary.change,
                    bodyMetricUnits[activeMetricTile.metricKey],
                  )}
                </span>
              </span>
              <span className="trend-tile__status">{activeMetricTile.summary.label}</span>
            </div>
          </div>

          {activeMetricTile.series.length ? (
            <article className="chart-card chart-card--sheet">
              <LineChart
                className="chart-card__chart chart-card__chart--flush"
                colors={['#2563eb']}
                height={260}
                margin={{ top: 8, right: 0, bottom: 18, left: 0 }}
                series={[
                  {
                    data: activeMetricTile.series.map((point) => point.value),
                    label: bodyMetricLabels[activeMetricTile.metricKey],
                  },
                ]}
                xAxis={[
                  {
                    data: activeMetricTile.series.map((point) => point.label),
                    scaleType: 'point',
                  },
                ]}
                yAxis={[{ width: 32 }]}
              />
            </article>
          ) : (
            <div className="empty-state compact-empty-state">
              <h3>No trend data yet</h3>
              <p>Save at least one body snapshot to start charting this metric.</p>
            </div>
          )}
        </BottomSheet>
      ) : null}

      {activeBodyPartTile ? (
        <BottomSheet
          description="Use the saved profile to compare body-part changes against expected monthly benchmarks."
          kicker="Body-Part Trend"
          onClose={() => setActiveDrilldown(null)}
          title={bodyPartProgressLabels[activeBodyPartTile.bodyPartKey]}
        >
          <div className="sheet-segmented-control">
            {statsRangePresetOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  option.value === activeBodyPartTile.range
                    ? 'chip-button is-active'
                    : 'chip-button'
                }
                onClick={() => updateBodyPartRange(activeBodyPartTile.bodyPartKey, option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className={`trend-tile trend-tile--${activeBodyPartTile.summary.tone}`}>
            <span className="trend-tile__label">
              {bodyPartProgressLabels[activeBodyPartTile.bodyPartKey]}
            </span>
            <strong>{formatBodyPartValue(activeBodyPartTile.summary.current)}</strong>
            <div className="trend-tile__footer">
              <span className="trend-tile__delta">
                <TrendGlyph direction={activeBodyPartTile.summary.direction} />
                <span>{formatMonthlyRate(activeBodyPartTile.summary.monthlyRate)}</span>
              </span>
              <span className="trend-tile__status">{activeBodyPartTile.summary.label}</span>
            </div>
          </div>

          {activeBodyPartTile.summary.benchmark ? (
            <div className="insight-card">
              <h4>Expected monthly range</h4>
              <p>
                {activeBodyPartTile.summary.benchmark.direction === 'maintainOrReduce'
                  ? 'Maintain or reduce'
                  : 'Grow'}
                {' / '}
                {activeBodyPartTile.summary.benchmark.optimal[0].toFixed(2)} to{' '}
                {activeBodyPartTile.summary.benchmark.optimal[1].toFixed(2)} cm per month.
              </p>
            </div>
          ) : null}

          {activeBodyPartTile.series.length ? (
            <article className="chart-card chart-card--sheet">
              <LineChart
                className="chart-card__chart chart-card__chart--flush"
                colors={['#7c3aed']}
                height={260}
                margin={{ top: 8, right: 0, bottom: 18, left: 0 }}
                series={[
                  {
                    data: activeBodyPartTile.series.map((point) => point.value),
                    label: bodyPartProgressLabels[activeBodyPartTile.bodyPartKey],
                  },
                ]}
                xAxis={[
                  {
                    data: activeBodyPartTile.series.map((point) => point.label),
                    scaleType: 'point',
                  },
                ]}
                yAxis={[{ width: 32 }]}
              />
            </article>
          ) : (
            <div className="empty-state compact-empty-state">
              <h3>No measurement history yet</h3>
              <p>Save measurements for this area to inspect its trend and benchmark fit.</p>
            </div>
          )}
        </BottomSheet>
      ) : null}

      {isEntrySheetOpen ? (
        <BottomSheet
          description="Save weight, body fat, and optional measurements for future progression and projection."
          kicker="Entry"
          onClose={() => setIsEntrySheetOpen(false)}
          title="Save body snapshot"
        >
          <form className="body-stats-entry-form" onSubmit={handleBodyStatsSubmit}>
            <div className="form-grid body-stats-entry-form__summary-grid">
              <label className="field">
                <span className="field-label">Date</span>
                <input
                  type="date"
                  value={bodyStatsDate}
                  onChange={(event) => setBodyStatsDate(event.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Weight (kg)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={bodyStatsWeight}
                  onChange={(event) => setBodyStatsWeight(event.target.value)}
                  placeholder="82.5"
                />
              </label>
              <label className="field">
                <span className="field-label">Body Fat (%)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={bodyStatsBodyFat}
                  onChange={(event) => setBodyStatsBodyFat(event.target.value)}
                  placeholder="16.2"
                />
              </label>
            </div>

            <section className="body-stats-entry-form__section">
              <div className="body-stats-entry-form__section-header">
                <div>
                  <h4>Measurements</h4>
                  <p className="muted">Optional circumference values in centimeters.</p>
                </div>
              </div>

              <div className="form-grid body-stats-entry-form__measurement-grid">
                {measurementFields.map((measurementKey) => (
                  <label key={measurementKey} className="field">
                    <span className="field-label">{bodyMeasurementLabels[measurementKey]} (cm)</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      value={bodyStatsMeasurements[measurementKey] ?? ''}
                      onChange={(event) =>
                        handleBodyStatsMeasurementChange(measurementKey, event.target.value)
                      }
                      placeholder="0.0"
                    />
                  </label>
                ))}
              </div>
            </section>

            <label className="field field--full">
              <span className="field-label">Notes</span>
              <textarea
                rows={3}
                value={bodyStatsNotes}
                onChange={(event) => setBodyStatsNotes(event.target.value)}
                placeholder="Morning weigh-in, cut checkpoint, peak week, travel rebound..."
              />
            </label>

            <div className="row-actions body-stats-entry-form__actions">
              <button type="submit" className="primary-button icon-button">
                <Scale size={16} />
                <span>Save snapshot</span>
              </button>
            </div>
          </form>

          {sortedEntries.length ? (
            <div className="card-stack">
              {sortedEntries.slice(0, 6).map((entry) => (
                <article key={entry.id} className="log-card">
                  <div>
                    <h4>{formatShortDate(entry.recordedAt)}</h4>
                    <p className="muted">
                      {[
                        entry.weightKg !== null ? `${entry.weightKg} kg` : null,
                        entry.bodyFatPercentage !== null
                          ? `${entry.bodyFatPercentage}% fat`
                          : null,
                        countRecordedMeasurements(entry)
                          ? `${countRecordedMeasurements(entry)} measurements`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' / ') || 'No recorded values'}
                    </p>
                    {entry.notes ? <p className="muted">{entry.notes}</p> : null}
                  </div>
                  <button
                    type="button"
                    className="chip-button workout-table__icon-button workout-table__remove-button"
                    onClick={() => onRemoveBodyStatsEntry(entry.id)}
                    aria-label={`Delete body stats entry from ${entry.recordedAt}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </article>
              ))}
            </div>
          ) : null}
        </BottomSheet>
      ) : null}
    </>
  )
}
