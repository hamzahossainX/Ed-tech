import { eq } from "drizzle-orm";
import { ArrowLeft, Hammer } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { RoadmapTracker } from "@/components/roadmap/roadmap-tracker";
import { db } from "@/db";
import { aiRoadmaps } from "@/db/schema";

type Props = { params: Promise<{ id: string }> };

export default async function RoadmapPage({ params }: Props) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const roadmap = await db.query.aiRoadmaps.findFirst({
    where: eq(aiRoadmaps.id, id),
    with: { milestones: { orderBy: (milestones, { asc }) => [asc(milestones.position)] } },
  });
  if (!roadmap) notFound();

  return <main className="min-h-screen pb-12 sm:pb-20"><header className="border-b border-black/8 bg-white/70 backdrop-blur dark:border-white/8 dark:bg-[#080d0a]/70"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 pr-16 sm:px-6 sm:py-5 sm:pr-20"><Link href="/" className="flex min-h-10 items-center gap-2 font-black"><span className="grid size-8 place-items-center rounded-full bg-[#173f2c] text-[#c8ff65]"><Hammer size={16} /></span><span className="hidden min-[360px]:inline">LearnX</span></Link><Link href="/" className="flex min-h-10 items-center gap-2 text-xs font-bold text-black/50 hover:text-black dark:text-white/55 dark:hover:text-white sm:text-sm"><ArrowLeft className="shrink-0" size={16} /> New roadmap</Link></div></header><div className="mx-auto max-w-6xl px-3 pt-3 sm:px-6 sm:pt-8"><RoadmapTracker roadmap={roadmap} /></div></main>;
}
