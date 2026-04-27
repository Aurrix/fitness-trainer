import BottomSheet from './BottomSheet'

type StartWorkoutDialogProps = {
  dayName: string | null
  onClose: () => void
  onConfirm: () => void
  programName: string | null
}

export default function StartWorkoutDialog({
  dayName,
  onClose,
  onConfirm,
  programName,
}: StartWorkoutDialogProps) {
  return (
    <BottomSheet
      className="finish-workout-dialog"
      description={
        programName
          ? `Start ${programName}${dayName ? ` / ${dayName}` : ''} now?`
          : 'Start this workout day now?'
      }
      kicker="Start Day"
      onClose={onClose}
      title="Confirm start"
    >
      <div className="row-actions finish-workout-dialog__actions">
        <button type="button" className="secondary-button" onClick={onClose}>
          Not yet
        </button>
        <button type="button" className="primary-button" onClick={onConfirm}>
          Start day
        </button>
      </div>
    </BottomSheet>
  )
}
