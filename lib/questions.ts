import importedQuestions from "../data/generated/questions.json";

export type Difficulty = "Easy" | "Medium" | "Hard" | "Extreme";
export type QuestionType = string;

export type Question = {
  questionId: string;
  factId: string;
  bookId: string;
  book: string;
  chapter: number;
  verseReference: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  uiType: "single_select" | "text";
  question: string;
  options: string[];
  correctOption?: string;
  correctAnswer: string;
  acceptedAnswers: string[];
  explanation: string;
  tags: string[];
  translation: string;
  active: boolean;
};

export const questions = importedQuestions as Question[];
export const books = [...new Set(questions.map((question) => question.book))];
export const chapters = [...new Set(questions.map((question) => question.chapter))].sort((a, b) => a - b);

export type QuizConfiguration = { books: string[]; chapters: number[]; difficulties: Difficulty[]; questionTypes: QuestionType[]; count: number; mode: "practice" | "competition"; avoidFactRepeats: boolean };

export function normalizeAnswer(value: string) {
  return value.toLowerCase().trim().replace(/[.,!?;:'\"()]/g, "").replace(/\s+/g, " ");
}

export function filterQuestions(configuration: QuizConfiguration) {
  return questions.filter((question) => question.active && configuration.books.includes(question.book) && configuration.chapters.includes(question.chapter) && configuration.difficulties.includes(question.difficulty) && configuration.questionTypes.includes(question.questionType));
}

export function generateQuiz(configuration: QuizConfiguration, seed = Date.now()) {
  const eligible = filterQuestions(configuration);
  let state = seed >>> 0;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  const byFact = new Map<string, Question[]>();
  eligible.forEach((question) => byFact.set(question.factId, [...(byFact.get(question.factId) ?? []), question]));
  const unique = [...byFact.values()].map((variants) => variants[Math.floor(random() * variants.length)]);
  const pool = configuration.avoidFactRepeats ? unique : eligible;
  const target = Math.min(configuration.count, pool.length);
  const selected: Question[] = [];
  const selectedFacts = new Set<string>();
  const difficulties = configuration.difficulties;
  const quota = new Map(difficulties.map((difficulty, index) => [difficulty, Math.floor(target / difficulties.length) + (index < target % difficulties.length ? 1 : 0)]));
  for (const difficulty of difficulties) {
    const candidates = [...pool].filter((question) => question.difficulty === difficulty && !selectedFacts.has(question.factId)).sort(() => random() - 0.5);
    for (const question of candidates.slice(0, quota.get(difficulty) ?? 0)) {
      selected.push(question);
      selectedFacts.add(question.factId);
    }
  }
  if (selected.length < target) {
    [...pool].sort(() => random() - 0.5).forEach((question) => {
      if (selected.length < target && !selectedFacts.has(question.factId)) { selected.push(question); selectedFacts.add(question.factId); }
    });
  }
  return selected.sort(() => random() - 0.5);
}
