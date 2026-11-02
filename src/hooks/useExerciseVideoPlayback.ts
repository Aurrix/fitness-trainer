import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

type Player = {
  video: HTMLVideoElement
  ratio: number
  userPaused: RefObject<boolean>
  explicitlyPlaying: boolean
  blocked: boolean
  preview: boolean
}

// Coordinate only exercise demos. Camera streams and other videos keep their own lifecycle.
const players = new Set<Player>()
let frame: number | null = null
let disconnect: (() => void) | null = null
let reducedMotion: MediaQueryList | null = null
let preferred: Player | null = null

function foregroundDialog() {
  return [...document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')]
    .filter(dialog => dialog.getClientRects().length > 0).at(-1)
}

function play(player: Player) {
  if (!player.video.paused) return
  player.video.muted = true
  void player.video.play().catch((error: unknown) => {
    if (error instanceof DOMException && error.name === 'AbortError') return
    player.blocked = true
    // Retain a useful diagnostic when browser autoplay policy rejects playback.
    console.debug('Exercise video playback was blocked', error)
  })
}

function reconcile() {
  frame = null
  const dialog = foregroundDialog()
  const visible = [...players].filter(player => player.ratio >= 0.25 && player.video.getClientRects().length > 0 && (!dialog || dialog.contains(player.video)))
  const distance = (player: Player) => { const rect = player.video.getBoundingClientRect(); return Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2) }
  const demos = visible.filter(player => !player.preview)
  const candidate = preferred && demos.includes(preferred) ? preferred : demos.sort((a, b) => b.ratio - a.ratio || distance(a) - distance(b))[0]
  const shouldPlay = (player: Player) => (player.preview ? visible.includes(player) && !candidate : player === candidate) && !document.hidden && !player.userPaused.current && !player.blocked && (!reducedMotion?.matches || player.explicitlyPlaying)
  // Pause foreground demos and background previews before changing playback ownership.
  for (const player of players) if (!shouldPlay(player)) player.video.pause()
  for (const player of players) if (shouldPlay(player)) play(player)
}

function schedule() {
  if (frame === null) frame = requestAnimationFrame(reconcile)
}

function connect() {
  if (disconnect) return
  reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
  const observer = new MutationObserver(schedule)
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'aria-modal'] })
  const visible = () => { if (!document.hidden) for (const player of players) player.blocked = false; schedule() }
  document.addEventListener('visibilitychange', visible)
  window.addEventListener('scroll', schedule, { capture: true, passive: true })
  window.addEventListener('resize', schedule)
  reducedMotion.addEventListener('change', schedule)
  disconnect = () => {
    observer.disconnect()
    document.removeEventListener('visibilitychange', visible)
    window.removeEventListener('scroll', schedule, true)
    window.removeEventListener('resize', schedule)
    reducedMotion?.removeEventListener('change', schedule)
    reducedMotion = null
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
    disconnect = null
  }
}

export default function useExerciseVideoPlayback(videoRef: RefObject<HTMLVideoElement | null>, enabled: boolean, sourceKey: string, { preview = false }: { preview?: boolean } = {}) {
  const userPaused = useRef(false)
  const playerRef = useRef<Player | null>(null)
  const previousSource = useRef(sourceKey)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (previousSource.current !== sourceKey) { previousSource.current = sourceKey; userPaused.current = false }
    if (!video || !enabled) { video?.pause(); return }
    const player: Player = { video, ratio: 0, userPaused, explicitlyPlaying: false, blocked: false, preview }
    playerRef.current = player
    players.add(player)
    connect()
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    queueMicrotask(() => { if (playerRef.current === player) setIsPlaying(!video.paused) })
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    const observer = new IntersectionObserver(([entry]) => {
      player.ratio = entry.isIntersecting ? entry.intersectionRatio : 0
      if (player.ratio < 0.25 && preferred === player) preferred = null
      schedule()
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] })
    observer.observe(video)
    schedule()
    return () => {
      observer.disconnect()
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.pause()
      players.delete(player)
      if (preferred === player) preferred = null
      playerRef.current = null
      if (!players.size) disconnect?.()
      else schedule()
    }
  }, [videoRef, enabled, sourceKey, preview])

  const togglePlayback = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    preferred = player
    if (!player.video.paused) {
      userPaused.current = true
      player.explicitlyPlaying = false
      player.video.pause()
    } else {
      userPaused.current = false
      player.blocked = false
      player.explicitlyPlaying = true
      // Call play within the gesture so explicit playback also works with restrictive policies.
      for (const other of players) if (other !== player) other.video.pause()
      play(player)
    }
    schedule()
  }, [])

  return { isPlaying, togglePlayback }
}
