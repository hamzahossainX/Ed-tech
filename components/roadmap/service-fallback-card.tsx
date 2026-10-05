"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CloudOff, LoaderCircle, PlayCircle, X } from "lucide-react";
import { toast } from "sonner";
import { DEMO_ROADMAP } from "@/lib/demo-roadmap";
import { encodeRoadmapForUrl } from "@/lib/roadmap-sharing";

type ServiceFallbackCardProps = {
  onDismiss: () => void;
};

export function ServiceFallbackCard({ onDismiss }: ServiceFallbackCardProps) {
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);

  async function openOfflineDemo() {
    if (isOpening) return;
    setIsOpening(true);

    try {
      const encoded = await encodeRoadmapForUrl(DEMO_ROADMAP);
      router.push(`/roadmap/demo?roadmap=${encodeURIComponent(encoded)}`);
    } catch {
      setIsOpening(false);
      toast.error("The offline demo could not be opened. Please try again.", {
        duration: 20_000,
      });
    }
  }

  return (
    <aside role="status" aria-live="polite" className="relative mt-4 overflow-hidden rounded-3xl border border-amber-300/40 bg-gradient-to-br from-amber-50 via-white to-[#f0f7e7] p-5 shadow-[0_18px_55px_rgba(120,80,20,.08)] dark:border-amber-300/15 dark:from-amber-400/[.08] dark:via-[#111512] dark:to-[#c8ff65]/[.04] sm:p-6">
      <button type="button" onClick={onDismiss} aria-label="Dismiss offline demo suggestion" className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-black/35 transition hover:bg-black/5 hover:text-black dark:text-white/35 dark:hover:bg-white/8 dark:hover:text-white"><X className="size-4" /></button>
      <div className="flex flex-col gap-5 pr-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-400 text-amber-950 shadow-[0_8px_25px_rgba(245,158,11,.2)]"><CloudOff className="size-6" /></span>
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-amber-700 dark:text-amber-300">Live services are taking a break</p>
            <h3 className="mt-1 text-lg font-black tracking-tight sm:text-xl">Keep exploring with Offline Demo</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50 dark:text-white/50">Open a complete sample roadmap instantly. Mind Map, Zen Mode, exports, progress tracking, badges, and study streaks remain available without an AI or database connection.</p>
          </div>
        </div>
        <button type="button" onClick={() => void openOfflineDemo()} disabled={isOpening} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#173f2c] px-5 py-2.5 text-sm font-black text-white transition hover:scale-[1.02] hover:bg-[#21573d] disabled:cursor-wait disabled:opacity-60 dark:bg-[#c8ff65] dark:text-[#17211b] dark:hover:bg-[#d5ff84]">
          {isOpening ? <LoaderCircle className="size-4 animate-spin" /> : <PlayCircle className="size-4" />}
          {isOpening ? "Opening…" : "Open offline demo"}
          {!isOpening && <ArrowRight className="size-4" />}
        </button>
      </div>
    </aside>
  );
}
