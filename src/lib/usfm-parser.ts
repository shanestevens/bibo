import type {
  BibleBook,
  Chapter,
  ChapterBlock,
  DescriptionBlock,
  HeadingBlock,
  ParagraphStyle,
  PoetryParagraphBlock,
  ProseParagraphBlock,
  PoetryLine,
  SpacerBlock,
  Testament,
  Verse,
} from './types'

interface ParseUsfmOptions {
  testament?: Testament
  source?: string
}

interface InlineState {
  inJesusWords: boolean
}

interface CleanInlineResult {
  text: string
  redLetter: boolean
}

const HEADING_MARKERS = /^(ms|s)(\d+)?$/
const POETRY_MARKERS = /^q(\d+)?$/
const DEFAULT_SOURCE = 'World English Bible (WEB)'

export function parseUsfmBook(
  usfm: string,
  options: ParseUsfmOptions = {},
): BibleBook {
  const lines = usfm.replace(/^\uFEFF/, '').split(/\r?\n/)
  const inlineState: InlineState = { inJesusWords: false }
  const titleLines: string[] = []

  const book: BibleBook = {
    name: '',
    abbrev: '',
    testament: options.testament ?? 'old',
    source: options.source ?? DEFAULT_SOURCE,
    chapters: [],
  }

  let currentChapter: Chapter | null = null
  let currentParagraph: ProseParagraphBlock | PoetryParagraphBlock | null = null
  let currentVerse: Verse | null = null
  let currentVerseNumber: number | null = null
  let currentPoetryIndent = 1
  let nextProseStyle: ParagraphStyle = 'flush'

  const closeParagraph = () => {
    currentParagraph = null
    currentVerse = null
    currentPoetryIndent = 1
  }

  const resetSectionState = (preserveVerseNumber = false) => {
    closeParagraph()
    if (!preserveVerseNumber) {
      currentVerseNumber = null
    }
  }

  const addBlock = (block: ChapterBlock | null) => {
    if (!currentChapter || !block) {
      return
    }

    if (block.kind === 'spacer' && currentChapter.blocks.at(-1)?.kind === 'spacer') {
      return
    }

    currentChapter.blocks.push(block)
  }

  const startChapter = (chapterNumber: number) => {
    currentChapter = {
      number: chapterNumber,
      blocks: [],
    }

    book.chapters.push(currentChapter)
    nextProseStyle = 'flush'
    resetSectionState()
  }

  const startProseParagraph = (style?: ParagraphStyle) => {
    currentParagraph = {
      kind: 'paragraph',
      type: 'prose',
      style: style ?? nextProseStyle,
      verses: [],
    } satisfies ProseParagraphBlock

    addBlock(currentParagraph)
    currentVerse = null
    currentPoetryIndent = 1
    nextProseStyle = 'indented'
  }

  const ensurePoetryParagraph = () => {
    if (currentParagraph?.kind === 'paragraph' && currentParagraph.type === 'poetry') {
      return
    }

    currentParagraph = {
      kind: 'paragraph',
      type: 'poetry',
      verses: [],
    } satisfies PoetryParagraphBlock

    addBlock(currentParagraph)
    currentVerse = null
    nextProseStyle = 'indented'
  }

  const createContinuationVerse = (type: 'prose' | 'poetry') => {
    if (!currentParagraph || !currentVerseNumber) {
      return null
    }

    const verse: Verse =
      type === 'poetry'
        ? { num: currentVerseNumber, continuation: true, lines: [] }
        : { num: currentVerseNumber, continuation: true, text: '' }

    currentParagraph.verses.push(verse)
    currentVerse = verse
    return verse
  }

  const appendProseText = (rawText: string) => {
    const cleaned = cleanInlineText(rawText, inlineState)
    if (!cleaned.text) {
      return
    }

    if (!isProseParagraph(currentParagraph)) {
      startProseParagraph()
    }

    if (!currentVerse) {
      currentVerse = createContinuationVerse('prose')
    }

    if (!currentVerse) {
      return
    }

    currentVerse.text = mergeText(currentVerse.text, cleaned.text)
    if (cleaned.redLetter) {
      currentVerse.redLetter = true
    }
  }

  const appendPoetryLine = (rawText: string, indent: number) => {
    const cleaned = cleanInlineText(rawText, inlineState)
    if (!cleaned.text) {
      return
    }

    ensurePoetryParagraph()

    if (!currentVerse) {
      currentVerse = createContinuationVerse('poetry')
    }

    if (!currentVerse) {
      return
    }

    currentVerse.lines ??= []
    currentVerse.lines.push({
      indent,
      text: cleaned.text,
    } satisfies PoetryLine)

    if (cleaned.redLetter) {
      currentVerse.redLetter = true
    }
  }

  const beginVerse = (verseNumber: number) => {
    currentVerseNumber = verseNumber

    if (!currentParagraph) {
      startProseParagraph()
    }

    const paragraph = currentParagraph
    if (!paragraph) {
      return
    }

    currentVerse =
      paragraph.type === 'poetry'
        ? { num: verseNumber, lines: [] }
        : { num: verseNumber, text: '' }

    paragraph.verses.push(currentVerse)
  }

  for (const rawLine of lines) {
    let line = rawLine.trimEnd()

    if (!line.trim()) {
      continue
    }

    while (line.startsWith('\\')) {
      const markerMatch = line.match(/^\\([A-Za-z0-9]+)\s*/)
      if (!markerMatch) {
        break
      }

      const marker = markerMatch[1]
      const content = line.slice(markerMatch[0].length)

      if (marker === 'id') {
        const identifier = content.trim().split(/\s+/)[0]
        if (identifier) {
          book.abbrev = identifier
        }
        line = ''
        break
      }

      if (marker === 'h' || marker === 'toc2') {
        const { text } = cleanInlineText(content, inlineState)
        if (text) {
          book.name = text
        }
        line = ''
        break
      }

      if (marker === 'toc1') {
        const { text } = cleanInlineText(content, inlineState)
        if (text && !book.fullTitle) {
          book.fullTitle = text
        }
        line = ''
        break
      }

      if (/^mt\d$/.test(marker)) {
        const { text } = cleanInlineText(content, inlineState)
        if (text) {
          titleLines.push(text)
        }
        line = ''
        break
      }

      if (marker === 'cl') {
        const { text } = cleanInlineText(content, inlineState)
        if (text) {
          book.chapterLabel = text
        }
        line = ''
        break
      }

      if (marker === 'c') {
        const chapterNumber = Number.parseInt(content.trim(), 10)
        if (Number.isFinite(chapterNumber)) {
          startChapter(chapterNumber)
        }
        line = ''
        break
      }

      const headingMatch = marker.match(HEADING_MARKERS)
      if (headingMatch) {
        const { text } = cleanInlineText(content, inlineState)
        addBlock(
          text
            ? ({
                kind: 'heading',
                text,
                level: Number.parseInt(headingMatch[2] ?? '1', 10) as 1 | 2 | 3,
              } satisfies HeadingBlock)
            : null,
        )
        nextProseStyle = 'flush'
        resetSectionState()
        line = ''
        break
      }

      if (marker === 'd') {
        const { text } = cleanInlineText(content, inlineState)
        addBlock(
          text
            ? ({
                kind: 'description',
                text,
              } satisfies DescriptionBlock)
            : null,
        )
        nextProseStyle = 'flush'
        resetSectionState()
        line = ''
        break
      }

      if (marker === 'b') {
        addBlock({ kind: 'spacer' } satisfies SpacerBlock)
        nextProseStyle = 'flush'
        resetSectionState()
        line = ''
        break
      }

      if (marker === 'nb') {
        nextProseStyle = 'flush'
        resetSectionState()
        line = content
        continue
      }

      if (marker === 'p') {
        startProseParagraph()
        line = content
        continue
      }

      if (marker === 'm') {
        startProseParagraph('flush')
        line = content
        continue
      }

      const poetryMatch = marker.match(POETRY_MARKERS)
      if (poetryMatch) {
        ensurePoetryParagraph()
        currentPoetryIndent = Number.parseInt(poetryMatch[1] ?? '1', 10)
        line = content
        continue
      }

      if (marker === 'v') {
        const verseMatch = content.match(/^(\d+)(?:[-,]\d+)?\s*(.*)$/s)
        if (!verseMatch) {
          line = ''
          break
        }

        beginVerse(Number.parseInt(verseMatch[1], 10))
        if (isPoetryParagraph(currentParagraph)) {
          appendPoetryLine(verseMatch[2], currentPoetryIndent)
        } else {
          appendProseText(verseMatch[2])
        }
        line = ''
        break
      }

      break
    }

    if (!line.trim()) {
      continue
    }

    if (isPoetryParagraph(currentParagraph)) {
      appendPoetryLine(line, currentPoetryIndent)
      continue
    }

    appendProseText(line)
  }

  book.name ||= book.abbrev
  book.fullTitle ||= titleLines.join(' ').trim() || book.name

  return book
}

