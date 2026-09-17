# Lampstand

Lampstand is a mobile-first Bible quiz practice app for NKJV-aligned study. It currently ships with a Proverbs question bank and is designed to grow to additional books such as Job and Revelation.

The app supports focused study as well as timed competition-style practice. Learners can choose books, chapters, difficulty levels, question types, and quiz length, then review explanations and track progress across sessions.

## Features

- Practice and competition quiz modes
- Single-select and free-text questions
- Filters for book, chapter, difficulty, and question type
- Fact-aware quiz generation to reduce duplicate concepts
- Results with answer explanations and question review
- Flagged questions for later study
- Local history and statistics stored in the browser
- Question browsing and data validation tools for content authors

## Getting started

### Requirements

- Node.js 20 or newer
- npm

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser. The bundled question catalog is loaded from `data/generated/questions.json`.

For a production build:

```bash
npm run build
npm start
```

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run import:questions` | Convert the source CSV into generated JSON |
| `npm run validate:questions` | Import and validate the question catalog |

Run `npm run validate:questions` after editing question data. It checks required fields, IDs, answer values, supported UI shapes, and fact coverage before writing the generated catalog.

## Application areas

- `/` - Dashboard and recent activity
- `/quiz/setup` - Configure a quiz
- `/quiz/play` - Answer questions
- `/quiz/results/[sessionId]` - Review a completed session
- `/review` - Study flagged and missed questions
- `/questions` - Browse the question catalog
- `/history` - View previous quiz sessions
- `/stats` - View progress and performance

## Project structure

```text
app/                    Next.js routes and global styles
components/             Client-side quiz and catalog views
data/generated/         Generated question JSON used by the app
lib/questions.ts        Question types, filtering, and quiz generation
lib/session.ts          Client-side session and progress persistence
lib/*.csv               Source question data
scripts/                Import and validation scripts
```

`components/quiz-app.tsx` coordinates the main client workflow. The question engine in `lib/questions.ts` is book-independent: it filters eligible questions, balances selected difficulties, and can avoid repeating the same `factId` in a quiz.

## Question data workflow

The source catalog is a CSV in `lib/`. Import it into the generated JSON catalog with:

```bash
npm run import:questions
```

Each question keeps both a `questionId` and a `factId`. Multiple question variants can test the same fact, while `factId` lets quiz generation and review identify those variants together. Tags and book metadata are data-driven, so adding another book should not require book-specific UI conditionals.

To add Job or Revelation, add CSV data following the existing schema, run the importer and validator, and rebuild the app. Use tags for book-specific concepts such as speakers or thematic groups.

## Persistence and limitations

Attempts and flags currently persist in browser `localStorage` under `lampstand-attempts` and `lampstand-flagged`. There is no account system or backend synchronization yet, so progress is tied to the current browser.

The current MVP does not include automated browser tests, a test runner, or server-side persistence. Additional question renderers such as multi-select, ordering, and matching can be introduced by extending the question UI model and adding their renderers without changing the catalog format.
