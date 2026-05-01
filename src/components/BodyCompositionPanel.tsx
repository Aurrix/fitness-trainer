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
import { SparkLineChart } from '@mui/x-charts/SparkLineChart'
import { useMemo, useState, type FormEvent } from 'react'
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
  BodyStatEntry,
  BodyStatEntryInput,
} from '../entities/body-stats'
import {
  bodyMeasurementLabels,
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
import GrowthMapCard from '../pages/progression/components/GrowthMapCard'

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

type LoggableBodyMetricKey = Extract<BodyMetricKey, 'bodyFatPercentage' | 'weightKg'>

type MeasurementDraft = Partial<Record<BodyMeasurementKey, string>>

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

const metricChartThreshold = 10

const bodyMetricChartColors: Record<BodyMetricKey, string> = {
  weightKg: '#f97316',
  bodyFatPercentage: '#dc2626',
  leanMassKg: '#16a34a',
  bmi: '#2563eb',
}

const decimalInputPattern = '[0-9]+([.,][0-9]*)?|[.,][0-9]+'

const loggableBodyMetricKeys = new Set<BodyMetricKey>(['bodyFatPercentage', 'weightKg'])

function getTodayDateInputValue() {
  const now = new Date()
  const timezoneOffsetMs = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - timezoneOffsetMs).toISOString().slice(0, 10)
}

