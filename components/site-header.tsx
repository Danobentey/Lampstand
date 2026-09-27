"use client";

import Link from "next/link";
import { useState } from "react";

const navigation = [
  { label: "Practice", href: "/quiz/setup" },
  { label: "Review", href: "/review" },
  { label: "Progress", href: "/stats" },
  { label: "History", href: "/history" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return <header className="relative z-20 border-b border-[#ded8ca] bg-[#fffdf8]/95 px-5 py-4 backdrop-blur md:px-10">
    <div className="mx-auto flex max-w-6xl items-center justify-between">
      <Link href="/" className="flex items-center gap-3 text-left" onClick={() => setMenuOpen(false)}>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#275844] text-lg text-[#f4dfb3]">✦</span>
        <span><b className="serif block text-xl tracking-tight">Lampstand</b><small className="block text-[10px] uppercase tracking-[.2em] text-[#6e756c]">Bible quiz training</small></span>
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-[#6e756c] md:flex" aria-label="Main navigation">
        {navigation.map((item) => <Link key={item.href} href={item.href} className="transition-colors hover:text-[#275844]">{item.label}</Link>)}
      </nav>
      <div className="flex items-center gap-2">
        <Link href="/quiz/setup" className="hidden rounded-lg bg-[#275844] px-4 py-2 text-sm font-semibold text-white sm:inline-flex">Start quiz</Link>
        <button type="button" className="grid h-10 w-10 place-items-center rounded-lg border border-[#ded8ca] text-[#275844] md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          <span className="text-xl leading-none" aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
        </button>
      </div>
    </div>
    {menuOpen && <>
      <button aria-label="Close navigation menu" className="fixed inset-0 z-30 bg-[#1d2a24]/35 md:hidden" onClick={() => setMenuOpen(false)} />
      <nav className="fixed right-0 top-0 z-40 h-dvh w-[min(20rem,calc(100vw-3rem))] border-l border-[#ded8ca] bg-[#fffdf8] px-6 py-6 shadow-xl md:hidden" aria-label="Mobile navigation">
        <div className="flex h-full flex-col">
          <div className="mb-8 flex items-center justify-between"><span className="serif text-xl font-semibold">Lampstand</span><button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="grid h-10 w-10 place-items-center rounded-lg border border-[#ded8ca] text-xl text-[#275844]">×</button></div>
          {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="border-b border-[#ded8ca] py-3 text-sm font-semibold text-[#275844]">{item.label}</Link>)}
          <Link href="/quiz/setup" onClick={() => setMenuOpen(false)} className="mt-auto rounded-lg bg-[#275844] px-4 py-3 text-center text-sm font-semibold text-white">Start quiz</Link>
        </div>
      </nav>
    </>}
  </header>;
}