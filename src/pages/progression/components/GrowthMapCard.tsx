import { Activity, ChartColumnIncreasing } from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { SparkLineChart } from '@mui/x-charts/SparkLineChart'
import type { BodyPartProgressKey, TrendSummary } from '../../../lib/progression'
import { bodyPartProgressLabels } from '../../../lib/progression'

type BodyPartTile = {
  bodyPartKey: BodyPartProgressKey
  range: '30d' | '90d' | '180d' | '365d' | 'all'
  series: Array<{ label: string; value: number }>
  summary: TrendSummary & { benchmark: unknown }
}

type GrowthMapCardProps = {
  bodyPartImages: Record<BodyPartProgressKey, string>
  bodyPartTiles: BodyPartTile[]
  entryCoverage: number
  formatBodyPartValue: (value: number | null) => string
  formatMonthlyRate: (value: number | null) => string
  onOpenBodyPart: (key: BodyPartProgressKey) => void
  renderTrendGlyph: (direction: TrendSummary['direction']) => ReactNode
}

export default function GrowthMapCard({
  bodyPartImages,
  bodyPartTiles,
  entryCoverage,
  formatBodyPartValue,
  formatMonthlyRate,
  onOpenBodyPart,
  renderTrendGlyph,
}: GrowthMapCardProps) {
  const [mode, setMode] = useState<'chart' | 'map'>('map')

  return (
    <section className="section-card stats-section-card">
      <div className="section-header">
        <div>
          <p className="kicker">Body Parts</p>
          <h3>Growth map</h3>
          <p className="muted">
            Tap a body-part card to add a measurement or inspect its trend.
          </p>
        </div>
        <div className="progression-growth-map__header-actions">
          <div className="progression-growth-map__mode-toggle" role="group" aria-label="Growth map mode">
            <button
              type="button"
              className={mode === 'map' ? 'ghost-button icon-button is-active' : 'ghost-button icon-button'}
              onClick={() => setMode('map')}
              aria-label="Map view"
              title="Map view"
            >
              <Activity size={16} />
            </button>
            <button
              type="button"
              className={mode === 'chart' ? 'ghost-button icon-button is-active' : 'ghost-button icon-button'}
              onClick={() => setMode('chart')}
              aria-label="Chart view"
              title="Chart view"
            >
              <ChartColumnIncreasing size={16} />
            </button>
          </div> 
          <span className="pill pill--subtle">{entryCoverage} areas tracked</span>
        </div>
      </div>

      <div className="body-part-grid">
        {bodyPartTiles.map(({ bodyPartKey, series, summary }) => {
          const tileStyle = {
            '--body-part-image': `url("${bodyPartImages[bodyPartKey]}")`,
          } as CSSProperties

          return (
            <button
              key={bodyPartKey}
              type="button"
              className={`body-part-tile body-part-tile--${summary.tone} ${
                mode === 'chart' ? 'body-part-tile--chart' : ''
              }`}
              style={tileStyle}
              onClick={() => onOpenBodyPart(bodyPartKey)}
            >
              <div className="body-part-tile__backdrop" aria-hidden="true" />
              <div className="body-part-tile__content">
                <div className="body-part-tile__header">
                  <span>{bodyPartProgressLabels[bodyPartKey]}</span>
                  {renderTrendGlyph(summary.direction)}
                </div>
                <strong>{formatBodyPartValue(summary.current)}</strong>
                {mode === 'chart' ? (
                  series.length > 1 ? (
                    <div className="body-part-tile__chart" aria-hidden="true">
                      <SparkLineChart
                        area
                        color={
                          summary.tone === 'positive'
                            ? '#22c55e'
                            : summary.tone === 'negative'
                              ? '#ef4444'
                              : '#0ea5e9'
                        }
                        data={series.map((point) => point.value)}
                        height={72}
                        margin={{ top: 6, right: 2, bottom: 6, left: 2 }}
                        showHighlight={false}
                        showTooltip={false}
                        xAxis={{
                          data: series.map((point) => point.label),
                          scaleType: 'point',
                        }}
                      />
                    </div>
                  ) : (
                    <div className="body-part-tile__chart-empty">
                      Save more measurements to plot this area.
                    </div>
                  )
                ) : null}
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
  )
}
