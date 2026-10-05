"use client";

import { useState } from "react";
import { BrainCircuit, Gauge, LoaderCircle, Rabbit, Snail } from "lucide-react";
import { toast } from "sonner";
import { adaptRoadmap, type AdaptedMilestone } from "@/app/actions/adapt-roadmap";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { RecoverableRoadmap } from "@/lib/roadmap-storage";

type AdaptiveRoadmapDialogProps = {
  roadmap: RecoverableRoadmap;
  disabled?: boolean;
  onAdapted: (updates: AdaptedMilestone[]) => void;
};

export function AdaptiveRoadmapDialog({ roadmap, disabled = false, onAdapted }: AdaptiveRoadmapDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeChoice, setActiveChoice] = useState<"too-easy" | "too-hard" | null>(null);
  const unfinishedMilestones = roadmap.milestones.filter((item) => !item.isCompleted);

  async function handleChoice(choice: "too-easy" | "good" | "too-hard") {
    if (choice === "good") {
      setOpen(false);
      toast.success("Perfect—your current learning pace stays unchanged.", { duration: 8_000 });
      return;
    }
    if (!unfinishedMilestones.length || activeChoice) return;

    setActiveChoice(choice);
    try {
      const result = await adaptRoadmap({
        roadmapTitle: roadmap.title,
        estimatedDuration: roadmap.estimatedDuration,
        level: choice,
        milestones: unfinishedMilestones.map(({ position, title, description, duration }) => ({
          position,
          title,
          description,
          duration,
        })),
      });

      if (!result.success) {
        toast.error(result.error, { duration: 20_000 });
        return;
      }
      onAdapted(result.milestones);
      setOpen(false);
      toast.success(result.summary, { duration: 10_000 });
    } catch {
      toast.error("Servers are currently experiencing high traffic. Please try again shortly.", {
        duration: 20_000,
      });
    } finally {
      setActiveChoice(null);
    }
  }

  return (
    <>
      <button type="button" disabled={disabled || unfinishedMilestones.length === 0} onClick={() => setOpen(true)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-[#173f2c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#3c7156]/30 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/8 dark:text-white sm:text-sm">
        <Gauge className="size-4" /> Adapt Path
      </button>
      <Dialog open={open} onOpenChange={(nextOpen) => { if (!activeChoice) setOpen(nextOpen); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="mb-2 flex w-fit items-center gap-2 rounded-full bg-[#f0f7e7] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-[#28583f] dark:bg-[#c8ff65]/10 dark:text-[#c8ff65]"><BrainCircuit className="size-4" /> Adaptive Learning</div>
            <DialogTitle>How does the path feel?</DialogTitle>
            <DialogDescription>LearnX will tune only your unfinished milestones. Completed work and deep-dive lessons stay intact.</DialogDescription>
          </DialogHeader>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <ChoiceButton icon={Rabbit} title="Too easy" description="Add deeper practice and challenge." loading={activeChoice === "too-easy"} disabled={Boolean(activeChoice)} onClick={() => void handleChoice("too-easy")} />
            <ChoiceButton icon={Gauge} title="Feels good" description="Keep the current path unchanged." loading={false} disabled={Boolean(activeChoice)} onClick={() => void handleChoice("good")} />
            <ChoiceButton icon={Snail} title="Too hard" description="Add foundations and gentler pacing." loading={activeChoice === "too-hard"} disabled={Boolean(activeChoice)} onClick={() => void handleChoice("too-hard")} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ChoiceButton({ icon: Icon, title, description, loading, disabled, onClick }: { icon: typeof Gauge; title: string; description: string; loading: boolean; disabled: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="group rounded-2xl border border-black/8 bg-black/[.02] p-5 text-left transition hover:-translate-y-1 hover:border-[#3c7156]/25 hover:bg-[#f5faee] hover:shadow-md disabled:translate-y-0 disabled:cursor-wait disabled:opacity-55 dark:border-white/10 dark:bg-white/[.025] dark:hover:border-[#c8ff65]/25 dark:hover:bg-[#c8ff65]/[.05]"><span className="grid size-10 place-items-center rounded-xl bg-white text-[#3c7156] shadow-sm dark:bg-white/10 dark:text-[#c8ff65]">{loading ? <LoaderCircle className="size-5 animate-spin" /> : <Icon className="size-5" />}</span><strong className="mt-4 block text-sm font-black">{loading ? "Adapting…" : title}</strong><span className="mt-1 block text-xs leading-5 text-black/45 dark:text-white/45">{description}</span></button>;
}
