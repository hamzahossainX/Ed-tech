"use client";

import { useCallback, useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Baby, BadgeCheck, BookOpen, Check, ChevronRight, Clock3, Circle, ExternalLink, ListTree, LoaderCircle, Sparkles, Timer, Workflow } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { simplifyMilestone } from "@/app/actions/simplify-milestone";
import { toggleMilestone } from "@/app/actions/toggle-milestone";
import { ClaimCertificateDialog } from "@/components/certificate/claim-certificate-dialog";
import { AchievementGallery } from "@/components/roadmap/achievement-gallery";
import { AdaptiveRoadmapDialog } from "@/components/roadmap/adaptive-roadmap-dialog";
import { CareerInsightsWidget } from "@/components/roadmap/career-insights-widget";
import { MilestoneQuizDialog } from "@/components/roadmap/milestone-quiz-dialog";
import { RoadmapExportMenu } from "@/components/roadmap/roadmap-export-menu";
import { RoadmapCriticDialog } from "@/components/roadmap/roadmap-critic-dialog";
import { RoadmapListenButton } from "@/components/roadmap/roadmap-listen-button";
import { RoadmapMindMap } from "@/components/roadmap/roadmap-mind-map";
import { RoadmapNotionButton } from "@/components/roadmap/roadmap-notion-button";
import { RoadmapShareButton } from "@/components/roadmap/roadmap-share-button";
import { ZenModeDialog } from "@/components/roadmap/zen-mode-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CareerInsights } from "@/lib/career-insights";
import { ACHIEVEMENTS, persistAchievements, readAchievements, type AchievementId, type UnlockedAchievement } from "@/lib/achievements";
import { createMilestoneMindMap } from "@/lib/roadmap-mind-map";
import { ROADMAP_VIEW_EVENT, ROADMAP_ZEN_EVENT, type RoadmapView } from "@/lib/roadmap-events";
import {
  createRoadmapSnapshot,
  persistRoadmapSnapshot,
  restoreRoadmapSnapshot,
  type RecoverableMilestone,
} from "@/lib/roadmap-storage";
import { cn } from "@/lib/utils";

export type TrackerMilestone = RecoverableMilestone;

type Props = {
  roadmap: {
    id: string;
    userName?: string | null;
    title: string;
    description: string;
    estimatedDuration: string;
    careerInsights?: CareerInsights | null;
    mermaidSyntax?: string | null;
    updatedAt: Date | string;
    milestones: TrackerMilestone[];
  };
  isSharedSnapshot?: boolean;
  isDemoMode?: boolean;
};

async function celebrateMilestone(isRoadmapComplete: boolean) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  try {
    const { default: confetti } = await import("canvas-confetti");
    const colors = ["#C6F85E", "#3C7156", "#22C55E", "#FFFFFF"];

    confetti({
      particleCount: isRoadmapComplete ? 140 : 70,
      spread: isRoadmapComplete ? 100 : 70,
      startVelocity: isRoadmapComplete ? 48 : 36,
      origin: { x: 0.5, y: 0.72 },
      colors,
      zIndex: 100,
    });

    if (!isRoadmapComplete) return;

    const celebrationEndsAt = Date.now() + 1_800;
    const timer = window.setInterval(() => {
      if (Date.now() >= celebrationEndsAt) {
        window.clearInterval(timer);
        return;
      }

      confetti({
        particleCount: 24,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.65 },
        colors,
        zIndex: 100,
      });
      confetti({
        particleCount: 24,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.65 },
        colors,
        zIndex: 100,
      });
    }, 220);
  } catch {
    // Progress persistence is the source of truth; animation is non-critical.
  }
}

