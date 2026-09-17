import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "lib", "proverbs_quiz_questions_v1.csv");
const output = path.join(root, "data", "generated", "questions.json");
const allowedDifficulties = new Set(["Easy", "Medium", "Hard", "Extreme"]);
const required = ["question_id", "book_id", "book", "chapter", "difficulty", "question_type", "ui_type", "question", "correct_answer", "fact_id", "translation", "active"];

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(cell); cell = ""; }
    else if (char === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [headers, ...data] = rows;
    const normalizedHeaders = headers.map((header) => header.replace(/^\uFEFF/, ""));
    return data.filter((values) => values.some(Boolean)).map((values) => Object.fromEntries(normalizedHeaders.map((header, index) => [header, values[index] ?? ""])));
}

function toQuestion(row) {
  const options = [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean);
  return {
    questionId: row.question_id,
    factId: row.fact_id,
    bookId: row.book_id,
    book: row.book,
    chapter: Number(row.chapter),
    verseReference: row.verse_reference,
    verseStart: row.verse_start,
    difficulty: row.difficulty,
    difficultyRank: Number(row.difficulty_rank),
    questionType: row.question_type,
    uiType: row.ui_type,
    question: row.question,
    options,
    correctOption: row.correct_option ? row[`option_${row.correct_option.toLowerCase()}`] : undefined,
    correctAnswer: row.correct_answer,
    acceptedAnswers: row.accepted_answers.split("|").map((answer) => answer.trim()).filter(Boolean),
    explanation: row.explanation,
    variantIndex: Number(row.variant_index),
    tags: row.tags.split(";").map((tag) => tag.trim()).filter(Boolean),
    translation: row.translation,
    sourceMode: row.source_mode,
    sourceUrl: row.source_url,
    reviewStatus: row.review_status,
    active: row.active.toLowerCase() === "true",
  };
}

const rows = parseCsv(fs.readFileSync(source, "utf8"));
const errors = [];
const ids = new Set();
rows.forEach((row, index) => {
  const line = index + 2;
  required.forEach((field) => { if (!row[field]?.trim()) errors.push(`line ${line}: missing ${field}`); });
  if (ids.has(row.question_id)) errors.push(`line ${line}: duplicate question_id ${row.question_id}`);
  ids.add(row.question_id);
  if (!allowedDifficulties.has(row.difficulty)) errors.push(`line ${line}: invalid difficulty ${row.difficulty}`);
  if (!Number.isInteger(Number(row.chapter)) || Number(row.chapter) < 1) errors.push(`line ${line}: invalid chapter`);
  if (row.ui_type === "single_select" && (!row.correct_option || !row[`option_${row.correct_option.toLowerCase()}`])) errors.push(`line ${line}: correct option is not displayed`);
  if (row.ui_type === "text" && !row.accepted_answers.trim()) errors.push(`line ${line}: text question has no accepted answer`);
});
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
const questions = rows.map(toQuestion);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(questions, null, 2)}\n`);
const counts = (values) => Object.fromEntries([...new Set(values)].map((value) => [value, values.filter((item) => item === value).length]));
console.log(`Loaded: ${questions.length}`);
console.log(`Books: ${[...new Set(questions.map((question) => question.book))].join(", ")}`);
console.log(`Chapters: ${new Set(questions.map((question) => question.chapter)).size}`);
console.log(`Difficulty: ${JSON.stringify(counts(questions.map((question) => question.difficulty)))}`);
console.log(`Question types: ${JSON.stringify(counts(questions.map((question) => question.questionType)))}`);
