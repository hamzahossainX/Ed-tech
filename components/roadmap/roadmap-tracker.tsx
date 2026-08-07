"use client";

import { useOptimistic, useTransition } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, BookOpen, Check, Clock3, Circle, ExternalLink } from "lucide-react";
import { toggleMilestone } from "@/app/actions/toggle-milestone";
import { ClaimCertificateDialog } from "@/components/certificate/claim-certificate-dialog";
import type { ResourceLink } from "@/db/schema";
import { cn } from "@/lib/utils";

export type TrackerMilestone = { id: string; title: string; description: string; duration: string; resourceLinks: ResourceLink[]; position: number; isCompleted: boolean };

type Props = { roadmap: { id: string; userName?: string | null; title: string; description: string; estimatedDuration: string; milestones: TrackerMilestone[] } };

export function RoadmapTracker({ roadmap }: Props) {
  const [isPending, startTransition] = useTransition();
  const [milestones, setOptimistic] = useOptimistic(roadmap.milestones, (current, update: { id: string; completed: boolean }) => current.map((item) => item.id === update.id ? { ...item, isCompleted: update.completed } : item));
  const completed = milestones.filter((item) => item.isCompleted).length;
  const progress = milestones.length ? Math.round((completed / milestones.length) * 100) : 0;

  function handleToggle(item: TrackerMilestone) {
    const next = !item.isCompleted;
    startTransition(async () => {
      setOptimistic({ id: item.id, completed: next });
      await toggleMilestone(item.id, next);
    });
  }

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-black/8 bg-white shadow-[0_20px_70px_rgba(23,33,27,.08)] dark:border-white/10 dark:bg-[#111512] dark:shadow-black/30 sm:mt-10 md:rounded-[2rem]">
      <header className="grid gap-5 border-b border-black/8 p-4 dark:border-white/8 sm:p-6 md:grid-cols-[1fr_auto] md:gap-8 md:p-8 lg:p-10">
        <div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-[#3c7156] dark:text-[#a9e950] sm:text-xs sm:tracking-[.2em]"><BadgeCheck size={16} /> Your personal path</div><h2 className="mt-3 break-words text-2xl font-black tracking-[-.04em] sm:text-3xl md:text-4xl">{roadmap.title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-black/50 dark:text-white/55 sm:text-base sm:leading-7">{roadmap.description}</p></div>
        <div className="flex min-w-36 flex-col justify-center rounded-2xl bg-[#f0f7e7] p-5 dark:bg-white/6"><span className="text-3xl font-black">{progress}%</span><span className="mt-1 text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/45">{completed} of {milestones.length} done</span><div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10"><motion.div animate={{ width: `${progress}%` }} className="h-full rounded-full bg-[#3c7156] dark:bg-[#a9e950]" /></div></div>
      </header>
      <div className="p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-black/45 dark:text-white/45 sm:mb-7"><Clock3 className="shrink-0" size={16} /> Estimated path: {roadmap.estimatedDuration}</div>
        <ol className="relative space-y-3 before:absolute before:bottom-7 before:left-[1.1rem] before:top-7 before:w-px before:bg-black/10 dark:before:bg-white/10 sm:space-y-4 sm:before:left-[1.35rem]">
          {milestones.map((item, index) => (
            <motion.li initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} key={item.id} className={cn("relative flex gap-3 rounded-2xl border p-3 transition sm:gap-5 sm:p-5", item.isCompleted ? "border-[#3c7156]/15 bg-[#f5faee] dark:border-[#a9e950]/15 dark:bg-[#a9e950]/[.045]" : "border-black/8 bg-white hover:border-black/15 dark:border-white/8 dark:bg-white/[.025] dark:hover:border-white/15")}>
              <button type="button" disabled={isPending} onClick={() => handleToggle(item)} aria-label={`${item.isCompleted ? "Mark incomplete" : "Complete"} ${item.title}`} className={cn("relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-2 transition sm:size-11", item.isCompleted ? "border-[#3c7156] bg-[#3c7156] text-white dark:border-[#a9e950] dark:bg-[#a9e950] dark:text-[#17211b]" : "border-black/15 bg-white text-black/25 hover:border-[#3c7156] dark:border-white/15 dark:bg-[#111512] dark:text-white/25 dark:hover:border-[#a9e950]")}>{item.isCompleted ? <Check size={18} strokeWidth={3} /> : <Circle size={12} fill="currentColor" />}</button>
              <div className="min-w-0 flex-1"><div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:justify-between"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#3c7156]">Milestone {item.position}</p><h3 className={cn("mt-1 break-words text-base font-black sm:text-lg", item.isCompleted && "text-black/45 line-through")}>{item.title}</h3></div><span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/45">{item.duration}</span></div><p className="mt-2 break-words text-sm leading-6 text-black/50">{item.description}</p>{item.resourceLinks.length > 0 && <div className="mt-4 border-t border-black/8 pt-4"><p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-black/40"><BookOpen size={13} /> Resources</p><div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{item.resourceLinks.map((resource) => <a key={resource.url} href={resource.url} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-10 max-w-full items-center justify-between gap-2 rounded-xl border border-[#3c7156]/15 bg-white px-3 py-2 text-xs font-bold text-[#28583f] transition hover:-translate-y-0.5 hover:border-[#3c7156]/35 hover:shadow-sm"><span className="truncate">{resource.title}</span><ExternalLink size={13} className="shrink-0 opacity-45 transition group-hover:opacity-100" /></a>)}</div></div>}</div>
            </motion.li>
          ))}
        </ol>
        <ClaimCertificateDialog roadmapId={roadmap.id} isComplete={progress === 100 && milestones.length > 0} claimedName={roadmap.userName} />
      </div>
    </section>
  );
}
