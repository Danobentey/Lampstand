# MASTER BUILD PROMPT: BIBLE QUIZ COMPETITION APPLICATION

Build a complete, production-quality Bible quiz and competition-preparation web application.

The application is being built primarily to prepare for a Bible quiz competition covering:

* Proverbs
* Job
* Revelation

The official Bible version used for the competition is **NKJV — New King James Version**.

The first question database already exists for **Proverbs**, and the architecture must be designed so that **Job and Revelation can be added later without changing the fundamental application structure**.

Do not build a toy demo. Build the application as a solid MVP that can genuinely be used for thousands of practice questions, serious competition preparation, mistake review, chapter-by-chapter study, analytics, and eventually multiple books.

---

# 1. PRIMARY GOAL

The application should allow a learner to create highly configurable Bible quiz sessions.

A learner should be able to choose:

* one or more Bible books;
* one or more chapters;
* one or more question types;
* one or more difficulty levels;
* quiz mode;
* number of questions;
* optional timer settings.

The learner then answers questions, receives feedback according to the selected quiz mode, receives a score, sees mistakes, and can retry weak questions.

The app should progressively help the learner identify weak chapters, weak topics, weak question types, and weak individual facts.

The long-term goal is not simply to answer quiz questions but to prepare someone to handle virtually any competition-style question that might be drawn from Proverbs, Job, and Revelation.

---

# 2. TECHNOLOGY STACK

Use:

* Latest stable **Next.js**
* App Router
* TypeScript
* React
* Tailwind CSS
* A clean component system such as shadcn/ui if appropriate
* Lucide icons where useful

Use modern Next.js conventions.

The application must be:

* responsive;
* mobile-first;
* usable on desktop;
* fast;
* accessible;
* easy to extend;
* strongly typed.

Do not over-engineer the initial backend.

For Version 1:

* load the supplied question CSV into application-friendly data;
* use local browser storage for learner history and settings;
* structure the code so local persistence can later be replaced by Supabase/PostgreSQL without rewriting the quiz engine.

Prefer converting CSV data into validated JSON during build/import rather than reparsing a large CSV on every browser request.

---

# 3. PROVIDED QUESTION DATABASE

A CSV file will be supplied similar to:

`proverbs_quiz_questions_v1.csv`

It currently contains approximately:

* 3,100 questions;
* 31 Proverbs chapters;
* 100 questions per chapter;
* 25 questions per difficulty per chapter.

Difficulty levels:

* Easy
* Medium
* Hard
* Extreme

The app must not require a database value called `Mixed`.

**Mixed means all selected difficulty levels are included.**

When all four difficulty levels are enabled, the UI should display:

`Mixed`

The current question bank has fields approximately like:

```text
question_id
book_id
book
chapter
verse_reference
verse_start
difficulty
difficulty_rank
question_type
ui_type
question
option_a
option_b
option_c
option_d
correct_option
correct_answer
accepted_answers
explanation
fact_id
variant_index
tags
translation
source_mode
source_url
review_status
active
```

Build a strongly typed question model from this structure.

Do not tightly couple the application to Proverbs-specific fields.

Future records will include:

```text
book_id = JOB
book = Job
```

and:

```text
book_id = REV
book = Revelation
```

No major code changes should be required to add them.

---

# 4. IMPORTANT DATA MODEL CONCEPT

Multiple questions may test the same underlying Bible fact.

For example, one fact could appear as:

* direct fact;
* true/false;
* reference identification;
* matching;
* difficult swapped-reference question.

The database therefore includes:

`fact_id`

This field is extremely important.

The quiz generator should normally prevent several variants of the same `fact_id` from appearing during the same quiz unless:

* the user explicitly selects a repetition/reinforcement mode; or
* the quiz contains more questions than available unique facts.

The sampling process should therefore preferably be:

1. filter eligible questions;
2. group by `fact_id`;
3. sample unique facts;
4. select one eligible question variant per fact.

Do not simply shuffle every eligible database row and take the first N.

---

# 5. COPYRIGHT / NKJV HANDLING

The competition version is NKJV.

The supplied database primarily stores:

* paraphrased facts;
* Bible references;
* short answers;
* explanations.

Do not automatically scrape or copy full NKJV chapters into the application.

Do not build the application around reproducing large amounts of copyrighted NKJV Scripture.

The application should retain:

```text
translation = NKJV
```

and Bible references for every applicable question.

Later, an authorized quotation/verse-completion dataset may be added separately.

