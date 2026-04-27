import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { Activity, CheckCircle2, CirclePlay, TimerReset, X } from 'lucide-react'
import type { Program } from '../lib/content'

type RestTimerView = {
  exerciseName: string
  isComplete: boolean
  isWarning: boolean
  remainingLabel: string
  setNumber: number
  totalProgressPercent: number
}

type FloatingSessionBarProps = {
  completedExerciseCount: number
  completionRatio: number
  isSelectedWorkoutActive: boolean
  launchProgram: Program | null
  onDismissRestTimer?: () => void
  restTimer?: RestTimerView | null
  selectedWorkoutSectionName: string | null
  totalExerciseCount: number
}

export default function FloatingSessionBar({
  completedExerciseCount,
  completionRatio,
  isSelectedWorkoutActive,
  launchProgram,
  onDismissRestTimer,
  restTimer = null,
  selectedWorkoutSectionName,
  totalExerciseCount,
}: FloatingSessionBarProps) {
  const titleViewportRef = useRef<HTMLDivElement | null>(null)
  const titleContentRef = useRef<HTMLElement | null>(null)
  const [marqueeState, setMarqueeState] = useState({
    distance: 0,
    isOverflowing: false,
  })

  const title = launchProgram
    ? `${launchProgram.name} / ${selectedWorkoutSectionName ?? 'Ready'}`
    : 'Pick a program to begin'
  const visibleTitle = restTimer ? restTimer.exerciseName : title
  const progressNumerator = Math.max(0, completedExerciseCount)
  const progressDenominator = Math.max(0, totalExerciseCount)
  const isRestTimerVisible = Boolean(restTimer)
  const StatusIcon = isRestTimerVisible
    ? restTimer?.isComplete
      ? CheckCircle2
      : TimerReset
    : isSelectedWorkoutActive
      ? completionRatio >= 100
        ? CheckCircle2
        : Activity
      : CirclePlay

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const viewport = titleViewportRef.current
    const content = titleContentRef.current

    if (!viewport || !content) {
      return
    }

    const measure = () => {
      const overflowDistance = Math.max(0, content.scrollWidth - viewport.clientWidth)
      const isOverflowing = overflowDistance > 8
      const nextDistance = isOverflowing ? overflowDistance + 36 : 0

      setMarqueeState((currentState) => {
        if (
          currentState.isOverflowing === isOverflowing &&
          currentState.distance === nextDistance
        ) {
          return currentState
        }

        return {
          distance: nextDistance,
          isOverflowing,
        }
      })
    }

    measure()
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null

    resizeObserver?.observe(viewport)
    resizeObserver?.observe(content)
    window.addEventListener('resize', measure)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [visibleTitle])

  return (
    <section className="floating-session-bar">
      <div
        className={`floating-session-bar__panel ${
          isRestTimerVisible ? 'has-rest-timer' : ''
        } ${restTimer?.isWarning ? 'is-warning' : ''} ${restTimer?.isComplete ? 'is-rest-complete' : ''}`}
      >
        <div className="floating-session-bar__topline">
          <span
            className={`floating-session-bar__icon ${
              isRestTimerVisible
                ? restTimer?.isComplete
                  ? 'is-complete'
                  : restTimer?.isWarning
                    ? 'is-warning'
                    : 'is-resting'
                : isSelectedWorkoutActive
                  ? completionRatio >= 100
                    ? 'is-complete'
                    : 'is-active'
                : 'is-idle'
            }`}
            aria-hidden="true"
          >
            <StatusIcon size={16} />
          </span>

          <div className="floating-session-bar__copy">
            {restTimer ? (
              <span className="floating-session-bar__eyebrow">
                {restTimer.isComplete ? 'Rest complete' : `Rest after set ${restTimer.setNumber}`}
              </span>
            ) : null}
            <div className="floating-session-bar__title-viewport" ref={titleViewportRef}>
              {marqueeState.isOverflowing ? (
                <div
                  className="floating-session-bar__title-track is-marquee"
                  style={
                    {
                      '--marquee-distance': `${marqueeState.distance}px`,
                    } as CSSProperties
                  }
                >
                  <span ref={titleContentRef} className="floating-session-bar__title-copy">
                    {visibleTitle}
                  </span>
                  <span
                    className="floating-session-bar__title-gap"
                    aria-hidden="true"
                  >
                    /
                  </span>
                  <span className="floating-session-bar__title-copy" aria-hidden="true">
                    {visibleTitle}
                  </span>
                </div>
              ) : (
                <strong ref={titleContentRef}>{visibleTitle}</strong>
              )}
            </div>
          </div>

          {restTimer && onDismissRestTimer ? (
            <button
              type="button"
              className="floating-session-bar__dismiss"
              onClick={onDismissRestTimer}
              aria-label="Dismiss rest timer"
              title="Dismiss rest timer"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        <div className="floating-session-bar__progress-row">
          <strong className="floating-session-bar__fraction">
            {restTimer ? restTimer.remainingLabel : `${progressNumerator}/${progressDenominator}`}
          </strong>
          <div className="meter floating-session-bar__meter" aria-hidden="true">
            <span
              style={{
                width: `${
                  restTimer
                    ? Math.min(100, Math.max(0, restTimer.totalProgressPercent))
                    : isSelectedWorkoutActive
                      ? completionRatio
                      : 0
                }%`,
              }}
            ></span>
          </div>
        </div>
      </div>
    </section>
  )
}
