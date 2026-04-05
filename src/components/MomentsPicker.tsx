import {
  inspirationalMoments,
  type InspirationalMoment,
} from '../data/inspirationalMoments'

interface MomentsPickerProps {
  onSelectMoment: (momentId: string) => void
  selectedMomentId: string | null
}

const momentCategories = [...new Set(inspirationalMoments.map((moment) => moment.category))]

export function MomentsPicker({
  onSelectMoment,
  selectedMomentId,
}: MomentsPickerProps) {
  return (
    <div className="relative min-w-0 flex-1 sm:min-w-[17rem]">
      <label className="sr-only" htmlFor="moments-select">
        Inspirational moments
      </label>
      <select
        className="h-11 w-full appearance-none rounded-[0.9rem] border border-[var(--line)] bg-[rgba(255,252,247,0.74)] px-4 pr-10 text-[0.95rem] text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] outline-none transition focus:border-[var(--line-strong)] focus:ring-2 focus:ring-[var(--accent-soft)]"
        id="moments-select"
        onChange={(event) => onSelectMoment(event.target.value)}
        value={selectedMomentId ?? ''}
      >
        <option value="">Jump into an inspiring moment...</option>
        {momentCategories.map((category) => (
          <optgroup key={category} label={category}>
            {inspirationalMoments
              .filter((moment) => moment.category === category)
              .map((moment) => (
                <option key={moment.id} value={moment.id}>
                  {formatMomentOption(moment)}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--muted)]">
        <svg
          aria-hidden="true"
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 12 12"
        >
          <path
            d="M2.25 4.5 6 8.25 9.75 4.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </span>
    </div>
  )
}

function formatMomentOption(moment: InspirationalMoment): string {
  return `${moment.label} - ${moment.reference}`
}