Design the system so a future `quotation` question type can be introduced without architectural changes.

---

# 6. CORE APPLICATION PAGES

Build the following major areas.

## Dashboard

Route:

```text
/
```

This should be the learner's home screen.

Show:

* Start Quiz button
* Continue Review button if mistakes exist
* Overall accuracy
* Total questions attempted
* Total correct
* Current streak
* Strongest book/chapter if enough data exists
* Weakest chapter if enough data exists
* Recent quiz sessions
* Weak facts needing review

For a new user with no history, show an attractive onboarding state instead of empty charts.

The dashboard should feel like a serious training product, not an admin dashboard.

---

## Quiz Setup

Route:

```text
/quiz/setup
```

This is one of the most important screens.

Allow configuration of:

### Books

Current:

* Proverbs

Future:

* Job
* Revelation

Support multi-select.

If only Proverbs exists in the loaded database, Job and Revelation should not appear as selectable active options unless represented in the data.

Do not hardcode exactly three books into the selection component.

Generate the available books from the question dataset.

### Chapters

After one or more books are selected, display relevant chapters.

For Proverbs:

1–31.

Include:

* Select All
* Clear All
* convenient chapter range controls where helpful
* individual chapter buttons or checkboxes

The chapter selector must work well on mobile.

If multiple books are eventually selected, group chapters under the book headings.

### Difficulty

Show:

* Easy
* Medium
* Hard
* Extreme

All should be selected by default.

When all four are selected, display:

**Mixed**

Allow any combination.

For example:

* Easy only
* Hard + Extreme
* Easy + Medium
* Medium + Hard + Extreme

Require at least one difficulty.

### Question Types

Populate available question types dynamically from the dataset.

Current examples include:

```text
direct_fact
true_false
short_answer
reference_lookup
statement_match
pair_match
true_false_swapped
dual_reference
verse_precision
triple_reference_match
```

Display user-friendly names, for example:

```text
Direct Fact
True / False
Short Answer
Reference Identification
Statement Match
Correct Pairing
Swapped Reference
Dual Reference
Exact Verse
Triple Reference Match
```

Include:

* Select All
* Clear All

Require at least one question type.

### Question Count

Provide choices such as:

* 10
* 20
* 30
* 50
* 100
* All Available

Optionally allow custom count entry.

Do not permit a requested count larger than the number of eligible unique facts unless repetition is explicitly allowed.

If the learner asks for more than available, communicate that clearly and use the maximum valid number.

### Quiz Mode

Support at least:

**Practice Mode**

and

**Competition Mode**

Practice Mode:

* feedback can appear after answering;
* explanations can be shown;
* correct answer may be displayed;
* user can optionally proceed manually.

Competition Mode:

* do not reveal correctness immediately;
* do not show explanations during the quiz;
* user answers each item and moves on;
* score and corrections are revealed after completion.

### Optional Timer

Allow:

* Off
* Timer per question
* Timer for whole quiz

Timer should not be mandatory.

Do not let timer behavior interfere with accessibility.

### Shuffle

Provide options:

* Shuffle questions
* Shuffle answer choices where safe

Do not shuffle options for question types where option order is semantically significant.

---

# 7. QUIZ GENERATION ENGINE

Create a reusable quiz generation service.

Example API concept:

```ts
generateQuiz({
  books,
  chapters,
  difficulties,
  questionTypes,
  count,
  avoidFactRepeats,
  seed?,
})
```

Generation must be deterministic when a seed is supplied.

This is useful for:

* reproducible competition sets;
* debugging;
* team competitions.

The algorithm should:

1. Filter active questions.
2. Match selected books.
3. Match selected chapters.
4. Match selected difficulties.
5. Match selected question types.
6. Group by `fact_id`.
7. Avoid duplicate facts where possible.
8. Balance requested difficulty distribution.
9. Balance chapter distribution when several chapters are selected.
10. Randomize final presentation order.

---

# 8. MIXED DIFFICULTY DISTRIBUTION

When all four difficulty levels are selected, attempt an even distribution.

For a 20-question quiz, target approximately:

```text
Easy: 5
Medium: 5
Hard: 5
Extreme: 5
```

For 30 questions, distribute as evenly as mathematically possible.

If one difficulty does not contain enough eligible unique facts, redistribute its unused allocation among the remaining selected levels.

Use similar balancing logic for multiple selected chapters so one chapter does not dominate merely because it contains more eligible variants.

---

# 9. QUIZ PLAYER

