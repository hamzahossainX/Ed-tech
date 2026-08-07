import { eq } from "drizzle-orm";
import { Award, BadgeCheck, Hammer } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { DownloadPDFButton } from "@/components/certificate/download-pdf-button";
import { db } from "@/db";
import { aiRoadmaps } from "@/db/schema";

type Props = { params: Promise<{ id: string }> };

export default async function CertificatePage({ params }: Props) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const roadmap = await db.query.aiRoadmaps.findFirst({ where: eq(aiRoadmaps.id, id), with: { milestones: true } });
  if (!roadmap?.userName || !roadmap.milestones.length || roadmap.milestones.some((item) => !item.isCompleted)) notFound();
  const completionDate = roadmap.updatedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return <main className="min-h-screen bg-[#ece9df] px-4 py-8 md:px-8"><div className="mx-auto mb-6 flex max-w-[1120px] items-center justify-between"><Link href="/" className="flex items-center gap-2 font-black"><span className="grid size-8 place-items-center rounded-full bg-[#173f2c] text-[#c8ff65]"><Hammer size={16} /></span>LearnX</Link><DownloadPDFButton targetId="certificate-content" fileName="SkillForge-Certificate.pdf" /></div><div className="mx-auto max-w-[1120px] overflow-auto rounded-xl shadow-[0_30px_90px_rgba(23,33,27,.18)]"><section id="certificate-content" className="relative aspect-[1.414/1] min-w-[900px] overflow-hidden bg-[#fffdf5] p-5 text-[#173326]"><div className="absolute left-0 top-0 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full border-[28px] border-[#eaffbd]" /><div className="absolute bottom-0 right-0 size-72 translate-x-1/2 translate-y-1/2 rounded-full border-[42px] border-[#e7ebe8]" /><div className="relative flex h-full flex-col items-center justify-between border-2 border-[#b69b55] p-4 text-center"><div className="absolute inset-3 border border-[#e4dac1]" /><header className="relative z-10 mt-8"><div className="mx-auto grid size-16 place-items-center rounded-full bg-[#173f2c] text-[#c8ff65]"><Award size={34} /></div><p className="mt-4 text-sm font-bold uppercase tracking-[.38em] text-[#b08936]">LearnX Academy</p></header><div className="relative z-10 -mt-2 max-w-4xl"><p className="font-serif text-lg italic text-[#747e77]">This certificate is proudly presented to</p><h1 className="mt-4 font-serif text-6xl font-semibold italic tracking-tight text-[#173f2c]">{roadmap.userName}</h1><div className="mx-auto mt-4 h-px w-2/3 bg-[#b69b55]" /><p className="mx-auto mt-6 max-w-3xl font-serif text-lg leading-8 text-[#68756c]">for successfully completing every milestone in the learning path</p><h2 className="mt-3 font-serif text-3xl font-bold text-[#173f2c]">{roadmap.title}</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#89918c]">{roadmap.description}</p></div><footer className="relative z-10 mb-7 flex w-full max-w-4xl items-end justify-between"><div className="w-52 border-t border-[#b9beb9] pt-2"><p className="font-serif font-bold">{completionDate}</p><p className="mt-1 text-[10px] uppercase tracking-[.18em] text-[#969e98]">Completion date</p></div><div className="flex flex-col items-center"><BadgeCheck size={34} className="text-[#b08936]" /><p className="mt-1 text-xs font-black uppercase tracking-[.18em]">SkillForge Verified</p><p className="mt-1 text-[9px] text-[#a2a8a4]">Certificate ID: {roadmap.id.slice(0, 8).toUpperCase()}</p></div><div className="w-52 border-t border-[#b9beb9] pt-2"><p className="font-serif font-bold">LearnX</p><p className="mt-1 text-[10px] uppercase tracking-[.18em] text-[#969e98]">Learning platform</p></div></footer></div></section></div></main>;
}
