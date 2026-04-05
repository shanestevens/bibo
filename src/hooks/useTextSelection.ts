import { type RefObject, useEffect, useRef, useState } from 'react'
import { buildSelectedPassage } from '../lib/passage'
import type { Chapter, SelectionAction } from '../lib/types'

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
  const [selectionAction, setSelectionAction] = useState<SelectionAction | null>(null)
  const isPointerDownRef = useRef(false)

  useEffect(() => {
    if (!bookName || !chapter) {
      return
    }

    const clearSelectionAction = () => {
      setSelectionAction(null)
    }

    const evaluateSelection = () => {
      const container = containerRef.current
      const selection = window.getSelection()

      if (!container || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
        clearSelectionAction()
        return
      }

      const range = selection.getRangeAt(0)
      const commonAncestor = range.commonAncestorContainer
      const isInsideContainer =
        container.contains(commonAncestor) ||
        (commonAncestor.nodeType === Node.TEXT_NODE &&
          container.contains(commonAncestor.parentNode))

      if (!isInsideContainer) {
        clearSelectionAction()
        return
      }

      const selectionRect = range.getBoundingClientRect()
      if (selectionRect.width === 0 && selectionRect.height === 0) {
        clearSelectionAction()
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
        clearSelectionAction()
        return
      }

      const nextPassage = buildSelectedPassage(
        bookName,
        chapter,
        selection.toString(),
        [...new Set(verseNumbers)],
      )

      if (!nextPassage.text) {
        clearSelectionAction()
        return
      }

      setSelectionAction({
        left: clampSelectionLeft(selectionRect.left + selectionRect.width / 2),
        placement: selectionRect.top > 96 ? 'above' : 'below',
        passage: nextPassage,
        top: selectionRect.top > 96 ? selectionRect.top : selectionRect.bottom,
      })
    }

    const handleSelectionChange = () => {
      const selection = window.getSelection()

      if (!selection || selection.isCollapsed) {
        clearSelectionAction()
        return
      }

      if (!isPointerDownRef.current) {
        window.requestAnimationFrame(evaluateSelection)
      }
    }

    const handlePointerDown = () => {
      isPointerDownRef.current = true
      clearSelectionAction()
    }

    const handlePointerUp = () => {
      isPointerDownRef.current = false
      window.requestAnimationFrame(evaluateSelection)
    }

    const handleKeyUp = () => {
      window.requestAnimationFrame(evaluateSelection)
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('keyup', handleKeyUp)
    window.addEventListener('scroll', clearSelectionAction, true)
    window.addEventListener('resize', clearSelectionAction)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('scroll', clearSelectionAction, true)
      window.removeEventListener('resize', clearSelectionAction)
    }
  }, [bookName, chapter, containerRef])

  const clearSelection = () => {
    window.getSelection()?.removeAllRanges()
    setSelectionAction(null)
  }

  return {
    clearSelection,
    selectionAction: bookName && chapter ? selectionAction : null,
  }
}

function clampSelectionLeft(value: number): number {
  const horizontalPadding = 104
  return Math.min(
    Math.max(value, horizontalPadding),
    window.innerWidth - horizontalPadding,
  )
}