Route:

```text
/quiz/play
```

The quiz UI should focus attention on one question at a time.

Display:

* Book
* Chapter where appropriate
* Question number
* Total questions
* Difficulty badge
* Optional question-type badge
* Progress bar
* Question text
* Answer area
* Timer if enabled
* Flag / bookmark button
* Next / Submit controls

Do not unnecessarily display the Bible reference if the question is asking the learner to identify that reference.

Use question-type-aware rendering.

---

# 10. MULTIPLE-CHOICE QUESTIONS

For `single_select` questions:

Display only populated answer options.

Support databases where:

* A–D are populated;
* only A and B are populated, such as true/false.

Do not render blank buttons.

When the answer is submitted in Practice Mode:

* clearly indicate correct/incorrect;
* show the correct answer;
* show the explanation;
* show the Bible reference if appropriate.

Do not make the feedback visually overwhelming.

---

# 11. SHORT-ANSWER QUESTIONS

For `ui_type = text`:

Provide a text input.

Normalize answers before comparison.

At minimum normalize:

* case;
* leading/trailing spaces;
* repeated spaces;
* safe punctuation differences.

Support pipe-separated accepted answers:

```text
answer one|alternative one|alternative wording
```

Do not use overly aggressive fuzzy matching that could mark a materially incorrect Bible answer as correct.

If useful, implement conservative similarity support, but exact normalized matching against accepted values should remain the primary method.

After submission in Practice Mode, show:

* learner answer;
* canonical correct answer;
* explanation/reference.

---

# 12. FLAGGING QUESTIONS

Allow the learner to flag/bookmark questions during a quiz.

Flags may mean:

* review later;
* uncertain;
* difficult;
* possible database issue.

Store flag state.

On results, include a section showing flagged questions.

---

# 13. QUIZ RESULTS

Route:

```text
/quiz/results/[sessionId]
```

After completion show:

* Total score
* Percentage
* Correct count
* Incorrect count
* Skipped count if applicable
* Average response time
* Difficulty breakdown
* Chapter breakdown
* Question-type breakdown
* Book breakdown when multiple books exist

Display incorrect questions clearly.

For every incorrect item show:

* question;
* learner's answer;
* correct answer;
* explanation;
* reference;
* difficulty;
* chapter.

Include actions:

* Review mistakes
* Retry mistakes
* Retry flagged questions
* Start another quiz
* Return to dashboard

---

# 14. REVIEW SYSTEM

Route:

```text
/review
```

Create a powerful review system.

Allow reviewing:

* Incorrect questions
* Flagged questions
* Weak facts
* Recently missed
* Frequently missed
* Never mastered

Review should preferably work at the `fact_id` level rather than treating every question variant as unrelated.

Show progress such as:

```text
Fact mastered
Learning
Weak
New
```

Use clear but simple mastery rules.

For example:

**New**
No attempt history.

**Learning**
Attempted but not enough evidence.

**Weak**
Low accuracy or two recent mistakes.

**Mastered**
Several recent correct attempts with acceptable response time.

Do not permanently mark something mastered based on one correct answer.

---

# 15. RETRY MISTAKES

After every quiz, allow:

**Retry mistakes**

Generate a new mini-session containing missed facts.

Prefer, where possible, to use a different question variant with the same `fact_id`.

Example:

The learner misses a direct question based on `PRO-05-F03`.

During review, if another variant exists, ask a harder or differently worded question testing `PRO-05-F03`.

This makes review recall-based instead of simple memorization of the previous screen.

---

# 16. ADAPTIVE TRAINING

Implement a basic adaptive algorithm.

Do not make the algorithm opaque or unnecessarily complicated.

Questions should receive priority based on factors such as:

* recent incorrect attempts;
* total accuracy;
* how long since last seen;
* whether the fact has never been attempted;
* number of consecutive correct responses;
* average response time.

Create an optional quiz mode:

**Weak Areas**

This automatically generates a session biased toward:

* weak facts;
* weak chapters;
* weak question types.

Create another optional mode:

**Mastery Mix**

This should include:

* mostly weak or learning material;
* some mastered material for spaced reinforcement.

---

# 17. STATISTICS

Route:

```text
/stats
```

Provide useful analytics.

Include:

### Overall

* Questions attempted
* Accuracy
* Correct answers
* Incorrect answers
* Average response time
* Number of mastered facts
* Number of weak facts

### By Book

Eventually:

* Proverbs
* Job
* Revelation

### By Chapter

