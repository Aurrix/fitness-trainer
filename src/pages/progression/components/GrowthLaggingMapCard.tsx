import { SparkLineChart } from '@mui/x-charts/SparkLineChart'
import type { StatsPreferences, StatsRangePreset } from '../../../entities/stats-preferences'
import { statsRangePresetOptions } from '../../../entities/stats-preferences'
import type { FitnessProfileGender } from '../../../lib/fitness-profile'
import type { MuscleProfile } from '../../../lib/muscles'
import MuscleVisualizer from '../../../components/MuscleVisualizer'

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

type GrowthLaggingMapCardProps = {
  breakdownRows: BreakdownRow[]
  gender: FitnessProfileGender
  onSelectInfo: (info: BreakdownInfo) => void
  onUpdateBreakdownView: (view: StatsPreferences['muscleProgressView']) => void
  onUpdateRange: (range: StatsRangePreset) => void
  onUseDefaultView: () => void
  profile: MuscleProfile
  selectedRange: StatsRangePreset
  showTrendPreview: boolean
  summaryItems: Array<{ label: string; value: string }>
  view: StatsPreferences['muscleProgressView']
}

export default function GrowthLaggingMapCard({
  breakdownRows,
  gender,
  onSelectInfo,
  onUpdateBreakdownView,
  onUpdateRange,
  onUseDefaultView,
  profile,
  selectedRange,
  showTrendPreview,
  summaryItems,
  view,
}: GrowthLaggingMapCardProps) {
  const isNeglectView = view === 'neglect'

  return (
    <MuscleVisualizer
      className="progression-muscle-card"
      compact
      detailSheetDescription={
        isNeglectView
          ? 'Lower values identify muscle groups with fewer planned primary sets in the current main program.'
          : 'Positive values mean the later block of logged performance is stronger than the earlier block; negative values highlight lagging areas.'
      }
      detailsMode="sheet"
      emptyDescription={
        isNeglectView
          ? 'Add exercises with resolved primary muscle targets to inspect neglected areas.'
          : 'Complete more logged sessions to map growth vs lagging muscle groups.'
      }
      footer={
        <>
          <div className="progression-breakdown__header">
            <div>
              <strong>Breakdown</strong>
              <p className="muted">
                {isNeglectView
                  ? 'Primary set coverage counts planned sets where a muscle group is a main target.'
                  : 'Coefficient compares later average performance against the earlier average and dampens noisy low-sample lifts.'}
              </p>
            </div>
            <div className="segmented-control progression-breakdown__toggle">
              <button
                type="button"
                className={view === 'muscles' ? 'is-active' : ''}
                onClick={() => onUpdateBreakdownView('muscles')}
              >
                Muscles
              </button>
              <button
                type="button"
                className={view === 'exercises' ? 'is-active' : ''}
                onClick={() => onUpdateBreakdownView('exercises')}
              >
                Exercises
              </button>
              <button
                type="button"
                className={view === 'neglect' ? 'is-active' : ''}
                onClick={() => onUpdateBreakdownView('neglect')}
              >
                Neglect
              </button>
            </div>
          </div>

          <div className="stats-mini-table">
            {breakdownRows.length ? (
              breakdownRows.map((row) => (
                <div
                  key={row.id}
                  className={`stats-mini-table__row is-${row.tone} ${
                    row.badges.length === 0 ? 'stats-mini-table__row--compact' : ''
                  }`}
                >
                  <div className="stats-mini-table__copy">
                    <strong>{row.label}</strong>
                    {row.metaLines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                    {row.badges.length ? (
                      <div className="stats-mini-table__badges">
                        {row.badges.map((badge) => (
                          <button
                            key={badge.label}
                            type="button"
                            className={`stats-mini-table__badge stats-mini-table__badge-button is-${badge.tone}`}
                            onClick={() => onSelectInfo(badge)}
                          >
                            {badge.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="stats-mini-table__value-stack">
                    <button
                      type="button"
                      className="stats-mini-table__value-button"
                      onClick={() => onSelectInfo(row)}
                    >
                      <span className="stats-mini-table__value">{row.value}</span>
                    </button>
                    {row.valueMeta ? (
                      <span className="stats-mini-table__value-meta">{row.valueMeta}</span>
                    ) : null}
                    {showTrendPreview && row.sparkline?.data.length ? (
                      <div className="stats-mini-table__sparkline" aria-hidden="true">
                        <SparkLineChart
                          area
                          color={row.sparkline.color}
                          data={row.sparkline.data.map((value) => value ?? 0)}
                          height={30}
                          margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
                          showHighlight={false}
                          showTooltip={false}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state compact-empty-state">
                <p>
                  {isNeglectView
                    ? 'No primary-set coverage found for this program.'
                    : 'No strength samples yet for this range.'}
                </p>
              </div>
            )}
          </div>
        </>
      }
      gender={gender}
      kicker={isNeglectView ? 'Coverage' : 'Strength'}
      profile={profile}
      showSheetPreview={false}
      title={isNeglectView ? 'Primary set coverage' : 'Growth vs lagging map'}
      toolbar={
        <>
          {!isNeglectView ? (
            <div className="mini-chip-row">
              <button
                type="button"
                className={showTrendPreview ? 'chip-button' : 'chip-button is-active'}
                onClick={onUseDefaultView}
              >
                D
              </button>
              {statsRangePresetOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    showTrendPreview && option.value === selectedRange
                      ? 'chip-button is-active'
                      : 'chip-button'
                  }
                  onClick={() => onUpdateRange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
          <div className="progression-muscle-summary">
            {summaryItems.map((item) => (
              <span key={item.label} className="pill pill--subtle">
                {item.label}: {item.value}
              </span>
            ))}
          </div>
        </>
      }
    />
  )
}