function parseNullableNumber(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const parsedValue = Number(trimmedValue.replace(',', '.'))
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

function isLoggableBodyMetricKey(key: BodyMetricKey): key is LoggableBodyMetricKey {
  return loggableBodyMetricKeys.has(key)
}

function getBodyPartMeasurementKeys(key: BodyPartProgressKey): BodyMeasurementKey[] {
  switch (key) {
    case 'armsCm':
      return ['leftArmCm', 'rightArmCm']
    case 'calvesCm':
      return ['leftCalfCm', 'rightCalfCm']
    case 'forearmsCm':
      return ['leftForearmCm', 'rightForearmCm']
    case 'thighsCm':
      return ['leftThighCm', 'rightThighCm']
    case 'chestCm':
      return ['chestCm']
    case 'hipsCm':
      return ['hipsCm']
    case 'shouldersCm':
      return ['shouldersCm']
    case 'waistCm':
    default:
      return ['waistCm']
  }
}

function getMetricEntryValue(entry: BodyStatEntry, key: LoggableBodyMetricKey) {
  return key === 'weightKg' ? entry.weightKg : entry.bodyFatPercentage
}

function hasBodyPartEntry(entry: BodyStatEntry, measurementKeys: BodyMeasurementKey[]) {
  return measurementKeys.some((measurementKey) => entry.measurements[measurementKey] !== null)
}

function formatBodyPartEntryValue(entry: BodyStatEntry, measurementKeys: BodyMeasurementKey[]) {
  const measurementValues = measurementKeys
    .map((measurementKey) => {
      const value = entry.measurements[measurementKey]
      return value !== null
        ? `${bodyMeasurementLabels[measurementKey]} ${value.toFixed(1)} cm`
        : null
    })
    .filter(Boolean)

  return measurementValues.join(' / ') || 'No recorded value'
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
  const [metricEntryDate, setMetricEntryDate] = useState(getTodayDateInputValue)
  const [metricEntryValue, setMetricEntryValue] = useState('')
  const [bodyPartEntryDate, setBodyPartEntryDate] = useState(getTodayDateInputValue)
  const [bodyPartEntryValues, setBodyPartEntryValues] = useState<MeasurementDraft>({})
  const sortedEntries = useMemo(() => {
    return [...bodyStatsEntries].sort((left, right) => right.recordedAt.localeCompare(left.recordedAt))
  }, [bodyStatsEntries])
  const latestEntry = sortedEntries[0] ?? null
  const latestRecordedAt = latestEntry?.recordedAt ?? null

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

  function openMetricDrilldown(key: BodyMetricKey) {
    if (isLoggableBodyMetricKey(key)) {
      setMetricEntryDate(getTodayDateInputValue())
      setMetricEntryValue('')
    }

    setActiveDrilldown({ key, kind: 'metric' })
  }

  function openBodyPartDrilldown(key: BodyPartProgressKey) {
    setBodyPartEntryDate(getTodayDateInputValue())
    setBodyPartEntryValues({})
    setActiveDrilldown({ key, kind: 'part' })
  }

  function handleMetricEntrySubmit(
    event: FormEvent<HTMLFormElement>,
    key: LoggableBodyMetricKey,
  ) {
    event.preventDefault()

    const parsedValue = parseNullableNumber(metricEntryValue)

    if (parsedValue === null) {
      return
    }

    onAddBodyStatsEntry({
      bodyFatPercentage: key === 'bodyFatPercentage' ? parsedValue : null,
      measurements: createEmptyBodyMeasurements(),
      notes: '',
      recordedAt: metricEntryDate || getTodayDateInputValue(),
      weightKg: key === 'weightKg' ? parsedValue : null,
    })
    setMetricEntryValue('')
  }

  function updateBodyPartEntryValue(key: BodyMeasurementKey, rawValue: string) {
    setBodyPartEntryValues((currentValues) => ({
      ...currentValues,
      [key]: rawValue,
    }))
  }

  function handleBodyPartEntrySubmit(
    event: FormEvent<HTMLFormElement>,
    key: BodyPartProgressKey,
  ) {
    event.preventDefault()

    const measurements = createEmptyBodyMeasurements()
    const measurementKeys = getBodyPartMeasurementKeys(key)
    let hasMeasurement = false

    measurementKeys.forEach((measurementKey) => {
      const parsedValue = parseNullableNumber(bodyPartEntryValues[measurementKey] ?? '')

      if (parsedValue !== null) {
        measurements[measurementKey] = parsedValue
        hasMeasurement = true
      }
    })

    if (!hasMeasurement) {
      return
    }

    onAddBodyStatsEntry({
      bodyFatPercentage: null,
      measurements,
      notes: '',
      recordedAt: bodyPartEntryDate || getTodayDateInputValue(),
      weightKg: null,
    })
    setBodyPartEntryValues({})
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
  const activeMetricInputKey =
    activeMetricTile && isLoggableBodyMetricKey(activeMetricTile.metricKey)
      ? activeMetricTile.metricKey
      : null
  const activeMetricHistory = activeMetricInputKey
    ? sortedEntries
        .filter((entry) => getMetricEntryValue(entry, activeMetricInputKey) !== null)
        .slice(0, 6)
    : []
  const activeBodyPartMeasurementKeys = activeBodyPartTile
    ? getBodyPartMeasurementKeys(activeBodyPartTile.bodyPartKey)
    : []
  const activeBodyPartHistory = activeBodyPartTile
    ? sortedEntries
        .filter((entry) => hasBodyPartEntry(entry, activeBodyPartMeasurementKeys))
        .slice(0, 6)
    : []
  const trackedBodyPartCount = bodyPartTiles.filter((tile) => tile.summary.current !== null).length

  return (
    <>
      <section className="section-card stats-section-card">
        <div className="section-header">
          <div>
            <p className="kicker">Body</p>
            <h3>Body composition</h3>
            <p className="muted">
              {latestRecordedAt
                ? `Last entry ${latestRecordedAt} / ${sortedEntries.length} entries`
                : 'Tap a metric or body-part card to save a single entry.'}
            </p>
          </div>
        </div>

        <div className="trend-tile-grid">
          {metricTiles.map(({ currentValue, metricKey, series, summary }) => {
            return (
              <button
                key={metricKey}
                type="button"
                className={`trend-tile trend-tile--${summary.tone}`}
                onClick={() => openMetricDrilldown(metricKey)}
              >
                <span className="trend-tile__icon" aria-hidden="true">
                  {getMetricIcon(metricKey)}
                </span>
                <span className="trend-tile__label">{bodyMetricLabels[metricKey]}</span>
                <strong>{formatMetricValue(metricKey, currentValue)}</strong>
                {series.length > metricChartThreshold ? (
                  <div className="trend-tile__chart" aria-hidden="true">
                    <SparkLineChart
                      area
                      color={bodyMetricChartColors[metricKey]}
                      data={series.map((point) => point.value)}
                      height={64}
                      margin={{ top: 6, right: 2, bottom: 6, left: 2 }}
                      showHighlight={false}
                      showTooltip={false}
                      xAxis={{
                        data: series.map((point) => point.label),
                        scaleType: 'point',
                      }}
                    />
                  </div>
                ) : null}
                <div className="trend-tile__footer">
                  <span className="trend-tile__delta">
                    <TrendGlyph direction={summary.direction} />
                    <span>{formatDeltaWithUnit(summary.change, bodyMetricUnits[metricKey])}</span>
                  </span>
                  <span className="trend-tile__status">{summary.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <GrowthMapCard
        bodyPartImages={bodyPartImages}
        bodyPartTiles={bodyPartTiles}
        entryCoverage={trackedBodyPartCount}
        formatBodyPartValue={formatBodyPartValue}
        formatMonthlyRate={formatMonthlyRate}
        onOpenBodyPart={openBodyPartDrilldown}
        renderTrendGlyph={(direction) => <TrendGlyph direction={direction} />}
      />

      {activeMetricTile ? (
        <BottomSheet
          description="Save a single entry or inspect this metric trend on this device."
          kicker="Body Trend"
          onClose={() => setActiveDrilldown(null)}
          title={bodyMetricLabels[activeMetricTile.metricKey]}
        >
          {activeMetricInputKey ? (
            <form
              className="body-stats-entry-form body-stats-entry-form--compact"
              onSubmit={(event) => handleMetricEntrySubmit(event, activeMetricInputKey)}
            >
              <div className="body-stats-entry-form__section-header">
                <div>
                  <h4>Add {bodyMetricLabels[activeMetricInputKey]}</h4>
                  <p className="muted">
                    Save only this value. Other body stats can be added from their own cards.
                  </p>
                </div>
              </div>
              <div className="body-stats-entry-form__value-grid">
                <label className="field">
                  <span className="field-label">Date</span>
                  <input
                    type="date"
                    required
                    value={metricEntryDate}
                    onChange={(event) => setMetricEntryDate(event.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field-label">
                    {bodyMetricLabels[activeMetricInputKey]} ({bodyMetricUnits[activeMetricInputKey]})
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern={decimalInputPattern}
                    required
                    value={metricEntryValue}
                    onChange={(event) => setMetricEntryValue(event.target.value)}
                    placeholder={activeMetricInputKey === 'weightKg' ? '82.5' : '16.2'}
                  />
                </label>
              </div>
              <div className="row-actions body-stats-entry-form__actions">
                <button type="submit" className="primary-button icon-button">
                  {getMetricIcon(activeMetricInputKey)}
                  <span>Save entry</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="insight-card">
              <h4>Calculated metric</h4>
              <p>
                {activeMetricTile.metricKey === 'bmi'
                  ? 'BMI updates from weight entries when your profile has a saved height.'
                  : 'Lean mass updates from saved weight and body-fat entries.'}
              </p>
            </div>
          )}

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
              <p>Save at least one entry to start charting this metric.</p>
            </div>
          )}

          {activeMetricInputKey && activeMetricHistory.length ? (
            <div className="body-stats-history">
              <div className="body-stats-entry-form__section-header">
                <h4>Recent entries</h4>
              </div>
              {activeMetricHistory.map((entry) => (
                <article key={entry.id} className="body-stats-history__row">
                  <div>
                    <h4>{formatShortDate(entry.recordedAt)}</h4>
                    <p className="muted">
                      {formatMetricValue(
                        activeMetricInputKey,
                        getMetricEntryValue(entry, activeMetricInputKey),
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="chip-button workout-table__icon-button workout-table__remove-button body-stats-history__delete"
                    onClick={() => onRemoveBodyStatsEntry(entry.id)}
                    aria-label={`Delete ${bodyMetricLabels[activeMetricInputKey]} entry from ${entry.recordedAt}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </article>
              ))}
            </div>
          ) : null}
        </BottomSheet>
      ) : null}

      {activeBodyPartTile ? (
        <BottomSheet
          description="Save a body-part measurement and compare changes against expected monthly benchmarks."
          kicker="Body-Part Trend"
          onClose={() => setActiveDrilldown(null)}
          title={bodyPartProgressLabels[activeBodyPartTile.bodyPartKey]}
        >
          <form
            className="body-stats-entry-form body-stats-entry-form--compact"
            onSubmit={(event) =>
              handleBodyPartEntrySubmit(event, activeBodyPartTile.bodyPartKey)
            }
          >
            <div className="body-stats-entry-form__section-header">
              <div>
                <h4>Add {bodyPartProgressLabels[activeBodyPartTile.bodyPartKey]}</h4>
                <p className="muted">Save the available circumference values for this body part.</p>
              </div>
            </div>
            <div className="body-stats-entry-form__value-grid">
              <label className="field">
                <span className="field-label">Date</span>
                <input
                  type="date"
                  required
                  value={bodyPartEntryDate}
                  onChange={(event) => setBodyPartEntryDate(event.target.value)}
                />
              </label>
              {activeBodyPartMeasurementKeys.map((measurementKey) => (
                <label key={measurementKey} className="field">
                  <span className="field-label">{bodyMeasurementLabels[measurementKey]} (cm)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern={decimalInputPattern}
                    value={bodyPartEntryValues[measurementKey] ?? ''}
                    onChange={(event) =>
                      updateBodyPartEntryValue(measurementKey, event.target.value)
                    }
                    placeholder="0.0"
                  />
                </label>
              ))}
            </div>
            <div className="row-actions body-stats-entry-form__actions">
              <button type="submit" className="primary-button icon-button">
                <Ruler size={16} />
                <span>Save entry</span>
              </button>
            </div>
          </form>

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

          {activeBodyPartHistory.length ? (
            <div className="body-stats-history">
              <div className="body-stats-entry-form__section-header">
                <h4>Recent entries</h4>
              </div>
              {activeBodyPartHistory.map((entry) => (
                <article key={entry.id} className="body-stats-history__row">
                  <div>
                    <h4>{formatShortDate(entry.recordedAt)}</h4>
                    <p className="muted">
                      {formatBodyPartEntryValue(entry, activeBodyPartMeasurementKeys)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="chip-button workout-table__icon-button workout-table__remove-button body-stats-history__delete"
                    onClick={() => onRemoveBodyStatsEntry(entry.id)}
                    aria-label={`Delete ${bodyPartProgressLabels[activeBodyPartTile.bodyPartKey]} entry from ${entry.recordedAt}`}
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