For Proverbs show chapters 1–31 with:

* attempts;
* accuracy;
* mastery;
* weak-fact count.

Allow sorting by:

* chapter;
* accuracy;
* weakest;
* most attempted.

### By Difficulty

Display performance for:

* Easy
* Medium
* Hard
* Extreme

### By Question Type

Example:

```text
Direct Fact: 94%
Reference Identification: 68%
Exact Verse: 54%
True/False: 91%
```

This should reveal the learner's real weaknesses.

### Recent Performance

Show performance over recent sessions.

Avoid overcomplicated data visualizations.

Use simple, readable charts.

---

# 18. QUESTION BROWSER

Route:

```text
/questions
```

Create an optional searchable question browser.

Allow filtering by:

* book;
* chapter;
* difficulty;
* type;
* tag;
* fact ID;
* review status.

Allow searching question text.

This is especially useful during development and content review.

Do not reveal the correct answer by default if the learner is using this as study browsing; provide a reveal control.

---

# 19. ADMIN / CONTENT REVIEW AREA

Create a lightweight admin/content review interface or structure the code so one can easily be added.

Route may be:

```text
/admin/questions
```

This does not need full authentication in an initial local MVP, but do not expose destructive editing publicly in production.

Useful capabilities:

* inspect questions;
* filter questions;
* identify duplicate IDs;
* inspect all variants belonging to one `fact_id`;
* disable questionable questions;
* mark review status;
* search source references;
* export filtered results.

If actual CSV editing is too much for the first version, make this area read-only but architect it cleanly.

---

# 20. LOCAL STORAGE DATA MODEL

Create a clean persistence abstraction.

Do not scatter direct `localStorage` calls across UI components.

Create a storage/repository layer.

Store at minimum:

```text
UserSettings
QuizSession
QuestionAttempt
FactProgress
FlaggedQuestion
```

Suggested structures:

```ts
type QuizSession = {
  id: string;
  startedAt: string;
  completedAt?: string;
  configuration: QuizConfiguration;
  questionIds: string[];
  score?: number;
  total?: number;
};
```

```ts
type QuestionAttempt = {
  id: string;
  sessionId: string;
  questionId: string;
  factId: string;
  selectedAnswer?: string;
  correct: boolean;
  responseTimeMs?: number;
  attemptedAt: string;
};
```

```ts
type FactProgress = {
  factId: string;
  attempts: number;
  correct: number;
  incorrect: number;
  consecutiveCorrect: number;
  lastAttemptedAt?: string;
  masteryStatus: "new" | "learning" | "weak" | "mastered";
};
```

Create repository interfaces so the implementation can later become Supabase without changing application components.

Example:

```ts
interface ProgressRepository {
  saveAttempt(attempt: QuestionAttempt): Promise<void>;
  getFactProgress(factId: string): Promise<FactProgress | null>;
  getAllFactProgress(): Promise<FactProgress[]>;
}
```

---

# 21. DATA IMPORT PIPELINE

Create an import script for supplied CSV files.

Suggested command:

```bash
npm run import:questions
```

It should:

1. read CSV files from a known folder;
2. validate each row;
3. normalize data;
4. reject duplicate `question_id`;
5. validate difficulty;
6. validate book/chapter fields;
7. ensure single-select answers match one displayed option;
8. check `fact_id`;
9. create optimized application JSON;
10. create an import summary.

Example output:

```text
Loaded: 3,100
Invalid: 0
Duplicate IDs: 0
Books: Proverbs
Chapters: 31
Easy: 775
Medium: 775
Hard: 775
Extreme: 775
```

Use a validation library such as Zod where appropriate.

The application should fail loudly during development if critical question data is malformed.

Do not silently ignore corrupted rows.

---

# 22. DATA QUALITY CHECKS

Create automated database validation.

Validate:

* every `question_id` is unique;
* required fields exist;
* every active question has a correct answer;
* valid books exist;
* chapter is valid;
* difficulty is valid;
* `ui_type` is supported;
* `single_select` questions have appropriate options;
* `correct_option` points to the displayed correct answer;
* text questions have accepted answers;
* every question has a `fact_id`;
* no empty displayed question text;
* translation is correctly represented.

Create a script such as:

```bash
npm run validate:questions
```

---

# 23. SESSION RECOVERY

If the learner accidentally reloads or closes the browser during a quiz, preserve the active quiz.

When returning, offer:

**Resume quiz**

or:

**Discard quiz**

