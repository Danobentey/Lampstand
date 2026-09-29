# Plan: Corrections grouping, full history browsing, competition timer, mobile nav

## Context / key findings
- `components/quiz-app.tsx` is a single dense client component (`@ts-nocheck`, minified one-line-per-function style) rendering all screens (home/setup/play/results/review/stats) behind one shared header. `components/history-view.tsx` is a SEPARATE standalone component (no shared header) used by `app/history/page.tsx`.
- `lib/session.ts`: `QuizSession` already stores `attempts: Attempt[]` scoped to that session (with `correct`, `answer`, `questionId`, `factId`, `at`). `readHistory()` returns all completed sessions, newest-first, from localStorage key `lampstand-session-history`. No sessionId currently on the global `lampstand-attempts` store used for all-time stats — but we don't need it, since per-session attempts already live on each `QuizSession`.
- `ReviewBase` (recall lab) currently groups by fact/flag using the flat all-time `attempts` array — needs rework to group by session via `readHistory()`.
- `HistoryView` list items currently link to `/quiz/results/[sessionId]`, but `ResultsOriginal` (used by that route) ALWAYS reads `readLastSession()` regardless of the URL param — it was never wired to look up arbitrary sessions by id. Do NOT reuse/fix that route for this feature (out of scope/latent bug, noted below); build a new dedicated route instead.
- Player component (`function Player`) has no timer today. `submitted && mode === "practice"` gates the correct/incorrect feedback panel — competition mode already shows no feedback and just enables "Next", which fits the requested silent lock-on-timeout behavior.
- `AGENTS.md`/`CLAUDE.md`: this repo's Next.js is a customized/altered version — before adding the new dynamic route (`app/history/[sessionId]/page.tsx`), read `node_modules/next/dist/docs/` for the correct current conventions for dynamic route params (the existing `[sessionId]` results route ignores params entirely, which may or may not reflect this Next version's real API).

## Decisions (from user)
- Timer timeout: lock the question as incorrect, do NOT auto-advance — user still clicks "Next" manually.
- Mobile menu: app-wide. Extract a shared header/drawer component and use it in QuizApp AND HistoryView AND the new session-detail page.
- Session detail rows: show question text, given answer, correct answer, and a correct/incorrect badge.
- Timer visual: simple numeric countdown badge (e.g. "5s") near the question header, not a ring or bar.

## Steps

### Phase A — Shared header + mobile drawer (foundation, do first; other phases depend on nav existing everywhere)
1. Extract the current inline `<header>` block from `QuizApp`'s render (quiz-app.tsx) into a new `components/site-header.tsx` client component. Props: `active screen indicator (optional)`, `onNavigate(screen)` callback for internal QuizApp screens (home/setup/review/stats), and plain `<Link>`s for `/history` (since HistoryView/session-detail live outside QuizApp's screen state machine). Simplest approach: give `SiteHeader` a `variant` or just always render real `<Link href>` for every item (`/`, `/quiz/setup`, `/review`, `/stats`, `/history`) instead of the internal `nav()` state setter — this makes it trivially reusable outside QuizApp too, at the cost of QuizApp doing a client-side route push instead of in-memory screen swap for those links. Simpler and safer: keep `SiteHeader` navigation as real `<Link>` elements everywhere (both used inside QuizApp and standalone pages), and update `QuizApp` to drop its internal `nav()`-based header entirely, relying on Next routing + `initialScreen` (already how each `app/*/page.tsx` wrapper works).
2. Add mobile hamburger button (`md:hidden`) to `SiteHeader` and a slide-in drawer (fixed panel + backdrop) with the same links (Practice/Setup, Review, Progress/Stats, History) + "Start quiz" CTA. Close on link click or backdrop click. Keep desktop nav row (`hidden md:flex`) as-is.
3. Replace the inline header markup in `quiz-app.tsx` with `<SiteHeader />`.
4. Replace the plain "← Dashboard" link at the top of `components/history-view.tsx` with `<SiteHeader />` for visual/nav consistency.

### Phase B — Session detail page ("full history" per-session, right & wrong)
5. In `lib/session.ts`, add `readSessionById(id: string): QuizSession | null` — checks `readHistory()` first, falls back to `readLastSession()` if ids match (small pure helper, easy to unit-reason about).
6. Create `components/session-detail-view.tsx` (client component): reads `sessionId` via `useParams()` from `next/navigation`, loads the session with `readSessionById`, maps `session.questionIds` to full `Question` objects (from `lib/questions.ts`), and for each renders: question text, given answer (from matching `session.attempts` entry, or "No answer" if timed out unanswered), correct answer/verse, and a correct/incorrect badge (reuse existing `Pill` styling pattern). Header area: session date/time (`toLocaleString`), book(s)/mode, and score summary (reuse `Panel`/`Stat` patterns already in quiz-app.tsx — either export them from quiz-app.tsx or duplicate the small presentational bits locally to avoid entangling with the `@ts-nocheck` file). Include `<SiteHeader />` at top and a "← Full history" link back to `/history`.
7. Create `app/history/[sessionId]/page.tsx` rendering `<SessionDetailView />`. **Before implementing, read `node_modules/next/dist/docs/` for this project's actual dynamic-route param handling** since this Next build has deviated APIs per AGENTS.md — confirm whether params need to be awaited/passed differently than typical Next.js.
8. Update `components/history-view.tsx` session list links from `/quiz/results/${session.id}` to `/history/${session.id}`.

