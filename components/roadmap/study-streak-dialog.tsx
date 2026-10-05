"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Flame } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { calculateStudyStreak, createActivityDays, type StudyActivityEvent } from "@/lib/study-activity";

type StudyStreakDialogProps = {
  events: StudyActivityEvent[];
};

function activityColor(count: number) {
  if (count >= 3) return "bg-[#28583f] dark:bg-[#c8ff65]";
  if (count === 2) return "bg-[#69a879] dark:bg-[#91c94b]";
  if (count === 1) return "bg-[#b8dba9] dark:bg-[#527a32]";
  return "bg-black/[.07] dark:bg-white/[.08]";
}

export function StudyStreakDialog({ events }: StudyStreakDialogProps) {
  const [open, setOpen] = useState(false);
  const days = useMemo(() => createActivityDays(events), [events]);
  const streak = useMemo(() => calculateStudyStreak(events), [events]);
  const totalSessions = days.reduce((sum, day) => sum + day.count, 0);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-[#173f2c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#3c7156]/30 hover:shadow-md dark:border-white/10 dark:bg-white/8 dark:text-white sm:text-sm">
        <Flame className={`size-4 ${streak > 0 ? "fill-orange-500 text-orange-500" : "text-black/35 dark:text-white/35"}`} /> {streak} day streak
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="mb-2 flex w-fit items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-orange-800 dark:bg-orange-400/10 dark:text-orange-300"><Flame className="size-4" /> Study Streak</div>
            <DialogTitle>Consistency compounds.</DialogTitle>
            <DialogDescription>Your milestone and Pomodoro activity from the last five weeks, stored privately in this browser.</DialogDescription>
          </DialogHeader>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/8 bg-black/[.025] p-5 dark:border-white/10 dark:bg-white/[.03]"><strong className="text-3xl font-black">{streak}</strong><p className="mt-1 text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Current day streak</p></div>
            <div className="rounded-2xl border border-black/8 bg-black/[.025] p-5 dark:border-white/10 dark:bg-white/[.03]"><strong className="text-3xl font-black">{totalSessions}</strong><p className="mt-1 text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Activities in 5 weeks</p></div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-black/8 p-5 dark:border-white/10">
            <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black/45 dark:text-white/45"><CalendarDays className="size-4" /> Last 35 days</div>
            <div className="grid min-w-[23rem] grid-flow-col grid-rows-7 gap-1.5" aria-label="Study activity for the last 35 days">
              {days.map((day) => <div key={day.date} title={`${day.date}: ${day.count} ${day.count === 1 ? "activity" : "activities"}`} aria-label={`${day.date}: ${day.count} ${day.count === 1 ? "activity" : "activities"}`} className={`size-7 rounded-md ${activityColor(day.count)} ring-1 ring-inset ring-black/[.04] dark:ring-white/[.04]`} />)}
            </div>
            <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] font-semibold text-black/40 dark:text-white/40"><span>Less</span>{[0, 1, 2, 3].map((count) => <span key={count} className={`size-3 rounded-sm ${activityColor(count)}`} />)}<span>More</span></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
