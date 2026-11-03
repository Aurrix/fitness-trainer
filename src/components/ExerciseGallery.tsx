import { useId, useRef, useState } from 'react'
import useExerciseVideoPlayback from '../hooks/useExerciseVideoPlayback'
import { Play } from 'lucide-react'
import type { Exercise } from '../lib/content'
import { formatExerciseMuscleGroup, mapExerciseMuscleGroupToBodySlug } from '../entities/exercise-muscles'
import { muscleLabels } from '../lib/muscles'
import media from '../assets/exercise-media/index.json'
import ExerciseMuscleMaps from './ExerciseMuscleMaps'

type View = 'video' | 'front' | 'back'
export default function ExerciseGallery({ exercise, gender }: { exercise: Exercise; gender: 'male' | 'female' }) {
  const item = (media as Record<string, { video: string; poster: string }>)[exercise.id]
  const [failed, setFailed] = useState(false)
  const [view, setView] = useState<View>(item ? 'video' : 'front')
  const videoRef = useRef<HTMLVideoElement>(null)
  const gesture = useRef<{ x: number; y: number } | null>(null)
  const suppressClick = useRef(false)
  const id = useId()
  const views: View[] = item && !failed ? ['video', 'front', 'back'] : ['front', 'back']
  const activeView = views.includes(view) ? view : 'front'
  const { isPlaying, togglePlayback } = useExerciseVideoPlayback(videoRef, Boolean(item) && !failed && activeView === 'video', exercise.id)
  const summarizeTargets = (groups: string[]) => [...new Set(groups.map(group => {
    const slug = mapExerciseMuscleGroupToBodySlug(group)
    return slug ? muscleLabels[slug] : formatExerciseMuscleGroup(group)
  }))]
  const primary = summarizeTargets(exercise.primaryTargetMuscleGroups.filter(target => target.factor > 0).map(target => target.muscleGroup))
  const secondary = summarizeTargets(exercise.secondaryTargetMuscleGroups.filter(target => target.factor > 0).map(target => target.muscleGroup)).filter(group => !primary.includes(group))
  const changeView = (next: View) => { videoRef.current?.pause(); setView(next) }
  const stepView = (direction: number) => changeView(views[Math.max(0, Math.min(views.length - 1, views.indexOf(activeView) + direction))])


  return <section className="exercise-gallery" aria-label="Exercise demonstration and muscle targets">
    <div className="exercise-gallery__viewport" id={id} tabIndex={0} role="group" aria-roledescription="carousel" aria-label={`${activeView === 'video' ? 'Video demonstration' : `${activeView} muscle targets`}. Swipe or use arrow keys to change view.`}
      onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); stepView(event.key === 'ArrowRight' ? 1 : -1) } }}
      onPointerDown={event => { if (event.button === 0) { gesture.current = { x: event.clientX, y: event.clientY }; suppressClick.current = false } }}
      onPointerMove={event => { const start = gesture.current; if (start && Math.abs(event.clientX - start.x) > 8 && Math.abs(event.clientX - start.x) > Math.abs(event.clientY - start.y)) event.currentTarget.setPointerCapture(event.pointerId) }}
      onPointerCancel={() => { gesture.current = null }}
      onPointerUp={event => { const start = gesture.current; gesture.current = null; if (!start) return; const dx = event.clientX - start.x; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(event.clientY - start.y)) { suppressClick.current = true; stepView(dx < 0 ? 1 : -1) } }}>
      {item && !failed ? <button type="button" className="exercise-gallery__video" hidden={activeView !== 'video'} aria-label={`${isPlaying ? 'Pause' : 'Play'} ${exercise.name} demonstration`} onClick={() => {
        if (suppressClick.current) { suppressClick.current = false; return }
        togglePlayback()
      }}>
        <video ref={videoRef} src={import.meta.env.BASE_URL + item.video} poster={import.meta.env.BASE_URL + item.poster} controls={false} disablePictureInPicture muted loop playsInline preload="none" onError={() => { setFailed(true); setView('front') }} />
      </button> : null}
      {activeView !== 'video' ? <><span className="exercise-gallery__side-label">{activeView === 'front' ? 'Front targets' : 'Back targets'}</span><ExerciseMuscleMaps exercise={exercise} gender={gender} side={activeView} /></> : null}
    </div>
    <div className="exercise-gallery__nav" role="group" aria-label="Choose exercise media view">
      {views.map(option => <button key={option} type="button" aria-pressed={activeView === option} aria-controls={id} onClick={() => changeView(option)}>{option === 'video' ? <Play size={13} aria-hidden="true" /> : null}{option === 'video' ? 'Video' : option === 'front' ? 'Front' : 'Back'}</button>)}
    </div>
    <div className="exercise-gallery__targets"><span className="exercise-gallery__swipe">Swipe ↔</span>
      <strong><i className="exercise-target-dot" />{(primary.length ? primary : summarizeTargets(exercise.muscleGroups)).join(' · ') || 'No targets mapped'}</strong>
      {secondary.length ? <span><i className="exercise-target-dot exercise-target-dot--secondary" />{secondary.join(' · ')}</span> : null}
    </div>
  </section>
}
