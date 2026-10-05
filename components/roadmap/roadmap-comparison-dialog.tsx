"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, Check, GitCompareArrows, Link2, LoaderCircle, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DEMO_ROADMAP } from "@/lib/demo-roadmap";
import { decodeRoadmapFromUrl } from "@/lib/roadmap-sharing";
import type { RecoverableRoadmap } from "@/lib/roadmap-storage";
import { createRoadmapWorkload } from "@/lib/roadmap-workload";

type RoadmapComparisonDialogProps = {
  roadmap: RecoverableRoadmap;
};

function comparisonStats(roadmap: RecoverableRoadmap) {
  const workload = createRoadmapWorkload(roadmap.milestones);
  return {
    milestones: roadmap.milestones.length,
    completed: roadmap.milestones.filter((item) => item.isCompleted).length,
    weeks: workload.totalWeeks,
    weeklyHours: workload.averageHours,
  };
}

export function RoadmapComparisonDialog({ roadmap }: RoadmapComparisonDialogProps) {
  const [open, setOpen] = useState(false);
  const [shareValue, setShareValue] = useState("");
  const [comparison, setComparison] = useState<RecoverableRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const currentStats = useMemo(() => comparisonStats(roadmap), [roadmap]);
  const comparisonStatsValue = useMemo(() => comparison ? comparisonStats(comparison) : null, [comparison]);

  async function importSharedRoadmap() {
    if (!shareValue.trim() || isLoading) return;
    setIsLoading(true);
    try {
      let encoded = shareValue.trim();
      try {
        const url = new URL(encoded);
        encoded = url.searchParams.get("roadmap") ?? "";
      } catch {
        // Raw encoded payloads are accepted for convenience.
      }
      if (!encoded) throw new Error("Missing roadmap payload.");
      const decoded = await decodeRoadmapFromUrl(encoded);
      setComparison(decoded);
      toast.success("Shared roadmap loaded for comparison.", { duration: 8_000 });
    } catch {
      toast.error("That LearnX share link is invalid or too large.", { duration: 20_000 });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-[#173f2c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#3c7156]/30 hover:shadow-md dark:border-white/10 dark:bg-white/8 dark:text-white sm:text-sm"><GitCompareArrows className="size-4" /> Compare</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <div className="mb-2 flex w-fit items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-violet-800 dark:bg-violet-400/10 dark:text-violet-300"><ArrowRightLeft className="size-4" /> Roadmap Comparison</div>
            <DialogTitle>Compare two learning paths</DialogTitle>
            <DialogDescription>Use the offline demo or import a LearnX share link. Comparison happens entirely in your browser.</DialogDescription>
          </DialogHeader>

          {!comparison ? <div className="mt-7 space-y-4">
            <button type="button" onClick={() => setComparison(DEMO_ROADMAP)} className="flex w-full items-center gap-4 rounded-2xl border border-black/8 bg-black/[.02] p-5 text-left transition hover:-translate-y-0.5 hover:border-[#3c7156]/25 hover:bg-[#f5faee] dark:border-white/10 dark:bg-white/[.025] dark:hover:border-[#c8ff65]/20 dark:hover:bg-[#c8ff65]/[.04]"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#c8ff65] text-[#17211b]"><PlayCircle className="size-5" /></span><span><strong className="block text-sm font-black">Compare with offline demo</strong><span className="mt-1 block text-xs text-black/45 dark:text-white/45">Full-Stack Next.js Developer in 12 Weeks</span></span></button>
            <div className="rounded-2xl border border-black/8 p-5 dark:border-white/10"><label htmlFor="comparison-link" className="flex items-center gap-2 text-sm font-black"><Link2 className="size-4 text-[#3c7156] dark:text-[#c8ff65]" /> Import a shared roadmap</label><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input id="comparison-link" value={shareValue} onChange={(event) => setShareValue(event.target.value.slice(0, 50_000))} maxLength={50_000} placeholder="Paste a LearnX share URL…" className="min-h-11 min-w-0 flex-1 rounded-xl border border-black/10 bg-black/[.025] px-3 text-sm outline-none focus:ring-2 focus:ring-[#3c7156] dark:border-white/10 dark:bg-white/5 dark:focus:ring-[#c8ff65]" /><button type="button" onClick={() => void importSharedRoadmap()} disabled={!shareValue.trim() || isLoading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#173f2c] px-4 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#c8ff65] dark:text-[#17211b]">{isLoading ? <LoaderCircle className="size-4 animate-spin" /> : <GitCompareArrows className="size-4" />} Compare</button></div></div>
          </div> : <div className="mt-7">
            <div className="grid gap-3 sm:grid-cols-2"><RoadmapColumn label="Current roadmap" roadmap={roadmap} stats={currentStats} /><RoadmapColumn label="Comparison" roadmap={comparison} stats={comparisonStatsValue!} /></div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-black/8 dark:border-white/10">
              <ComparisonRow label="Estimated duration" left={roadmap.estimatedDuration} right={comparison.estimatedDuration} />
              <ComparisonRow label="Milestones" left={String(currentStats.milestones)} right={String(comparisonStatsValue!.milestones)} />
              <ComparisonRow label="Planned schedule" left={`${currentStats.weeks} weeks`} right={`${comparisonStatsValue!.weeks} weeks`} />
              <ComparisonRow label="Suggested effort" left={`~${currentStats.weeklyHours}h/week`} right={`~${comparisonStatsValue!.weeklyHours}h/week`} />
              <ComparisonRow label="Top roles" left={roadmap.careerInsights?.topRoles.join(", ") || "Not provided"} right={comparison.careerInsights?.topRoles.join(", ") || "Not provided"} />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2"><MilestoneOutline roadmap={roadmap} /><MilestoneOutline roadmap={comparison} /></div>
            <button type="button" onClick={() => { setComparison(null); setShareValue(""); }} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-black/10 px-4 text-xs font-black hover:bg-black/[.03] dark:border-white/10 dark:hover:bg-white/5"><ArrowRightLeft className="size-4" /> Choose another roadmap</button>
          </div>}
        </DialogContent>
      </Dialog>
    </>
  );
}

function RoadmapColumn({ label, roadmap, stats }: { label: string; roadmap: RecoverableRoadmap; stats: ReturnType<typeof comparisonStats> }) {
  return <article className="rounded-2xl border border-black/8 bg-black/[.02] p-5 dark:border-white/10 dark:bg-white/[.025]"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#3c7156] dark:text-[#c8ff65]">{label}</p><h3 className="mt-2 text-lg font-black tracking-tight">{roadmap.title}</h3><p className="mt-2 text-xs leading-5 text-black/45 dark:text-white/45">{roadmap.description}</p><p className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400"><Check className="size-4" /> {stats.completed}/{stats.milestones} completed</p></article>;
}

function ComparisonRow({ label, left, right }: { label: string; left: string; right: string }) {
  return <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-black/8 px-4 py-3 text-xs last:border-b-0 dark:border-white/10"><span className="text-right font-bold">{left}</span><span className="rounded-full bg-black/5 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-black/40 dark:bg-white/8 dark:text-white/40">{label}</span><span className="font-bold">{right}</span></div>;
}

function MilestoneOutline({ roadmap }: { roadmap: RecoverableRoadmap }) {
  return <div className="rounded-2xl border border-black/8 p-4 dark:border-white/10"><p className="mb-3 text-xs font-black uppercase tracking-wider text-black/40 dark:text-white/40">Milestone outline</p><ol className="space-y-2">{roadmap.milestones.map((item) => <li key={item.id} className="flex gap-2 text-xs leading-5"><span className="font-black text-[#3c7156] dark:text-[#c8ff65]">{item.position}.</span><span>{item.title}</span></li>)}</ol></div>;
}
