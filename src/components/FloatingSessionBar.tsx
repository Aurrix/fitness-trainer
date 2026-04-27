import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { Activity, CheckCircle2, CirclePlay } from 'lucide-react'
import type { Program } from '../lib/content'

type FloatingSessionBarProps = {
  completedExerciseCount: number
  completionRatio: number
  isSelectedWorkoutActive: boolean
  launchProgram: Program | null
  selectedWorkoutSectionName: string | null
  totalExerciseCount: number
}

export default function FloatingSessionBar({
  completedExerciseCount,
  completionRatio,
  isSelectedWorkoutActive,
  launchProgram,
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
  const progressNumerator = Math.max(0, completedExerciseCount)
  const progressDenominator = Math.max(0, totalExerciseCount)
  const StatusIcon = isSelectedWorkoutActive
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
  }, [title])

  return (
    <section className="floating-session-bar">
      <div className="floating-session-bar__panel">
        <div className="floating-session-bar__topline">
          <span
            className={`floating-session-bar__icon ${
              isSelectedWorkoutActive
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
                    {title}
                  </span>
                  <span
                    className="floating-session-bar__title-gap"
                    aria-hidden="true"
                  >
                    /
                  </span>
                  <span className="floating-session-bar__title-copy" aria-hidden="true">
                    {title}
                  </span>
                </div>
              ) : (
                <strong ref={titleContentRef}>{title}</strong>
              )}
            </div>
          </div>
        </div>

        <div className="floating-session-bar__progress-row">
          <strong className="floating-session-bar__fraction">
            {progressNumerator}/{progressDenominator}
          </strong>
          <div className="meter floating-session-bar__meter" aria-hidden="true">
            <span style={{ width: `${isSelectedWorkoutActive ? completionRatio : 0}%` }}></span>
          </div>
        </div>
      </div>
    </section>
  )
}
