import {
  ChartColumnIncreasing,
  CirclePlay,
  Lightbulb,
  LibraryBig,
  Play,
  Square,
  Settings2,
} from 'lucide-react'
import type { CSSProperties, MouseEvent, PointerEvent } from 'react'
import type { AppTab } from '../lib/app-types'

type BottomNavProps = {
  activeTab: AppTab
  canStartSelectedWorkout: boolean
  hasActiveWorkout: boolean
  isWorkoutButtonHolding: boolean
  onOpenWorkout: () => void
  onSetActiveTab: (tab: AppTab) => void
  onWorkoutButtonContextMenu: (event: MouseEvent<HTMLButtonElement>) => void
  onWorkoutButtonPointerCancel: () => void
  onWorkoutButtonPointerDown: (event: PointerEvent<HTMLButtonElement>) => void
  onWorkoutButtonPointerLeave: () => void
  onWorkoutButtonPointerUp: () => void
  workoutButtonMode: 'resume' | 'start' | 'stop'
  workoutNavStyle: CSSProperties
}

export default function BottomNav({
  activeTab,
  canStartSelectedWorkout,
  hasActiveWorkout,
  isWorkoutButtonHolding,
  onOpenWorkout,
  onSetActiveTab,
  onWorkoutButtonContextMenu,
  onWorkoutButtonPointerCancel,
  onWorkoutButtonPointerDown,
  onWorkoutButtonPointerLeave,
  onWorkoutButtonPointerUp,
  workoutButtonMode,
  workoutNavStyle,
}: BottomNavProps) {
  const WorkoutIcon =
    workoutButtonMode === 'stop'
      ? Square
      : workoutButtonMode === 'resume'
        ? CirclePlay
        : Play
  const workoutButtonLabel =
    workoutButtonMode === 'stop'
      ? 'Finish workout day'
      : hasActiveWorkout
        ? 'Resume workout day'
        : activeTab === 'workout' && canStartSelectedWorkout
          ? 'Start selected workout day'
          : canStartSelectedWorkout
          ? 'Open workout screen or hold to start selected day'
          : 'Open workout screen'

  return (
    <div className="bottom-nav-shell">
      <div className="bottom-nav__dock">
        <nav className="bottom-nav" aria-label="Primary">
          <button
            type="button"
            className={activeTab === 'library' ? 'is-active' : ''}
            onClick={() => onSetActiveTab('library')}
          >
            <LibraryBig size={18} />
            <span>Library</span>
          </button>
          <button
            type="button"
            className={activeTab === 'progression' ? 'is-active' : ''}
            onClick={() => onSetActiveTab('progression')}
          >
            <ChartColumnIncreasing size={18} />
            <span>Stats</span>
          </button>
          <span className="bottom-nav__spacer" aria-hidden="true" />
          <button
            type="button"
            className={activeTab === 'insights' ? 'is-active' : ''}
            onClick={() => onSetActiveTab('insights')}
          >
            <Lightbulb size={18} />
            <span>Insights</span>
          </button>
          <button
            type="button"
            className={activeTab === 'settings' ? 'is-active' : ''}
            onClick={() => onSetActiveTab('settings')}
          >
            <Settings2 size={18} />
            <span>Profile</span>
          </button>
        </nav>

        <button
          type="button"
          className={`bottom-nav__workout ${
            activeTab === 'workout' ? 'is-active' : ''
          } ${isWorkoutButtonHolding ? 'is-holding' : ''}`}
          onClick={onOpenWorkout}
          onContextMenu={onWorkoutButtonContextMenu}
          onPointerDown={onWorkoutButtonPointerDown}
          onPointerUp={onWorkoutButtonPointerUp}
          onPointerLeave={onWorkoutButtonPointerLeave}
          onPointerCancel={onWorkoutButtonPointerCancel}
          style={workoutNavStyle}
          aria-label={workoutButtonLabel}
        >
          <span className="bottom-nav__workout-ring">
            <span className="bottom-nav__workout-core">
              <WorkoutIcon size={28} aria-hidden="true" />
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}
