"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Bookmark, CalendarDays, Check, Clock3, Code2, Database, Layers3, Palette, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createStudyPrompt, DEFAULT_STUDY_PREFERENCES, LEARNING_PATHS, readStudyPreferences, STUDIO_STORAGE_KEY, STUDY_DAYS, type StudyPreferences } from "@/lib/study-planner";

const filters = ["All paths", "Development", "Data & AI", "Design", "Security", "Saved"] as const;
const icons = { web: Code2, python: Sparkles, design: Palette, security: ShieldCheck, mobile: Smartphone, analytics: Database };
const accents = {
  mint: "bg-[#e4efda] text-[#355e36] dark:bg-[#263d29] dark:text-[#c8ff65]",
  violet: "bg-[#eae5fb] text-[#655196] dark:bg-[#322849] dark:text-[#d7c3ff]",
  peach: "bg-[#fae6d7] text-[#9a5235] dark:bg-[#442e23] dark:text-[#ffc79e]",
  sky: "bg-[#e0edf7] text-[#396680] dark:bg-[#223946] dark:text-[#a1d7f9]",
};
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#659c36] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#101611]";

export function LearningStudio({ onStart }: { onStart: (prompt: string) => void }) {
  const [filter, setFilter] = useState<typeof filters[number]>("All paths");
  const [preferences, setPreferences] = useState<StudyPreferences>(DEFAULT_STUDY_PREFERENCES);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(true);
  const plannerRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setPreferences(readStudyPreferences());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(preferences));
      setSaved(true);
    } catch { setSaved(false); }
  }, [preferences, ready]);

  const visiblePaths = LEARNING_PATHS.filter((path) => filter === "All paths" || (filter === "Saved" ? preferences.favorites.includes(path.id) : path.category === filter));
  const selectedPath = LEARNING_PATHS.find((path) => path.id === preferences.pathId)!;
  const weeklyMinutes = preferences.minutes * preferences.days.length;
  const weeklyHours = Math.round(weeklyMinutes / 60 * 10) / 10;
  const totalHours = Math.round(weeklyMinutes * preferences.weeks / 60);

  function toggleFavorite(id: StudyPreferences["pathId"]) {
    setPreferences((current) => ({ ...current, favorites: current.favorites.includes(id) ? current.favorites.filter((value) => value !== id) : [...current.favorites, id] }));
  }

  function selectPath(id: StudyPreferences["pathId"]) {
    const path = LEARNING_PATHS.find((item) => item.id === id)!;
    setPreferences((current) => ({ ...current, pathId: id, weeks: path.weeks }));
    plannerRef.current?.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "center" });
    plannerRef.current?.focus({ preventScroll: true });
  }

  function toggleDay(index: number) {
    if (preferences.days.includes(index) && preferences.days.length === 1) {
      toast.info("Keep at least one study day in your week.");
      return;
    }
    setPreferences((current) => ({ ...current, days: current.days.includes(index) ? current.days.filter((day) => day !== index) : [...current.days, index].sort() }));
  }

  return (
    <section id="explore" aria-labelledby="explore-heading" className="mx-auto max-w-7xl scroll-mt-8 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-[#52705a] dark:text-[#b8e789]"><Layers3 className="size-4" aria-hidden="true" /> The learning studio</p>
          <h2 id="explore-heading" className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-4xl">Find your next <span className="font-serif font-normal italic text-[#3c7156] dark:text-[#c8ff65]">obsession.</span></h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#617067] dark:text-[#a3b0a6]">A few good starting points. Save what sparks your curiosity, then make a little room for it in your week.</p>
        </div>
        <a href="#study-planner" className={cn("inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-xs font-bold dark:border-white/15 dark:bg-white/5", focusRing)}><CalendarDays className="size-4" aria-hidden="true" /> Plan my week <ArrowUpRight className="size-4" aria-hidden="true" /></a>
      </div>

      <div role="group" aria-label="Filter learning paths" className="mb-6 flex flex-wrap gap-2">
        {filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className={cn("inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-bold transition-colors", focusRing, filter === item ? "border-[#173f2c] bg-[#173f2c] text-white dark:border-[#c8ff65] dark:bg-[#c8ff65] dark:text-[#17211b]" : "border-black/10 bg-white/60 text-[#526157] hover:border-[#3c7156]/50 dark:border-white/10 dark:bg-white/5 dark:text-[#b7c2ba] dark:hover:border-[#c8ff65]/40")}>
          {item === "Saved" && <Bookmark className="size-3.5" aria-hidden="true" />}{item}{item === "Saved" && <span className="opacity-70">{preferences.favorites.length}</span>}
        </button>)}
      </div>
      <p role="status" className="sr-only">{visiblePaths.length} learning paths shown</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visiblePaths.map((path) => {
            const Icon = icons[path.id];
            const isFavorite = preferences.favorites.includes(path.id);
            return <motion.article key={path.id} layout={!reduceMotion} initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .2 }} className="group relative overflow-hidden rounded-[1.75rem] border border-[#173f2c]/10 bg-white p-5 shadow-[0_8px_30px_-25px_rgba(23,63,44,.25)] dark:border-white/10 dark:bg-[#121914] sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className={cn("relative grid size-14 place-items-center rounded-2xl transition-transform duration-300 motion-safe:group-hover:-rotate-6", accents[path.accent])}><Icon className="size-6" aria-hidden="true" /></div>
                <button type="button" disabled={!ready} aria-label={`${isFavorite ? "Unsave" : "Save"} ${path.title}`} aria-pressed={isFavorite} onClick={() => toggleFavorite(path.id)} className={cn("grid size-10 place-items-center rounded-full transition-colors disabled:opacity-40", focusRing, isFavorite ? "bg-[#c8ff65]/20 text-[#426b28] dark:text-[#c8ff65]" : "text-[#7b887e] hover:bg-black/5 dark:text-[#9cac9f] dark:hover:bg-white/10")}><Bookmark className={cn("size-4", isFavorite && "fill-current")} aria-hidden="true" /></button>
              </div>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[.14em] text-[#6a796e] dark:text-[#91a596]">{path.category} <span aria-hidden="true" className="mx-1">/</span> {path.weeks}-week starting point</p>
              <h3 className="mt-2 text-xl font-bold tracking-tight">{path.title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-[#667369] dark:text-[#a5b2a9]">{path.description}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Skills covered">{path.skills.map((skill) => <li key={skill} className="rounded-md bg-[#f1f4ee] px-2 py-1 text-[10px] font-semibold text-[#55705a] dark:bg-white/5 dark:text-[#bfd0c3]">{skill}</li>)}</ul>
              <div className="mt-5 flex items-center justify-between gap-2 border-t border-black/5 pt-4 dark:border-white/10">
                <span className="text-[10px] text-[#68776c] dark:text-[#9dae9f]">{path.level}</span>
                <button type="button" disabled={!ready} onClick={() => selectPath(path.id)} aria-label={`Plan ${path.title}`} className={cn("inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-xs font-bold text-[#376442] hover:bg-[#eef5e9] disabled:opacity-40 dark:text-[#c8ff65] dark:hover:bg-white/5", focusRing)}>Plan this path <ArrowRight className="size-3.5" aria-hidden="true" /></button>
              </div>
            </motion.article>;
          })}
        </AnimatePresence>
      </div>
      {visiblePaths.length === 0 && <div className="rounded-3xl border border-dashed border-[#3c7156]/30 p-10 text-center dark:border-white/15"><Bookmark className="mx-auto size-7 text-[#789b61]" aria-hidden="true" /><h3 className="mt-3 font-bold">Keep your next idea close.</h3><p className="mt-2 text-sm text-[#617067] dark:text-[#a3b0a6]">Tap the bookmark on a path to find it here later.</p><button type="button" onClick={() => setFilter("All paths")} className={cn("mt-4 rounded-full px-4 py-2 text-sm font-bold text-[#3c7156] dark:text-[#c8ff65]", focusRing)}>Explore all paths <span aria-hidden="true">→</span></button></div>}

      <section ref={plannerRef} tabIndex={-1} id="study-planner" aria-labelledby="planner-heading" className="relative mt-10 scroll-mt-8 overflow-hidden rounded-[2rem] border border-[#31523d] bg-[#13271d] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#c8ff65]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-40 size-96 rounded-full bg-[#c8ff65]/10 blur-3xl" />
        <div className="relative grid lg:grid-cols-[1.05fr_1fr]">
          <div className="p-6 sm:p-9">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-[#c8ff65]"><CalendarDays className="size-4" aria-hidden="true" /> Your weekly rhythm</p>
            <h2 id="planner-heading" className="mt-4 text-3xl font-bold tracking-[-.04em] sm:text-4xl">Big goals.<br /><span className="font-serif font-normal italic text-[#d7efb9]">Small calendar slots.</span></h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#aec1b4]">Build a schedule that fits your life. We’ll include your time budget in the goal you send to the roadmap builder.</p>
            <label htmlFor="planner-path" className="mt-6 block text-xs font-semibold text-[#d2e1d5]">What are we making time for?</label>
            <select id="planner-path" value={preferences.pathId} disabled={!ready} onChange={(event) => setPreferences((current) => ({ ...current, pathId: event.target.value as StudyPreferences["pathId"] }))} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#203c2b] px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-[#c8ff65] disabled:opacity-50">
              {LEARNING_PATHS.map((path) => <option key={path.id} value={path.id}>{path.goal}</option>)}
            </select>
            <div className="mt-5 flex items-center justify-between gap-3"><label htmlFor="session-minutes" className="text-xs font-semibold text-[#d2e1d5]">Time per session</label><output htmlFor="session-minutes" className="rounded-lg bg-white/10 px-2 py-1 font-mono text-xs text-[#c8ff65]">{preferences.minutes} minutes</output></div>
            <input id="session-minutes" type="range" min={15} max={120} step={15} disabled={!ready} value={preferences.minutes} onChange={(event) => setPreferences((current) => ({ ...current, minutes: Number(event.target.value) }))} className="mt-3 h-7 w-full cursor-pointer accent-[#c8ff65] disabled:opacity-50" />
            <div className="flex justify-between font-mono text-[10px] text-[#a1b8a7]"><span>15 min</span><span>2 hours</span></div>
          </div>
          <div className="border-t border-white/10 bg-black/10 p-6 sm:p-9 lg:border-l lg:border-t-0">
            <fieldset disabled={!ready}><legend className="text-xs font-semibold text-[#d2e1d5]">Your study days</legend><div className="mt-3 grid grid-cols-7 gap-1.5">
              {STUDY_DAYS.map((day, index) => <button key={day} type="button" aria-label={day} aria-pressed={preferences.days.includes(index)} onClick={() => toggleDay(index)} className={cn("flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl border text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-40", preferences.days.includes(index) ? "border-[#c8ff65] bg-[#c8ff65] text-[#17311d]" : "border-white/10 bg-white/5 text-[#bfd0c3] hover:border-white/30")}><span>{day.slice(0, 2)}</span>{preferences.days.includes(index) ? <Check className="size-3" aria-hidden="true" /> : <span aria-hidden="true" className="size-1 rounded-full bg-white/20" />}</button>)}
            </div></fieldset>
            <fieldset disabled={!ready} className="mt-6"><legend className="text-xs font-semibold text-[#d2e1d5]">Give yourself</legend><div className="mt-3 grid grid-cols-4 gap-2">{([4, 8, 12, 24] as const).map((weeks) => <button key={weeks} type="button" aria-pressed={preferences.weeks === weeks} onClick={() => setPreferences((current) => ({ ...current, weeks }))} className={cn("min-h-10 rounded-xl border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8ff65]", preferences.weeks === weeks ? "border-[#c8ff65]/50 bg-[#c8ff65]/10 text-[#d4f7ac]" : "border-white/10 text-[#b7c9bd] hover:bg-white/5")}>{weeks} weeks</button>)}</div></fieldset>
            <div aria-live="polite" aria-atomic="true" className="mt-6 flex items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <Clock3 className="size-7 shrink-0 text-[#bce581]" aria-hidden="true" />
              <div><p className="text-2xl font-bold tracking-tight">{weeklyHours}<span className="ml-1 text-xs font-medium text-[#b9cabc]">hrs / week</span></p><p className="mt-1 text-[11px] text-[#a9bcae]">{totalHours} planned hours over {preferences.weeks} weeks</p></div>
            </div>
            <button type="button" disabled={!ready} onClick={() => onStart(createStudyPrompt(preferences))} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#c8ff65] px-4 text-sm font-black text-[#152719] transition hover:bg-[#d8ff91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#13271d] disabled:opacity-50">Build my learning plan <ArrowUpRight className="size-4" aria-hidden="true" /></button>
            <p className="mt-3 text-center text-[10px] leading-5 text-[#adc2b2]">{ready && !saved ? "Browser storage is unavailable. Your choices last for this visit." : "Your preferences stay on this device."}<br />A starting schedule for {selectedPath.goal}. Adjust your pace as you learn.</p>
          </div>
        </div>
      </section>
    </section>
  );
}
