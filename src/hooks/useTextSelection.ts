import { type RefObject, useEffect, useState } from 'react'
import { buildSelectedPassage } from '../lib/passage'
import type { Chapter, SelectedPassage } from '../lib/types'

interface UseTextSelectionOptions {
  bookName: string | null
  chapter: Chapter | null
  containerRef: RefObject<HTMLElement | null>
}

export function useTextSelection({
  bookName,
  chapter,
  containerRef,
}: UseTextSelectionOptions) {
  const [selectedPassage, setSelectedPassage] = useState<SelectedPassage | null>(null)

  useEffect(() => {
    if (!bookName || !chapter) {
      return
    }

    const handleSelectionChange = () => {
      const container = containerRef.current
      const selection = window.getSelection()

      if (!container || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return
      }

      const range = selection.getRangeAt(0)
      const commonAncestor = range.commonAncestorContainer
      const isInsideContainer =
        container.contains(commonAncestor) ||
        (commonAncestor.nodeType === Node.TEXT_NODE &&
          container.contains(commonAncestor.parentNode))

      if (!isInsideContainer) {
        return
      }

      const verseNodes = Array.from(
        container.querySelectorAll<HTMLElement>('[data-verse-number]'),
      )

      const verseNumbers = verseNodes
        .filter((node) => {
          try {
            return range.intersectsNode(node)
          } catch {
            return false
          }
        })
        .map((node) => Number.parseInt(node.dataset.verseNumber ?? '', 10))
        .filter((value) => Number.isFinite(value))

      if (verseNumbers.length === 0) {
        return
      }

      const nextPassage = buildSelectedPassage(
        bookName,
        chapter,
        selection.toString(),
        [...new Set(verseNumbers)],
      )

      if (!nextPassage.text) {
        return
      }

      setSelectedPassage(nextPassage)
    }

    document.addEventListener('selectionchange', handleSelectionChange)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [bookName, chapter, containerRef])

  const clearSelection = () => {
    window.getSelection()?.removeAllRanges()
    setSelectedPassage(null)
  }

  return {
    clearSelection,
    selectedPassage: bookName && chapter ? selectedPassage : null,
  }
}