function cleanInlineText(rawText: string, inlineState: InlineState): CleanInlineResult {
  if (!rawText.trim()) {
    return { text: '', redLetter: inlineState.inJesusWords }
  }

  let text = rawText
  let redLetter = inlineState.inJesusWords

  text = text.replace(/\\f\b[\s\S]*?\\f\*/g, ' ')
  text = text.replace(/\\x\b[\s\S]*?\\x\*/g, ' ')

  text = text.replace(/\\wj\s*/g, () => {
    inlineState.inJesusWords = true
    redLetter = true
    return ''
  })

  text = text.replace(/\\wj\*/g, () => {
    inlineState.inJesusWords = false
    return ''
  })

  text = text.replace(/\\qs\s*/g, '')
  text = text.replace(/\\qs\*/g, '')
  text = text.replace(/\\\+?w\s+([^|\\]+?)(?:\|[^\\]*)?\\\+?w\*/g, '$1')
  text = text.replace(/\\\+?wh\s+([^|\\]+?)(?:\|[^\\]*)?\\\+?wh\*/g, '$1')
  text = text.replace(/\\[A-Za-z0-9+]+\*?/g, ' ')
  text = text.replace(/\s+([,.;!?])/g, '$1')
  text = text.replace(/\(\s+/g, '(')
  text = text.replace(/\s+\)/g, ')')
  text = text.replace(/\s+([”’])/g, '$1')
  text = text.replace(/([“‘])\s+/g, '$1')
  text = text.replace(/\s+/g, ' ').trim()

  if (inlineState.inJesusWords) {
    redLetter = true
  }

  return { text, redLetter }
}

function mergeText(existingText: string | undefined, nextText: string): string {
  if (!existingText) {
    return nextText
  }

  if (/^[,.;!?)]/.test(nextText)) {
    return `${existingText}${nextText}`
  }

  if (/[“‘]$/.test(existingText)) {
    return `${existingText}${nextText}`
  }

  return `${existingText} ${nextText}`.replace(/\s+/g, ' ').trim()
}

function isProseParagraph(
  paragraph: ProseParagraphBlock | PoetryParagraphBlock | null,
): paragraph is ProseParagraphBlock {
  return paragraph?.type === 'prose'
}

function isPoetryParagraph(
  paragraph: ProseParagraphBlock | PoetryParagraphBlock | null,
): paragraph is PoetryParagraphBlock {
  return paragraph?.type === 'poetry'
}
