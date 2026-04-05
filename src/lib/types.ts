export type Testament = 'old' | 'new'

export type ParagraphStyle = 'flush' | 'indented'

export interface BibleBook {
  name: string
  abbrev: string
  fullTitle?: string
  chapterLabel?: string
  testament: Testament
  source: string
  chapters: Chapter[]
}

export interface Chapter {
  number: number
  blocks: ChapterBlock[]
}

export type ChapterBlock =
  | HeadingBlock
  | DescriptionBlock
  | SpacerBlock
  | ParagraphBlock

export interface HeadingBlock {
  kind: 'heading'
  text: string
  level: 1 | 2 | 3
}

export interface DescriptionBlock {
  kind: 'description'
  text: string
}

export interface SpacerBlock {
  kind: 'spacer'
}

export type ParagraphBlock = ProseParagraphBlock | PoetryParagraphBlock

export interface ProseParagraphBlock {
  kind: 'paragraph'
  type: 'prose'
  style: ParagraphStyle
  verses: Verse[]
}

export interface PoetryParagraphBlock {
  kind: 'paragraph'
  type: 'poetry'
  verses: Verse[]
}

export interface Verse {
  num: number
  continuation?: boolean
  text?: string
  lines?: PoetryLine[]
  redLetter?: boolean
}

export interface PoetryLine {
  text: string
  indent: number
}

export interface SelectedPassage {
  bookName: string
  chapterNumber: number
  contextText: string
  reference: string
  text: string
  verseNumbers: number[]
}

export interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
}
