"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { DEMO_ROADMAP } from "@/lib/demo-roadmap";
import { encodeRoadmapForUrl } from "@/lib/roadmap-sharing";

export function DemoRoadmapButton() {
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);

  async function openDemo() {
    if (isOpening) return;
    setIsOpening(true);

    try {
      const encodedRoadmap = await encodeRoadmapForUrl(DEMO_ROADMAP);
      router.push(`/roadmap/demo?roadmap=${encodeURIComponent(encodedRoadmap)}`);
    } catch {
      setIsOpening(false);
      toast.error("The demo could not be opened. Please try again.", { duration: 8_000 });
    }
  }

  return (
    <button
      type="button"
      onClick={() => void openDemo()}
      disabled={isOpening}
      className="flex min-h-12 items-center gap-2 rounded-full border border-[#173f2c]/15 bg-white/70 px-6 py-3 text-base font-black text-[#173f2c] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[#3c7156]/35 hover:bg-white disabled:cursor-wait disabled:opacity-60 dark:border-white/15 dark:bg-white/8 dark:text-white dark:hover:bg-white/12 sm:px-7 sm:py-5 sm:text-lg"
    >
      {isOpening ? <LoaderCircle className="size-[19px] animate-spin" /> : <PlayCircle size={19} />}
      {isOpening ? "Opening demo…" : "Try demo roadmap"}
    </button>
  );
}
