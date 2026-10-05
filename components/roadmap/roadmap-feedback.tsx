"use client";

import { useEffect, useState } from "react";
import { MessageSquareText, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import {
  readRoadmapFeedback,
  saveRoadmapFeedback,
  upsertRoadmapFeedback,
  type RoadmapFeedbackRating,
} from "@/lib/roadmap-feedback";
import { cn } from "@/lib/utils";

type RoadmapFeedbackProps = {
  roadmapId: string;
};

export function RoadmapFeedback({ roadmapId }: RoadmapFeedbackProps) {
  const [rating, setRating] = useState<RoadmapFeedbackRating | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    const saved = readRoadmapFeedback().find((item) => item.roadmapId === roadmapId);
    if (saved) {
      setRating(saved.rating);
      setNote(saved.note);
    }
  }, [roadmapId]);

  function save(ratingValue: RoadmapFeedbackRating) {
    const current = readRoadmapFeedback();
    const next = upsertRoadmapFeedback(current, {
      roadmapId,
      rating: ratingValue,
      note: note.trim().slice(0, 240),
      updatedAt: new Date().toISOString(),
    });
    if (!saveRoadmapFeedback(next)) {
      toast.error("We couldn't save your feedback in this browser.", { duration: 20_000 });
      return;
    }
    setRating(ratingValue);
    toast.success("Feedback saved privately on this device.", { duration: 8_000 });
  }

  return (
    <aside data-tour="feedback" className="mt-8 rounded-2xl border border-black/8 bg-black/[.02] p-4 dark:border-white/10 dark:bg-white/[.025] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-black"><MessageSquareText className="size-4 text-[#3c7156] dark:text-[#c8ff65]" /> Was this roadmap useful?</p>
          <p className="mt-1 text-xs text-black/40 dark:text-white/40">Feedback stays in your browser and helps demonstrate product iteration.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" aria-pressed={rating === "helpful"} onClick={() => save("helpful")} className={cn("inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-black transition", rating === "helpful" ? "border-emerald-500/30 bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300" : "border-black/10 bg-white hover:border-emerald-500/30 dark:border-white/10 dark:bg-white/5")}><ThumbsUp className="size-4" /> Helpful</button>
          <button type="button" aria-pressed={rating === "needs-improvement"} onClick={() => save("needs-improvement")} className={cn("inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-black transition", rating === "needs-improvement" ? "border-amber-500/30 bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300" : "border-black/10 bg-white hover:border-amber-500/30 dark:border-white/10 dark:bg-white/5")}><ThumbsDown className="size-4" /> Needs work</button>
        </div>
      </div>
      {rating === "needs-improvement" && <div className="mt-4"><label htmlFor={`feedback-${roadmapId}`} className="text-xs font-bold text-black/50 dark:text-white/50">What would make it better? <span className="font-normal">(optional)</span></label><div className="mt-2 flex flex-col gap-2 sm:flex-row"><textarea id={`feedback-${roadmapId}`} value={note} onChange={(event) => setNote(event.target.value.slice(0, 240))} maxLength={240} rows={2} className="min-h-20 flex-1 resize-none rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3c7156] dark:border-white/10 dark:bg-white/5 dark:focus:ring-[#c8ff65]" placeholder="A shorter pace, different resources, more examples…" /><button type="button" onClick={() => save("needs-improvement")} className="min-h-10 rounded-xl bg-[#173f2c] px-4 text-xs font-black text-white dark:bg-[#c8ff65] dark:text-[#17211b]">Save note</button></div><p className="mt-1 text-right text-[10px] text-black/35 dark:text-white/35">{note.length}/240</p></div>}
    </aside>
  );
}
