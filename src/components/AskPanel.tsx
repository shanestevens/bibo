import { useState } from 'react'
import type { ConversationTurn, SelectedPassage } from '../lib/types'

const quickQuestions = [
  'Explain this in plain language.',
  'What does this mean?',
  'What was going on at the time?',
  'Why does this matter?',
] as const

interface AskPanelProps {
  error: string | null
  isLoading: boolean
  messages: ConversationTurn[]
  onAskQuestion: (question: string) => Promise<void> | void
  onClose: () => void
  passage: SelectedPassage
}

export function AskPanel({
  error,
  isLoading,
  messages,
  onAskQuestion,
  onClose,
  passage,
}: AskPanelProps) {
  const [draftQuestion, setDraftQuestion] = useState('')

  const submitQuestion = async (question: string) => {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || isLoading) {
      return
    }

    setDraftQuestion('')
    await onAskQuestion(trimmedQuestion)
  }

  return (
    <aside className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-3xl rounded-[1.6rem] border border-[var(--line)] bg-[var(--paper-panel-strong)]/98 p-4 shadow-[0_18px_50px_rgba(58,41,20,0.2)] backdrop-blur-md sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              Ask About This Passage
            </p>
            <p className="mt-1 text-[0.88rem] font-semibold text-[var(--accent)]">
              {passage.reference}
            </p>
            <p className="mt-2 max-w-2xl text-[0.96rem] leading-relaxed text-[var(--ink)]">
              "{passage.text}"
            </p>
          </div>

          <button
            aria-label="Close the ask panel"
            className="shrink-0 rounded-full border border-[var(--line)] px-3 py-1.5 text-[0.85rem] text-[var(--muted)] transition hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickQuestions.map((question) => (
            <button
              className="rounded-full border border-[var(--line)] bg-white/55 px-3 py-1.5 text-[0.88rem] text-[var(--ink)] transition hover:border-[var(--line-strong)] hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
              key={question}
              onClick={() => {
                void submitQuestion(question)
              }}
              type="button"
            >
              {question}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {messages.length > 0 ? (
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {messages.map((message, index) => (
                <div
                  className={[
                    'rounded-[1.1rem] px-4 py-3 text-[0.95rem] leading-relaxed',
                    message.role === 'assistant'
                      ? 'border border-[var(--line)] bg-white/70 text-[var(--ink)]'
                      : 'ml-auto max-w-[85%] bg-[var(--accent-soft)] text-[var(--ink)]',
                  ].join(' ')}
                  key={`${message.role}-${index}-${message.content.slice(0, 18)}`}
                >
                  {message.content}
                </div>
              ))}
              {isLoading ? (
                <div className="rounded-[1.1rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-[0.95rem] text-[var(--muted)]">
                  Thinking through the passage...
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-[0.93rem] leading-relaxed text-[var(--muted)]">
              Select a quick question or ask your own. Follow-up questions stay
              grounded in this same passage and chapter context.
            </p>
          )}

          {error ? (
            <div className="rounded-[1rem] border border-[rgba(142,62,53,0.24)] bg-[rgba(142,62,53,0.08)] px-3 py-2 text-[0.9rem] text-[var(--wine)]">
              {error}
            </div>
          ) : null}

          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault()
              void submitQuestion(draftQuestion)
            }}
          >
            <input
              className="min-w-0 flex-1 rounded-[1rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-[0.96rem] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--line-strong)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              disabled={isLoading}
              onChange={(event) => setDraftQuestion(event.target.value)}
              placeholder="Ask a follow-up question in plain language..."
              value={draftQuestion}
            />
            <button
              className="rounded-[1rem] bg-[var(--ink)] px-4 py-3 text-[0.95rem] font-semibold text-[var(--paper)] transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || !draftQuestion.trim()}
              type="submit"
            >
              Ask
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
