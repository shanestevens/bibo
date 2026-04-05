import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseUsfmBook } from '../src/lib/usfm-parser.ts'
import type { Testament } from '../src/lib/types.ts'

interface SourceBook {
  code: string
  filename: string
  testament: Testament
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const sourceDir = path.join(repoRoot, 'usfm', 'source')
const outputDir = path.join(repoRoot, 'src', 'data', 'books')

const phaseOneBooks: SourceBook[] = [
  {
    code: 'GEN',
    filename: '02-GENengwebp.usfm',
    testament: 'old',
  },
  {
    code: 'PSA',
    filename: '20-PSAengwebp.usfm',
    testament: 'old',
  },
  {
    code: 'JHN',
    filename: '73-JHNengwebp.usfm',
    testament: 'new',
  },
]

async function main() {
  await mkdir(outputDir, { recursive: true })

  for (const sourceBook of phaseOneBooks) {
    const rawBook = await readFile(path.join(sourceDir, sourceBook.filename), 'utf8')
    const parsedBook = parseUsfmBook(rawBook, {
      testament: sourceBook.testament,
      source: 'World English Bible (WEB)',
    })

    const outputPath = path.join(outputDir, `${sourceBook.code}.json`)
    await writeFile(outputPath, JSON.stringify(parsedBook, null, 2))

    console.log(
      `Parsed ${parsedBook.name} (${parsedBook.chapters.length} chapters) -> ${path.relative(repoRoot, outputPath)}`,
    )
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
