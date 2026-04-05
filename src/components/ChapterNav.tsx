interface ChapterNavProps {
  chapterCount: number
  currentChapter: number
  chapterLabel: string
  canGoBackward: boolean
  canGoForward: boolean
  onGoBackward: () => void
  onGoForward: () => void
  onSelectChapter: (chapterNumber: number) => void
}

export function ChapterNav({
  chapterCount,
  currentChapter,
  chapterLabel,
  canGoBackward,
  canGoForward,
  onGoBackward,
  onGoForward,
  onSelectChapter,
}: ChapterNavProps) {
  return (
    <section className="flex items-center gap-2">
      <button
        aria-label="Go to the previous chapter"
        className="flex h-12 w-12 items-center justify-center rounded-[0.9rem] border border-[var(--line)] bg-[rgba(255,252,247,0.68)] text-[1rem] font-semibold leading-none text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition enabled:hover:border-[var(--line-strong)] enabled:hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canGoBackward}
        onClick={onGoBackward}
        type="button"
      >
        &lt;
      </button>

      <div className="relative min-w-[6rem]">
        <label className="sr-only" htmlFor="chapter-select">
          {chapterLabel}
        </label>
        <select
          className="h-12 w-full appearance-none rounded-[0.9rem] border border-[var(--line)] bg-[rgba(255,252,247,0.68)] px-4 pr-9 text-center text-[1rem] font-semibold text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] outline-none transition focus:border-[var(--line-strong)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          id="chapter-select"
          onChange={(event) => onSelectChapter(Number.parseInt(event.target.value, 10))}
          value={currentChapter}
        >
          {Array.from({ length: chapterCount }, (_, index) => {
            const chapterNumber = index + 1

            return (
              <option key={chapterNumber} value={chapterNumber}>
                {chapterNumber}
              </option>
            )
          })}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--muted)]">
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

      <button
        aria-label="Go to the next chapter"
        className="flex h-12 w-12 items-center justify-center rounded-[0.9rem] border border-[var(--line)] bg-[rgba(255,252,247,0.68)] text-[1rem] font-semibold leading-none text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition enabled:hover:border-[var(--line-strong)] enabled:hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canGoForward}
        onClick={onGoForward}
        type="button"
      >
        &gt;
      </button>
    </section>
  )
}
