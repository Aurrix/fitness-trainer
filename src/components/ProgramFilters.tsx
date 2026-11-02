import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { emptyProgramFacets, programFacetLabels, programFilterOptions, type ProgramFacets } from '../lib/program-filters'

type Props = { value: ProgramFacets; onChange: (value: ProgramFacets) => void; countMatches: (value: ProgramFacets) => number; sort: string; onSort: (value: string) => void }
export default function ProgramFilters({ value, onChange, countMatches, sort, onSort }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const active = (Object.keys(value) as Array<keyof ProgramFacets>).filter(key => value[key] !== 'any')
  useEffect(() => {
    if (!open) return
    dialog.current?.showModal()
    const triggerElement = trigger.current
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous; triggerElement?.focus() }
  }, [open])
  function close() { dialog.current?.close(); setOpen(false) }
  const count = countMatches(draft)
  return <>
    <div className="program-filter-toolbar">
      <button ref={trigger} type="button" className="secondary-button icon-button" aria-haspopup="dialog" aria-expanded={open} onClick={() => { setDraft(value); setOpen(true) }}><SlidersHorizontal size={17} />Filters {active.length ? <span className="program-filter-badge">{active.length}</span> : null}</button>
      <label className="program-sort">Sort <select aria-label="Sort programs" value={sort} onChange={event => onSort(event.target.value)}><option value="default">Library order</option><option value="name">Name A–Z</option><option value="days">Fewest days</option></select></label>
    </div>
    {active.length ? <div className="tag-row program-filter-applied" aria-label="Applied program filters">{active.map(key => <button key={key} type="button" className="chip-button is-active" aria-label={`Remove ${programFacetLabels[key]} filter`} onClick={() => onChange({ ...value, [key]: 'any' })}>{key === 'days' ? `${value[key]} days / week` : programFilterOptions[key].find(option => option[0] === value[key])?.[1]}<X size={14} /></button>)}<button className="ghost-button" type="button" onClick={() => onChange({ ...emptyProgramFacets })}>Clear all</button></div> : null}
    {open ? createPortal(<dialog ref={dialog} className="program-filter-dialog" aria-labelledby="program-filter-title" onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === event.currentTarget) close() }}>
      <div className="program-filter-panel">
        <header className="program-filter-header"><h2 id="program-filter-title">Filter programs</h2><div className="row-actions"><button type="button" className="ghost-button" onClick={() => setDraft({ ...emptyProgramFacets })}>Reset</button><button type="button" className="ghost-button" aria-label="Close filters" onClick={close}><X size={21} /></button></div></header>
        <div className="program-filter-body">{(Object.keys(programFilterOptions) as Array<keyof ProgramFacets>).map(key => <fieldset key={key}><legend>{programFacetLabels[key]}</legend><div className="program-filter-options">{programFilterOptions[key].map(([id, label]) => <button type="button" className={`chip-button ${draft[key] === id ? 'is-active' : ''}`} aria-pressed={draft[key] === id} key={id} onClick={() => setDraft({ ...draft, [key]: id })}>{label}</button>)}</div></fieldset>)}<p className="muted">Days count scheduled sessions in each week; optional days are excluded. Equipment filters use mapped exercise requirements. Plans with missing requirements stay visible under Any.</p></div>
        <footer className="program-filter-footer"><button type="button" className="primary-button" onClick={() => { onChange(draft); close() }}>Show {count} {count === 1 ? 'program' : 'programs'}</button></footer>
      </div>
    </dialog>, document.body) : null}
  </>
}
