import { useEffect, useState } from 'react'
import { requestPassageExplanation } from '../lib/bible-api'
import type { ConversationTurn, SelectedPassage } from '../lib/types'

export function useConversation(resetKey: string) {
  const [messages, setMessages] = useState<ConversationTurn[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMessages([])
    setError(null)
    setIsLoading(false)
  }, [resetKey])

  const askQuestion = async (passage: SelectedPassage, question: string) => {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || isLoading) {
      return
    }

    const history = messages
    const nextUserMessage: ConversationTurn = {
      role: 'user',
      content: trimmedQuestion,
    }

    setMessages((currentMessages) => [...currentMessages, nextUserMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await requestPassageExplanation({
        history,
        passage,
        question: trimmedQuestion,
      })

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'assistant',
          content: response.answer,
        },
      ])
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Something went wrong while generating the explanation.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    askQuestion,
    error,
    isLoading,
    messages,
  }
}
