import { useCallback, useEffect, useId, useRef, useState, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import icons from '../assets/icons/next-time.svg?no-inline'

type Choice = 'increase' | 'hold' | 'decrease'
type Props = { value: Choice | null; inherited?: Choice | null; disabled?: boolean; label: string; onChange: (value: string) => void }
const choices: Choice[] = ['increase', 'hold', 'decrease']
const labels = { increase: 'Easy · increase next time', hold: 'Challenging · keep weight', decrease: 'Too hard · decrease next time' }
export function NextTimeIcon({ choice }: { choice: Choice }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><use href={`${icons}#${choice}`} /></svg>
}
export default function NextTimeButton({ value, inherited, disabled, label, onChange }: Props) {
  const hintId = useId()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gesture = useRef<{ id: number; x: number; y: number; active: boolean; selection: Choice | null } | null>(null)
  const suppressClick = useRef(false)
  const [picker, setPicker] = useState<{ x: number; y: number; selection: Choice | null } | null>(null)
  const displayed = value ?? inherited
  const clearTimer = useCallback(() => { if (timer.current) clearTimeout(timer.current); timer.current = null }, [])
  const cancel = useCallback(() => { clearTimer(); gesture.current = null; setPicker(null) }, [clearTimer])
  useEffect(() => {
    const dismiss = () => { if (gesture.current) suppressClick.current = true; cancel() }
    window.addEventListener('blur', dismiss)
    document.addEventListener('visibilitychange', dismiss)
    return () => { clearTimer(); window.removeEventListener('blur', dismiss); document.removeEventListener('visibilitychange', dismiss) }
  }, [cancel, clearTimer])
  useEffect(() => {
    if (!disabled) return
    const frame = requestAnimationFrame(cancel)
    return () => cancelAnimationFrame(frame)
  }, [disabled, cancel])
  function down(event: PointerEvent<HTMLButtonElement>) {
    if (disabled || !event.isPrimary || event.button !== 0 || gesture.current) return
    event.stopPropagation()
    suppressClick.current = false
    const { clientX: x, clientY: y, pointerId: id } = event
    event.currentTarget.setPointerCapture(id)
    gesture.current = { id, x, y, active: false, selection: 'hold' }
    timer.current = setTimeout(() => {
      const current = gesture.current
      if (!current) return
      current.active = true
      // Keep the hold row under the finger, including near the screen edges.
      const centerY = Math.max(82, Math.min(window.innerHeight - 82, y))
      current.y = centerY
      setPicker({ x: Math.max(96, Math.min(window.innerWidth - 96, x)), y: centerY, selection: 'hold' })
    }, 420)
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current
    if (!current || current.id !== event.pointerId) return
    event.stopPropagation()
    if (!current.active) {
      if (Math.hypot(event.clientX - current.x, event.clientY - current.y) > 12) { suppressClick.current = true; cancel() }
      return
    }
    const delta = event.clientY - current.y
    current.selection = Math.abs(event.clientX - current.x) > 110 || Math.abs(delta) > 125 ? null : delta < -25 ? 'increase' : delta > 25 ? 'decrease' : 'hold'
    setPicker(previous => previous ? { ...previous, selection: current.selection } : null)
  }
  function up(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current
    if (!current || current.id !== event.pointerId) return
    event.stopPropagation()
    if (current.active) {
      suppressClick.current = true
      if (current.selection && !disabled) onChange(current.selection)
    }
    cancel()
  }
  return <div className="workout-compact-advice">
    <button type="button" className={`next-time-button${value ? ' is-active' : ''}${!value && inherited ? ' is-inherited' : ''}${picker ? ' is-selecting' : ''}`} data-progression={displayed ?? ''}
      aria-label={`Next time for ${label}: ${displayed ? labels[displayed] : 'not rated'}`}
      aria-describedby={hintId} aria-expanded={Boolean(picker)}
      title={`${!value && inherited ? 'Last workout: ' : ''}${displayed ? labels[displayed] + '. ' : ''}Tap: challenging. Tap again to clear. Hold and slide up: increase; down: decrease.`}
      disabled={disabled} onPointerDown={down} onPointerMove={move} onPointerUp={up}
      onPointerCancel={() => { suppressClick.current = true; cancel() }}
      onLostPointerCapture={() => { if (gesture.current) { suppressClick.current = true; cancel() } }}
      onContextMenu={event => event.preventDefault()}
      onClick={event => { if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return } suppressClick.current = false; onChange(value === 'hold' ? '' : 'hold') }}
      onKeyDown={event => {
        if (event.key === 'Escape') { suppressClick.current = true; cancel(); event.preventDefault() }
        else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); onChange(event.key === 'ArrowUp' ? 'increase' : 'decrease') }
        else if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); onChange('') }
      }}>
      <NextTimeIcon choice={displayed ?? 'hold'} />
      <span className="next-time-button__grip" aria-hidden="true" />
    </button>
    <span className="sr-only" id={hintId}>Tap for challenging weight. Tap again to clear. Hold and slide up for easy or down for too hard. Slide away to cancel. Keyboard: up or down arrows choose; Enter toggles challenging; Delete clears.</span>
    {picker && !disabled ? createPortal(<div className="next-time-picker" style={{ left: picker.x, top: picker.y }} aria-hidden="true">
      {choices.map(choice => <div key={choice} className={`next-time-picker__option${picker.selection === choice ? ' is-selected' : ''}`} data-progression={choice}><NextTimeIcon choice={choice} /><span>{labels[choice]}</span></div>)}
    </div>, document.body) : null}
  </div>
}
