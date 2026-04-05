import type { PoetryParagraphBlock } from '../lib/types'
import { VerseNumber } from './VerseNumber'

interface PoetryParagraphProps {
  highlightedVerseNumbers?: number[]
  paragraph: PoetryParagraphBlock
}

export function PoetryParagraph({
  highlightedVerseNumbers = [],
  paragraph,
}: PoetryParagraphProps) {
  const highlightedVerseSet = new Set(highlightedVerseNumbers)

  return (
    <div className="space-y-2 font-[var(--font-serif)] text-[1.1rem] leading-[1.95] text-[var(--ink)] sm:text-[1.16rem]">
      {paragraph.verses.map((verse) => (
        <div
          className={[
            'cursor-text space-y-1 scroll-mt-40 rounded-[0.85rem]',
            highlightedVerseSet.has(verse.num) ? 'spotlight-verse px-2 py-1' : '',
          ].join(' ')}
          data-verse-number={verse.num}
          key={`${verse.num}-${verse.continuation ? 'continued' : 'start'}-${verse.lines?.[0]?.text.slice(0, 18) ?? 'poetry'}`}
        >
          {verse.lines?.map((line, lineIndex) => (
            <div
              className="flex items-start gap-2"
              key={`${verse.num}-${lineIndex}-${line.text.slice(0, 18)}`}
              style={{
                paddingLeft: `${Math.max(line.indent - 1, 0) * 1.1}rem`,
              }}
            >
              <span className="mt-[0.18rem] inline-flex w-5 shrink-0 justify-end">
                {lineIndex === 0 && !verse.continuation ? (
                  <VerseNumber value={verse.num} />
                ) : null}
              </span>
              <span className={verse.redLetter ? 'text-[var(--wine)]' : undefined}>
                {line.text}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
