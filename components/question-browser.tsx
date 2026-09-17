"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { chapters, Difficulty, questions } from "../lib/questions";

const difficulties: Difficulty[] = ["Easy", "Medium", "Hard", "Extreme"];
const typeLabels: Record<string, string> = { direct_fact: "Direct fact", true_false: "True / False", short_answer: "Short answer", reference_lookup: "Reference identification", statement_match: "Statement match", pair_match: "Correct pairing", true_false_swapped: "Swapped reference", dual_reference: "Dual reference", verse_precision: "Exact verse", triple_reference_match: "Triple reference match" };

export default function QuestionBrowser() {
  const [search, setSearch] = useState("");
  const [chapter, setChapter] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [type, setType] = useState("all");
  const [tag, setTag] = useState("all");
  const [revealed, setRevealed] = useState<string[]>([]);
  const tags = useMemo(() => [...new Set(questions.flatMap((question) => question.tags))].sort(), []);
  const types = useMemo(() => [...new Set(questions.map((question) => question.questionType))].sort(), []);
  const filtered = useMemo(() => questions.filter((question) => {
    const term = search.trim().toLowerCase();
    return (!term || question.question.toLowerCase().includes(term) || question.factId.toLowerCase().includes(term)) && (chapter === "all" || question.chapter === Number(chapter)) && (difficulty === "all" || question.difficulty === difficulty) && (type === "all" || question.questionType === type) && (tag === "all" || question.tags.includes(tag));
  }).slice(0, 100), [chapter, difficulty, search, tag, type]);
  function toggleReveal(id: string) { setRevealed((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  return <main className="mx-auto min-h-screen max-w-6xl bg-[#f5f1e8] px-5 py-8 md:px-10 md:py-12">
    <Link href="/" className="text-sm font-semibold text-[#275844]">← Dashboard</Link>
    <p className="mt-10 text-xs font-semibold uppercase tracking-[.18em] text-[#6e756c]">Content library</p>
    <h1 className="serif mt-2 text-5xl">Question browser.</h1>
    <p className="mt-3 text-[#6e756c]">Search the imported catalog without giving away the answer.</p>
    <section className="mt-8 grid gap-3 rounded-2xl border border-[#ded8ca] bg-[#fffdf8] p-5 md:grid-cols-5">
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search question or fact ID" className="rounded-lg border border-[#bdb7a9] bg-transparent px-3 py-2 text-sm outline-none focus:border-[#275844] md:col-span-2" />
      <select value={chapter} onChange={(event) => setChapter(event.target.value)} className="rounded-lg border border-[#bdb7a9] bg-transparent px-3 py-2 text-sm"><option value="all">All chapters</option>{chapters.map((item) => <option key={item} value={item}>Chapter {item}</option>)}</select>
      <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="rounded-lg border border-[#bdb7a9] bg-transparent px-3 py-2 text-sm"><option value="all">All difficulties</option>{difficulties.map((item) => <option key={item}>{item}</option>)}</select>
      <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-lg border border-[#bdb7a9] bg-transparent px-3 py-2 text-sm"><option value="all">All types</option>{types.map((item) => <option key={item} value={item}>{typeLabels[item] ?? item}</option>)}</select>
      <select value={tag} onChange={(event) => setTag(event.target.value)} className="rounded-lg border border-[#bdb7a9] bg-transparent px-3 py-2 text-sm md:col-span-2"><option value="all">All tags</option>{tags.map((item) => <option key={item}>{item}</option>)}</select>
      <p className="self-center text-sm text-[#6e756c]">Showing {filtered.length} of {questions.length}</p>
    </section>
    <section className="mt-5 space-y-3">{filtered.map((question) => { const isRevealed = revealed.includes(question.questionId); return <article key={question.questionId} className="rounded-2xl border border-[#ded8ca] bg-[#fffdf8] p-5"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-[#275844]">{question.book} · Chapter {question.chapter}</span><span className="text-xs text-[#6e756c]">{question.verseReference}</span><span className="ml-auto rounded-full bg-[#f4dfb3] px-2 py-1 text-xs text-[#765112]">{question.difficulty}</span></div><p className="mt-4 font-semibold leading-6">{question.question}</p><p className="mt-2 text-xs text-[#6e756c]">{typeLabels[question.questionType] ?? question.questionType} · {question.factId}</p><button onClick={() => toggleReveal(question.questionId)} className="mt-4 rounded-lg border border-[#bdb7a9] px-3 py-2 text-sm font-semibold">{isRevealed ? "Hide answer" : "Reveal answer"}</button>{isRevealed && <div className="mt-4 rounded-lg bg-[#e2eee5] p-4 text-sm"><b>Answer:</b> {question.correctAnswer}<p className="mt-2 text-[#6e756c]">{question.explanation}</p></div>}</article>; })}</section>
  </main>;
}
