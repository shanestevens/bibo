# Bibo

A mobile-first Bible reader built with React, TypeScript, Vite, and Tailwind CSS. Phase 1 focuses on the reading experience first: elegant typography, lazy-loaded book data, preserved paragraph and poetry structure, and simple chapter navigation.

## Included In This Pass

- Vite + React + TypeScript scaffold
- Tailwind CSS v4 setup
- WEB USFM source download stored locally in `usfm/` and ignored from git
- Build-time parser for Genesis, Psalms, and John
- Structured JSON output in `src/data/books/`
- Reader UI with:
  - grouped book picker
  - compact chapter picker + previous/next navigation
  - swipe chapter navigation on touch devices
  - prose and poetry rendering tuned separately
  - red-letter support at the verse level
  - highlight-to-ask bottom sheet for passage questions
- Server-side OpenAI integration for passage explanations
- Vite dev proxy to the local API server

## Commands

```bash
npm install
npm run parse:usfm
npm run dev
npm run build
npm run lint
```

## Environment

Create a local `.env.local` file for the API server:

```bash
OPENAI_API_KEY=your_server_side_key_here
OPENAI_MODEL=gpt-4o
```

The key is used only by the local Node API in `server/index.mjs` and is not exposed to the browser bundle.

## Project Structure

```text
src/
  components/
  data/
    books/
  lib/
scripts/
```

## Notes

- The app currently ships three proof-of-concept books: Genesis, Psalms, and John.
- The parser preserves paragraph breaks, poetry indentation, psalm descriptions, major headings, and words of Jesus.
- The AI tone is tuned for plain-language, beginner-friendly explanations by default.
