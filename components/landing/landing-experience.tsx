"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight, BookOpen, Check, Focus, GitBranch, Sparkles } from "lucide-react";
import { ContinueLearning } from "@/components/landing/continue-learning";
import { DemoRoadmapButton } from "@/components/landing/demo-roadmap-button";
import { LearningPathPreview } from "@/components/landing/learning-path-preview";
import { LearningStudio } from "@/components/landing/learning-studio";
import { RoadmapPrompt } from "@/components/roadmap/roadmap-prompt";

type LandingExperienceProps = { isAuthenticated: boolean };

const learningSteps = [
  { number: "01", icon: GitBranch, title: "Find your direction.", description: "Describe your goal and your available time. Get an ordered path with resources for each step.", detail: "A plan that starts where you are" },
  { number: "02", icon: Focus, title: "Make room for focus.", description: "Open a milestone, explore a deep dive, or settle into a focused study session with Zen Mode.", detail: "Less tab-hopping. More learning." },
  { number: "03", icon: BookOpen, title: "Make the knowledge stick.", description: "Check your understanding with a quiz, track your progress, and take your notes with you.", detail: "Small wins you can build on" },
] as const;

export function LandingExperience({ isAuthenticated }: LandingExperienceProps) {
  const [started, setStarted] = useState(false);
  const [startRequest, setStartRequest] = useState(0);
  const [promptRequest, setPromptRequest] = useState<{ text: string; id: number }>();
  const builderRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  function begin(prompt?: string) {
    setStarted(true);
    setStartRequest((request) => request + 1);
    if (prompt) setPromptRequest((previous) => ({ text: prompt, id: (previous?.id ?? 0) + 1 }));
  }

  useEffect(() => {
    if (!startRequest) return;
    const frame = requestAnimationFrame(() => {
      builderRef.current?.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "center" });
      builderRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [startRequest, reduceMotion]);

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative isolate min-h-screen overflow-x-clip">
        <div aria-hidden="true" className="landing-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[850px] opacity-60 dark:opacity-30" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 -z-10 size-[32rem] max-w-full rounded-full bg-[#c8ff65]/15 blur-[100px] dark:bg-[#759d35]/10" />
        <section data-tour="hero" className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:min-h-[700px] lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-10 lg:pb-24 lg:pt-12">
          <div className="min-w-0 text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#173f2c]/15 bg-white/80 px-3 py-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#356349] backdrop-blur dark:border-[#c8ff65]/20 dark:bg-[#c8ff65]/5 dark:text-[#c8ff65] sm:text-xs">
              <Sparkles className="size-3.5" aria-hidden="true" /> A little direction. A lot of possibility.
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="mx-auto max-w-2xl text-5xl font-black leading-[1.04] tracking-[-.055em] sm:text-6xl lg:text-[clamp(3.6rem,5.3vw,4.6rem)]">
              Turn ambition into<br /><span className="bg-gradient-to-r from-[#3c7156] to-[#4e8462] bg-clip-text text-transparent dark:from-[#c8ff65] dark:to-[#7cdec2]">a clear roadmap.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .16 }} className="mx-auto mt-6 max-w-lg text-base leading-7 text-[#526157] dark:text-[#a5b2a9] sm:text-lg sm:leading-8 lg:mx-0">
              Your next skill starts with a plan. Turn a big goal into manageable milestones, useful resources, and a little progress every day.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .24 }} className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <button type="button" onClick={() => begin()} aria-expanded={started} aria-controls={started ? "start" : undefined} className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#c8ff65] px-7 py-4 text-base font-black text-slate-950 shadow-[0_8px_28px_rgba(144,191,67,.18)] transition duration-300 hover:bg-[#d7ff91] hover:shadow-[0_8px_32px_rgba(144,191,67,.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c7156] focus-visible:ring-offset-4 dark:focus-visible:ring-offset-[#0a0a0a] motion-safe:hover:-translate-y-1">
                Start learning <ArrowUpRight className="size-5" aria-hidden="true" />
              </button>
              <DemoRoadmapButton />
            </motion.div>
            <p className="mt-4 text-xs leading-5 text-[#657168] dark:text-[#93a397]">Explore the demo freely. Sign in to create your own path.</p>
            <a href="#explore" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full text-xs font-bold text-[#3c7156] underline decoration-[#3c7156]/30 underline-offset-4 hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c7156] dark:text-[#c8ff65] dark:decoration-[#c8ff65]/30">Not sure where to start? Explore the learning studio <ArrowDown className="size-3.5 shrink-0" aria-hidden="true" /></a>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-semibold text-[#40594a] dark:text-[#b4c3b8] lg:justify-start" aria-label="Learning tools">
              {["Step-by-step plans", "Built-in focus tools", "Export your notes"].map((label) => <li key={label} className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-[#3c7156] dark:text-[#c8ff65]" aria-hidden="true" />{label}</li>)}
            </ul>
          </div>
          <motion.div data-testid="learning-path-preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2, duration: .55 }} className="mx-auto w-full min-w-0 max-w-xl">
            <LearningPathPreview onStart={begin} />
          </motion.div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10"><ContinueLearning /></div>

        <AnimatePresence>
          {started && (
            <motion.section ref={builderRef} id="start" aria-label="Build your learning path" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl scroll-mt-8 px-4 pb-16 pt-6 sm:scroll-mt-12 sm:px-6 lg:px-10">
              <RoadmapPrompt isAuthenticated={isAuthenticated} promptRequest={promptRequest} />
            </motion.section>
          )}
        </AnimatePresence>

        <LearningStudio onStart={begin} />

        <section aria-labelledby="learning-tools-title" className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-10">
          <div className="mb-8 flex flex-col justify-between gap-4 border-t border-[#173f2c]/10 pt-10 dark:border-white/10 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#52705a] dark:text-[#a9e950]">From someday to day one</p>
              <h2 id="learning-tools-title" className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-4xl">Built for the part after the plan.</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-[#617067] dark:text-[#9caea0]">A place to learn, practice, and see how far you’ve come.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {learningSteps.map(({ number, icon: Icon, title, description, detail }, index) => (
              <motion.article key={number} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ delay: index * .08, duration: .4 }} className="rounded-[1.75rem] border border-[#173f2c]/10 bg-white/80 p-6 transition-colors hover:border-[#3c7156]/40 dark:border-white/10 dark:bg-[#101611] dark:hover:border-[#c8ff65]/30 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#edf3e6] text-[#3c7156] dark:bg-[#c8ff65]/10 dark:text-[#c8ff65]"><Icon className="size-5" aria-hidden="true" /></span>
                  <span className="font-mono text-xs text-[#728276] dark:text-[#738c79]">/{number}</span>
                </div>
                <h3 className="mt-7 text-xl font-bold tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#627167] dark:text-[#a3b0a6]">{description}</p>
                <p className="mt-6 border-t border-[#173f2c]/10 pt-4 text-xs font-semibold text-[#3c7156] dark:border-white/10 dark:text-[#b9d794]">{detail}</p>
              </motion.article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <button type="button" onClick={() => begin()} className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold text-[#3c7156] transition hover:bg-[#173f2c]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c7156] dark:text-[#c8ff65] dark:hover:bg-white/5">Make a plan for your next skill <ArrowDown className="size-4" aria-hidden="true" /></button>
          </div>
        </section>
        <footer className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-[#173f2c]/10 px-4 py-6 text-xs text-[#617067] dark:border-white/10 dark:text-[#94a298] sm:flex-row sm:justify-between sm:px-6 lg:px-10">
          <span className="font-bold text-[#36543f] dark:text-[#d0dfd4]">LearnX <span className="ml-2 font-normal text-[#617067] dark:text-[#94a298]">Stay curious. Keep going.</span></span>
          <span>AI-assisted plans. Progress made by you.</span>
        </footer>
      </main>
    </MotionConfig>
  );
}
