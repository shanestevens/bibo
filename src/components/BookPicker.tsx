import type { BookCatalogEntry, PhaseOneBookCode } from '../data/bookCatalog'

interface BookPickerProps {
  books: readonly BookCatalogEntry[]
  selectedBook: PhaseOneBookCode
  onSelectBook: (bookCode: PhaseOneBookCode) => void
}

export function BookPicker({
  books,
  selectedBook,
  onSelectBook,
}: BookPickerProps) {
  const oldTestamentBooks = books.filter((book) => book.testament === 'old')
  const newTestamentBooks = books.filter((book) => book.testament === 'new')

  return (
    <div className="relative min-w-0 flex-1 sm:min-w-[19rem]">
      <label className="sr-only" htmlFor="book-select">
        Book
      </label>
      <select
        className="h-12 w-full appearance-none rounded-[0.9rem] border border-[var(--line)] bg-[rgba(255,252,247,0.68)] px-4 pr-10 text-[1rem] font-semibold text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] outline-none transition focus:border-[var(--line-strong)] focus:ring-2 focus:ring-[var(--accent-soft)]"
        id="book-select"
        onChange={(event) => onSelectBook(event.target.value as PhaseOneBookCode)}
        value={selectedBook}
      >
        <optgroup label="Old Testament">
          {oldTestamentBooks.map((book) => (
            <option key={book.code} value={book.code}>
              {book.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="New Testament">
          {newTestamentBooks.map((book) => (
            <option key={book.code} value={book.code}>
              {book.name}
            </option>
          ))}
        </optgroup>
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--muted)]">
        <svg
          aria-hidden="true"
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 12 12"
        >
          <path
            d="M2.25 4.5 6 8.25 9.75 4.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </span>
    </div>
  )
}
