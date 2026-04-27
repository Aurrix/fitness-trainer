import type { ReactNode } from 'react'

type BottomSheetProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  description?: ReactNode
  headerActions?: ReactNode
  kicker?: string
  onClose: () => void
  title: ReactNode
}

export default function BottomSheet({
  children,
  className,
  contentClassName,
  description,
  headerActions,
  kicker,
  onClose,
  title,
}: BottomSheetProps) {
  return (
    <div className="overlay overlay--workout" role="presentation" onClick={onClose}>
      <aside
        className={['overlay-sheet', 'overlay-sheet--workout', className ?? '']
          .filter(Boolean)
          .join(' ')}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="overlay-header">
          <div>
            {kicker ? <p className="kicker">{kicker}</p> : null}
            <h2>{title}</h2>
            {description ? <p className="muted">{description}</p> : null}
          </div>
          {headerActions ?? (
            <button type="button" className="ghost-button" onClick={onClose}>
              Close
            </button>
          )}
        </div>

        <div className={['sheet-content', contentClassName ?? ''].filter(Boolean).join(' ')}>
          {children}
        </div>
      </aside>
    </div>
  )
}
