import { Activity, BarChart3 } from 'lucide-react'
import { LineChart } from '@mui/x-charts/LineChart'
import {
  BarPlot,
  ChartsContainer,
  ChartsReferenceLine,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
} from '@mui/x-charts'
import type { ExerciseStatsStore } from '../entities/exercise-stats'
import type { ProgramDayLog } from '../entities/program-day-stats'
import type {
  ProgramPrimaryChartView,
  StatsPreferences,
  StatsRangePreset,
} from '../entities/stats-preferences'
import { statsRangePresetOptions } from '../entities/stats-preferences'
import type { WorkoutLog } from '../entities/workout'
import type { AppProgram } from '../lib/app-types'
import type { FitnessProfile } from '../lib/fitness-profile'
import {
  buildExerciseProgressionBreakdown,
  buildMuscleProgressionBreakdown,
  buildMuscleProgressProfile,
  buildProgramSessionPoints,
  buildWeeklyFrequency,
  derivePlannedSessionsPerWeek,
  formatSignedNumber,
  summarizeTrend,
  type ExerciseProgressEntry,
  type MuscleProgressEntry,
} from '../lib/progression'
import type { ProgramStatsRecord } from '../services/program-stats'
import MuscleVisualizer from './MuscleVisualizer'

type ProgramProgressionPanelProps = {
  exerciseStatsStore: ExerciseStatsStore
  fitnessProfile: FitnessProfile
  mainProgram: AppProgram | null
  mainProgramStats: ProgramStatsRecord | null
  onUpdateStatsPreferences: (
    updater: StatsPreferences | ((current: StatsPreferences) => StatsPreferences),
  ) => void
  programDayLogs: ProgramDayLog[]
  statsPreferences: StatsPreferences
  workoutLogs: WorkoutLog[]
}

function formatCoefficient(value: number) {
  return `${formatSignedNumber(value * 100, 0)}%`
}

function formatSetCountValue(value: number | null) {
  return value !== null ? `${Math.round(value)} sets` : 'N/A'
}

function formatVolumeValue(value: number | null) {
  return value !== null ? `${Math.round(value)} kg` : 'N/A'
}

function formatMetricValue(value: number | null, unit: string, digits = 0) {
  if (value === null) {
    return 'N/A'
  }

  const normalizedUnit = unit === 'min' ? 'min' : unit
  const roundedValue = digits > 0 ? value.toFixed(digits) : Math.round(value).toString()
  return normalizedUnit ? `${roundedValue} ${normalizedUnit}` : roundedValue
}

function formatSignedMetricValue(value: number | null, unit: string, digits = 0) {
  if (value === null) {
    return 'N/A'
  }

  const normalizedUnit = unit === 'min' ? 'min' : unit
  const magnitude = digits > 0 ? Math.abs(value).toFixed(digits) : Math.round(Math.abs(value)).toString()
  return `${value > 0 ? '+' : value < 0 ? '-' : ''}${magnitude}${normalizedUnit ? ` ${normalizedUnit}` : ''}`
}

function formatRangeValue([min, max]: [number, number], unit: string) {
  const normalizedUnit = unit === 'minutes' ? 'min' : unit
  return `${Math.round(min)}-${Math.round(max)} ${normalizedUnit}`
}

type BreakdownRow = {
  id: string
  label: string
  metaLines: string[]
  tone: 'negative' | 'neutral' | 'positive'
  value: string
  valueMeta: string | null
}

