import type { SelectionAction } from '../lib/types'

interface SelectionAskButtonProps {
  action: SelectionAction
  onAsk: () => void
}

export function SelectionAskButton({
  action,
  onAsk,
}: SelectionAskButtonProps) {
  const isAbove = action.placement === 'above'

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <button
        className="selection-ask-bubble pointer-events-auto absolute inline-flex items-center justify-center rounded-full px-5 py-3 text-[0.95rem] font-semibold text-[var(--paper)] shadow-[0_14px_28px_rgba(58,41,20,0.25)] transition hover:brightness-[1.03]"
        onClick={onAsk}
        style={{
          left: `${action.left}px`,
          top: `${action.top}px`,
          transform: isAbove
            ? 'translate(-50%, calc(-100% - 14px))'
            : 'translate(-50%, 14px)',
        }}
        type="button"
      >
        Ask about this
        <span
          className="selection-ask-bubble-nub absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45"
          style={
            isAbove
              ? { bottom: '-7px' }
              : { top: '-7px' }
          }
        />
      </button>
    </div>
  )
}
