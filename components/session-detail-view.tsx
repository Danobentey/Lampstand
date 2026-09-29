"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { questions } from "../lib/questions";
import { createRetakeSession, readSessionById, saveSession, QuizSession } from "../lib/session";
import SiteHeader from "./site-header";

export default function SessionDetailView({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<QuizSession | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSession(readSessionById(sessionId)), 0);
    return () => window.clearTimeout(timer);
  }, [sessionId]);

  const questionRows = session?.questionIds.map((questionId) => {
    const question = questions.find((item) => item.questionId === questionId);
    return question ? { question, attempt: session.attempts.find((item) => item.questionId === questionId) } : null;
  }).filter((row): row is NonNullable<typeof row> => row !== null) ?? [];
  const correct = session?.attempts.filter((attempt) => attempt.correct).length ?? 0;
  const total = session?.questionIds.length ?? 0;

  function retake() {
    if (!session) return;
    const retakeSession = createRetakeSession(session);
    saveSession(retakeSession);
    router.push(`/quiz/play?sessionId=${retakeSession.id}`);
  }

  return <div className="min-h-screen bg-[#f5f1e8]">
    <SiteHeader />
    <main className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">
      <Link href="/history" className="text-sm font-semibold text-[#275844]">← Full history</Link>
      {!session ? <section className="py-16 text-center"><h1 className="serif text-4xl">Session not found.</h1><p className="mt-3 text-[#6e756c]">This session may no longer be stored on this device.</p></section> : <>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[.18em] text-[#6e756c]">{session.configuration.books.join(", ")} · {session.configuration.mode}</p>
        <h1 className="serif mt-2 text-4xl md:text-5xl">{new Date(session.startedAt).toLocaleString()}</h1>
        <p className="mt-3 text-[#6e756c]">{correct} of {total} correct · {total ? Math.round(correct / total * 100) : 0}%</p>
        <button onClick={retake} className="mt-6 rounded-lg bg-[#275844] px-5 py-3 font-semibold text-white">Retake exact quiz →</button>
        <section className="mt-8 divide-y divide-[#ded8ca] border-y border-[#ded8ca]">
          {questionRows.map(({ question, attempt }, index) => <article key={question.questionId} className="grid gap-4 py-6 md:grid-cols-[3rem_1fr_auto] md:gap-6">
            <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#6e756c]">{String(index + 1).padStart(2, "0")}</p>
            <div>
              <h2 className="serif text-xl leading-snug">{question.question}</h2>
              <p className="mt-3 text-sm text-[#6e756c]">Your answer: <span className="font-medium text-[#1d2a24]">{attempt?.answer || "No answer"}</span></p>
              <p className="mt-1 text-sm text-[#6e756c]">Correct answer: <span className="font-medium text-[#1d2a24]">{question.correctAnswer}</span> · {question.verseReference}</p>
            </div>
            <span className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${attempt?.correct ? "bg-[#e2eee5] text-[#275844]" : "bg-[#f4dfb3] text-[#765112]"}`}>{attempt?.correct ? "Correct" : "Incorrect"}</span>
          </article>)}
        </section>
      </>}
    </main>
  </div>;
}