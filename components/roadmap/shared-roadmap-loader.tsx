"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { RoadmapTracker } from "@/components/roadmap/roadmap-tracker";
import { decodeRoadmapFromUrl } from "@/lib/roadmap-sharing";
import type { RecoverableRoadmap } from "@/lib/roadmap-storage";

type Props = {
  encodedRoadmap: string;
};

export function SharedRoadmapLoader({ encodedRoadmap }: Props) {
  const [roadmap, setRoadmap] = useState<RecoverableRoadmap | null>(null);
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    setRoadmap(null);
    setIsInvalid(false);

    void decodeRoadmapFromUrl(encodedRoadmap)
      .then((decodedRoadmap) => {
        if (isCurrent) setRoadmap(decodedRoadmap);
      })
      .catch(() => {
        if (isCurrent) setIsInvalid(true);
      });

    return () => {
      isCurrent = false;
    };
  }, [encodedRoadmap]);

  if (isInvalid) {
    return (
      <section className="mx-auto mt-10 max-w-xl rounded-3xl border border-red-500/20 bg-white p-8 text-center shadow-xl dark:bg-[#111512]">
        <AlertTriangle className="mx-auto size-10 text-red-500" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-black">This share link is invalid</h1>
        <p className="mt-2 text-sm leading-6 text-black/55 dark:text-white/55">
          It may be incomplete, damaged, or from an unsupported LearnX version.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#c8ff65] px-5 text-sm font-black text-slate-950 transition hover:bg-[#d5ff87]"
        >
          Create a new roadmap
        </Link>
      </section>
    );
  }

  if (!roadmap) {
    return (
      <div className="flex min-h-72 items-center justify-center gap-3 text-sm font-bold text-black/50 dark:text-white/55" role="status">
        <LoaderCircle className="size-5 animate-spin text-[#3c7156] dark:text-[#a9e950]" aria-hidden="true" />
        Opening shared roadmap...
      </div>
    );
  }

  return <RoadmapTracker roadmap={roadmap} isSharedSnapshot />;
}