Do not lose answered questions unnecessarily.

---

# 24. BOOKMARK / FLAG PERSISTENCE

Flagged questions should remain available across sessions.

Provide a dedicated filter in Review:

```text
Flagged
```

Allow unflagging.

---

# 25. USER EXPERIENCE

Design this application primarily for repeated daily study.

The visual style should be:

* clean;
* modern;
* focused;
* calm;
* readable;
* competition-oriented.

Avoid excessive animations.

Use animation only when it improves feedback or navigation.

Mobile use is extremely important because much practice may occur on phones.

Touch targets should be large.

Avoid horizontal scrolling.

Quiz answer options should be easy to tap.

---

# 26. ACCESSIBILITY

Support:

* semantic HTML;
* keyboard navigation;
* visible focus states;
* adequate contrast;
* screen-reader labels;
* reduced-motion preference;
* no reliance on color alone for correct/incorrect feedback.

Use icons and text together where useful.

---

# 27. THEMING

Support light mode and dark mode if straightforward.

Remember the user's selected theme.

Do not spend excessive development time on decorative theming before core quiz functionality works.

---

# 28. RESPONSIVE DESIGN

Prioritize these widths:

* small phones;
* larger phones;
* tablets;
* desktops.

The quiz experience should remain one-column and highly focused on smaller screens.

The setup page may use wider layouts on desktop.

---

# 29. IMPORTANT QUESTION-RANDOMIZATION RULES

Avoid predictable patterns.

Do not repeatedly put the correct answer in the same answer position.

Where options are safe to shuffle, randomize them.

However, after shuffling, the application must still track the actual correct answer correctly.

Do not mutate the original database question object.

Generate a session-specific rendered question object.

---

# 30. SEEDED QUIZZES

Add support for seeded quiz generation.

This enables a facilitator to use something like:

```text
Seed: COMP2026-ROUND-01
```

and generate the same question set again using identical configuration.

This is valuable for:

* team practice;
* mock competitions;
* debugging.

The normal learner experience can use automatically generated seeds.

---

# 31. COMPETITION MODE

Competition Mode should feel distinct from practice.

Features:

* no answer feedback during quiz;
* optional countdown;
* no explanations until end;
* final score;
* answer review after submission;
* optional prevention of changing answers once confirmed;
* keyboard shortcuts on desktop where useful.

Future extension should support a presentation/host mode, but this does not need to be implemented in the first MVP.

---

# 32. PRACTICE MODE

Practice Mode should optimize learning.

After each answer:

* show whether it was correct;
* show the correct answer;
* show explanation;
* show Bible reference;
* allow flagging;
* move to next question when learner chooses.

Include an optional setting:

```text
Automatically continue after correct answer
```

but default to manual continuation so the learner has time to read feedback.

---

# 33. QUESTION REPORTING

Allow a learner to report a suspicious question.

Reasons might include:

* Wrong answer
* Ambiguous
* Reference seems wrong
* Typo
* Duplicate
* Other

For local Version 1, store reports locally or export them.

Design the data structure so reports can later be synced to a backend.

---

# 34. QUIZ HISTORY

Create a History view, either inside Dashboard or as:

```text
/history
```

For each completed session show:

* date;
* books;
* chapters;
* mode;
* question count;
* score;
* percentage;
* duration.

Clicking a session should reopen its results.

---

# 35. FILTER PRESETS

Allow learners to save quiz presets.

Examples:

```text
Proverbs 1–5 Extreme
Reference Drill
All Proverbs Mixed
Hard + Extreme
Weak Chapters
```

Persist presets locally.

Allow renaming and deleting presets.

---

# 36. DEFAULT QUIZ CONFIGURATION

Default state should be sensible.

For a first-time Proverbs learner:

```text
Book: Proverbs
Chapters: All
Difficulty: Easy + Medium + Hard + Extreme
Displayed difficulty label: Mixed
Question types: All
Question count: 20
Mode: Practice
Timer: Off
Avoid duplicate facts: On
Shuffle questions: On
```

---

# 37. TAG SUPPORT

The database contains tags.

Build tag infrastructure even if tag filtering is hidden from the first-time setup UI.

Possible Proverbs tags include:

```text
wisdom
speech
marriage
money
fools
righteousness
wicked
fear_of_the_lord
parenting
diligence
laziness
king
justice
poor
generosity
```

Later allow thematic drills.

Example:

```text
Proverbs → All chapters → Speech
```

Tag architecture will also be useful for Job and Revelation.

