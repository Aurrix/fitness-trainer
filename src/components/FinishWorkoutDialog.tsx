import BottomSheet from './BottomSheet'

type FinishWorkoutDialogProps = {
  dayName: string | null
  onClose: () => void
  onConfirm: () => void
  programName: string | null
}

export default function FinishWorkoutDialog({
  dayName,
  onClose,
  onConfirm,
  programName,
}: FinishWorkoutDialogProps) {
  return (
    <BottomSheet
      className="finish-workout-dialog"
      description={
        programName
          ? `Finish ${programName}${dayName ? ` / ${dayName}` : ''} and save it to your history?`
          : 'Finish this workout day and save it to your history?'
      }
      kicker="Finish Day"
      onClose={onClose}
      title="Confirm completion"
    >
      <div className="row-actions finish-workout-dialog__actions">
        <button type="button" className="secondary-button" onClick={onClose}>
          Keep training
        </button>
        <button type="button" className="primary-button" onClick={onConfirm}>
          Finish day
        </button>
      </div>
    </BottomSheet>
  )
}
