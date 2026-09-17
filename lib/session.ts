import type { Question, QuizConfiguration } from "./questions";

export type Attempt = { questionId: string; factId: string; correct: boolean; answer: string; at: string };
export type QuizSession = {
  id: string;
  startedAt: string;
  completedAt?: string;
  configuration: QuizConfiguration;
  questionIds: string[];
  currentIndex: number;
  attempts: Attempt[];
};

const key = "lampstand-active-session";
const historyKey = "lampstand-session-history";
const lastKey = "lampstand-last-session";

export function createSession(configuration: QuizConfiguration, quiz: Question[]): QuizSession {
  return { id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, startedAt: new Date().toISOString(), configuration, questionIds: quiz.map((question) => question.questionId), currentIndex: 0, attempts: [] };
}

export function saveSession(session: QuizSession) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(session));
}

export function readSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(key) ?? "null") as QuizSession | null; } catch { return null; }
}

export function completeSession(session: QuizSession) {
  const completed = { ...session, completedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
    localStorage.setItem(lastKey, JSON.stringify(completed));
    const history = readHistory();
    localStorage.setItem(historyKey, JSON.stringify([completed, ...history].slice(0, 100)));
  }
  return completed;
}

export function readLastSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(lastKey) ?? "null") as QuizSession | null; } catch { return null; }
}

export function readHistory() {
  if (typeof window === "undefined") return [] as QuizSession[];
  try { return JSON.parse(localStorage.getItem(historyKey) ?? "[]") as QuizSession[]; } catch { return []; }
}
