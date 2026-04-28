import { useState } from 'react'
import { Activity, BarChart3 } from 'lucide-react'
import type { Slug } from '@mjcdev/react-body-highlighter'
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
  buildExerciseProgressTimeline,
  buildMuscleProgressionBreakdown,
  buildMuscleProgressProfile,
  buildMuscleProgressTimeline,
  buildProgramSessionPoints,
  buildWeeklyFrequency,
  derivePlannedSessionsPerWeek,
  formatSignedNumber,
  summarizeTrend,
  type ExerciseProgressEntry,
  type MuscleProgressEntry,
} from '../lib/progression'
import type { ProgramStatsRecord } from '../services/program-stats'
import BottomSheet from './BottomSheet'
import GrowthLaggingMapCard from '../pages/progression/components/GrowthLaggingMapCard'

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

type BreakdownBadge = {
  description: string
  details: string[]
  kicker: string
  label: string
  title: string
  tone: 'negative' | 'neutral' | 'positive'
}

type BreakdownRow = {
  badges: BreakdownBadge[]
  description: string
  details: string[]
  id: string
  kicker: string
  label: string
  metaLines: string[]
  sparkline?: {
    color: string
    data: Array<number | null>
  } | null
  tone: 'negative' | 'neutral' | 'positive'
  title: string
  value: string
  valueMeta: string | null
}

type BreakdownInfo = Pick<BreakdownRow, 'description' | 'details' | 'kicker' | 'title'> | Pick<
  BreakdownBadge,
  'description' | 'details' | 'kicker' | 'title'
>

function formatPercentValue(value: number) {
  return `${formatSignedNumber(value * 100, 0)}%`
}

