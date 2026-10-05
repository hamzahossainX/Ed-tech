"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from "lucide-react";

export const START_TOUR_EVENT = "learnx:start-tour";

type TourStep = {
  selector: string;
  title: string;
  description: string;
};

const TOUR_STEPS: TourStep[] = [
  { selector: "[data-tour='hero']", title: "One goal, one clear path", description: "Start with a learning goal or open the offline demo when live services are unavailable." },
  { selector: "[data-tour='demo']", title: "Demo-safe by design", description: "Judges can explore a complete roadmap without authentication, AI providers, or a database connection." },
  { selector: "[data-tour='roadmap-header']", title: "Your command center", description: "Track completion, listen to the summary, and understand the roadmap at a glance." },
  { selector: "[data-tour='roadmap-actions']", title: "Built for action", description: "Open streaks, workload planning, badges, adaptations, AI critique, sharing, and exports." },
  { selector: "[data-tour='view-switcher']", title: "Two ways to understand", description: "Move between an actionable timeline and an AI-generated Mermaid mind map." },
  { selector: "[data-tour='milestone-list']", title: "Learn, focus, prove", description: "Each milestone combines resources, Zen Mode, progress tracking, and a knowledge check." },
  { selector: "[data-tour='feedback']", title: "Close the feedback loop", description: "Learners can rate the roadmap locally without sending private feedback to a server." },
];

export function GuidedTourLauncher() {
  return <button type="button" onClick={() => window.dispatchEvent(new Event(START_TOUR_EVENT))} aria-label="Start judge tour" title="Start 60-second judge tour" className="inline-flex size-10 shrink-0 items-center justify-center gap-2 rounded-full border border-black/8 bg-black/[.025] text-xs font-black text-black/50 transition hover:bg-black/[.06] hover:text-black dark:border-white/10 dark:bg-white/[.06] dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white lg:w-auto lg:px-3"><Sparkles className="size-4" /> <span className="hidden lg:inline">Judge Tour</span></button>;
}

export function GuidedTour() {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const activeStep = steps[stepIndex];
  const open = Boolean(activeStep);

  const close = useCallback(() => {
    setSteps([]);
    setStepIndex(0);
    setTargetRect(null);
    try { window.localStorage.setItem("learnx:judge-tour-seen:v1", new Date().toISOString()); } catch { /* Optional preference only. */ }
  }, []);

  useEffect(() => {
    function startTour() {
      const availableSteps = TOUR_STEPS.filter((step) => document.querySelector(step.selector));
      setSteps(availableSteps);
      setStepIndex(0);
    }
    window.addEventListener(START_TOUR_EVENT, startTour);
    return () => window.removeEventListener(START_TOUR_EVENT, startTour);
  }, []);

  useEffect(() => {
    if (!activeStep) return;
    const matchedTarget = document.querySelector<HTMLElement>(activeStep.selector);
    if (!matchedTarget) { close(); return; }
    const target = matchedTarget;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    function updateRect() { setTargetRect(target.getBoundingClientRect()); }
    const timer = window.setTimeout(updateRect, 350);
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [activeStep, close]);

  useEffect(() => {
    if (!open) return;
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") setStepIndex((index) => Math.min(index + 1, steps.length - 1));
      if (event.key === "ArrowLeft") setStepIndex((index) => Math.max(index - 1, 0));
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [close, open, steps.length]);

  if (!activeStep) return null;
  const isLast = stepIndex === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="LearnX guided tour">
      <div className="absolute inset-0 bg-[#07110b]/70 backdrop-blur-[2px]" onClick={close} />
      {targetRect && <div aria-hidden="true" className="pointer-events-none fixed rounded-2xl ring-4 ring-[#c8ff65] shadow-[0_0_0_9999px_rgba(7,17,11,.30),0_0_45px_rgba(200,255,101,.35)] transition-all duration-300" style={{ left: Math.max(8, targetRect.left - 6), top: Math.max(8, targetRect.top - 6), width: Math.min(window.innerWidth - 16, targetRect.width + 12), height: targetRect.height + 12 }} />}
      <section className="fixed bottom-4 left-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-3xl border border-white/10 bg-[#111512] p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,.65)] sm:bottom-8">
        <button type="button" onClick={close} aria-label="Close guided tour" className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/8 text-white/55 transition hover:bg-white/12 hover:text-white"><X className="size-4" /></button>
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#c8ff65]">60-second judge tour · {stepIndex + 1}/{steps.length}</p>
        <h2 className="mt-3 pr-8 text-2xl font-black tracking-tight">{activeStep.title}</h2>
        <p className="mt-2 text-sm leading-6 text-white/55">{activeStep.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <button type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((index) => Math.max(index - 1, 0))} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/12 px-4 text-xs font-black text-white/70 disabled:opacity-30"><ArrowLeft className="size-4" /> Back</button>
          <button type="button" onClick={() => isLast ? close() : setStepIndex((index) => index + 1)} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#c8ff65] px-4 text-xs font-black text-[#17211b]">{isLast ? <><Check className="size-4" /> Finish</> : <>Next <ArrowRight className="size-4" /></>}</button>
        </div>
      </section>
    </div>
  );
}
