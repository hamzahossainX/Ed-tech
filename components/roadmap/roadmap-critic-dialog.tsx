"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, CheckCircle2, LoaderCircle, RefreshCw, Sparkles, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { critiqueRoadmap, type RoadmapCritique } from "@/app/actions/critique-roadmap";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ROADMAP_CRITIC_EVENT } from "@/lib/roadmap-events";
import type { RecoverableRoadmap } from "@/lib/roadmap-storage";

type RoadmapCriticDialogProps = {
  roadmap: RecoverableRoadmap;
  disabled?: boolean;
};

export function RoadmapCriticDialog({ roadmap, disabled = false }: RoadmapCriticDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [critique, setCritique] = useState<RoadmapCritique | null>(null);

  useEffect(() => {
    function openCritic() {
      if (!disabled) setOpen(true);
    }

    window.addEventListener(ROADMAP_CRITIC_EVENT, openCritic);
    return () => window.removeEventListener(ROADMAP_CRITIC_EVENT, openCritic);
  }, [disabled]);

  async function handleCritique() {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const result = await critiqueRoadmap({
        title: roadmap.title,
        description: roadmap.description,
        estimatedDuration: roadmap.estimatedDuration,
        milestones: roadmap.milestones.map(({ title, description, duration }) => ({
          title,
          description,
          duration,
        })),
      });

      if (!result.success) {
        toast.error(result.error, { duration: 20_000 });
        return;
      }
      setCritique(result.critique);
    } catch {
      toast.error("Servers are currently experiencing high traffic. Please try again shortly.", {
        duration: 20_000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button type="button" disabled={disabled} onClick={() => setOpen(true)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-[#173f2c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#3c7156]/30 hover:shadow-md disabled:cursor-wait disabled:opacity-60 dark:border-white/10 dark:bg-white/8 dark:text-white sm:text-sm">
        <BrainCircuit className="size-4" /> AI Critic
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <div className="mb-2 flex w-fit items-center gap-2 rounded-full bg-[#f0f7e7] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-[#28583f] dark:bg-[#c8ff65]/10 dark:text-[#c8ff65]"><Sparkles className="size-4" /> AI Reality Check</div>
            <DialogTitle>Is this path realistic?</DialogTitle>
            <DialogDescription>LearnX reviews scope, sequence, workload, and practical outcomes without changing your roadmap.</DialogDescription>
          </DialogHeader>

          {!critique ? (
            <div className="mt-7 rounded-2xl border border-black/8 bg-black/[.025] p-6 text-center dark:border-white/10 dark:bg-white/[.035]">
              <BrainCircuit className="mx-auto size-10 text-[#3c7156] dark:text-[#c8ff65]" />
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/50 dark:text-white/50">Get a concise, constructive review with a realism score and actionable improvements.</p>
              <button type="button" onClick={() => void handleCritique()} disabled={isLoading} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#c8ff65] px-5 py-2.5 text-sm font-black text-[#17211b] transition hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60">
                {isLoading ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {isLoading ? "Reviewing your path…" : "Review my roadmap"}
              </button>
            </div>
          ) : (
            <div className="mt-7 space-y-5">
              <div className="flex flex-col gap-5 rounded-2xl border border-[#3c7156]/15 bg-[#f5faee] p-5 dark:border-[#c8ff65]/15 dark:bg-[#c8ff65]/[.045] sm:flex-row sm:items-center">
                <div className="grid size-24 shrink-0 place-items-center rounded-full border-8 border-[#c8ff65] bg-white text-center shadow-sm dark:bg-[#111512]"><span><strong className="block text-3xl font-black">{critique.realismScore}</strong><span className="text-[10px] font-black uppercase tracking-wider text-black/40 dark:text-white/40">out of 100</span></span></div>
                <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#3c7156] dark:text-[#c8ff65]">{critique.verdict}</p><p className="mt-2 text-sm leading-6 text-black/60 dark:text-white/60">{critique.summary}</p></div>
              </div>
              <CritiqueList title="What works" icon={CheckCircle2} items={critique.strengths} tone="success" />
              <CritiqueList title="Watch-outs" icon={TriangleAlert} items={critique.risks} tone="warning" />
              <CritiqueList title="Recommended adjustments" icon={Sparkles} items={critique.recommendations} tone="accent" />
              <button type="button" onClick={() => { setCritique(null); void handleCritique(); }} disabled={isLoading} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-black transition hover:bg-black/[.035] disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5"><RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} /> Review again</button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function CritiqueList({ title, icon: Icon, items, tone }: { title: string; icon: typeof Sparkles; items: string[]; tone: "success" | "warning" | "accent" }) {
  const colors = tone === "warning" ? "text-amber-600 dark:text-amber-400" : tone === "accent" ? "text-violet-600 dark:text-violet-400" : "text-emerald-700 dark:text-emerald-400";
  return <section className="rounded-2xl border border-black/8 p-5 dark:border-white/10"><h3 className={`flex items-center gap-2 text-sm font-black ${colors}`}><Icon className="size-4" /> {title}</h3><ul className="mt-3 space-y-2">{items.map((item) => <li key={item} className="flex gap-2 text-sm leading-6 text-black/55 dark:text-white/55"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-current" />{item}</li>)}</ul></section>;
}