---

# 38. JOB EXTENSIBILITY

Do not implement Job content unless supplied, but ensure the architecture supports important Job-specific tags such as:

```text
speaker:job
speaker:eliphaz
speaker:bildad
speaker:zophar
speaker:elihu
speaker:lord
calamity
speech
restoration
behemoth
leviathan
```

Future questions may ask:

* Who said this?
* To whom?
* During whose speech?
* Which chapter?
* What happened before/after?
* Sequence the speakers.

Question rendering should therefore remain generic and extensible.

---

# 39. REVELATION EXTENSIBILITY

Future Revelation tags may include:

```text
seven_churches
seals
trumpets
bowls
144000
elders
living_creatures
dragon
beasts
babylon
new_jerusalem
numbers
symbols
sequence
```

Future question types may involve:

* ordering;
* sequence;
* multi-select;
* symbol identification.

Design the question renderer around an extensible registry or component map rather than one huge conditional component.

Example:

```ts
const questionRenderers = {
  single_select: SingleSelectQuestion,
  text: TextQuestion,
}
```

Later we should be able to add:

```text
multi_select
ordering
matching
```

without rewriting the player.

---

# 40. FUTURE SERVER DATABASE

Do not require Supabase for Version 1, but make the data access layer replaceable.

Future architecture may include:

* Supabase/PostgreSQL
* authentication;
* cloud progress syncing;
* multiple learners;
* team competitions;
* shared leaderboards;
* teacher/admin dashboards.

Keep domain logic independent of localStorage.

---

# 41. TESTING

Add meaningful tests.

At minimum test:

* filtering questions;
* selected chapters;
* selected difficulties;
* selected question types;
* no duplicate question IDs;
* fact deduplication;
* balanced difficulty sampling;
* quiz count limits;
* answer normalization;
* multiple-choice scoring;
* true/false scoring;
* short-answer accepted variants;
* progress updates;
* mastery calculation;
* seeded quiz reproducibility.

Use appropriate unit testing tools available in the project.

Add a few end-to-end tests for:

1. starting a quiz;
2. answering questions;
3. completing it;
4. seeing results;
5. retrying mistakes.

---

# 42. ERROR STATES

Handle:

* no eligible questions;
* corrupted question data;
* impossible quiz count;
* missing localStorage;
* stale saved quiz;
* unknown question type;
* invalid route session ID.

Show useful messages instead of crashing.

---

# 43. PERFORMANCE

A 3,100-question dataset is small.

Even once Job and Revelation are added, the complete set should remain manageable.

Still:

* avoid unnecessary rerenders;
* do not recalculate full analytics on every keystroke;
* memoize or preprocess appropriate indexes;
* create question indexes by book/chapter/difficulty/type if useful.

Do not prematurely introduce heavy infrastructure.

---

# 44. PROJECT STRUCTURE

Use a clean structure similar to:

```text
app/
  page.tsx

  quiz/
    setup/
      page.tsx
    play/
      page.tsx
    results/
      [sessionId]/
        page.tsx

  review/
    page.tsx

  stats/
    page.tsx

  questions/
    page.tsx

  history/
    page.tsx

components/
  dashboard/
  quiz/
  review/
  stats/
  common/

lib/
  questions/
    loader.ts
    schema.ts
    filters.ts
    generator.ts
    validation.ts

  quiz/
    scoring.ts
    session.ts

  progress/
    mastery.ts
    repository.ts
    local-storage-repository.ts

  analytics/
    calculations.ts

  utils/

types/
  question.ts
  quiz.ts
  progress.ts

data/
  source/
    proverbs_quiz_questions_v1.csv
  generated/
    questions.json

scripts/
  import-questions.ts
  validate-questions.ts
```

This structure is illustrative rather than mandatory.

Keep responsibilities separated.

---

# 45. CODE QUALITY

Requirements:

* TypeScript strict mode;
* minimal use of `any`;
* no giant page components;
* reusable components;
* clear domain models;
* meaningful naming;
* comments for non-obvious algorithms;
* no unnecessary abstraction;
* no dead code;
* no fake functionality.

Do not leave core features as TODOs.

---

# 46. README

Write a thorough README containing:

* project purpose;
* setup instructions;
* installation;
* local development;
* question import;
* validation;
* build;
* deployment;
* data model;
* adding another book;
* adding another question type;
* persistence architecture;
* known limitations.

Include exact commands.

Example:

```bash
npm install
npm run import:questions
npm run validate:questions
npm run dev
```

