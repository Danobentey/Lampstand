import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "data", "generated", "questions.json");
const questions = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];
const ids = new Set();
questions.forEach((question, index) => {
  const label = `row ${index + 1}`;
  if (ids.has(question.questionId)) errors.push(`${label}: duplicate questionId ${question.questionId}`);
  ids.add(question.questionId);
  if (!question.factId || !question.question || !question.correctAnswer) errors.push(`${label}: missing identity, question, or answer`);
  if (!question.active) return;
  if (!question.options.length && question.uiType === "single_select") errors.push(`${label}: single-select question has no options`);
  if (question.uiType === "single_select" && !question.options.includes(question.correctAnswer) && question.questionType !== "true_false_swapped") errors.push(`${label}: correct answer is not among options`);
  if (question.uiType === "text" && !question.acceptedAnswers.length) errors.push(`${label}: text question has no accepted answers`);
});
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Validated: ${questions.length} questions; ${new Set(questions.map((question) => question.factId)).size} facts.`);
