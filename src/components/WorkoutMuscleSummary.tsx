import { useEffect, useRef, useState, type ReactNode } from 'react'
import Body, { type Slug } from '@mjcdev/react-body-highlighter'
import { Maximize2, X } from 'lucide-react'
import { muscleLabels, type MuscleProfile } from '../lib/muscles'
import type { FitnessProfileGender } from '../lib/fitness-profile'

type Props = {
  sessionTitle?: ReactNode
  sessionProgress?: ReactNode
  gender: FitnessProfileGender
  targetProfile: MuscleProfile
  workedProfile: MuscleProfile
  kicker: string
  headerLeading: ReactNode
  headerTrailing: ReactNode
  onSelectMuscle: (slug: Slug) => void
}

const workedColors = ['#f8fbff', '#e8f4ff', '#cfeaff', '#9fd3ff', '#63b6ff', '#2f8cff', '#f7b267', '#f97341', '#9a3412']
const colors = ['#d5dce0', '#fff0b3', '#efc34c', ...workedColors]

export default function WorkoutMuscleSummary({ sessionTitle, sessionProgress, gender, targetProfile, workedProfile, kicker, headerLeading, headerTrailing, onSelectMuscle }: Props) {
  const [isZoomed, setIsZoomed] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const zoomRef = useRef<HTMLButtonElement>(null)
  const targets = new Map(targetProfile.data.map(part => [part.slug, part.intensity ?? 1]))
  const worked = new Map(workedProfile.data.map(part => [part.slug, part.intensity ?? 1]))
  const slugs = [...new Set([...targetProfile.muscles, ...workedProfile.muscles].map(part => part.slug))]
  const data = (Object.keys(muscleLabels) as Slug[]).map(slug => ({
    slug,
    intensity: worked.has(slug) ? 3 + worked.get(slug)! : targets.has(slug) ? (targets.get(slug)! > 4 ? 3 : 2) : 1,
  }))

  useEffect(() => {
    if (!isZoomed) return
    dialogRef.current?.showModal()
    const zoomButton = zoomRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      zoomButton?.focus()
    }
  }, [isZoomed])

  function select(slug: Slug) {
    setIsZoomed(false)
    onSelectMuscle(slug)
  }

  function renderCoverage(expanded: boolean) {
    return <div className="workout-muscles__coverage">
      <div className="workout-muscles__maps" aria-label="Front and back muscle coverage">
        {(['front', 'back'] as const).map(side => <Body key={side} side={side} gender={gender} data={data} colors={colors} border="none" onBodyPartClick={part => {
          if (part.slug && part.slug in muscleLabels) select(part.slug)
        }} />)}
      </div>
      <div className="workout-muscles__summary">
        <div className="workout-muscles__rows">
          {(expanded ? slugs : slugs.slice(0, 3)).map(slug => <button key={slug} type="button" className="workout-muscles__row" onClick={() => select(slug)} aria-label={`Add ${muscleLabels[slug]}`}>
            <span>{muscleLabels[slug]}</span>
            <span className="workout-muscles__segments" aria-hidden="true">
              {Array.from({ length: 9 }, (_, index) => <i key={index} style={{ background: worked.has(slug) && index < worked.get(slug)! ? workedColors[index] : targets.has(slug) && index < targets.get(slug)! ? (index < 4 ? '#fff0b3' : '#efc34c') : '#e2e3e2' }} />)}
            </span>
            <span className="sr-only">{targets.has(slug) ? 'Targeted' : ''}{worked.has(slug) ? ', worked' : ', not yet worked'}</span>
          </button>)}
          {!slugs.length ? <p className="muted">No muscle targets for this day.</p> : null}
        </div>
        <div className="workout-muscles__legend">
          <span><i className="workout-muscles__target-swatch" />Targeted</span>
          <span><i className="workout-muscles__worked-swatch" />Worked <small>(low → high)</small></span>
        </div>
        {!expanded && slugs.length > 3 ? <button type="button" className="workout-muscles__more" onClick={() => setIsZoomed(true)}>All {slugs.length} muscles</button> : null}
      </div>
    </div>
  }

  return <>
    <section className="section-card workout-day-visualizer workout-muscles">
      {sessionTitle}
      <div className="section-header visualizer-header visualizer-header--balanced">
        <div className="visualizer-header__leading">{headerLeading}</div>
        <div className="visualizer-header__copy is-centered"><p className="kicker">{kicker}</p><h3>Muscle coverage</h3></div>
        <div className="visualizer-header__trailing">{headerTrailing}</div>
      </div>
      {sessionProgress}
      <div className="workout-muscles__panel">
        <button ref={zoomRef} type="button" className="chip-button icon-button workout-muscles__zoom" aria-label="Open muscle coverage full screen" onClick={() => setIsZoomed(true)}><Maximize2 size={16} /></button>
        {renderCoverage(false)}
      </div>
    </section>
    {isZoomed ? <dialog ref={dialogRef} className="workout-muscles-dialog" aria-labelledby="workout-muscles-title" onCancel={() => setIsZoomed(false)} onClose={() => setIsZoomed(false)}>
      <header><div><p className="kicker">{kicker}</p><h2 id="workout-muscles-title">Muscle coverage</h2></div><button type="button" className="chip-button icon-button" aria-label="Close muscle coverage" onClick={() => setIsZoomed(false)} autoFocus><X size={24} /></button></header>
      <p className="muted">Yellow shows targets. Blue through orange shows logged work. Tap a muscle to add an exercise.</p>
      {renderCoverage(true)}
    </dialog> : null}
  </>
}
