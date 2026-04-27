import { useEffect, useRef } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { BannerTone } from '../lib/app-types'

type BannerProps = {
  durationMs?: number
  onDismiss?: () => void
  text: string
  tone: BannerTone
}

export default function Banner({
  durationMs = 3200,
  onDismiss,
  text,
  tone,
}: BannerProps) {
  const dismissRef = useRef(onDismiss)

  useEffect(() => {
    dismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    if (!dismissRef.current || durationMs <= 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      dismissRef.current?.()
    }, durationMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [durationMs, text, tone])

  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle

  return (
    <section className={`banner banner--${tone}`} role="status">
      <span className="banner__icon" aria-hidden="true">
        <Icon size={16} />
      </span>
      <p>{text}</p>
    </section>
  )
}
