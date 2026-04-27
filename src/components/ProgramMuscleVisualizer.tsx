import MuscleVisualizer from './MuscleVisualizer'
import type { Exercise, Program } from '../lib/content'
import type { FitnessProfileGender } from '../lib/fitness-profile'
import { buildProgramMuscleProfile } from '../lib/muscles'

type ProgramMuscleVisualizerProps = {
  exercises: Exercise[]
  gender?: FitnessProfileGender
  program: Program | null
}

function ProgramMuscleVisualizer({
  exercises,
  gender,
  program,
}: ProgramMuscleVisualizerProps) {
  const profile = buildProgramMuscleProfile(program, exercises)

  if (!program) {
    return (
      <div className="empty-state">
        <h3>No selected program</h3>
        <p>Pick a program to preview its muscle emphasis.</p>
      </div>
    )
  }

  return (
    <MuscleVisualizer
      description="Highlight intensity is inferred from the exercises in the selected program."
      emptyDescription="Add explicit muscle fields to exercise JSON for more accurate highlighting."
      gender={gender}
      profile={profile}
      title={program.name}
    />
  )
}

export default ProgramMuscleVisualizer
