import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { RoadmapTracker } from "@/components/roadmap/roadmap-tracker";
import { Header } from "@/components/Header";
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

  return <main className="min-h-screen pb-12 sm:pb-20"><Header contentClassName="max-w-6xl"><Link href="/" className="flex min-h-10 items-center gap-2 text-xs font-bold text-black/50 hover:text-black dark:text-white/55 dark:hover:text-white sm:text-sm"><ArrowLeft className="shrink-0" size={16} /> New roadmap</Link></Header><div className="mx-auto max-w-6xl px-3 pt-3 sm:px-6 sm:pt-8"><RoadmapTracker roadmap={roadmap} /></div></main>;
}
