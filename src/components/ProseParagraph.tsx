import { Fragment } from 'react'
import type { ProseParagraphBlock } from '../lib/types'
import { VerseNumber } from './VerseNumber'

interface ProseParagraphProps {
  highlightedVerseNumbers?: number[]
  paragraph: ProseParagraphBlock
}

export function ProseParagraph({
  highlightedVerseNumbers = [],
  paragraph,
}: ProseParagraphProps) {
  const highlightedVerseSet = new Set(highlightedVerseNumbers)

  return (
    <p
      className={[
        'font-[var(--font-serif)] text-[1.1rem] leading-[1.95] text-[var(--ink)] sm:text-[1.16rem]',
        paragraph.style === 'indented' ? 'indent-[1.5em]' : '',
      ].join(' ')}
    >
      {paragraph.verses.map((verse, index) => (
        <Fragment
          key={`${verse.num}-${verse.continuation ? 'continued' : 'start'}-${verse.text?.slice(0, 16) ?? index}`}
        >
          <span
            className={[
              verse.redLetter ? 'cursor-text text-[var(--wine)]' : 'cursor-text',
              highlightedVerseSet.has(verse.num)
                ? 'spotlight-verse scroll-mt-40 rounded-[0.55rem] px-[0.18rem] py-[0.05rem]'
                : '',
            ].join(' ')}
            data-verse-number={verse.num}
          >
            {!verse.continuation ? (
              <>
                <VerseNumber value={verse.num} />{' '}
              </>
            ) : null}
            {verse.text}
          </span>
          {index < paragraph.verses.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </p>
  )
}
