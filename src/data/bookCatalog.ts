import type { BibleBook, Testament } from '../lib/types'

export type PhaseOneBookCode = 'GEN' | 'PSA' | 'JHN'

export interface BookCatalogEntry {
  code: PhaseOneBookCode
  name: string
  testament: Testament
  chapters: number
  descriptor: string
  loader: () => Promise<BibleBook>
}

const loaders: Record<PhaseOneBookCode, () => Promise<BibleBook>> = {
  GEN: () => import('./books/GEN.json').then((module) => module.default as BibleBook),
  PSA: () => import('./books/PSA.json').then((module) => module.default as BibleBook),
  JHN: () => import('./books/JHN.json').then((module) => module.default as BibleBook),
}

export const bookCatalog: readonly BookCatalogEntry[] = [
  {
    code: 'GEN',
    name: 'Genesis',
    testament: 'old',
    chapters: 50,
    descriptor: 'Origins, covenant, blessing, and the first long family story.',
    loader: loaders.GEN,
  },
  {
    code: 'PSA',
    name: 'Psalms',
    testament: 'old',
    chapters: 150,
    descriptor: 'Prayer, lament, praise, and poetry shaped for the voice.',
    loader: loaders.PSA,
  },
  {
    code: 'JHN',
    name: 'John',
    testament: 'new',
    chapters: 21,
    descriptor: 'A reflective Gospel centered on signs, testimony, and life.',
    loader: loaders.JHN,
  },
] as const

export function findCatalogEntry(code: PhaseOneBookCode): BookCatalogEntry {
  return bookCatalog.find((entry) => entry.code === code) ?? bookCatalog[0]
}

export async function loadBook(code: PhaseOneBookCode): Promise<BibleBook> {
  return loaders[code]()
}
