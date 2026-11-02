import { useRef, useState } from 'react'
import type { Exercise } from '../lib/content'
import media from '../assets/exercise-media/index.json'
import useExerciseVideoPlayback from '../hooks/useExerciseVideoPlayback'
import ExerciseMuscleMaps from './ExerciseMuscleMaps'

type Props = { exercise: Exercise; gender: 'male' | 'female'; onOpen: () => void; videoOnly?: boolean; enabled?: boolean }

export default function ProgramExercisePreview({ exercise, gender, onOpen, videoOnly = false, enabled = true }: Props) {
  const item = (media as Record<string, { video: string; poster: string }>)[exercise.id]
  const [failed, setFailed] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const hasVideo = Boolean(item?.video) && !failed
  useExerciseVideoPlayback(video, hasVideo && enabled, exercise.id, { preview: true })

  if (videoOnly && !hasVideo) return null

  return <button type="button" className="program-exercise-preview" aria-label={`Preview ${exercise.name}`} onClick={onOpen}>
    {hasVideo ? <video ref={video} src={import.meta.env.BASE_URL + item.video} poster={import.meta.env.BASE_URL + item.poster} muted loop playsInline preload="none" onError={() => setFailed(true)} /> : <ExerciseMuscleMaps exercise={exercise} gender={gender} miniature />}
  </button>
}
