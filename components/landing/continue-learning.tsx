"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, BookOpen, CheckCircle2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { encodeRoadmapForUrl } from "@/lib/roadmap-sharing";
import { readLatestRoadmapEntry, type RecoverableRoadmap, type RoadmapSource } from "@/lib/roadmap-storage";
import { cn } from "@/lib/utils";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

function ResumeRoadmapButton({ roadmap, source }: { roadmap: RecoverableRoadmap; source?: RoadmapSource }) {
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);
  const isComplete = roadmap.milestones.every((milestone) => milestone.isCompleted);
  const label = isComplete ? "Revisit roadmap" : "Continue learning";
  const buttonClassName = "min-h-11 w-full shrink-0 text-slate-950 sm:w-auto";

  // Generated roadmaps keep their existing server route and completion behavior.
  if (source !== "shared" && source !== "demo" && UUID_PATTERN.test(roadmap.id)) {
    return (
      <Button asChild variant="accent" className={buttonClassName}>
        <Link href={`/roadmap/${roadmap.id}`} prefetch={false}>
          {label}<ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    );
  }

  async function openSavedRoadmap() {
    if (isOpening) return;
    setIsOpening(true);
    try {
      const encodedRoadmap = await encodeRoadmapForUrl(roadmap);
      const route = source === "demo" || roadmap.id === "learnx-demo-nextjs-roadmap" ? "demo" : "saved";
      router.push(`/roadmap/${route}?roadmap=${encodeURIComponent(encodedRoadmap)}`);
    } catch {
      toast.error("This saved path could not be opened. Please try again.", { duration: 8_000 });
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <Button
      type="button"
      variant="accent"
      className={buttonClassName}
      disabled={isOpening}
      onClick={() => void openSavedRoadmap()}
    >
      {isOpening ? "Opening roadmap…" : label}
      {isOpening
        ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        : <ArrowUpRight className="size-4" aria-hidden="true" />}
    </Button>
  );
}

/** Appears only when this browser has a valid saved learning path. */
export function ContinueLearning({ className }: { className?: string }) {
  const titleId = useId();
  const [entry, setEntry] = useState<ReturnType<typeof readLatestRoadmapEntry>>(null);

  useEffect(() => {
    const refresh = () => setEntry(readLatestRoadmapEntry());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, []);

  if (!entry) return null;
  const { roadmap, source } = entry;

  const completedCount = roadmap.milestones.filter((milestone) => milestone.isCompleted).length;
  const progress = Math.round((completedCount / roadmap.milestones.length) * 100);
  const nextMilestone = [...roadmap.milestones]
    .sort((first, second) => first.position - second.position)
    .find((milestone) => !milestone.isCompleted);

  return (
    <section
      aria-labelledby={titleId}
      className={cn("relative overflow-hidden rounded-[1.75rem] border border-[#3c7156]/20 bg-white/80 p-5 text-left shadow-[0_12px_40px_-24px_rgba(23,63,44,0.4)] backdrop-blur-xl dark:border-[#c8ff65]/15 dark:bg-[#12221a]/85 sm:p-6", className)}
    >
      <div className="absolute inset-y-5 left-0 w-1 rounded-r-full bg-[#94c945] dark:bg-[#c8ff65]" aria-hidden="true" />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-[#3c7156] dark:text-[#c8ff65]">
              <BookOpen className="size-3.5" aria-hidden="true" /> Pick up where you left off
            </p>
            <span className="text-[11px] text-black/45 dark:text-white/45">Saved on this device</span>
          </div>
          <h2 id={titleId} className="mt-2 break-words text-lg font-black tracking-tight text-[#173f2c] dark:text-white sm:text-xl">
            {roadmap.title}
          </h2>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-black/55 dark:text-white/60">
            <span>{completedCount} of {roadmap.milestones.length} milestones complete</span>
            <span className="text-[#3c7156] dark:text-[#c8ff65]">{progress}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Roadmap completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-valuetext={`${completedCount} of ${roadmap.milestones.length} milestones complete`}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#173f2c]/10 dark:bg-white/10"
          >
            <div className="h-full rounded-full bg-[#5d9132] transition-[width] duration-500 motion-reduce:transition-none dark:bg-[#c8ff65]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-black/55 dark:text-white/60">
            {nextMilestone
              ? <><span className="shrink-0 font-bold text-[#3c7156] dark:text-[#c8ff65]">Up next:</span><span className="min-w-0 break-words">{nextMilestone.title}</span></>
              : <><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#3c7156] dark:text-[#c8ff65]" aria-hidden="true" /><span>Every milestone complete. Your hard work adds up.</span></>}
          </p>
        </div>
        <ResumeRoadmapButton key={`${roadmap.id}-${source}`} roadmap={roadmap} source={source} />
      </div>
    </section>
  );
}
