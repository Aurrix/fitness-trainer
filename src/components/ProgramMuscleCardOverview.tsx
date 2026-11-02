import { useEffect, useMemo, useRef, useState } from 'react'
import Body from '@mjcdev/react-body-highlighter'
import type { Exercise, Program } from '../lib/content'
import { buildCoverageMuscleProfile, buildProgramCoverage, muscleLabels } from '../lib/muscles'

type Props = {
  program: Program
  exercises: Exercise[]
  gender: 'male' | 'female'
}

const colors = ['#e9eff3', '#d9e9f4', '#bdd8ec', '#94bfdf', '#6ca3cf', '#4785b8', '#2e6797', '#20507c', '#173a61']

export default function ProgramMuscleCardOverview({ program, exercises, gender }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [showMap, setShowMap] = useState(() => typeof window !== 'undefined' && !('IntersectionObserver' in window))
  const container = useRef<HTMLDivElement>(null)
  const summary = useMemo(() => {
    const firstWeek = Math.min(...program.sections.map(section => section.weekIndex || 1))
    const sections = program.sections.filter(section => !section.optional && (section.weekIndex || 1) === firstWeek)
    const coverage = buildProgramCoverage(sections, exercises)
    const rows = [...coverage.rows].sort((a, b) => b.setsMax - a.setsMax || b.exercises - a.exercises || muscleLabels[a.slug].localeCompare(muscleLabels[b.slug]))
    return { firstWeek, sessions: sections.length, rows, profile: buildCoverageMuscleProfile(rows, 'sets') }
  }, [program, exercises])

  // Only mount the anatomical SVGs near the viewport when browsing a large catalog.
  useEffect(() => {
    const element = container.current
    if (!element) return
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setShowMap(true)
        observer.disconnect()
      }
    }, { rootMargin: '200px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  if (!summary.rows.length) return <p className="muted">Muscle coverage not available yet.</p>
  const visibleRows = expanded ? summary.rows : summary.rows.slice(0, 4)
  return <div ref={container} className="program-card-coverage" role="group" aria-label={`${program.name} muscle overview`}>
    <div className="program-card-coverage__heading"><strong>Muscle overview</strong><span>Week {summary.firstWeek} · {summary.sessions} sessions</span></div>
    <div className="program-card-coverage__body">
      <div className="program-card-coverage__maps" aria-hidden="true">
        {showMap ? <><Body data={summary.profile.data} colors={colors} gender={gender} side="front" border="none" scale={0.27} /><Body data={summary.profile.data} colors={colors} gender={gender} side="back" border="none" scale={0.27} /></> : null}
        <span>Front / Back</span>
      </div>
      <div className="program-card-coverage__counts">
        <div className="program-card-coverage__columns"><span>Muscle group</span><span>Sets · sessions</span></div>
        <ul>{visibleRows.map(row => <li key={row.slug}>
          <span>{muscleLabels[row.slug]}</span>
          <span className="program-card-coverage__values" aria-label={`${row.setsMin === row.setsMax ? row.setsMin : `${row.setsMin} to ${row.setsMax}`} planned sets${row.unknownSets ? ', some sets unspecified' : ''}, targeted in ${row.sessions} of ${summary.sessions} sessions`}>
            <strong>{row.setsMin === row.setsMax ? row.setsMin : `${row.setsMin}–${row.setsMax}`}{row.unknownSets ? '+' : ''}</strong><span> · {row.sessions}/{summary.sessions}</span>
          </span>
        </li>)}</ul>
        {summary.rows.length > 4 ? <button type="button" className="program-card-coverage__expand" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Show main groups' : `+${summary.rows.length - 4} more muscle groups`}</button> : null}
      </div>
    </div>
    <p>Planned working sets · primary + secondary targets{program.sections.some(section => section.optional) ? ' · optional days excluded' : ''}{summary.rows.some(row => row.unknownSets) ? ' · + means some sets are unspecified' : ''}</p>
  </div>
}