function buildBreakdownRows(
  breakdownView: StatsPreferences['muscleProgressView'],
  exercises: ExerciseProgressEntry[],
  muscles: MuscleProgressEntry[],
): BreakdownRow[] {
  if (breakdownView === 'exercises') {
    return exercises.slice(0, 8).map((exercise) => {
      const deltaLabel =
        exercise.previousScore !== null && exercise.latestScore !== null
          ? `${exercise.scoreLabel} ${formatSignedMetricValue(
              exercise.latestScore - exercise.previousScore,
              exercise.scoreUnit,
            )}`
          : null

      return {
      id: exercise.exerciseKey,
      label: exercise.exerciseName,
      metaLines: [
        exercise.latestScore !== null
          ? `${exercise.scoreLabel} ${formatMetricValue(exercise.latestScore, exercise.scoreUnit)} · ${exercise.sampleCount} logs`
          : `${exercise.sampleCount} logs`,
        exercise.benchmarkComparison
          ? `Avg ${formatRangeValue(
              exercise.benchmarkComparison.benchmarkRange,
              exercise.benchmarkComparison.measurementUnit,
            )} · ${formatSignedNumber(
              exercise.benchmarkComparison.comparisonPercent,
              0,
            )}% vs avg`
          : 'No peer benchmark for this exercise yet',
        exercise.latestVolumeKg !== null || exercise.previousVolumeKg !== null
          ? `Volume ${formatSignedMetricValue(
              (exercise.latestVolumeKg ?? 0) - (exercise.previousVolumeKg ?? 0),
              'kg',
            )}`
          : null,
      ].filter(Boolean) as string[],
      tone:
        exercise.coefficient > 0.03
          ? ('positive' as const)
          : exercise.coefficient < -0.03
            ? ('negative' as const)
            : ('neutral' as const),
      valueMeta:
        deltaLabel && exercise.benchmarkComparison
          ? `${deltaLabel} · ${formatSignedMetricValue(
              exercise.benchmarkComparison.comparisonDelta,
              exercise.benchmarkComparison.measurementUnit === 'minutes'
                ? 'min'
                : exercise.benchmarkComparison.measurementUnit,
            )}`
          : deltaLabel ??
            (exercise.benchmarkComparison
              ? formatSignedMetricValue(
                  exercise.benchmarkComparison.comparisonDelta,
                  exercise.benchmarkComparison.measurementUnit === 'minutes'
                    ? 'min'
                    : exercise.benchmarkComparison.measurementUnit,
                )
              : null),
      value: formatCoefficient(exercise.coefficient),
    }})
  }

  return muscles.slice(0, 8).map((muscle) => ({
    id: muscle.slug,
    label: muscle.label,
    metaLines: [
      muscle.exerciseNames.length > 0
        ? muscle.exerciseNames.slice(0, 2).join(', ')
        : `${muscle.sampleCount} logs`,
    ],
    tone:
      muscle.coefficient > 0.03
        ? ('positive' as const)
        : muscle.coefficient < -0.03
          ? ('negative' as const)
          : ('neutral' as const),
    valueMeta: null,
    value: formatCoefficient(muscle.coefficient),
  }))
}