---

# 47. ADDING JOB OR REVELATION

Document this workflow clearly.

Adding a new book should ideally require only:

1. place the new CSV into the source data directory;
2. run the import command;
3. run validation;
4. restart/rebuild.

The UI should automatically discover the new book and chapters.

Do not require manually coding:

```ts
if (book === "Job")
```

throughout the application.

---

# 48. DATASET COVERAGE VIEW

Create a development/content QA page if practical.

Show:

```text
Book
Chapter
Easy count
Medium count
Hard count
Extreme count
Unique facts
Question types
```

For Proverbs, expected current baseline:

```text
31 chapters
100 questions per chapter
25 Easy
25 Medium
25 Hard
25 Extreme
```

Highlight gaps.

This will become valuable when we expand the database beyond Version 1.

---

# 49. VERSE COVERAGE ARCHITECTURE

The current Proverbs database tests a curated set of facts repeatedly.

A future Proverbs V2 may contain much greater verse-by-verse coverage.

Do not assume a fixed number of questions per chapter.

The application must work correctly if:

```text
Chapter 1 has 100 questions
Chapter 2 has 174
Chapter 3 has 230
```

Likewise, do not assume every difficulty contains exactly 25 questions forever.

Question counts are data-driven.

---

# 50. PROGRESSIVE MASTERING

The learner should eventually be able to work through:

```text
Book → Chapter → Fact → Variant
```

The application should therefore track mastery by `fact_id`.

Individual `question_id` performance may also be stored, but fact mastery is more important.

When new variants are added to an existing fact, previous mastery should remain relevant.

---

# 51. SPACED REVIEW

Implement a basic spaced-review score.

It does not need to be a sophisticated Anki clone.

A simple approach is sufficient:

Weak or recently missed:

* high priority

Correct once:

* medium-high priority

Several consecutive correct:

* lower priority

Mastered but not seen for a long period:

* gradually increase priority again

Keep this logic isolated in a function so it can be improved later.

---

# 52. STREAKS

Optional but useful:

Track:

* current correct-answer streak;
* best streak;
* daily study streak.

Do not let gamification overwhelm the study purpose.

Accuracy and mastery are more important than meaningless points.

---

# 53. DASHBOARD CALL TO ACTION

The dashboard should prominently offer:

**Start Quiz**

and a faster option such as:

**Quick 20 — Mixed**

Quick 20 should use the user's most recent/default configuration, with:

* 20 questions;
* balanced difficulty;
* unique facts.

If weak questions exist, also offer:

**Review Weak Areas**

---

# 54. FIRST-RUN EXPERIENCE

When the app launches for the first time:

Briefly explain:

```text
Train by book, chapter, difficulty, and question type.
Your mistakes are tracked automatically so you can focus on weak areas.
```

Then show:

**Start First Quiz**

Do not force account creation.

---

# 55. OFFLINE-FRIENDLY BEHAVIOR

Since the core question bank can be bundled with the app, design the application to remain highly usable without constant network requests.

If feasible, make it PWA-friendly later.

Full PWA implementation is optional for the first version unless straightforward.

---

# 56. IMPORT THE PROVIDED PROVERBS DATABASE

Actually import the supplied Proverbs CSV.

Do not populate the application with mock questions while ignoring the real file.

After import, verify the dataset counts.

The imported application should show Proverbs chapters 1–31.

The question generator should use the real question data.

---

# 57. ACCEPTANCE TEST: BASIC QUIZ

This scenario must work:

User opens Quiz Setup.

Selects:

```text
Book: Proverbs
Chapters: 1–5
Difficulty: Easy + Medium + Hard + Extreme
Question Types: All
Question Count: 20
Mode: Practice
```

The app should:

* recognize the difficulty as Mixed;
* generate 20 questions;
* avoid repeated `fact_id`s where possible;
* roughly balance difficulties;
* roughly balance selected chapters;
* show one question at a time;
* correctly score answers;
* give practice feedback;
* save attempts;
* show final results;
* allow retrying mistakes.

---

# 58. ACCEPTANCE TEST: HARD REFERENCE DRILL

User selects:

```text
Book: Proverbs
Chapters: 10–20
Difficulty: Hard + Extreme
Question Types:
  Reference Identification
  Exact Verse
Question Count: 30
Mode: Competition
```

The application must generate only eligible questions matching those filters.

No easy or medium questions should appear.

No unrelated question types should appear.

Answers should not be revealed until completion.

