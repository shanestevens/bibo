import type { RefObject } from 'react'
import type { BibleBook, Chapter, PoetryParagraphBlock, ProseParagraphBlock } from '../lib/types'
import { PoetryParagraph } from './PoetryParagraph'
import { ProseParagraph } from './ProseParagraph'

interface ChapterViewProps {
  book: BibleBook
  chapter: Chapter
  selectionRootRef?: RefObject<HTMLElement | null>
}

export function ChapterView({ book, chapter, selectionRootRef }: ChapterViewProps) {
  const chapterLabel = book.chapterLabel ?? 'Chapter'

  return (
    <article
      className="mx-auto max-w-[40rem] rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper-panel-strong)] px-5 py-7 shadow-[0_14px_34px_rgba(58,41,20,0.1)] sm:px-7 sm:py-8"
      ref={selectionRootRef}
    >
      <header className="mb-7 text-center">
        <p className="text-[0.73rem] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
          {book.source}
        </p>
        <h2 className="mt-3 font-[var(--font-serif)] text-[2.45rem] leading-none text-[var(--ink)] sm:text-[3rem]">
          {book.name}
        </h2>
        {book.fullTitle && book.fullTitle !== book.name ? (
          <p className="mx-auto mt-2 max-w-[28rem] text-[0.96rem] italic text-[var(--muted)] sm:text-[1rem]">
            {book.fullTitle}
          </p>
        ) : null}
        <div className="mx-auto mt-4 h-px w-16 bg-[var(--line-strong)]" />
        <p className="mt-3 text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
          {chapterLabel} {chapter.number}
        </p>
      </header>

      <div className="space-y-6">
        {chapter.blocks.map((block, index) => {
          if (block.kind === 'heading') {
            return (
              <div
                className={[
                  'text-center text-[var(--muted)]',
                  block.level === 1
                    ? 'text-[0.8rem] font-semibold uppercase tracking-[0.34em]'
                    : 'text-[1rem] italic sm:text-[1.08rem]',
                ].join(' ')}
                key={`heading-${index}-${block.text.slice(0, 18)}`}
              >
                {block.text}
              </div>
            )
          }

          if (block.kind === 'description') {
            return (
              <div
                className="mx-auto max-w-[30rem] text-center text-[0.98rem] italic leading-relaxed text-[var(--muted)] sm:text-[1.03rem]"
                key={`description-${index}-${block.text.slice(0, 18)}`}
              >
                {block.text}
              </div>
            )
          }

          if (block.kind === 'spacer') {
            return <div className="h-2" key={`spacer-${index}`} />
          }

          if (block.type === 'poetry') {
            return (
              <PoetryParagraph
                key={`poetry-${index}`}
                paragraph={block as PoetryParagraphBlock}
              />
            )
          }

          return (
            <ProseParagraph
              key={`prose-${index}`}
              paragraph={block as ProseParagraphBlock}
            />
          )
        })}
      </div>
    </article>
  )
}
