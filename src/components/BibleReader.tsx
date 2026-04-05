import {
  type TouchEvent,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from 'react'
import {
  bookCatalog,
  findCatalogEntry,
  loadBook,
  type PhaseOneBookCode,
} from '../data/bookCatalog'
import { useConversation } from '../hooks/useConversation'
import { useTextSelection } from '../hooks/useTextSelection'
import type { BibleBook } from '../lib/types'
import { AskPanel } from './AskPanel'
import { BookPicker } from './BookPicker'
import { ChapterNav } from './ChapterNav'
import { ChapterView } from './ChapterView'

export function BibleReader() {
  const [selectedBook, setSelectedBook] = useState<PhaseOneBookCode>('GEN')
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [loadedBook, setLoadedBook] = useState<BibleBook | null>(null)
  const [isLoadingBook, setIsLoadingBook] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const selectionRootRef = useRef<HTMLElement | null>(null)

  const currentCatalogEntry = findCatalogEntry(selectedBook)
  const chapterCount = loadedBook?.chapters.length ?? currentCatalogEntry.chapters
  const currentChapter =
    loadedBook?.chapters.find((chapter) => chapter.number === selectedChapter) ?? null
  const chapterLabel = loadedBook?.chapterLabel ?? 'Chapter'
  const { clearSelection, selectedPassage } = useTextSelection({
    bookName: loadedBook?.name ?? null,
    chapter: currentChapter,
    containerRef: selectionRootRef,
  })
  const conversationResetKey = selectedPassage
    ? `${selectedPassage.reference}:${selectedPassage.text}`
    : `${selectedBook}:${selectedChapter}`
  const {
    askQuestion,
    error: conversationError,
    isLoading: isAsking,
    messages,
  } = useConversation(conversationResetKey)

  const applyLoadedBook = useEffectEvent((book: BibleBook) => {
    setLoadedBook(book)
    setSelectedChapter((currentValue) => Math.min(currentValue, book.chapters.length))
    setIsLoadingBook(false)
  })

  useEffect(() => {
    let isCancelled = false

    void loadBook(selectedBook)
      .then((book) => {
        if (!isCancelled) {
          applyLoadedBook(book)
        }
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : 'The selected book could not be loaded.',
        )
        setIsLoadingBook(false)
      })

    return () => {
      isCancelled = true
    }
  }, [selectedBook])

  const changeSelection = (nextBook: PhaseOneBookCode, nextChapter: number) => {
    clearSelection()
    startTransition(() => {
      setIsLoadingBook(true)
      setLoadError(null)
      setSelectedBook(nextBook)
      setSelectedChapter(nextChapter)
    })
  }

  const selectBook = (nextBook: PhaseOneBookCode) => {
    changeSelection(nextBook, 1)
  }

  const selectChapter = (nextChapter: number) => {
    clearSelection()
    startTransition(() => {
      setSelectedChapter(nextChapter)
    })
  }

  const goToAdjacentChapter = (direction: 'backward' | 'forward') => {
    const currentBookIndex = bookCatalog.findIndex((book) => book.code === selectedBook)

    if (direction === 'backward') {
      if (selectedChapter > 1) {
        selectChapter(selectedChapter - 1)
        return
      }

      const previousBook = bookCatalog[currentBookIndex - 1]
      if (previousBook) {
        changeSelection(previousBook.code, previousBook.chapters)
      }
      return
    }

    if (selectedChapter < chapterCount) {
      selectChapter(selectedChapter + 1)
      return
    }

    const nextBook = bookCatalog[currentBookIndex + 1]
    if (nextBook) {
      changeSelection(nextBook.code, 1)
    }
  }

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    const touch = event.changedTouches[0]
    touchStartXRef.current = touch.clientX
    touchStartYRef.current = touch.clientY
  }

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) {
      return
    }

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStartXRef.current
    const deltaY = touch.clientY - touchStartYRef.current

    touchStartXRef.current = null
    touchStartYRef.current = null

    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
      return
    }

    if (deltaX < 0) {
      goToAdjacentChapter('forward')
      return
    }

    goToAdjacentChapter('backward')
  }

  const currentBookIndex = bookCatalog.findIndex((book) => book.code === selectedBook)
  const canGoBackward = selectedChapter > 1 || currentBookIndex > 0
  const canGoForward =
    selectedChapter < chapterCount || currentBookIndex < bookCatalog.length - 1

  return (
    <div
      className={[
        'min-h-screen px-4 pb-24 pt-4 sm:px-6 sm:pt-6',
        selectedPassage ? 'pb-[22rem] sm:pb-[20rem]' : '',
      ].join(' ')}
    >
      <div className="mx-auto max-w-5xl">
        <header className="sticky top-3 z-20 rounded-[1.15rem] border border-[var(--line)] bg-[var(--paper-panel-strong)]/92 px-3 py-3 shadow-[0_10px_24px_rgba(58,41,20,0.08)] backdrop-blur-md sm:px-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 px-1">
              <div className="min-w-0">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                  Bibo
                </p>
                <p className="mt-1 text-[0.94rem] text-[var(--muted)]">
                  Highlight any line to ask for context, meaning, or a simpler explanation.
                </p>
              </div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[var(--muted)]">
                {loadedBook?.source ?? 'World English Bible (WEB)'}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <BookPicker
                books={bookCatalog}
                onSelectBook={selectBook}
                selectedBook={selectedBook}
              />
              <ChapterNav
                canGoBackward={canGoBackward}
                canGoForward={canGoForward}
                chapterCount={chapterCount}
                chapterLabel={chapterLabel}
                currentChapter={selectedChapter}
                onGoBackward={() => goToAdjacentChapter('backward')}
                onGoForward={() => goToAdjacentChapter('forward')}
                onSelectChapter={selectChapter}
              />
            </div>
          </div>
        </header>

        <main
          className="mt-3"
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
        >
          <div className="mb-3 flex items-center justify-between gap-3 px-1 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            <span className="truncate">{currentCatalogEntry.descriptor}</span>
            <span className="shrink-0">
              {chapterLabel} {selectedChapter} / {chapterCount}
            </span>
          </div>

          {loadError ? (
            <section className="mx-auto max-w-[40rem] rounded-[1.4rem] border border-[var(--line)] bg-[var(--paper-panel-strong)] px-5 py-6 text-center shadow-[0_14px_34px_rgba(58,41,20,0.1)]">
              <p className="text-[0.8rem] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                Unable to Load Book
              </p>
              <p className="mt-4 text-[1.05rem] leading-relaxed text-[var(--ink)]">
                {loadError}
              </p>
            </section>
          ) : isLoadingBook || !loadedBook || !currentChapter ? (
            <section className="mx-auto max-w-[40rem] rounded-[1.4rem] border border-[var(--line)] bg-[var(--paper-panel-strong)] px-5 py-7 shadow-[0_14px_34px_rgba(58,41,20,0.1)]">
              <div className="animate-pulse space-y-4">
                <div className="mx-auto h-3 w-28 rounded-full bg-[var(--accent-soft)]" />
                <div className="mx-auto h-10 w-44 rounded-full bg-[var(--accent-soft)]" />
                <div className="mx-auto h-3 w-52 rounded-full bg-[var(--accent-soft)]" />
                <div className="mt-8 space-y-3">
                  <div className="h-4 rounded-full bg-[var(--accent-soft)]" />
                  <div className="h-4 rounded-full bg-[var(--accent-soft)]" />
                  <div className="h-4 w-[90%] rounded-full bg-[var(--accent-soft)]" />
                  <div className="h-4 rounded-full bg-[var(--accent-soft)]" />
                </div>
              </div>
            </section>
          ) : (
            <>
              <div className="mb-3 text-center text-[0.88rem] text-[var(--muted)]">
                Highlight any verse or sentence to open the study panel.
              </div>
              <ChapterView
                book={loadedBook}
                chapter={currentChapter}
                selectionRootRef={selectionRootRef}
              />
            </>
          )}
        </main>
      </div>

      {selectedPassage ? (
        <AskPanel
          error={conversationError}
          isLoading={isAsking}
          messages={messages}
          onAskQuestion={async (question) => {
            await askQuestion(selectedPassage, question)
          }}
          onClose={clearSelection}
          passage={selectedPassage}
        />
      ) : null}
    </div>
  )
}
