import { useEffect, useId, useRef, type ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'

type Props = { title: string; subtitle?: ReactNode; backLabel?: string; onClose: () => void; headerAction?: ReactNode; navigation?: ReactNode; footer?: ReactNode; children: ReactNode; contentRef?: React.RefObject<HTMLDivElement | null> }
export default function ExerciseSheet({ title, subtitle, backLabel = 'Back', onClose, headerAction, navigation, footer, children, contentRef }: Props) {
  const ref = useRef<HTMLElement>(null)
  const closeRef = useRef(onClose)
  const id = useId()
  useEffect(() => { closeRef.current = onClose }, [onClose])
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => {
      const dialogs = document.querySelectorAll('[aria-modal="true"]')
      if (dialogs[dialogs.length - 1] !== ref.current) return
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeRef.current(); return }
      if (event.key !== 'Tab') return
      const focusable = [...(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select, textarea, a[href], summary, [tabindex="0"]') ?? [])].filter(element => element.getClientRects().length > 0)
      const first = focusable[0], last = focusable.at(-1)
      if (event.shiftKey && (document.activeElement === first || !ref.current?.contains(document.activeElement))) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && (document.activeElement === last || !ref.current?.contains(document.activeElement))) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKey, true)
    return () => { document.removeEventListener('keydown', onKey, true); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({ preventScroll: true }) }
  }, [])
  return <div className="overlay exercise-sheet-overlay" role="presentation" onClick={onClose}>
    <aside ref={ref} className="overlay-sheet exercise-sheet" role="dialog" aria-modal="true" aria-labelledby={id} onClick={event => event.stopPropagation()}>
      <div className="exercise-sheet__handle" aria-hidden="true" />
      <div className="exercise-sheet__bar"><button type="button" className="exercise-sheet__back" onClick={onClose} aria-label={backLabel === 'Back' ? 'Back' : `Back to ${backLabel.toLowerCase()}`}><ChevronLeft size={18} />{backLabel}</button>{headerAction ?? <button type="button" className="ghost-button" onClick={onClose} aria-label="Close">×</button>}</div>
      <header className="exercise-sheet__heading"><h2 id={id}>{title}</h2>{subtitle ? <div className="exercise-sheet__subtitle">{subtitle}</div> : null}</header>
      {navigation}
      <div className="exercise-sheet__content" ref={contentRef}>{children}</div>
      {footer ? <footer className="exercise-sheet__footer">{footer}</footer> : null}
    </aside>
  </div>
}