function formatConfidenceLabel(value: number) {
  return `${Math.round(value * 100)}% confidence weight`
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
      const rawRelativeChange =
        (exercise.laterAverageScore - exercise.earlierAverageScore) /
        Math.max(Math.abs(exercise.earlierAverageScore), 1)
      const volumeDelta =
        exercise.latestVolumeKg !== null || exercise.previousVolumeKg !== null
          ? (exercise.latestVolumeKg ?? 0) - (exercise.previousVolumeKg ?? 0)
          : null
      const comparisonUnit =
        exercise.benchmarkComparison?.measurementUnit === 'minutes'
          ? 'min'
          : exercise.benchmarkComparison?.measurementUnit ?? ''

      return {
        badges: [
          exercise.benchmarkComparison
            ? {
                description:
                  'Compares your latest benchmark-relevant performance against the midpoint of the matching peer average range for this exercise.',
                details: [
                  `Benchmark range: ${formatRangeValue(
                    exercise.benchmarkComparison.benchmarkRange,
                    exercise.benchmarkComparison.measurementUnit,
                  )}`,
                  `Latest value: ${formatMetricValue(
                    exercise.benchmarkComparison.latestValue,
                    comparisonUnit,
                  )}`,
                  `Difference vs midpoint: ${formatSignedMetricValue(
                    exercise.benchmarkComparison.comparisonDelta,
                    comparisonUnit,
                  )}`,
                  `Relative difference: ${formatSignedNumber(
                    exercise.benchmarkComparison.comparisonPercent,
                    0,
                  )}%`,
                ],
                kicker: 'Peer Average',
                label: `Avg ${formatSignedNumber(
                  exercise.benchmarkComparison.comparisonPercent,
                  0,
                )}%`,
                title: `${exercise.exerciseName} average comparison`,
                tone: exercise.benchmarkComparison.comparisonTone,
              }
            : null,
          deltaLabel
            ? {
                description:
                  'Shows how the latest logged performance for this exercise changed versus the previous logged performance.',
                details: [
                  `Previous: ${formatMetricValue(
                    exercise.previousScore,
                    exercise.scoreUnit,
                  )}`,
                  `Latest: ${formatMetricValue(exercise.latestScore, exercise.scoreUnit)}`,
                  `Change: ${deltaLabel}`,
                ],
                kicker: 'Latest Change',
                label: deltaLabel,
                title: `${exercise.exerciseName} latest ${exercise.scoreLabel.toLowerCase()} change`,
                tone:
                  exercise.previousScore !== null && exercise.latestScore !== null
                    ? exercise.latestScore > exercise.previousScore
                      ? 'positive'
                      : exercise.latestScore < exercise.previousScore
                        ? 'negative'
                        : 'neutral'
                    : 'neutral',
              }
            : null,
          volumeDelta !== null
            ? {
                description:
                  'Shows how the latest logged session volume changed versus the previous logged session volume for this exercise.',
                details: [
                  `Previous volume: ${formatVolumeValue(exercise.previousVolumeKg)}`,
                  `Latest volume: ${formatVolumeValue(exercise.latestVolumeKg)}`,
                  `Change: ${formatSignedMetricValue(volumeDelta, 'kg')}`,
                ],
                kicker: 'Session Volume',
                label: `Vol ${formatSignedMetricValue(volumeDelta, 'kg')}`,
                title: `${exercise.exerciseName} volume change`,
                tone: volumeDelta > 0 ? 'positive' : volumeDelta < 0 ? 'negative' : 'neutral',
              }
            : null,
        ].filter((badge): badge is BreakdownBadge => badge !== null),
        description:
          'Progress coefficient compares the later average exercise performance against the earlier average, then dampens the result when the sample size is small.',
        details: [
          `Earlier average ${exercise.scoreLabel}: ${formatMetricValue(
            exercise.earlierAverageScore,
            exercise.scoreUnit,
          )}`,
          `Later average ${exercise.scoreLabel}: ${formatMetricValue(
            exercise.laterAverageScore,
            exercise.scoreUnit,
          )}`,
          `Raw relative change: ${formatPercentValue(rawRelativeChange)}`,
          `${formatConfidenceLabel(exercise.confidence)} based on ${exercise.sampleCount} logged sessions`,
          `Final coefficient: ${formatCoefficient(exercise.coefficient)}`,
        ],
        id: exercise.exerciseKey,
        kicker: 'Exercise Progress',
        label: exercise.exerciseName,
        metaLines: [
          exercise.latestScore !== null
            ? `${exercise.scoreLabel} ${formatMetricValue(exercise.latestScore, exercise.scoreUnit)} / ${exercise.sampleCount} logs`
            : `${exercise.sampleCount} logs`,
          exercise.benchmarkComparison
            ? `Average ${formatRangeValue(
                exercise.benchmarkComparison.benchmarkRange,
                exercise.benchmarkComparison.measurementUnit,
              )} / ${formatSignedMetricValue(
                exercise.benchmarkComparison.comparisonDelta,
                comparisonUnit,
              )} vs midpoint`
            : 'No peer benchmark for this exercise yet',
        ],
        tone:
          exercise.coefficient > 0.03
            ? ('positive' as const)
            : exercise.coefficient < -0.03
              ? ('negative' as const)
              : ('neutral' as const),
        sparkline: null,
        title: `${exercise.exerciseName} progression coefficient`,
        valueMeta: null,
        value: formatCoefficient(exercise.coefficient),
      }
    })
  }

  return muscles.slice(0, 8).map((muscle) => ({
    badges: [],
    description:
      'Muscle coefficient is the weighted average of exercise progression coefficients for exercises that target this muscle.',
    details: [
      `Contributing exercises: ${muscle.contributorCount}`,
      `Logged samples across contributors: ${muscle.sampleCount}`,
      `Uses exercise target coefficients to weight chest, back, arm, leg and similar overlap`,
      `Final coefficient: ${formatCoefficient(muscle.coefficient)}`,
    ],
    id: muscle.slug,
    kicker: 'Muscle Progress',
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
    sparkline: null,
    title: `${muscle.label} progression coefficient`,
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
  const [selectedInfo, setSelectedInfo] = useState<BreakdownInfo | null>(null)
  const [showStrengthTrendPreview, setShowStrengthTrendPreview] = useState(false)

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
  const muscleTimeline = buildMuscleProgressTimeline(
    mainProgram.id,
    exerciseStatsStore,
    strengthRange,
    muscleBreakdown.slice(0, 8).map((entry) => entry.slug),
  )
  const exerciseTimeline = buildExerciseProgressTimeline(
    mainProgram.id,
    exerciseStatsStore,
    strengthRange,
    exerciseBreakdown.slice(0, 8).map((entry) => entry.exerciseKey),
  )
  const muscleTimelineLookup = new Map(
    muscleTimeline.series.map((entry, index) => [
      entry.slug,
      {
        color: ['#f97316', '#0ea5e9', '#22c55e', '#7c3aed', '#ef4444', '#14b8a6'][index % 6],
        data: entry.data,
      },
    ]),
  )
  const exerciseTimelineLookup = new Map(
    exerciseTimeline.series.map((entry, index) => [
      entry.exerciseKey,
      {
        color: ['#f97316', '#0ea5e9', '#22c55e', '#7c3aed', '#ef4444', '#14b8a6'][index % 6],
        data: entry.data,
      },
    ]),
  )
  const breakdownRows = buildBreakdownRows(
    statsPreferences.muscleProgressView,
    exerciseBreakdown,
    muscleBreakdown,
  ).map((row) => ({
    ...row,
    sparkline:
      statsPreferences.muscleProgressView === 'exercises'
        ? (exerciseTimelineLookup.get(row.id) ?? null)
        : (muscleTimelineLookup.get(row.id as Slug) ?? null),
  }))
  const showVolumeTrendChart = strengthPoints.length > 10
  const showExecutionTrendChart = strengthPoints.length > 10

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
    setShowStrengthTrendPreview(true)
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

  function showDefaultStrengthView() {
    setShowStrengthTrendPreview(false)
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
          {showVolumeTrendChart ? (
            <LineChart
              className="trend-tile__chart"
              colors={['#f97316']}
              height={72}
              margin={{ top: 6, right: 0, bottom: 0, left: 0 }}
              series={[
                {
                  area: true,
                  data: strengthPoints.map((point) => point.totalVolumeKg ?? 0),
                  label: 'Volume',
                  showMark: false,
                },
              ]}
              xAxis={[
                {
                  data: strengthPoints.map((point) => point.label),
                  scaleType: 'point',
                },
              ]}
              yAxis={[{ width: 0 }]}
            />
          ) : null}
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
          {showExecutionTrendChart ? (
            <LineChart
              className="trend-tile__chart"
              colors={['#0ea5e9']}
              height={72}
              margin={{ top: 6, right: 0, bottom: 0, left: 0 }}
              series={[
                {
                  area: true,
                  data: strengthPoints.map((point) => point.completionRatio),
                  label: 'Completion',
                  showMark: false,
                },
              ]}
              xAxis={[
                {
                  data: strengthPoints.map((point) => point.label),
                  scaleType: 'point',
                },
              ]}
              yAxis={[{ max: 100, min: 0, width: 0 }]}
            />
          ) : null}
          <div className="trend-tile__footer">
            <span className="trend-tile__delta">
              <span>{formatSetCountValue(latestProgramPoint?.totalSetCount ?? null)}</span>
            </span>
            <span className="trend-tile__status">{Math.round(durationAverage)} min avg</span>
          </div>
        </article>
      </div>

      <GrowthLaggingMapCard
        breakdownRows={breakdownRows}
        gender={fitnessProfile.gender}
        onSelectInfo={setSelectedInfo}
        onUpdateBreakdownView={updateBreakdownView}
        onUpdateRange={updateStrengthRange}
        onUseDefaultView={showDefaultStrengthView}
        profile={progressProfile}
        selectedRange={strengthRange}
        showTrendPreview={showStrengthTrendPreview}
        topGainerLabel={
          topGainer ? `${topGainer.label} ${formatCoefficient(topGainer.coefficient)}` : 'N/A'
        }
        topLaggerLabel={
          topLagger ? `${topLagger.label} ${formatCoefficient(topLagger.coefficient)}` : 'N/A'
        }
        view={statsPreferences.muscleProgressView}
      />

      {selectedInfo ? (
        <BottomSheet
          description={selectedInfo.description}
          kicker={selectedInfo.kicker}
          onClose={() => setSelectedInfo(null)}
          title={selectedInfo.title}
        >
          <div className="info-sheet-list">
            {selectedInfo.details.map((detail) => (
              <div key={detail} className="info-sheet-list__item">
                {detail}
              </div>
            ))}
          </div>
        </BottomSheet>
      ) : null}
    </>
  )
}
