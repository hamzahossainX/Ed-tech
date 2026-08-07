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
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 pr-16 sm:px-6 sm:py-7 sm:pr-20 lg:px-10 lg:pr-24">
        <div className="flex items-center gap-2 text-lg font-black tracking-tight"><span className="grid size-9 place-items-center rounded-full bg-[#173f2c] text-[#c8ff65]"><Hammer size={18} /></span>LearnX</div>
        <span className="hidden rounded-full border border-[#173f2c]/15 bg-white/60 px-4 py-2 text-xs font-bold text-[#173f2c] backdrop-blur dark:border-white/10 dark:bg-white/8 dark:text-white/75 sm:inline-flex">AI-powered learning</span>
      </nav>

      <section className="relative mx-auto flex min-h-[72vh] max-w-7xl flex-col items-center justify-center px-4 pb-14 pt-8 text-center sm:min-h-[78vh] sm:px-6 sm:pb-20 sm:pt-12 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#173f2c]/15 bg-white/70 px-3 py-2 text-[10px] font-black uppercase tracking-[.14em] text-[#3c7156] backdrop-blur dark:border-white/10 dark:bg-white/8 dark:text-[#c8ff65] sm:mb-7 sm:px-4 sm:text-xs sm:tracking-[.2em]"><Sparkles size={15} /> One goal. Your perfect path.</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="max-w-5xl text-4xl font-black leading-[.95] tracking-[-.05em] sm:text-6xl md:text-7xl lg:text-[7.5rem] lg:leading-[.9] lg:tracking-[-.065em]">Turn ambition into<br /><span className="text-[#3c7156] dark:text-[#a9e950]">a clear roadmap.</span></motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .18 }} className="mt-6 max-w-2xl text-base leading-7 text-black/50 dark:text-white/55 sm:mt-8 sm:text-lg sm:leading-8 md:text-xl">Tell us what you want to learn. LearnX creates a personalized, milestone-by-milestone plan in seconds—no signup, no friction.</motion.p>
        <motion.button initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .26 }} onClick={begin} className="mt-8 flex min-h-12 items-center gap-3 rounded-full bg-[#c8ff65] px-6 py-3 text-base font-black shadow-[4px_4px_0_#17211b] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none sm:mt-10 sm:px-8 sm:py-5 sm:text-lg">Start learning <ArrowDown size={19} /></motion.button>
        <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-2 text-left min-[380px]:grid-cols-3 sm:mt-14 sm:gap-3">{[[BrainCircuit, "AI tailored"], [Route, "Clear milestones"], [BadgeCheck, "Track progress"]].map(([Icon, label]) => { const FeatureIcon = Icon as typeof BrainCircuit; return <div key={label as string} className="flex items-center gap-3 rounded-2xl border border-black/8 bg-white/55 p-3 text-xs font-bold backdrop-blur transition-colors dark:border-white/10 dark:bg-white/6 min-[380px]:block min-[380px]:p-4 min-[380px]:text-center sm:text-sm"><FeatureIcon className="shrink-0 text-[#3c7156] dark:text-[#a9e950] min-[380px]:mx-auto min-[380px]:mb-2" size={20} />{label as string}</div>; })}</div>
      </section>

      <AnimatePresence>
        {started && <motion.section id="start" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl scroll-mt-8 px-4 pb-20 sm:scroll-mt-12 sm:px-6 sm:pb-28 lg:px-10"><RoadmapPrompt /></motion.section>}
      </AnimatePresence>
    </main>
  );
}
