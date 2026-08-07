"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, BadgeCheck, BrainCircuit, Hammer, Route, Sparkles } from "lucide-react";
import { RoadmapPrompt } from "@/components/roadmap/roadmap-prompt";

export function LandingExperience() {
  const [started, setStarted] = useState(false);

  function begin() {
    setStarted(true);
    requestAnimationFrame(() => document.getElementById("start")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
        <div className="flex items-center gap-2 text-lg font-black tracking-tight"><span className="grid size-9 place-items-center rounded-full bg-[#173f2c] text-[#c8ff65]"><Hammer size={18} /></span>LearnX</div>
        <span className="rounded-full border border-[#173f2c]/15 bg-white/60 px-4 py-2 text-xs font-bold text-[#173f2c]">AI-powered learning</span>
      </nav>

      <section className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-12 text-center lg:px-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#173f2c]/15 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[.2em] text-[#3c7156]"><Sparkles size={15} /> One goal. Your perfect path.</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="max-w-5xl text-6xl font-black leading-[.9] tracking-[-.065em] sm:text-8xl lg:text-[7.5rem]">Turn ambition into<br /><span className="text-[#3c7156]">a clear roadmap.</span></motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .18 }} className="mt-8 max-w-2xl text-lg leading-8 text-black/50 md:text-xl">Tell us what you want to learn. LearnX creates a personalized, milestone-by-milestone plan in seconds—no signup, no friction.</motion.p>
        <motion.button initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .26 }} onClick={begin} className="mt-10 flex items-center gap-3 rounded-full bg-[#c8ff65] px-8 py-5 text-lg font-black shadow-[5px_5px_0_#17211b] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none">Start learning <ArrowDown size={19} /></motion.button>
        <div className="mt-14 grid w-full max-w-3xl grid-cols-3 gap-3 text-left">{[[BrainCircuit, "AI tailored"], [Route, "Clear milestones"], [BadgeCheck, "Track progress"]].map(([Icon, label]) => { const FeatureIcon = Icon as typeof BrainCircuit; return <div key={label as string} className="rounded-2xl border border-black/8 bg-white/55 p-4 text-center text-xs font-bold sm:text-sm"><FeatureIcon className="mx-auto mb-2 text-[#3c7156]" size={20} />{label as string}</div>; })}</div>
      </section>

      <AnimatePresence>
        {started && <motion.section id="start" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl scroll-mt-12 px-6 pb-28 lg:px-10"><RoadmapPrompt /></motion.section>}
      </AnimatePresence>
    </main>
  );
}
