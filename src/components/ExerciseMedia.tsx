import { useRef, useState } from 'react'
import type { Exercise } from '../lib/content'
import MuscleVisualizer from './MuscleVisualizer'
import { buildExerciseMuscleProfile } from '../lib/muscles'
import media from '../assets/exercise-media/index.json'
import useExerciseVideoPlayback from '../hooks/useExerciseVideoPlayback'

export default function ExerciseMedia({ exercise, gender = 'male' }: { exercise: Exercise; gender?: 'male' | 'female' }) {
  const item = (media as Record<string, { video: string; poster: string }>)[exercise.id]
  const [state, setState] = useState({ id: exercise.id, muscles: false, failed: false })
  if (state.id !== exercise.id) setState({ id: exercise.id, muscles: false, failed: false })
  const current = state.id === exercise.id ? state : { muscles: false, failed: false }
  const video = useRef<HTMLVideoElement>(null)
  const start = useRef(0)
  const swiped = useRef(false)
  const { isPlaying, togglePlayback } = useExerciseVideoPlayback(video, Boolean(item) && !current.failed && !current.muscles, exercise.id)
  return <section className="exercise-media">
    {item && !current.failed ? <div className="segmented-control"><button type="button" aria-pressed={!current.muscles} onClick={() => setState({ ...state, muscles: false })}>Demo</button><button type="button" aria-pressed={current.muscles} onClick={() => setState({ ...state, muscles: true })}>Muscles</button></div> : null}
    {item && !current.failed && !current.muscles ? <>
      <button type="button" className="exercise-media__video" aria-label={`${isPlaying ? 'Pause' : 'Play'} ${exercise.name} demonstration`}
        onTouchStart={event => { start.current = event.touches[0].clientX; swiped.current = false }}
        onTouchEnd={event => { if (start.current - event.changedTouches[0].clientX > 45) { swiped.current = true; setState({ ...state, muscles: true }) } }}
        onClick={() => { if (swiped.current) { swiped.current = false; return }; togglePlayback() }}>
        <video key={exercise.id} ref={video} src={import.meta.env.BASE_URL + item.video} poster={import.meta.env.BASE_URL + item.poster} onError={() => setState({ ...state, failed: true })} controls={false} muted loop playsInline preload="none" />
      </button>
    </> : <MuscleVisualizer compact hideHeader detailsMode="sheet" showSheetPreview={false} gender={gender} profile={buildExerciseMuscleProfile(exercise)} title={exercise.name} />}
  </section>
}
