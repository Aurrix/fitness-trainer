import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { RefreshCw } from 'lucide-react'
import Body, { type Slug } from '@mjcdev/react-body-highlighter'
import BottomSheet from './BottomSheet'
import type { FitnessProfileGender } from '../lib/fitness-profile'
import { muscleLabels, type MuscleProfile } from '../lib/muscles'

type MuscleVisualizerProps = {
  className?: string
  centerHeader?: boolean
  compact?: boolean
  description?: string
  detailSheetDescription?: string
  detailsMode?: 'inline' | 'sheet'
  emptyDescription?: string
  emptyTitle?: string
  footer?: ReactNode
  gender?: FitnessProfileGender
  headerActions?: ReactNode
  headerLeading?: ReactNode
  headerTrailing?: ReactNode
  hideHeader?: boolean
  holdDetailLabel?: string
  intensityLegendLabel?: string
  kicker?: string
  onSelectMuscle?: (slug: Slug) => void
  profile: MuscleProfile
  selectedMuscle?: Slug | null
  showAllMuscles?: boolean
  showIntensityLegend?: boolean
  showSheetPreview?: boolean
  title: string
  toolbar?: ReactNode
}

const LONG_PRESS_MS = 480
const muscleIntensityColors = [
  '#f8fbff',
  '#e8f4ff',
  '#cfeaff',
  '#9fd3ff',
  '#63b6ff',
  '#2f8cff',
  '#f7b267',
  '#f97341',
  '#9a3412',
]

const frontVisibleMuscleSlugs = new Set<Slug>([
  'abs',
  'adductors',
  'ankles',
  'biceps',
  'calves',
  'chest',
  'deltoids',
  'feet',
  'forearm',
  'hands',
  'hair',
  'head',
  'knees',
  'neck',
  'obliques',
  'quadriceps',
  'tibialis',
  'trapezius',
  'triceps',
])

const backVisibleMuscleSlugs = new Set<Slug>([
  'adductors',
  'ankles',
  'calves',
  'deltoids',
  'feet',
  'forearm',
  'gluteal',
  'hamstring',
  'hands',
  'hair',
  'head',
  'knees',
  'lower-back',
  'neck',
  'trapezius',
  'triceps',
  'upper-back',
])

