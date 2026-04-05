import type { PhaseOneBookCode } from './bookCatalog'

export interface InspirationalMoment {
  id: string
  category: string
  label: string
  prompt: string
  reference: string
  bookCode: PhaseOneBookCode
  chapterNumber: number
  verseNumbers: number[]
}

export const inspirationalMoments: readonly InspirationalMoment[] = [
  {
    id: 'gen-new-beginnings',
    category: 'Fresh Start',
    label: 'A new beginning',
    prompt: 'Start with the opening claim that God begins the story with purpose.',
    reference: 'Genesis 1:1-3',
    bookCode: 'GEN',
    chapterNumber: 1,
    verseNumbers: [1, 2, 3],
  },
  {
    id: 'gen-made-in-image',
    category: 'Identity',
    label: 'You were made with dignity',
    prompt: "A grounding moment about human worth and being made in God's image.",
    reference: 'Genesis 1:26-27',
    bookCode: 'GEN',
    chapterNumber: 1,
    verseNumbers: [26, 27],
  },
  {
    id: 'psa-still-waters',
    category: 'Comfort',
    label: 'When you need calm',
    prompt: 'A gentle passage about care, rest, and being guided through fear.',
    reference: 'Psalms 23:1-4',
    bookCode: 'PSA',
    chapterNumber: 23,
    verseNumbers: [1, 2, 3, 4],
  },
  {
    id: 'psa-refuge',
    category: 'Strength',
    label: 'When life feels unstable',
    prompt: 'A steadying psalm about God as refuge when the world feels shaken.',
    reference: 'Psalms 46:1-3',
    bookCode: 'PSA',
    chapterNumber: 46,
    verseNumbers: [1, 2, 3],
  },
  {
    id: 'psa-known',
    category: 'Belonging',
    label: 'You are deeply known',
    prompt: 'A close, personal poem about being seen fully and still held.',
    reference: 'Psalms 139:1-6',
    bookCode: 'PSA',
    chapterNumber: 139,
    verseNumbers: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'jhn-light',
    category: 'Hope',
    label: 'Light in the darkness',
    prompt: 'A beautiful opening about light, life, and hope that darkness cannot crush.',
    reference: 'John 1:1-5',
    bookCode: 'JHN',
    chapterNumber: 1,
    verseNumbers: [1, 2, 3, 4, 5],
  },
  {
    id: 'jhn-love',
    category: 'Grace',
    label: "God's love in one place",
    prompt: 'A well-known summary of love, rescue, and what God is like toward the world.',
    reference: 'John 3:16-17',
    bookCode: 'JHN',
    chapterNumber: 3,
    verseNumbers: [16, 17],
  },
  {
    id: 'jhn-peace',
    category: 'Peace',
    label: 'Peace for anxious hearts',
    prompt: 'Jesus speaks comfort to people who are worried and unsettled.',
    reference: 'John 14:1-3',
    bookCode: 'JHN',
    chapterNumber: 14,
    verseNumbers: [1, 2, 3],
  },
] as const