export default function ProgramProgressionPanel({
  exerciseStatsStore,
  fitnessProfile,
  mainProgram,
  mainProgramStats,
  onUpdateStatsPreferences,
  programDayLogs,
  statsPreferences,
  workoutLogs,
}: ProgramProgressionPanelProps) {
  if (!mainProgram) {
    return (
      <section className="section-card">
        <div className="empty-state">
          <h3>No main program selected</h3>
          <p>Select a main program to unlock program-specific stats.</p>
        </div>
      </section>
    )
  }

  const programRange = statsPreferences.programMetricRanges.frequency ?? '180d'
  const programPrimaryChart = statsPreferences.programPrimaryChart
  const programPoints = buildProgramSessionPoints(
    mainProgram.id,
    programDayLogs,
    workoutLogs,
    programRange,
  )
  const strengthRange = statsPreferences.muscleProgressRange
  const strengthPoints = buildProgramSessionPoints(
    mainProgram.id,
    programDayLogs,
    workoutLogs,
    strengthRange,
  )
  const weeklyBars = buildWeeklyFrequency(programPoints)
  const plannedSessionsPerWeek = derivePlannedSessionsPerWeek(
    mainProgram,
    fitnessProfile.weeklyWorkoutTarget,
  )
  const volumeDelta = summarizeTrend(strengthPoints.map((point) => point.totalVolumeKg))
  const completionAverage =
    strengthPoints.reduce((total, point) => total + point.completionRatio, 0) /
    Math.max(strengthPoints.length, 1)
  const durationAverage =
    strengthPoints.reduce((total, point) => total + point.durationMinutes, 0) /
    Math.max(strengthPoints.length, 1)
  const latestProgramPoint = programPoints.at(-1) ?? null
  const latestStrengthPoint = strengthPoints.at(-1) ?? null
  const exerciseBreakdown = buildExerciseProgressionBreakdown(
    mainProgram.id,
    exerciseStatsStore,
    strengthRange,
    fitnessProfile,
  )
  const muscleBreakdown = buildMuscleProgressionBreakdown(exerciseBreakdown)
  const progressProfile = buildMuscleProgressProfile(muscleBreakdown)
  const topGainer =
    [...muscleBreakdown]
      .filter((entry) => entry.coefficient > 0.01)
      .sort((left, right) => right.coefficient - left.coefficient)[0] ?? null
  const topLagger =
    [...muscleBreakdown]
      .filter((entry) => entry.coefficient < -0.01)
      .sort((left, right) => left.coefficient - right.coefficient)[0] ?? null
  const breakdownRows = buildBreakdownRows(
    statsPreferences.muscleProgressView,
    exerciseBreakdown,
    muscleBreakdown,
  )

  function updateProgramRange(range: StatsRangePreset) {
    onUpdateStatsPreferences((currentPreferences) => ({
      ...currentPreferences,
      programMetricRanges: {
        ...currentPreferences.programMetricRanges,
        frequency: range,
      },
    }))
  }

  function updateProgramPrimaryChart(view: ProgramPrimaryChartView) {
    onUpdateStatsPreferences((currentPreferences) => ({
      ...currentPreferences,
      programPrimaryChart: view,
    }))
  }

  function updateStrengthRange(range: StatsRangePreset) {
    onUpdateStatsPreferences((currentPreferences) => ({
      ...currentPreferences,
      muscleProgressRange: range,
    }))
  }

  function updateBreakdownView(view: StatsPreferences['muscleProgressView']) {
    onUpdateStatsPreferences((currentPreferences) => ({
      ...currentPreferences,
      muscleProgressView: view,
    }))
  }

  if (!programPoints.length && !exerciseBreakdown.length) {
    return (
      <section className="section-card">
        <div className="section-header">
          <div>
            <p className="kicker">Program</p>
            <h3>{mainProgram.name}</h3>
            <p className="muted">
              Finish workouts from this program to unlock frequency, strength, and muscle
              progression stats.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <article className="chart-card chart-card--compact">
        <div className="chart-card__header chart-card__header--stacked">
          <div>
            <p className="kicker">Program Chart</p>
            <h4>
              {programPrimaryChart === 'sets'
                ? 'Total exercise volume by session'
                : 'Sessions per week'}
            </h4>
            <p className="muted">
              {mainProgramStats?.totalCompletions ?? 0} completions / planned{' '}
              {plannedSessionsPerWeek} day{plannedSessionsPerWeek === 1 ? '' : 's'} per week
            </p>
          </div>
          <div className="chart-card__toolbar">
            <div className="segmented-control segmented-control--two chart-card__toggle">
              <button
                type="button"
                className={programPrimaryChart === 'sets' ? 'is-active' : ''}
                onClick={() => updateProgramPrimaryChart('sets')}
              >
                Sets
              </button>
              <button
                type="button"
                className={programPrimaryChart === 'frequency' ? 'is-active' : ''}
                onClick={() => updateProgramPrimaryChart('frequency')}
              >
                Days
              </button>
            </div>
            <div className="mini-chip-row">
              {statsRangePresetOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    option.value === programRange ? 'chip-button is-active' : 'chip-button'
                  }
                  onClick={() => updateProgramRange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {programPrimaryChart === 'sets' ? (
          programPoints.length ? (
            <LineChart
              className="chart-card__chart chart-card__chart--flush"
              colors={['#0ea5e9']}
              height={216}
              margin={{ top: 6, right: 0, bottom: 18, left: 0 }}
              series={[
                {
                  area: true,
                  data: programPoints.map((point) => point.totalSetCount),
                  label: 'Sets',
                  showMark: false,
                },
              ]}
              xAxis={[
                {
                  data: programPoints.map((point) => point.label),
                  scaleType: 'point',
                },
              ]}
              yAxis={[{ min: 0, width: 32 }]}
            />
          ) : (
            <div className="empty-state compact-empty-state">
              <h3>No set volume yet</h3>
              <p>Complete at least one tracked workout to chart logged set volume.</p>
            </div>
          )
        ) : weeklyBars.length ? (
          <div className="chart-card__chart chart-card__chart--flush">
            <ChartsContainer
              height={216}
              margin={{ top: 6, right: 0, bottom: 18, left: 0 }}
              series={[
                {
                  color: '#7c3aed',
                  data: weeklyBars.map((entry) => entry.sessions),
                  label: 'Sessions',
                  type: 'bar',
                },
              ]}
              xAxis={[
                {
                  data: weeklyBars.map((entry) => entry.label),
                  id: 'weeks',
                  scaleType: 'band',
                },
              ]}
              yAxis={[
                {
                  id: 'sessions',
                  min: 0,
                  width: 32,
                },
              ]}
            >
              <BarPlot />
              <ChartsXAxis axisId="weeks" />
              <ChartsYAxis axisId="sessions" />
              {plannedSessionsPerWeek > 0 ? (
                <ChartsReferenceLine
                  label={`Plan ${plannedSessionsPerWeek}`}
                  lineStyle={{ stroke: '#f97316', strokeDasharray: '6 4', strokeWidth: 2 }}
                  y={plannedSessionsPerWeek}
                />
              ) : null}
              <ChartsTooltip trigger="axis" />
            </ChartsContainer>
          </div>
        ) : (
          <div className="empty-state compact-empty-state">
            <h3>No session frequency yet</h3>
            <p>Complete at least one tracked workout to chart weekly consistency.</p>
          </div>
        )}
      </article>

      <div className="trend-tile-grid program-progress-grid">
        <article className="trend-tile trend-tile--neutral">
          <span className="trend-tile__icon" aria-hidden="true">
            <BarChart3 size={16} />
          </span>
          <span className="trend-tile__label">Volume</span>
          <strong>{formatVolumeValue(latestStrengthPoint?.totalVolumeKg ?? null)}</strong>
          <div className="trend-tile__footer">
            <span className="trend-tile__delta">
              <span>{formatSignedNumber(volumeDelta, 0)} kg</span>
            </span>
            <span className="trend-tile__status">Recent delta</span>
          </div>
        </article>

        <article className="trend-tile trend-tile--neutral">
          <span className="trend-tile__icon" aria-hidden="true">
            <Activity size={16} />
          </span>
          <span className="trend-tile__label">Execution</span>
          <strong>{Math.round(completionAverage)}%</strong>
          <div className="trend-tile__footer">
            <span className="trend-tile__delta">
              <span>{formatSetCountValue(latestProgramPoint?.totalSetCount ?? null)}</span>
            </span>
            <span className="trend-tile__status">{Math.round(durationAverage)} min avg</span>
          </div>
        </article>
      </div>

      <MuscleVisualizer
        className="progression-muscle-card"
        compact
        detailSheetDescription="Positive values mean the later block of logged performance is stronger than the earlier block; negative values highlight lagging areas."
        detailsMode="sheet"
        emptyDescription="Complete more logged sessions to map growth vs lagging muscle groups."
        footer={
          <>
            <div className="progression-breakdown__header">
              <div>
                <strong>Breakdown</strong>
                <p className="muted">
                  Coefficient compares later average performance against the earlier average and
                  dampens noisy low-sample lifts.
                </p>
              </div>
              <div className="segmented-control segmented-control--two progression-breakdown__toggle">
                <button
                  type="button"
                  className={statsPreferences.muscleProgressView === 'muscles' ? 'is-active' : ''}
                  onClick={() => updateBreakdownView('muscles')}
                >
                  Muscles
                </button>
                <button
                  type="button"
                  className={statsPreferences.muscleProgressView === 'exercises' ? 'is-active' : ''}
                  onClick={() => updateBreakdownView('exercises')}
                >
                  Exercises
                </button>
              </div>
            </div>

            <div className="stats-mini-table">
              {breakdownRows.length ? (
                breakdownRows.map((row) => (
                  <div key={row.id} className={`stats-mini-table__row is-${row.tone}`}>
                    <div className="stats-mini-table__copy">
                      <strong>{row.label}</strong>
                      {row.metaLines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </div>
                    <div className="stats-mini-table__value-stack">
                      <span className="stats-mini-table__value">{row.value}</span>
                      {row.valueMeta ? (
                        <span className="stats-mini-table__value-meta">{row.valueMeta}</span>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state compact-empty-state">
                  <p>No strength samples yet for this range.</p>
                </div>
              )}
            </div>
          </>
        }
        gender={fitnessProfile.gender}
        kicker="Strength"
        profile={progressProfile}
        showSheetPreview={false}
        title="Growth vs lagging map"
        toolbar={
          <>
            <div className="mini-chip-row">
              {statsRangePresetOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    option.value === strengthRange ? 'chip-button is-active' : 'chip-button'
                  }
                  onClick={() => updateStrengthRange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="progression-muscle-summary">
              <span className="pill pill--subtle">
                Top gainer:{' '}
                {topGainer ? `${topGainer.label} ${formatCoefficient(topGainer.coefficient)}` : 'N/A'}
              </span>
              <span className="pill pill--subtle">
                Lagging:{' '}
                {topLagger ? `${topLagger.label} ${formatCoefficient(topLagger.coefficient)}` : 'N/A'}
              </span>
            </div>
          </>
        }
      />
    </>
  )
}