export function RoadmapTracker({ roadmap, isSharedSnapshot = false, isDemoMode = false }: Props) {
  const [isPending, startTransition] = useTransition();
  const serverSnapshot = useMemo(() => createRoadmapSnapshot(roadmap), [roadmap]);
  const [roadmapState, setRoadmapState] = useState(serverSnapshot);
  const [storageReady, setStorageReady] = useState(false);
  const [achievements, setAchievements] = useState<UnlockedAchievement[]>([]);
  const [activeView, setActiveView] = useState<"timeline" | "mind-map">("timeline");
  const [activeMilestone, setActiveMilestone] = useState<TrackerMilestone | null>(null);
  const [zenMilestone, setZenMilestone] = useState<TrackerMilestone | null>(null);
  const [quizMilestone, setQuizMilestone] = useState<TrackerMilestone | null>(null);
  const [simplifyingMilestoneId, setSimplifyingMilestoneId] = useState<string | null>(null);
  const [eli5ByMilestone, setEli5ByMilestone] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      roadmap.milestones
        .filter((item) => item.eli5Explanation?.length)
        .map((item) => [item.id, item.eli5Explanation as string[]]),
    ),
  );
  const roadmapForStorage = useMemo(() => ({
    ...roadmapState,
    milestones: roadmapState.milestones.map((item) => ({
      ...item,
      eli5Explanation: eli5ByMilestone[item.id] ?? item.eli5Explanation,
    })),
  }), [eli5ByMilestone, roadmapState]);
  const [milestones, setOptimistic] = useOptimistic(roadmapState.milestones, (current, update: { id: string; completed: boolean }) => current.map((item) => item.id === update.id ? { ...item, isCompleted: update.completed } : item));
  const completed = milestones.filter((item) => item.isCompleted).length;
  const progress = milestones.length ? Math.round((completed / milestones.length) * 100) : 0;
  const currentRoadmap = useMemo(() => ({
    ...roadmapForStorage,
    milestones: milestones.map((item) => ({
      ...item,
      eli5Explanation: eli5ByMilestone[item.id] ?? item.eli5Explanation,
    })),
  }), [eli5ByMilestone, milestones, roadmapForStorage]);
  const mindMapSyntax = useMemo(
    () => roadmapState.mermaidSyntax ?? createMilestoneMindMap(roadmapState.title, milestones),
    [milestones, roadmapState.mermaidSyntax, roadmapState.title],
  );
  const unlockAchievement = useCallback((achievementId: AchievementId) => {
    const current = readAchievements();
    if (current.some((item) => item.id === achievementId)) {
      setAchievements(current);
      return;
    }

    const next = [...current, { id: achievementId, unlockedAt: new Date().toISOString() }];
    persistAchievements(next);
    setAchievements(next);
    const definition = ACHIEVEMENTS.find((item) => item.id === achievementId);
    if (definition) toast.success(definition.celebration, { duration: 10_000 });
  }, []);

  useEffect(() => {
    const recoveredRoadmap = isSharedSnapshot && !isDemoMode
      ? serverSnapshot
      : restoreRoadmapSnapshot(serverSnapshot);
    setRoadmapState(recoveredRoadmap);
    setEli5ByMilestone(Object.fromEntries(
      recoveredRoadmap.milestones
        .filter((item) => item.eli5Explanation?.length)
        .map((item) => [item.id, item.eli5Explanation as string[]]),
    ));
    setStorageReady(true);
  }, [isDemoMode, isSharedSnapshot, serverSnapshot]);

  useEffect(() => {
    if (storageReady) persistRoadmapSnapshot(roadmapForStorage);
  }, [roadmapForStorage, storageReady]);

  useEffect(() => {
    setAchievements(readAchievements());
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    const persistedCompleted = roadmapState.milestones.filter((item) => item.isCompleted).length;
    if (persistedCompleted > 0) unlockAchievement("first-step");
    if (persistedCompleted === roadmapState.milestones.length && persistedCompleted > 0) {
      unlockAchievement("path-master");
    }
  }, [roadmapState.milestones, storageReady, unlockAchievement]);

  useEffect(() => {
    function handleViewCommand(event: Event) {
      const requestedView = (event as CustomEvent<RoadmapView>).detail;
      if (requestedView === "timeline" || requestedView === "mind-map") {
        setActiveView(requestedView);
      }
    }

    function handleZenCommand() {
      const nextMilestone = milestones.find((item) => !item.isCompleted) ?? milestones[0];
      if (nextMilestone) setZenMilestone(nextMilestone);
    }

    window.addEventListener(ROADMAP_VIEW_EVENT, handleViewCommand);
    window.addEventListener(ROADMAP_ZEN_EVENT, handleZenCommand);
    return () => {
      window.removeEventListener(ROADMAP_VIEW_EVENT, handleViewCommand);
      window.removeEventListener(ROADMAP_ZEN_EVENT, handleZenCommand);
    };
  }, [milestones]);

  function updateMilestoneCompletion(item: TrackerMilestone, next: boolean) {
    const completesRoadmap = next && completed + 1 === milestones.length;
    startTransition(async () => {
      setOptimistic({ id: item.id, completed: next });
      try {
        if (!isSharedSnapshot) await toggleMilestone(item.id, next);
        setRoadmapState((current) => ({
          ...current,
          updatedAt: new Date().toISOString(),
          milestones: current.milestones.map((milestone) => (
            milestone.id === item.id
              ? { ...milestone, isCompleted: next }
              : milestone
          )),
        }));
        if (next) await celebrateMilestone(completesRoadmap);
      } catch {
        toast.error("We couldn't update this milestone. Please try again.", {
          duration: 20_000,
        });
      }
    });
  }

  function handleToggle(item: TrackerMilestone) {
    if (item.isCompleted) {
      updateMilestoneCompletion(item, false);
      return;
    }

    if (isDemoMode) {
      updateMilestoneCompletion(item, true);
      return;
    }

    setQuizMilestone(item);
  }

  function openFocusMode(item: TrackerMilestone) {
    if (item.exhaustiveDeepDive) setActiveMilestone(item);
  }

  async function handleSimplify(item: TrackerMilestone) {
    if (simplifyingMilestoneId || eli5ByMilestone[item.id]) return;

    setSimplifyingMilestoneId(item.id);
    try {
      const result = await simplifyMilestone(item.id);
      if (!result.success) {
        toast.error(result.error, { duration: 20_000 });
        return;
      }

      setEli5ByMilestone((current) => ({
        ...current,
        [item.id]: result.lines,
      }));
    } catch {
      toast.error(
        "We couldn't simplify this topic right now. Please wait a moment and try again.",
        { duration: 20_000 },
      );
    } finally {
      setSimplifyingMilestoneId(null);
    }
  }

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-black/8 bg-white shadow-[0_20px_70px_rgba(23,33,27,.08)] dark:border-white/10 dark:bg-[#111512] dark:shadow-black/30 sm:mt-10 md:rounded-[2rem]">
      {roadmapForStorage.careerInsights && (
        <CareerInsightsWidget insights={roadmapForStorage.careerInsights} />
      )}
      <header className="grid gap-5 border-b border-black/8 p-4 dark:border-white/8 sm:p-6 md:grid-cols-[1fr_auto] md:gap-8 md:p-8 lg:p-10">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-[#3c7156] dark:text-[#a9e950] sm:text-xs sm:tracking-[.2em]"><BadgeCheck size={16} /> Your personal path {isDemoMode && <span className="rounded-full bg-[#c8ff65] px-2 py-1 text-[9px] tracking-[.12em] text-[#17211b]">Offline demo</span>}</div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <AchievementGallery unlocked={achievements} />
              <RoadmapShareButton disabled={isPending} roadmap={currentRoadmap} />
              <RoadmapNotionButton disabled={isPending} roadmap={currentRoadmap} />
              <AdaptiveRoadmapDialog
                disabled={isPending}
                roadmap={currentRoadmap}
                onAdapted={(updates) => {
                  const updatesByPosition = new Map(updates.map((item) => [item.position, item]));
                  setRoadmapState((current) => ({
                    ...current,
                    updatedAt: new Date().toISOString(),
                    milestones: current.milestones.map((milestone) => {
                      if (milestone.isCompleted) return milestone;
                      const update = updatesByPosition.get(milestone.position);
                      return update ? {
                        ...milestone,
                        description: update.description,
                        duration: update.duration,
                        resourceLinks: update.resources,
                      } : milestone;
                    }),
                  }));
                }}
              />
              <RoadmapCriticDialog disabled={isPending} roadmap={currentRoadmap} />
              <RoadmapExportMenu disabled={isPending} roadmap={currentRoadmap} />
            </div>
          </div>
          <h2 className="mt-3 break-words text-2xl font-black tracking-[-.04em] sm:text-3xl md:text-4xl">{roadmapState.title}</h2>
          <div className="mt-3 flex max-w-2xl flex-col items-start gap-3 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm leading-6 text-black/50 dark:text-white/55 sm:text-base sm:leading-7">{roadmapState.description}</p>
            <RoadmapListenButton
              text={`${roadmapState.title}. ${roadmapState.description} Estimated duration: ${roadmapState.estimatedDuration}. This learning path contains ${milestones.length} milestones.`}
            />
          </div>
        </div>
        <div role="progressbar" aria-label="Roadmap completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="flex min-w-36 flex-col justify-center rounded-2xl bg-[#f0f7e7] p-5 dark:bg-white/6"><span className="text-3xl font-black">{progress}%</span><span className="mt-1 text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/45">{completed} of {milestones.length} done</span><div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10"><motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.45, ease: "easeOut" }} className="h-full rounded-full bg-[#3c7156] dark:bg-[#a9e950]" /></div></div>
      </header>
      <div className="p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-black/45 dark:text-white/45"><Clock3 className="shrink-0" size={16} /> Estimated path: {roadmapState.estimatedDuration}</div>
          <div className="inline-flex w-fit rounded-xl border border-black/8 bg-black/[.025] p-1 dark:border-white/10 dark:bg-white/5" role="tablist" aria-label="Roadmap view">
            <button type="button" role="tab" aria-selected={activeView === "timeline"} onClick={() => setActiveView("timeline")} className={cn("inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-black transition sm:text-sm", activeView === "timeline" ? "bg-white text-[#28583f] shadow-sm dark:bg-white/10 dark:text-[#c8ff65]" : "text-black/45 hover:text-black dark:text-white/45 dark:hover:text-white")}><ListTree size={15} /> Timeline View</button>
            <button type="button" role="tab" aria-selected={activeView === "mind-map"} onClick={() => setActiveView("mind-map")} className={cn("inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-black transition sm:text-sm", activeView === "mind-map" ? "bg-white text-[#28583f] shadow-sm dark:bg-white/10 dark:text-[#c8ff65]" : "text-black/45 hover:text-black dark:text-white/45 dark:hover:text-white")}><Workflow size={15} /> Mind Map View</button>
          </div>
        </div>
        {activeView === "timeline" ? <ol className="relative space-y-3 before:absolute before:bottom-7 before:left-[1.1rem] before:top-7 before:w-px before:bg-black/10 dark:before:bg-white/10 sm:space-y-4 sm:before:left-[1.35rem]">
          {milestones.map((item, index) => (
            <motion.li initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} key={item.id} onClick={() => openFocusMode(item)} onKeyDown={(event) => { if (item.exhaustiveDeepDive && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); openFocusMode(item); } }} role={item.exhaustiveDeepDive ? "button" : undefined} tabIndex={item.exhaustiveDeepDive ? 0 : undefined} aria-label={item.exhaustiveDeepDive ? `Open focus mode for ${item.title}` : undefined} className={cn("group relative flex gap-3 overflow-hidden rounded-2xl border p-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c7156] dark:focus-visible:ring-[#a9e950] sm:gap-5 sm:p-5", item.exhaustiveDeepDive && "cursor-pointer pr-10 hover:border-black/20 hover:bg-black/[.025] dark:hover:border-white/20 dark:hover:bg-white/5 sm:pr-14", item.isCompleted ? "border-[#3c7156]/15 bg-[#f5faee] dark:border-[#a9e950]/15 dark:bg-[#a9e950]/[.045]" : "border-black/8 bg-white dark:border-white/8 dark:bg-white/[.025]")}>
              <button type="button" role="checkbox" aria-checked={item.isCompleted} disabled={isPending} onClick={(event) => { event.stopPropagation(); handleToggle(item); }} aria-label={`${item.isCompleted ? "Mark incomplete" : "Complete"} ${item.title}`} className={cn("relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-2 transition sm:size-11", item.isCompleted ? "border-[#3c7156] bg-[#3c7156] text-white dark:border-[#a9e950] dark:bg-[#a9e950] dark:text-[#17211b]" : "border-black/15 bg-white text-black/25 hover:border-[#3c7156] dark:border-white/15 dark:bg-[#111512] dark:text-white/25 dark:hover:border-[#a9e950]")}>{item.isCompleted ? <Check size={18} strokeWidth={3} /> : <Circle size={12} fill="currentColor" />}</button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#3c7156] dark:text-[#a9e950]">Milestone {item.position}</p>
                    <h3 className={cn("mt-1 break-words text-base font-black sm:text-lg", item.isCompleted && "text-black/45 line-through dark:text-white/40")}>{item.title}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/45 dark:bg-white/8 dark:text-white/45">{item.duration}</span>
                    <button type="button" onClick={(event) => { event.stopPropagation(); setZenMilestone(item); }} className="relative z-10 inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#3c7156]/15 bg-[#f0f7e7] px-3 py-1 text-xs font-black text-[#28583f] transition hover:-translate-y-0.5 hover:border-[#3c7156]/35 dark:border-[#c8ff65]/20 dark:bg-[#c8ff65]/10 dark:text-[#c8ff65] dark:hover:border-[#c8ff65]/40" aria-label={`Start a focus session for ${item.title}`}><Timer size={13} /> Focus</button>
                  </div>
                </div>
                <p className="mt-2 break-words text-sm leading-6 text-black/50 dark:text-white/55">{item.description}</p>
                {item.resourceLinks.length > 0 && <div className="mt-4 border-t border-black/8 pt-4 dark:border-white/10"><p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-black/40 dark:text-white/40"><BookOpen size={13} /> Resources</p><div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{item.resourceLinks.map((resource) => <a key={resource.url} href={resource.url} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="relative z-10 inline-flex min-h-10 max-w-full items-center justify-between gap-2 rounded-xl border border-[#3c7156]/15 bg-white px-3 py-2 text-xs font-bold text-[#28583f] transition hover:-translate-y-0.5 hover:border-[#3c7156]/35 hover:shadow-sm dark:border-[#a9e950]/15 dark:bg-white/5 dark:text-[#a9e950]"><span className="truncate">{resource.title}</span><ExternalLink size={13} className="shrink-0 opacity-45 transition hover:opacity-100" /></a>)}</div></div>}
              </div>
              {item.exhaustiveDeepDive && <ChevronRight aria-hidden="true" className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-black/25 opacity-60 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#3c7156] group-hover:opacity-100 dark:text-white/25 dark:group-hover:text-[#a9e950] sm:right-5" />}
            </motion.li>
          ))}
        </ol> : <RoadmapMindMap syntax={mindMapSyntax} />}
        {!isSharedSnapshot && (
          <ClaimCertificateDialog roadmapId={roadmapState.id} isComplete={progress === 100 && milestones.length > 0} claimedName={roadmapState.userName} />
        )}
      </div>
      <Dialog open={Boolean(activeMilestone)} onOpenChange={(open) => { if (!open) setActiveMilestone(null); }}>
        <DialogContent overlayClassName="bg-black/40 backdrop-blur-md" className="flex max-h-[85vh] w-[95vw] max-w-4xl flex-col overflow-hidden rounded-3xl border-slate-800 bg-slate-950/90 p-0 text-slate-100 shadow-[0_32px_120px_rgba(0,0,0,.6)] backdrop-blur-xl md:p-0">
          {activeMilestone && (
            <>
              <DialogHeader className="shrink-0 border-b border-slate-800/80 bg-slate-950/70 px-5 py-6 pr-16 backdrop-blur-xl sm:px-8">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-[#C6F85E] sm:text-xs">
                  <Sparkles size={15} /> Focus Mode · Milestone {activeMilestone.position}
                </div>
                <DialogTitle className="text-2xl text-white sm:text-3xl">
                  {activeMilestone.title}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {activeMilestone.description} · {activeMilestone.duration}
                </DialogDescription>
                {(!isSharedSnapshot || eli5ByMilestone[activeMilestone.id]) && <button
                  type="button"
                  onClick={() => handleSimplify(activeMilestone)}
                  disabled={
                    Boolean(simplifyingMilestoneId) ||
                    Boolean(eli5ByMilestone[activeMilestone.id])
                  }
                  className="mt-3 inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-full border border-[#C6F85E]/25 bg-[#C6F85E]/10 px-4 py-2 text-xs font-black text-[#C6F85E] transition hover:border-[#C6F85E]/50 hover:bg-[#C6F85E]/15 disabled:cursor-default disabled:opacity-70 sm:text-sm"
                >
                  {simplifyingMilestoneId === activeMilestone.id ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Baby className="size-4" aria-hidden="true" />
                  )}
                  {simplifyingMilestoneId === activeMilestone.id
                    ? "Making it super simple..."
                    : simplifyingMilestoneId
                      ? "Please wait..."
                    : eli5ByMilestone[activeMilestone.id]
                      ? "Simplified (ELI5)"
                      : "Simplify it (ELI5)"}
                </button>}
              </DialogHeader>
              <div className="focus-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-7 sm:px-8 sm:py-9">
                {eli5ByMilestone[activeMilestone.id] && (
                  <motion.aside
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="status"
                    aria-live="polite"
                    className="mb-8 overflow-hidden rounded-2xl border border-[#C6F85E]/20 bg-gradient-to-br from-[#C6F85E]/12 to-emerald-400/5 p-5 shadow-[0_16px_50px_rgba(198,248,94,.08)] sm:p-6"
                  >
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#C6F85E]">
                      <Baby className="size-5" aria-hidden="true" /> Explain like I&apos;m 5
                    </div>
                    <ul className="mt-4 space-y-3">
                      {eli5ByMilestone[activeMilestone.id].map((line, index) => (
                        <li key={`${index}-${line}`} className="flex gap-3 text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">
                          <span className="mt-2 size-2 shrink-0 rounded-full bg-[#C6F85E] shadow-[0_0_10px_rgba(198,248,94,.55)]" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.aside>
                )}
                <article className="prose prose-invert prose-slate max-w-none prose-headings:text-[#C6F85E] prose-a:text-blue-400 prose-pre:border prose-pre:border-slate-800 prose-pre:bg-slate-900 prose-code:text-[#C6F85E] prose-strong:text-white">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeMilestone.exhaustiveDeepDive}
                  </ReactMarkdown>
                </article>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <MilestoneQuizDialog
        milestone={quizMilestone}
        onOpenChange={(open) => {
          if (!open) setQuizMilestone(null);
        }}
        onPassed={(passedMilestone) => {
          const matchingMilestone = milestones.find((item) => item.id === passedMilestone.id);
          if (matchingMilestone) updateMilestoneCompletion(matchingMilestone, true);
        }}
      />
      <ZenModeDialog
        milestone={zenMilestone}
        onPomodoroComplete={() => unlockAchievement("deep-work")}
        onOpenChange={(open) => {
          if (!open) setZenMilestone(null);
        }}
        onMarkDone={() => {
          if (zenMilestone && !zenMilestone.isCompleted) handleToggle(zenMilestone);
        }}
      />
    </section>
  );
}
