import type { Chapter, SelectedPassage, Verse } from './types'

export function normalizeSelectionText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

export function buildPassageReference(
  bookName: string,
  chapterNumber: number,
  verseNumbers: number[],
): string {
  if (verseNumbers.length === 0) {
    return `${bookName} ${chapterNumber}`
  }

  const uniqueVerses = [...new Set(verseNumbers)].sort((left, right) => left - right)
  const ranges: string[] = []

  let rangeStart = uniqueVerses[0]
  let previousVerse = uniqueVerses[0]

  for (const verseNumber of uniqueVerses.slice(1)) {
    if (verseNumber === previousVerse + 1) {
      previousVerse = verseNumber
      continue
    }

    ranges.push(
      rangeStart === previousVerse ? `${rangeStart}` : `${rangeStart}-${previousVerse}`,
    )
    rangeStart = verseNumber
    previousVerse = verseNumber
  }

  ranges.push(
    rangeStart === previousVerse ? `${rangeStart}` : `${rangeStart}-${previousVerse}`,
  )

  return `${bookName} ${chapterNumber}:${ranges.join(',')}`
}

export function buildChapterContext(bookName: string, chapter: Chapter): string {
  const contextLines: string[] = [`${bookName} ${chapter.number}`]

  for (const block of chapter.blocks) {
    if (block.kind === 'heading') {
      contextLines.push(block.text)
      continue
    }

    if (block.kind === 'description') {
      contextLines.push(block.text)
      continue
    }

    if (block.kind === 'spacer') {
      contextLines.push('')
      continue
    }

    if (block.type === 'prose') {
      contextLines.push(
        ...block.verses.map((verse) => formatVerseLine(verse, verse.text ?? '')),
      )
      continue
    }

    for (const verse of block.verses) {
      const poetryText = verse.lines?.map((line) => line.text).join(' / ') ?? ''
      contextLines.push(formatVerseLine(verse, poetryText))
    }
  }

  return contextLines.join('\n').trim()
}

export function buildSelectedPassage(
  bookName: string,
  chapter: Chapter,
  text: string,
  verseNumbers: number[],
): SelectedPassage {
  const normalizedText = normalizeSelectionText(text)

  return {
    bookName,
    chapterNumber: chapter.number,
    contextText: buildChapterContext(bookName, chapter),
    reference: buildPassageReference(bookName, chapter.number, verseNumbers),
    text: normalizedText,
    verseNumbers,
  }
}

function formatVerseLine(verse: Verse, text: string): string {
  const prefix = verse.continuation ? `${verse.num}b` : `${verse.num}`
  return `${prefix} ${text}`.trim()
}