function formatMuscleScore(value: number) {
  if (Number.isInteger(value)) {
    return String(value)
  }

  if (value >= 10) {
    return value.toFixed(1)
  }

  return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

function getDefaultViewSide(profile: MuscleProfile) {
  const hasFrontVisibleMuscle = profile.data.some(
    (muscle) => muscle.slug && frontVisibleMuscleSlugs.has(muscle.slug),
  )
  const hasBackVisibleMuscle = profile.data.some(
    (muscle) => muscle.slug && backVisibleMuscleSlugs.has(muscle.slug),
  )

  return !hasFrontVisibleMuscle && hasBackVisibleMuscle ? 'back' : 'front'
}

function MuscleVisualizer({
  className,
  centerHeader = false,
  compact = false,
  description,
  detailSheetDescription,
  detailsMode = 'inline',
  emptyDescription = 'Add explicit muscle fields to show coverage more accurately.',
  emptyTitle = 'No muscle matches yet',
  footer,
  gender = 'male',
  headerActions,
  headerLeading,
  headerTrailing,
  hideHeader = false,
  holdDetailLabel = 'Hold body view to inspect muscle hits.',
  intensityLegendLabel = 'Very light blue shows lighter relative activation, while darker blue through dark orange marks higher weighted work in this view.',
  kicker = 'Muscle Visualizer',
  onSelectMuscle,
  profile,
  selectedMuscle = null,
  showAllMuscles = false,
  showIntensityLegend = false,
  showSheetPreview = true,
  title,
  toolbar,
}: MuscleVisualizerProps) {
  const defaultViewSide = getDefaultViewSide(profile)
  const profileSideSignature = profile.data
    .map((muscle) => muscle.slug ?? '')
    .sort()
    .join('|')
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [isHolding, setIsHolding] = useState(false)
  const [viewSideState, setViewSideState] = useState<{
    signature: string
    value: 'front' | 'back'
  }>(() => ({
    signature: profileSideSignature,
    value: defaultViewSide,
  }))
  const holdTimeoutRef = useRef<number | null>(null)
  const shouldIgnoreBodyPartClickRef = useRef(false)
  const viewSide =
    viewSideState.signature === profileSideSignature ? viewSideState.value : defaultViewSide
  const visibleMuscles = showAllMuscles ? profile.muscles : profile.topMuscles
  const detailMuscles = profile.muscles
  const selectableSlugs = new Set(profile.muscles.map((muscle) => muscle.slug))
  const knownSlugs = new Set(Object.keys(muscleLabels) as Slug[])
  const shouldShowSheetPreview = detailsMode === 'sheet' && showSheetPreview
  const hasInlineContent =
    Boolean(description) ||
    (shouldShowSheetPreview && visibleMuscles.length > 0) ||
    visibleMuscles.length === 0
  const classes = [
    'section-card',
    'visualizer-card',
    compact ? 'visualizer-card--compact' : '',
    detailsMode === 'sheet' ? 'visualizer-card--sheet-details' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current !== null) {
        window.clearTimeout(holdTimeoutRef.current)
      }
    }
  }, [])

  function clearHold() {
    if (holdTimeoutRef.current !== null) {
      console.debug('[MuscleVisualizer] clearing hold timeout', {
        hasSelectionHandler: Boolean(onSelectMuscle),
        isHolding,
        title,
        viewSide,
      })
    }

    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current)
      holdTimeoutRef.current = null
    }

    setIsHolding(false)
  }

  function handleVisualizerPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    console.debug('[MuscleVisualizer] pointer down', {
      button: event.button,
      detailsMode,
      hasDetailMuscles: detailMuscles.length > 0,
      hasSelectionHandler: Boolean(onSelectMuscle),
      pointerType: event.pointerType,
      targetTag: event.target instanceof HTMLElement ? event.target.tagName : 'unknown',
      title,
      viewSide,
    })

    if (detailsMode !== 'sheet' || !detailMuscles.length) {
      console.debug('[MuscleVisualizer] pointer down ignored: sheet details unavailable', {
        detailsMode,
        detailMuscles: detailMuscles.length,
      })
      return
    }

    if (event.pointerType === 'mouse' && event.button !== 0) {
      console.debug('[MuscleVisualizer] pointer down ignored: non-primary mouse button', {
        button: event.button,
      })
      return
    }

    // Preserve normal desktop clicks for selectable muscle actions.
    if (event.pointerType === 'mouse' && onSelectMuscle) {
      console.debug('[MuscleVisualizer] pointer down ignored: preserving desktop click selection')
      return
    }

    if ((event.target as HTMLElement).closest('button')) {
      console.debug('[MuscleVisualizer] pointer down ignored: nested button target')
      return
    }

    clearHold()
    shouldIgnoreBodyPartClickRef.current = false
    setIsHolding(true)
    console.debug('[MuscleVisualizer] starting hold timer', {
      longPressMs: LONG_PRESS_MS,
      title,
      viewSide,
    })
    holdTimeoutRef.current = window.setTimeout(() => {
      holdTimeoutRef.current = null
      setIsHolding(false)
      shouldIgnoreBodyPartClickRef.current = true
      console.debug('[MuscleVisualizer] hold timer completed, opening detail sheet', {
        title,
        viewSide,
      })
      setIsDetailSheetOpen(true)
    }, LONG_PRESS_MS)
  }

  function renderMuscleRows({
    interactive = false,
    onAfterSelect,
    muscles,
  }: {
    interactive?: boolean
    onAfterSelect?: () => void
    muscles: typeof detailMuscles
  }) {
    return muscles.map(({ slug, count }) =>
      interactive && onSelectMuscle ? (
        <button
          key={slug}
          type="button"
          className={`muscle-row muscle-row--interactive ${
            selectedMuscle === slug ? 'is-active' : ''
          }`}
          onClick={() => {
            onSelectMuscle(slug)
            onAfterSelect?.()
          }}
        >
          <span>{muscleLabels[slug]}</span>
          <strong>{formatMuscleScore(count)}</strong>
        </button>
      ) : (
        <div key={slug} className="muscle-row">
          <span>{muscleLabels[slug]}</span>
          <strong>{formatMuscleScore(count)}</strong>
        </div>
      ),
    )
  }

  return (
    <>
      <section className={classes}>
        {!hideHeader ? (
          <div
            className={`section-header visualizer-header ${
              centerHeader ? 'visualizer-header--balanced' : ''
            }`}
          >
            {centerHeader || headerLeading ? (
              <div className="visualizer-header__leading">{headerLeading}</div>
            ) : null}

            <div
              className={
                centerHeader
                  ? 'visualizer-header__copy is-centered'
                  : 'visualizer-header__copy'
              }
            >
              <p className="kicker">{kicker}</p>
              <h3>{title}</h3>
            </div>

            {centerHeader || headerTrailing ? (
              <div className="visualizer-header__trailing">{headerTrailing}</div>
            ) : null}

            {headerActions ? (
              <div className="visualizer-header__actions">{headerActions}</div>
            ) : null}
          </div>
        ) : null}

        {toolbar ? <div className="visualizer-toolbar">{toolbar}</div> : null}

        <div className="visualizer-layout">
          <div className="visualizer-stage">
            <div
              className={`visualizer-frame ${isHolding ? 'is-holding' : ''}`}
              onContextMenu={(event) => {
                if (detailsMode === 'sheet') {
                  event.preventDefault()
                }
              }}
              onPointerCancel={clearHold}
              onPointerDown={handleVisualizerPointerDown}
              onPointerLeave={clearHold}
              onPointerUp={clearHold}
            >
              <button
                type="button"
                className="visualizer-flip-button"
                onClick={() => {
                  setViewSideState((currentState) => {
                    const currentSide =
                      currentState.signature === profileSideSignature
                        ? currentState.value
                        : defaultViewSide

                    return {
                      signature: profileSideSignature,
                      value: currentSide === 'front' ? 'back' : 'front',
                    }
                  })
                }}
                aria-label={`Show ${viewSide === 'front' ? 'back' : 'front'} muscles`}
              >
                <RefreshCw size={15} />
              </button>

              <Body
                border="none"
                colors={muscleIntensityColors}
                data={profile.data}
                gender={gender}
                onBodyPartClick={(bodyPart) => {
                  const isKnownSlug = bodyPart.slug ? knownSlugs.has(bodyPart.slug) : false
                  const isSelectableSlug = bodyPart.slug
                    ? selectableSlugs.has(bodyPart.slug) ||
                      (Boolean(onSelectMuscle) && isKnownSlug)
                    : false

                  console.debug('[MuscleVisualizer] body part click', {
                    slug: bodyPart.slug ?? null,
                    isKnownSlug,
                    selectable: isSelectableSlug,
                    shouldIgnoreClick: shouldIgnoreBodyPartClickRef.current,
                    title,
                    viewSide,
                  })

                  if (shouldIgnoreBodyPartClickRef.current) {
                    shouldIgnoreBodyPartClickRef.current = false
                    console.debug('[MuscleVisualizer] body part click ignored after long press')
                    return
                  }

                  if (bodyPart.slug && isSelectableSlug) {
                    console.debug('[MuscleVisualizer] forwarding selected muscle', {
                      slug: bodyPart.slug,
                      title,
                    })
                    onSelectMuscle?.(bodyPart.slug)
                    return
                  }

                  console.debug('[MuscleVisualizer] body part click not forwarded', {
                    reason: bodyPart.slug ? 'slug-not-selectable' : 'missing-slug',
                    isKnownSlug,
                    slug: bodyPart.slug ?? null,
                    selectableSlugs: [...selectableSlugs],
                  })
                }}
                scale={compact ? 0.94 : 1.28}
                side={viewSide}
              />
            </div>

            {showIntensityLegend ? (
              <div className="visualizer-intensity-legend">
                <div
                  className="visualizer-intensity-legend__scale"
                  aria-hidden="true"
                />
                <div className="visualizer-intensity-legend__labels">
                  <span>Light</span>
                  <span>High</span>
                </div>
                <p className="visualizer-intensity-legend__note">
                  {intensityLegendLabel}
                </p>
              </div>
            ) : null}
          </div>

          {hasInlineContent ? (
            <div className="visualizer-copy">
              {description ? <p className="muted">{description}</p> : null}

              {detailsMode === 'sheet' ? (
                visibleMuscles.length ? (
                  shouldShowSheetPreview ? (
                    <>
                      <div className="visualizer-summary-pills">
                        {visibleMuscles.slice(0, 4).map(({ slug, count }) => (
                          <span key={slug} className="pill pill--subtle">
                            {muscleLabels[slug]} {formatMuscleScore(count)}
                          </span>
                        ))}
                      </div>
                      <p className="muted visualizer-hint">{holdDetailLabel}</p>
                    </>
                  ) : null
                ) : (
                  <div className="empty-state compact-empty-state">
                    <h3>{emptyTitle}</h3>
                    <p>{emptyDescription}</p>
                  </div>
                )
              ) : visibleMuscles.length ? (
                <div className="muscle-list">
                  {renderMuscleRows({
                    interactive: Boolean(onSelectMuscle),
                    muscles: visibleMuscles,
                  })}
                </div>
              ) : (
                <div className="empty-state compact-empty-state">
                  <h3>{emptyTitle}</h3>
                  <p>{emptyDescription}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {footer ? <div className="visualizer-footer">{footer}</div> : null}
      </section>

      {detailsMode === 'sheet' && isDetailSheetOpen ? (
        <BottomSheet
          description={
            detailSheetDescription ||
            description ||
            'Breakdown of targeted muscle groups for this visualized view.'
          }
          kicker={kicker}
          onClose={() => setIsDetailSheetOpen(false)}
          title={title}
        >
          {detailMuscles.length ? (
            <div className="muscle-list">
              {renderMuscleRows({
                interactive: Boolean(onSelectMuscle),
                muscles: detailMuscles,
                onAfterSelect: () => setIsDetailSheetOpen(false),
              })}
            </div>
          ) : (
            <div className="empty-state compact-empty-state">
              <h3>{emptyTitle}</h3>
              <p>{emptyDescription}</p>
            </div>
          )}
        </BottomSheet>
      ) : null}
    </>
  )
}

export default MuscleVisualizer
