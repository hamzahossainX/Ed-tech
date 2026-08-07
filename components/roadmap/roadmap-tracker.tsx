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
    <section className="mt-10 overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_20px_70px_rgba(23,33,27,.08)]">
      <header className="grid gap-8 border-b border-black/8 p-7 md:grid-cols-[1fr_auto] md:p-10">
        <div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-[#3c7156]"><BadgeCheck size={16} /> Your personal path</div><h2 className="mt-3 text-4xl font-black tracking-[-.04em]">{roadmap.title}</h2><p className="mt-3 max-w-2xl leading-7 text-black/50">{roadmap.description}</p></div>
        <div className="flex min-w-36 flex-col justify-center rounded-2xl bg-[#f0f7e7] p-5"><span className="text-3xl font-black">{progress}%</span><span className="mt-1 text-xs font-bold uppercase tracking-wider text-black/40">{completed} of {milestones.length} done</span><div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10"><motion.div animate={{ width: `${progress}%` }} className="h-full rounded-full bg-[#3c7156]" /></div></div>
      </header>
      <div className="p-7 md:p-10">
        <div className="mb-7 flex items-center gap-2 text-sm font-semibold text-black/45"><Clock3 size={16} /> Estimated path: {roadmap.estimatedDuration}</div>
        <ol className="relative space-y-4 before:absolute before:bottom-8 before:left-[1.35rem] before:top-8 before:w-px before:bg-black/10">
          {milestones.map((item, index) => (
            <motion.li initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} key={item.id} className={cn("relative flex gap-5 rounded-2xl border p-5 transition", item.isCompleted ? "border-[#3c7156]/15 bg-[#f5faee]" : "border-black/8 bg-white hover:border-black/15")}>
              <button type="button" disabled={isPending} onClick={() => handleToggle(item)} aria-label={`${item.isCompleted ? "Mark incomplete" : "Complete"} ${item.title}`} className={cn("relative z-10 grid size-11 shrink-0 place-items-center rounded-full border-2 transition", item.isCompleted ? "border-[#3c7156] bg-[#3c7156] text-white" : "border-black/15 bg-white text-black/25 hover:border-[#3c7156]")}>{item.isCompleted ? <Check size={19} strokeWidth={3} /> : <Circle size={13} fill="currentColor" />}</button>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#3c7156]">Milestone {item.position}</p><h3 className={cn("mt-1 text-lg font-black", item.isCompleted && "text-black/45 line-through")}>{item.title}</h3></div><span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/45">{item.duration}</span></div><p className="mt-2 text-sm leading-6 text-black/50">{item.description}</p>{item.resourceLinks.length > 0 && <div className="mt-4 border-t border-black/8 pt-4"><p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-black/40"><BookOpen size={13} /> Resources</p><div className="flex flex-wrap gap-2">{item.resourceLinks.map((resource) => <a key={resource.url} href={resource.url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 rounded-xl border border-[#3c7156]/15 bg-white px-3 py-2 text-xs font-bold text-[#28583f] transition hover:-translate-y-0.5 hover:border-[#3c7156]/35 hover:shadow-sm"><span className="max-w-52 truncate">{resource.title}</span><ExternalLink size={13} className="opacity-45 transition group-hover:opacity-100" /></a>)}</div></div>}</div>
            </motion.li>
          ))}
        </ol>
        <ClaimCertificateDialog roadmapId={roadmap.id} isComplete={progress === 100 && milestones.length > 0} claimedName={roadmap.userName} />
      </div>
    </section>
  );
}
