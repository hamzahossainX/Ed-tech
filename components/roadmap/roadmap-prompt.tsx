"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowUpRight, Sparkles, TriangleAlert } from "lucide-react";
import { generateRoadmap, type GenerateRoadmapState } from "@/app/actions/generate-roadmap";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const initialState: GenerateRoadmapState = {};
const BUSY_SERVER_MESSAGE =
  "Servers are currently experiencing high traffic. Please wait a moment and try again.";
const suggestions = [
  "Full-Stack Next.js Developer in 3 months",
  "Cybersecurity & Bug Bounty basics in 8 weeks",
  "Master Python & Machine Learning in 2 months",
  "UI/UX Design for beginners in 4 weeks",
] as const;

async function submitRoadmap(
  previousState: GenerateRoadmapState,
  formData: FormData,
): Promise<GenerateRoadmapState> {
  try {
    const result = await generateRoadmap(previousState, formData);

    if (result.error && result.error !== "LIMIT_REACHED") {
      return {
        success: false,
        error: BUSY_SERVER_MESSAGE,
      };
    }

    return result;
  } catch {
    // Never expose Server Action exceptions or raw backend messages in the UI
    // or the browser console. Server-side logs remain available for diagnosis.
    return {
      success: false,
      error: BUSY_SERVER_MESSAGE,
    };
  }
}

export function RoadmapPrompt() {
  const [state, action] = useActionState(submitRoadmap, initialState);
  const [prompt, setPrompt] = useState("");
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.error === "LIMIT_REACHED") setLimitOpen(true);
  }, [state.error, state.limitReachedAt]);

  function selectSuggestion(suggestion: string) {
    setPrompt(suggestion);
    requestAnimationFrame(() => {
      promptRef.current?.focus();
      promptRef.current?.setSelectionRange(suggestion.length, suggestion.length);
    });
  }

  return (
    <><form action={action} className="relative overflow-hidden rounded-3xl bg-[#173f2c] p-4 text-white shadow-[0_24px_80px_rgba(23,63,44,.18)] sm:p-6 md:rounded-[2rem] md:p-9">
      <div className="absolute -right-16 -top-20 size-56 rounded-full bg-[#c8ff65]/10 blur-2xl" />
      <div className="relative">
        <div className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-[#c8ff65]"><Sparkles size={16} /> AI path builder</div>
        <label htmlFor="roadmap-prompt" className="block text-xl font-black tracking-tight sm:text-2xl md:text-3xl">What do you want to become great at?</label>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Include your goal, experience level, and available time. LearnX will turn it into a practical path.</p>
        <div className="mt-6 flex w-full flex-col gap-2 rounded-2xl bg-white p-2 md:flex-row md:gap-3">
          <textarea ref={promptRef} id="roadmap-prompt" name="prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} required minLength={12} maxLength={500} rows={2} placeholder="I want to learn Python in 3 months and can study 8 hours each week..." className="min-h-24 w-full flex-1 resize-none rounded-xl px-3 py-3 text-sm leading-6 text-[#17211b] outline-none placeholder:text-black/35 focus:ring-4 focus:ring-[#c8ff65]/35 sm:px-4 sm:text-[15px] md:min-h-16" />
          <SubmitButton isAdvanced={isAdvanced} />
        </div>
        <input type="hidden" name="isAdvanced" value={String(isAdvanced)} />
        <label htmlFor="advanced-mode" className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-[#c8ff65]/30 hover:bg-white/8">
          <span className="min-w-0"><span className="block text-sm font-bold text-white">Advanced Mode</span><span className="mt-0.5 block text-xs leading-5 text-white/50">Deep Dive &amp; Interview Prep</span></span>
          <Switch id="advanced-mode" checked={isAdvanced} onCheckedChange={setIsAdvanced} aria-label="Advanced Mode: Deep Dive and Interview Prep" />
        </label>
        {state.warning && <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300/25 bg-amber-300/15 px-4 py-3 text-sm leading-5 text-amber-100"><TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{state.warning}</p>}
        {state.error && state.error !== "LIMIT_REACHED" && <p role="alert" aria-live="polite" className="mt-3 break-words rounded-xl border border-amber-300/25 bg-amber-300/15 px-4 py-3 text-sm leading-5 text-amber-100">{BUSY_SERVER_MESSAGE}</p>}
        <div className="mt-4 flex max-w-full flex-wrap items-center gap-2 text-xs text-white/45"><span className="mr-1 font-semibold text-white/55">Try:</span>{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => selectSuggestion(suggestion)} aria-label={`Use prompt: ${suggestion}`} className="max-w-full break-words rounded-full border border-white/15 px-3 py-2 text-left leading-4 text-white/65 transition hover:-translate-y-0.5 hover:border-[#c8ff65]/50 hover:bg-[#c8ff65]/10 hover:text-[#c8ff65] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8ff65]">{suggestion}</button>)}</div>
      </div>
    </form><Dialog open={limitOpen} onOpenChange={setLimitOpen}><DialogContent className="max-w-md border-white/10 bg-[#fffefa] dark:bg-[#111512] dark:text-white"><DialogHeader><div className="mb-3 grid size-14 place-items-center rounded-2xl bg-[#c8ff65] text-2xl shadow-[0_0_35px_rgba(200,255,101,.25)]">🚀</div><DialogTitle>Daily Limit Reached!</DialogTitle><DialogDescription className="dark:text-white/55">You&apos;ve used today&apos;s 3 free roadmap generations. Your allowance resets automatically at midnight (Dhaka time).</DialogDescription></DialogHeader><button type="button" onClick={() => setLimitOpen(false)} className="mt-5 min-h-11 w-full rounded-xl bg-[#173f2c] px-5 font-black text-white transition hover:bg-[#21573d] dark:bg-[#c8ff65] dark:text-[#17211b]">Got it</button></DialogContent></Dialog></>
  );
}

function SubmitButton({ isAdvanced }: { isAdvanced: boolean }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="flex min-h-14 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#c8ff65] px-6 font-black text-[#17211b] transition hover:brightness-95 disabled:cursor-wait disabled:opacity-70 md:w-auto">{pending ? <><span className="size-4 animate-spin rounded-full border-2 border-[#17211b]/25 border-t-[#17211b]" /> {isAdvanced ? "Crafting deep dive..." : "Forging..."}</> : <>Forge my path <ArrowUpRight size={17} /></>}</button>;
}
