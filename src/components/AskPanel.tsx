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
    <aside className="study-dock fixed inset-x-0 bottom-0 z-30 overflow-hidden rounded-t-[1.45rem] border-t border-[var(--line)]">
      <div className="mx-auto max-w-5xl px-4 pb-[calc(env(safe-area-inset-bottom)+0.9rem)] pt-3 sm:px-6">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-[var(--line)]" />

        <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:items-start">
          <section className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                  Passage Guide
                </p>
                <p className="mt-1 text-[0.88rem] font-semibold text-[var(--accent)]">
                  {passage.reference}
                </p>
              </div>

              <button
                aria-label="Close the study tray"
                className="rounded-full border border-[var(--line)] bg-white/60 px-3 py-1.5 text-[0.84rem] text-[var(--muted)] transition hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
                onClick={onClose}
                type="button"
              >
                Done
              </button>
            </div>

            <p className="rounded-[1rem] border border-[var(--line)] bg-white/60 px-4 py-3 text-[0.96rem] leading-relaxed text-[var(--ink)]">
              "{passage.text}"
            </p>

            <div className="space-y-2">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Start Here
              </p>
              <div className="flex snap-x gap-2 overflow-x-auto pb-1">
                {quickQuestions.map((question, index) => (
                  <button
                    className={[
                      'shrink-0 rounded-full px-3.5 py-2 text-[0.88rem] transition disabled:cursor-not-allowed disabled:opacity-50',
                      index === 0
                        ? 'border border-[rgba(143,109,57,0.28)] bg-[linear-gradient(180deg,rgba(232,211,167,0.98),rgba(218,190,132,0.98))] font-semibold text-[var(--ink)] shadow-[0_8px_20px_rgba(143,109,57,0.16)]'
                        : 'border border-[var(--line)] bg-white/58 text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-white/78',
                    ].join(' ')}
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
            </div>
          </section>

          <section className="space-y-3">
            <div className="max-h-[17rem] space-y-3 overflow-y-auto pr-1 sm:max-h-[19rem]">
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    className={[
                      'rounded-[1.1rem] px-4 py-3 text-[0.95rem] leading-relaxed',
                      message.role === 'assistant'
                        ? 'border border-[var(--line)] bg-white/70 text-[var(--ink)]'
                        : 'ml-auto max-w-[88%] border border-[rgba(143,109,57,0.2)] bg-[rgba(232,211,167,0.55)] text-[var(--ink)]',
                    ].join(' ')}
                    key={`${message.role}-${index}-${message.content.slice(0, 18)}`}
                  >
                    {message.content}
                  </div>
                ))
              ) : (
                <div className="rounded-[1.15rem] border border-dashed border-[var(--line)] bg-white/55 px-4 py-4 text-[0.93rem] leading-relaxed text-[var(--muted)]">
                  Ask for a simple explanation, the backstory, or why the passage matters.
                  The answer will stay grounded in this exact chapter.
                </div>
              )}

              {isLoading ? (
                <div className="rounded-[1.1rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-[0.95rem] text-[var(--muted)]">
                  Working on a simple explanation...
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="rounded-[1rem] border border-[rgba(142,62,53,0.24)] bg-[rgba(142,62,53,0.08)] px-3 py-2 text-[0.9rem] text-[var(--wine)]">
                {error}
              </div>
            ) : null}

            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault()
                void submitQuestion(draftQuestion)
              }}
            >
              <input
                className="min-w-0 flex-1 rounded-[1rem] border border-[var(--line)] bg-white/74 px-4 py-3 text-[0.96rem] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--line-strong)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                disabled={isLoading}
                onChange={(event) => setDraftQuestion(event.target.value)}
                placeholder="Ask in plain language..."
                value={draftQuestion}
              />
              <button
                className="rounded-[1rem] border border-[rgba(143,109,57,0.28)] bg-[linear-gradient(180deg,rgba(232,211,167,0.98),rgba(218,190,132,0.98))] px-4 py-3 text-[0.95rem] font-semibold text-[var(--ink)] shadow-[0_10px_22px_rgba(143,109,57,0.18)] transition hover:brightness-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading || !draftQuestion.trim()}
                type="submit"
              >
                Send
              </button>
            </form>
          </section>
        </div>
      </div>
    </aside>
  )
}
