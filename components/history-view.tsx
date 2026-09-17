"use client";

import { useState } from "react";
import Link from "next/link";
import { readHistory, QuizSession } from "../lib/session";

export default function HistoryView() {
  const [sessions] = useState<QuizSession[]>(() => readHistory());
  return <main className="mx-auto min-h-screen max-w-6xl bg-[#f5f1e8] px-5 py-8 md:px-10 md:py-12">
    <Link href="/" className="text-sm font-semibold text-[#275844]">← Dashboard</Link>
    <p className="mt-10 text-xs font-semibold uppercase tracking-[.18em] text-[#6e756c]">Training record</p>
    <h1 className="serif mt-2 text-5xl">Quiz history.</h1>
    <p className="mt-3 text-[#6e756c]">Completed sessions stay here so your preparation has a trail.</p>
    <section className="mt-8 overflow-hidden rounded-2xl border border-[#ded8ca] bg-[#fffdf8]">
      {sessions.length ? <div className="divide-y divide-[#ded8ca]">{sessions.map((session) => {
        const correct = session.attempts.filter((attempt) => attempt.correct).length;
        const percentage = session.attempts.length ? Math.round(correct / session.attempts.length * 100) : 0;
        return <Link href={`/quiz/results/${session.id}`} key={session.id} className="block p-5 transition hover:bg-[#f8f3e9] md:flex md:items-center md:justify-between">
          <div><p className="font-semibold">{session.configuration.books.join(", ")} · {session.configuration.mode}</p><p className="mt-1 text-sm text-[#6e756c]">{new Date(session.startedAt).toLocaleString()} · {session.questionIds.length} questions</p></div>
          <div className="mt-3 text-left md:mt-0 md:text-right"><strong className="text-2xl text-[#275844]">{percentage}%</strong><p className="text-xs text-[#6e756c]">{correct} correct</p></div>
        </Link>;
      })}</div> : <div className="paper-grid p-10 text-center"><p className="serif text-2xl">No completed sessions yet.</p><p className="mt-2 text-sm text-[#6e756c]">Finish your first quiz and it will appear here.</p><a href="/quiz/setup" className="mt-5 inline-block rounded-lg bg-[#275844] px-5 py-3 text-sm font-semibold text-white">Start a quiz →</a></div>}
    </section>
  </main>;
}
