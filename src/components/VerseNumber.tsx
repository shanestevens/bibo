interface VerseNumberProps {
  value: number
}

export function VerseNumber({ value }: VerseNumberProps) {
  return (
    <sup className="font-[var(--font-sans)] text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
      {value}
    </sup>
  )
}
