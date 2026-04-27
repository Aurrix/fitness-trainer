import type { ReactNode } from 'react'
import type { AppProgram } from '../lib/app-types'
import type { ProgramStatsRecord } from '../services/program-stats'

type ProgressionPageProps = {
  bodyCompositionContent: ReactNode
  bodyStatsEntries: Array<{ id: string }>
  mainProgram: AppProgram | null
  mainProgramStats: ProgramStatsRecord | null
  programProgression: ReactNode
}

export default function ProgressionPage({
  bodyCompositionContent,
  programProgression,
}: ProgressionPageProps) {
  return (
    <>
      {programProgression}
      {bodyCompositionContent}
    </>
  )
}
