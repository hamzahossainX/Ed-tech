"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { generateRoadmap, type GenerateRoadmapState } from "@/app/actions/generate-roadmap";

const initialState: GenerateRoadmapState = {};

export function RoadmapPrompt() {
  const [state, action] = useActionState(generateRoadmap, initialState);

  return (
    <form action={action} className="relative overflow-hidden rounded-[2rem] bg-[#173f2c] p-6 text-white shadow-[0_24px_80px_rgba(23,63,44,.18)] md:p-9">
      <div className="absolute -right-16 -top-20 size-56 rounded-full bg-[#c8ff65]/10 blur-2xl" />
      <div className="relative">
        <div className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-[#c8ff65]"><Sparkles size={16} /> AI path builder</div>
        <label htmlFor="roadmap-prompt" className="block text-2xl font-black tracking-tight md:text-3xl">What do you want to become great at?</label>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Include your goal, experience level, and available time. LearnX will turn it into a practical path.</p>
        <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-2 sm:flex-row">
          <textarea id="roadmap-prompt" name="prompt" required minLength={12} maxLength={500} rows={2} placeholder="I want to learn Python in 3 months and can study 8 hours each week..." className="min-h-16 flex-1 resize-none rounded-xl px-4 py-3 text-[15px] leading-6 text-[#17211b] outline-none placeholder:text-black/35" />
          <SubmitButton />
        </div>
        {state.error && <p role="alert" className="mt-3 rounded-xl bg-red-400/15 px-4 py-3 text-sm text-red-100">{state.error}</p>}
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/45"><span>Try:</span>{["Data analysis in 8 weeks", "UX design from scratch", "Become job-ready in React"].map((idea) => <span key={idea} className="rounded-full border border-white/10 px-3 py-1">{idea}</span>)}</div>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#c8ff65] px-6 font-black text-[#17211b] transition hover:brightness-95 disabled:cursor-wait disabled:opacity-70">{pending ? <><span className="size-4 animate-spin rounded-full border-2 border-[#17211b]/25 border-t-[#17211b]" /> Forging...</> : <>Forge my path <ArrowUpRight size={17} /></>}</button>;
}
