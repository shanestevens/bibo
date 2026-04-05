import type { ConversationTurn, SelectedPassage } from './types'

interface ExplainPassageRequest {
  history: ConversationTurn[]
  passage: SelectedPassage
  question: string
}

interface ExplainPassageResponse {
  answer: string
}

interface ErrorPayload {
  error?: string
}

export async function requestPassageExplanation({
  history,
  passage,
  question,
}: ExplainPassageRequest): Promise<ExplainPassageResponse> {
  const response = await fetch('/api/explain', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      history,
      passage,
      question,
    }),
  })

  const rawBody = await response.text()
  const payload = parseJsonPayload(rawBody)

  if (!response.ok) {
    throw new Error(
      payload.error ?? buildStatusErrorMessage(response.status, rawBody),
    )
  }

  if (!payload.answer) {
    throw new Error(
      rawBody.trim()
        ? 'The explanation service returned an unexpected response.'
        : 'The explanation service returned an empty response.',
    )
  }

  return {
    answer: payload.answer,
  }
}

function parseJsonPayload(
  rawBody: string,
): Partial<ExplainPassageResponse> & ErrorPayload {
  if (!rawBody.trim()) {
    return {}
  }

  try {
    return JSON.parse(rawBody) as Partial<ExplainPassageResponse> & ErrorPayload
  } catch {
    return {}
  }
}

function buildStatusErrorMessage(statusCode: number, rawBody: string): string {
  if (statusCode === 429) {
    return 'The OpenAI account hit a quota or billing limit while generating this explanation. Update billing or quota and try again.'
  }

  if (!rawBody.trim()) {
    return 'The explanation service returned an empty response. Check the local API server and try again.'
  }

  return `The explanation request failed with status ${statusCode}.`
}