---

# 59. ACCEPTANCE TEST: SINGLE CHAPTER

User selects:

```text
Proverbs
Chapter 31
All difficulty levels
20 questions
```

Every question must belong to Proverbs 31.

---

# 60. ACCEPTANCE TEST: REVIEW

The user misses three questions.

After the quiz:

* the three incorrect facts appear in results;
* they contribute to weak-area statistics;
* Retry Mistakes creates a review session;
* where possible, review uses alternative variants of the same `fact_id`;
* completing the review updates progress.

---

# 61. ACCEPTANCE TEST: DATA PERSISTENCE

Complete a quiz.

Refresh the browser.

The following should remain:

* quiz history;
* statistics;
* flagged questions;
* mistake history;
* saved presets;
* mastery data.

---

# 62. ACCEPTANCE TEST: NEW BOOK

Simulate adding a valid Job CSV.

Run the import.

Without rewriting quiz setup components:

* Job appears as a selectable book;
* its chapters appear;
* Job questions can be mixed with Proverbs;
* analytics can separate the books.

This is a key architectural requirement.

---

# 63. WHAT NOT TO DO

Do not:

* hardcode Proverbs everywhere;
* hardcode exactly 31 chapters globally;
* rely on row position as question identity;
* ignore `fact_id`;
* create separate quiz engines for each book;
* reveal correct answers in Competition Mode;
* render blank answer options;
* silently accept malformed CSV rows;
* make every question random without balancing;
* store progress directly in dozens of React components;
* require user authentication for the MVP;
* build an unnecessarily complicated server backend before the quiz works;
* scrape bulk NKJV text;
* leave the application as a visual mockup with nonfunctional buttons.

---

# 64. DEVELOPMENT ORDER

Build the project in this order:

### Phase 1

Project setup and design system.

### Phase 2

Question schema, CSV importer, validation, and generated data.

### Phase 3

Quiz filtering and generation engine with tests.

### Phase 4

Quiz Setup screen.

### Phase 5

Quiz Player.

### Phase 6

Scoring and Results.

### Phase 7

Local persistence.

### Phase 8

Mistake review and retry.

### Phase 9

Dashboard and History.

### Phase 10

Statistics and mastery system.

### Phase 11

Question browser / QA screen.

### Phase 12

Polish, responsive testing, accessibility, tests, README, and production build.

Prioritize working functionality over decorative polish.

---

# 65. DELIVERABLES

Deliver a complete repository containing:

* working Next.js application;
* supplied Proverbs CSV integrated;
* question import script;
* question validation script;
* quiz generation engine;
* quiz setup UI;
* practice mode;
* competition mode;
* results;
* mistake review;
* progress tracking;
* analytics;
* quiz history;
* flags;
* presets;
* responsive styling;
* tests;
* README.

Before declaring completion, run:

```bash
npm run lint
npm run test
npm run build
```

Fix all important errors.

If the project uses different equivalent commands, document them.

---

# 66. FINAL QUALITY REQUIREMENT

The application should feel like a real Bible quiz training system capable of growing into a serious competition platform.

The key product principles are:

**Extensive practice**

The learner should be able to answer hundreds or thousands of questions without the experience becoming repetitive.

**Precise filtering**

The learner should be able to drill exactly the chapters, difficulty levels, and question types desired.

**Active recall**

The system should test facts from multiple directions rather than encouraging passive reading.

**Mistake-driven learning**

Incorrect answers should become future training material.

**Book-independent architecture**

Adding Job and Revelation should be a data task, not an application rewrite.

**Competition readiness**

Practice Mode should teach; Competition Mode should test.

**NKJV alignment**

All source references should remain aligned with the competition's NKJV version while respecting appropriate handling of copyrighted verse text.

---

# 67. IMPLEMENTATION BEHAVIOR FOR THE CODING AGENT

Do not stop after creating a plan.

Actually implement the application.

When something is unspecified, make a sensible product decision consistent with this document.

Do not repeatedly ask for confirmation for ordinary implementation choices.

Use the supplied question database as the real data source.

If you discover a genuine inconsistency in the supplied data, document it and make the safest non-destructive choice.

Keep the application runnable throughout development.

At the end, provide:

* summary of what was built;
* repository structure;
* commands to run locally;
* test results;
* known limitations;
* instructions for adding Job;
* instructions for adding Revelation;
* instructions for replacing local persistence with Supabase later.

The final result should be ready for serious use, not merely serve as a code sample.
