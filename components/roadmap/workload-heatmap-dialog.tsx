"use client";

import { useMemo, useState } from "react";
import { BarChart3, CalendarRange, Clock3 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createRoadmapWorkload } from "@/lib/roadmap-workload";
import type { RecoverableRoadmap } from "@/lib/roadmap-storage";

type WorkloadHeatmapDialogProps = {
  roadmap: RecoverableRoadmap;
};

function intensityColor(hours: number) {
  if (hours >= 9) return "bg-[#173f2c] text-white dark:bg-[#c8ff65] dark:text-[#17211b]";
  if (hours >= 7) return "bg-[#4d8a63] text-white dark:bg-[#86b947] dark:text-[#17211b]";
  if (hours >= 5) return "bg-[#a8d09c] text-[#173f2c] dark:bg-[#486b31] dark:text-white";
  return "bg-[#e5eee0] text-[#28583f] dark:bg-white/10 dark:text-white/65";
}

export function WorkloadHeatmapDialog({ roadmap }: WorkloadHeatmapDialogProps) {
  const [open, setOpen] = useState(false);
  const plan = useMemo(() => createRoadmapWorkload(roadmap.milestones), [roadmap.milestones]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-[#173f2c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#3c7156]/30 hover:shadow-md dark:border-white/10 dark:bg-white/8 dark:text-white sm:text-sm">
        <BarChart3 className="size-4" /> Workload
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <div className="mb-2 flex w-fit items-center gap-2 rounded-full bg-[#f0f7e7] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-[#28583f] dark:bg-[#c8ff65]/10 dark:text-[#c8ff65]"><BarChart3 className="size-4" /> Planned Workload</div>
            <DialogTitle>Your learning intensity map</DialogTitle>
            <DialogDescription>A week-by-week estimate based on milestone duration, Advanced Mode depth, and Security Focus. Use it as a planning guide, not a fixed requirement.</DialogDescription>
          </DialogHeader>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/8 bg-black/[.025] p-5 dark:border-white/10 dark:bg-white/[.03]"><CalendarRange className="size-5 text-[#3c7156] dark:text-[#c8ff65]" /><strong className="mt-3 block text-3xl font-black">{plan.totalWeeks}</strong><p className="mt-1 text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Planned weeks</p></div>
            <div className="rounded-2xl border border-black/8 bg-black/[.025] p-5 dark:border-white/10 dark:bg-white/[.03]"><Clock3 className="size-5 text-[#3c7156] dark:text-[#c8ff65]" /><strong className="mt-3 block text-3xl font-black">~{plan.averageHours}h</strong><p className="mt-1 text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Suggested per week</p></div>
          </div>

          <div className="mt-5 rounded-2xl border border-black/8 p-5 dark:border-white/10">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 md:grid-cols-8" aria-label="Planned weekly learning workload">
              {plan.weeks.map((week) => <div key={week.week} title={`Week ${week.week}: Milestone ${week.milestonePosition}, ${week.milestoneTitle}, about ${week.suggestedHours} hours`} className={`aspect-square rounded-lg p-2 ring-1 ring-inset ring-black/[.05] dark:ring-white/[.05] ${intensityColor(week.suggestedHours)}`}><span className="block text-[9px] font-black uppercase opacity-65">W{week.week}</span><span className="mt-1 block text-sm font-black">M{week.milestonePosition}</span></div>)}
            </div>
            {plan.isTruncated && <p className="mt-4 text-xs text-black/45 dark:text-white/45">Showing the first {plan.visibleWeeks} of {plan.totalWeeks} planned weeks.</p>}
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2 text-[10px] font-semibold text-black/40 dark:text-white/40"><span>Light</span>{[4, 5, 7, 9].map((hours) => <span key={hours} className={`size-4 rounded ${intensityColor(hours)}`} title={`About ${hours} hours per week`} />)}<span>Intensive</span></div>
          </div>

          <div className="mt-5 space-y-2">
            {roadmap.milestones.map((milestone) => <div key={milestone.id} className="flex items-center justify-between gap-4 rounded-xl bg-black/[.025] px-4 py-3 text-sm dark:bg-white/[.035]"><span className="min-w-0 truncate font-bold"><span className="mr-2 text-[#3c7156] dark:text-[#c8ff65]">M{milestone.position}</span>{milestone.title}</span><span className="shrink-0 text-xs text-black/40 dark:text-white/40">{milestone.duration}</span></div>)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
