import OpenAI from 'openai'

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o'

const SYSTEM_PROMPT = `You are a warm, knowledgeable Bible study companion. The reader may be brand new to the Bible, so explain things in plain, everyday language by default. Start with the simplest meaning first, like you are talking to a thoughtful friend over coffee. Avoid jargon, churchy phrasing, and academic language unless the reader asks for it. If you mention a term like covenant, Messiah, Gentiles, or a Hebrew/Greek nuance, explain it immediately in ordinary words. Keep it concise - 2 short paragraphs max. Include historical or cultural context only when it genuinely helps understanding, and explain why it matters in simple terms. Do not be preachy, devotional, or overly scholarly.`

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    sendJson(response, 405, {
      error: 'Method not allowed.',
    })
    return
  }

  if (!openai) {
    sendJson(response, 500, {
      error: 'OPENAI_API_KEY is missing on the server.',
    })
    return
  }

  let payload

  try {
    payload = await readJsonBody(request)
  } catch {
    sendJson(response, 400, {
      error: 'The request body was not valid JSON.',
    })
    return
  }

  const history = Array.isArray(payload?.history)
    ? payload.history
        .filter((message) => message && typeof message.content === 'string')
        .map((message) => ({
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: message.content.trim(),
        }))
        .filter((message) => message.content.length > 0)
    : []

  const passage = payload?.passage
  const question =
    typeof payload?.question === 'string' ? payload.question.trim() : ''

  if (
    !passage ||
    typeof passage.reference !== 'string' ||
    typeof passage.text !== 'string' ||
    typeof passage.contextText !== 'string' ||
    !question
  ) {
    sendJson(response, 400, {
      error: 'Passage reference, selected text, chapter context, and question are required.',
    })
    return
  }

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            `Passage reference: ${passage.reference}`,
            `Selected text: ${passage.text}`,
            'Chapter context:',
            `${String(passage.contextText).slice(0, 12000)}`,
            'Use this passage context as the foundation for the conversation unless the user clearly asks to broaden scope.',
          ].join('\n\n'),
        },
        ...history,
        {
          role: 'user',
          content: question,
        },
      ],
    })

    const answer = completion.choices[0]?.message?.content?.trim()

    if (!answer) {
      sendJson(response, 502, {
        error: 'OpenAI returned an empty response for this passage.',
      })
      return
    }

    sendJson(response, 200, {
      answer,
    })
  } catch (error) {
    const { message, statusCode } = normalizeOpenAiError(error)

    sendJson(response, statusCode, {
      error: message,
    })
  }
}

function normalizeOpenAiError(error) {
  if (error && typeof error === 'object' && 'status' in error) {
    const statusCode =
      typeof error.status === 'number' && error.status >= 400 ? error.status : 500

    if (statusCode === 401) {
      return {
        statusCode,
        message: 'The server-side OpenAI API key was rejected.',
      }
    }

    if (statusCode === 429) {
      return {
        statusCode,
        message:
          'The OpenAI account hit a quota or billing limit while generating this explanation. Update billing or quota and try again.',
      }
    }

    if ('message' in error && typeof error.message === 'string' && error.message.trim()) {
      return {
        statusCode,
        message: error.message.trim(),
      }
    }
  }

  return {
    statusCode: 500,
    message:
      error instanceof Error
        ? error.message
        : 'The explanation request failed on the server.',
  }
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

function readJsonBody(request) {
  if (request.body && typeof request.body === 'object') {
    return Promise.resolve(request.body)
  }

  return new Promise((resolve, reject) => {
    let rawBody = ''

    request.on('data', (chunk) => {
      rawBody += chunk

      if (rawBody.length > 1_000_000) {
        reject(new Error('Request body too large'))
        request.destroy()
      }
    })

    request.on('end', () => {
      try {
        resolve(rawBody ? JSON.parse(rawBody) : {})
      } catch (error) {
        reject(error)
      }
    })

    request.on('error', reject)
  })
}