### Phase C — Corrections page grouped by session (depends on Phase B's session-lookup helpers for consistency, but mostly independent UI work)
9. Rework `ReviewBase` in `components/quiz-app.tsx`:
   - Load `readHistory()` sessions directly inside the component (`useState(() => readHistory())`), instead of relying solely on the flat all-time `attempts` prop.
   - For each session (newest-first, already the storage order), compute its incorrect attempts, map to `Question` objects, and render a session group: header row with date/time + book/mode pill + miss count, a "Build review quiz →" button scoped to that session's missed `factId`s (calls existing `retry(factIds)` / `retryFacts`), and the list of missed questions (question text + verse + factId, same row styling as today).
   - Keep a separate top-level "Flagged" group for `flagged` questionIds not necessarily tied to one session (flags are all-time/global) — render above or below the session groups, clearly labeled (e.g. "Flagged · not tied to a session").
   - Skip sessions with zero misses (only render groups that have content) and keep the existing empty-state screen when there is nothing to review anywhere.
   - Add a "Full history →" link/button in the top-right of the page header area (next to "Recall lab"/"Review what resisted" heading) navigating to `/history`.

### Phase D — Corrections page (results, immediately after a session) → link into that session's full history
10. In `ResultsOriginal` (components/quiz-app.tsx), add a `sessionId: string` prop (passed from `QuizApp`'s render call, where `sessionId` state already exists) and a new button "View full session →" linking to `/history/${sessionId}` (plain `<a>`/`<Link>`, since this is a hard navigation away from the in-memory `results` screen). Place it alongside the existing "Review mistakes" / "Another quiz" buttons.

### Phase E — 5 second competition-mode timer (independent, can be done in parallel with B/C/D)
11. In `Player` (components/quiz-app.tsx):
    - Add `const [timeLeft, setTimeLeft] = useState(5)` and a `useEffect` keyed on `current.questionId` (and `mode`) that: only runs when `mode === "competition"`; resets `timeLeft` to 5 on question change; ticks down every second via `setInterval`; clears interval on unmount/question change/`submitted` becoming true.
    - On reaching 0 while `!submitted`: call a new `onTimeout()` callback (passed down from `QuizApp`) instead of touching `submit` directly, since `submit()` currently early-returns when `selected` is empty (`if (!current || !selected) return;`).
    - In `QuizApp`, add `function timeoutSubmit()`: if `!submitted`, records an attempt using current `selected` (if the user had picked something before time ran out, grade it normally; otherwise record `answer: ""`, `correct: false`), pushes it into `attempts`/`sessionAttempts`/session storage exactly like `submit()` does, and sets `submitted(true)` — but does NOT call `next()` (per decision: lock, don't auto-advance).
    - Render the numeric countdown badge (e.g. `{timeLeft}s`) near the existing question header/flag-button row, only when `mode === "competition" && !submitted`. Style consistent with existing `Pill`/border-button look.
    - No changes needed to practice mode; feedback panel gating (`submitted && mode === "practice"`) already means competition mode shows no reveal, matching "lock, no auto-advance" requirement — user still sees no feedback, just an enabled "Next" button once locked/submitted.

## Relevant files
- `components/quiz-app.tsx` — extract header (Phase A), rework `ReviewBase` (Phase C), add `sessionId` prop + button to `ResultsOriginal` (Phase D), add timer state/effect + `onTimeout` to `Player` and `timeoutSubmit()` to `QuizApp` (Phase E).
- `components/history-view.tsx` — swap in `SiteHeader`, update links to `/history/[sessionId]` (Phase A, B).
- `components/site-header.tsx` — new shared header + mobile drawer (Phase A).
- `components/session-detail-view.tsx` — new per-session full history view (Phase B).
- `app/history/[sessionId]/page.tsx` — new route (Phase B).
- `lib/session.ts` — add `readSessionById()` (Phase B).

## Verification
1. Manual: complete a quiz in competition mode; confirm a "5s" badge counts down per question, and on hitting 0 without answering, the question locks (Next enabled, no correct/incorrect reveal) rather than auto-advancing.
2. Manual: complete a couple of quiz sessions (mix of correct/incorrect), then open `/review` — confirm corrections are grouped under separate session headers (dated, newest first) plus a distinct flagged section, and a "Full history →" link in the top-right goes to `/history`.
3. Manual: from `/history`, click a session — confirm `/history/[sessionId]` shows every question in that session (not just misses) with given answer, correct answer, and a right/wrong badge.
4. Manual: right after finishing a quiz (results/corrections screen), confirm a new button links directly to `/history/[sessionId]` for that just-completed session.
5. Manual: resize to mobile width on Home, Setup, Review, Stats, and History pages — confirm a hamburger opens a consistent slide-in drawer with the same nav links on every page.
6. Run `npm run lint` (per eslint.config.mjs) and `npm run build` (or the project's existing scripts) to confirm no type/build errors given `quiz-app.tsx` is `@ts-nocheck` but other new files are not.

## Further Considerations
1. The existing `/quiz/results/[sessionId]` route ignores its `sessionId` param entirely (always shows `readLastSession()`) — a pre-existing latent bug, left untouched since this plan routes "browse a specific past session" traffic through the new `/history/[sessionId]` page instead. Flag to user if they'd like it fixed separately.
2. Per AGENTS.md, this project's Next.js has non-standard conventions — implementer must check `node_modules/next/dist/docs/` for correct dynamic-route param handling before writing `app/history/[sessionId]/page.tsx`.
