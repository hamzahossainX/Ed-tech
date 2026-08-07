"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Download, Mail, MapPin, Sparkles } from "lucide-react";
import type { ResumeSkill } from "@/db/schema";

type Props = {
  person: { name: string; headline: string; email: string; location?: string; summary: string };
  skills: ResumeSkill[];
  updatedAt: Date | string;
  onExport?: () => void;
};

export function AutoVerifyingResume({ person, skills, updatedAt, onExport }: Props) {
  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#3c7156]"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex size-2 rounded-full bg-emerald-500" /></span>Auto-verifying resume</div>
        <button onClick={onExport} className="flex items-center gap-2 rounded-full bg-[#17211b] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"><Download size={16} /> Export PDF</button>
      </div>

      <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[2rem] border border-black/10 bg-[#fffefa] shadow-[0_24px_80px_rgba(23,33,27,.12)]">
        <header className="grid gap-8 bg-[#173f2c] p-8 text-white md:grid-cols-[1fr_auto] md:p-12">
          <div><p className="mb-3 text-xs font-bold uppercase tracking-[.22em] text-[#c8ff65]">LearnX verified profile</p><h1 className="text-5xl font-black tracking-[-.05em]">{person.name}</h1><p className="mt-2 text-lg text-white/65">{person.headline}</p><div className="mt-6 flex flex-wrap gap-5 text-sm text-white/60"><span className="flex items-center gap-2"><Mail size={15} />{person.email}</span>{person.location && <span className="flex items-center gap-2"><MapPin size={15} />{person.location}</span>}</div></div>
          <div className="flex size-24 flex-col items-center justify-center rounded-full border border-[#c8ff65]/40 bg-[#c8ff65]/10 text-center"><BadgeCheck className="text-[#c8ff65]" size={29} /><span className="mt-1 text-[10px] font-bold uppercase tracking-wider">Verified</span></div>
        </header>

        <div className="grid gap-10 p-8 md:grid-cols-[.7fr_1.3fr] md:p-12">
          <div><ResumeHeading>Profile</ResumeHeading><p className="mt-4 text-sm leading-7 text-black/60">{person.summary}</p><div className="mt-10 rounded-2xl bg-[#f0f7e7] p-5"><Sparkles className="text-[#3c7156]" size={20} /><p className="mt-3 text-sm font-bold">Always current</p><p className="mt-1 text-xs leading-5 text-black/50">Verified skills appear here as soon as a module is completed.</p></div></div>
          <div><ResumeHeading>Verified skills</ResumeHeading><div className="mt-4 space-y-3">{skills.length ? skills.map((skill, index) => <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .07 }} key={skill.moduleId} className="flex items-center gap-4 rounded-2xl border border-black/8 p-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#c8ff65]"><BadgeCheck size={19} /></span><div className="min-w-0 flex-1"><h3 className="font-bold">{skill.name}</h3><p className="truncate text-sm text-black/45">{skill.courseTitle}</p></div><time className="hidden text-xs text-black/35 sm:block">{new Date(skill.verifiedAt).toLocaleDateString("en", { month: "short", year: "numeric" })}</time></motion.div>) : <p className="rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-black/45">Complete your first module to forge a verified skill.</p>}</div></div>
        </div>
        <footer className="flex items-center justify-between border-t border-black/8 px-8 py-5 text-xs text-black/35 md:px-12"><span>Verified by LearnX</span><span>Updated {new Date(updatedAt).toLocaleDateString()}</span></footer>
      </motion.article>
    </section>
  );
}

function ResumeHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="border-b border-black/10 pb-3 text-xs font-black uppercase tracking-[.2em] text-[#3c7156]">{children}</h2>;
}
