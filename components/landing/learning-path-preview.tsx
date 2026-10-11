"use client";

import { useEffect, useId, useState, type PointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight, BrainCircuit, Code2, Map, Palette, Route, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const tracks = [
  {
    name: "Web development",
    label: "Web dev",
    icon: Code2,
    duration: "12 weeks",
    prompt: "Full-Stack Next.js Developer in 3 months",
    milestones: [
      { title: "Build your foundations", short: "Foundations", timing: "Weeks 1–3", detail: "Turn HTML, CSS, and JavaScript fundamentals into a responsive page you can show someone.", output: "Your first responsive website" },
      { title: "Think in components", short: "React & Next.js", timing: "Weeks 4–6", detail: "Build reusable React components, connect pages, and learn how server and client rendering fit together.", output: "An interactive Next.js app" },
      { title: "Connect the full stack", short: "APIs & data", timing: "Weeks 7–9", detail: "Connect your interface to an API and database, then add validation and safe error handling.", output: "A working full-stack feature" },
      { title: "Ship something yours", short: "Launch project", timing: "Weeks 10–12", detail: "Test, refine, and deploy a portfolio project. Explain your design decisions in a clear README.", output: "A deployed portfolio project" },
    ],
  },
  {
    name: "Python & AI",
    label: "Python & AI",
    icon: BrainCircuit,
    duration: "8 weeks",
    prompt: "Master Python & Machine Learning in 2 months",
    milestones: [
      { title: "Get fluent in Python", short: "Python basics", timing: "Weeks 1–2", detail: "Practice functions, collections, and file handling with small programs that solve everyday problems.", output: "A useful Python automation" },
      { title: "Find the story in data", short: "Explore data", timing: "Weeks 3–4", detail: "Clean a dataset with pandas and create charts that help you ask better questions about it.", output: "An exploratory data notebook" },
      { title: "Train your first model", short: "Machine learning", timing: "Weeks 5–6", detail: "Start with a simple baseline, separate training and test data, and measure what your model gets right.", output: "An evaluated prediction model" },
      { title: "Make your work usable", short: "Build an AI app", timing: "Weeks 7–8", detail: "Put your model behind a simple interface and document its limitations alongside the results.", output: "A shareable machine learning demo" },
    ],
  },
  {
    name: "Design",
    label: "Design",
    icon: Palette,
    duration: "4 weeks",
    prompt: "UI/UX Design for beginners in 4 weeks",
    milestones: [
      { title: "Start with the person", short: "User research", timing: "Week 1", detail: "Interview a few potential users, understand their needs, and turn what you learn into a clear problem statement.", output: "A focused design brief" },
      { title: "Sketch the experience", short: "Wireframes", timing: "Week 2", detail: "Map the key journey and explore low-fidelity layouts before committing to a visual direction.", output: "A connected set of wireframes" },
      { title: "Give the idea a voice", short: "Visual design", timing: "Week 3", detail: "Use hierarchy, typography, accessible contrast, and reusable components to build a consistent interface.", output: "A polished clickable prototype" },
      { title: "Test, learn, improve", short: "Test & refine", timing: "Week 4", detail: "Watch people try your prototype, improve the confusing parts, and present the outcome as a case study.", output: "Your first UX case study" },
    ],
  },
] as const;

const nodePositions = [
  { left: "15%", top: "17%" },
  { left: "70%", top: "38%" },
  { left: "28%", top: "66%" },
  { left: "78%", top: "80%" },
];

type LearningPathPreviewProps = {
  onStart?: (prompt: string) => void;
};

/** An interactive sample, not a generated roadmap or a user's saved progress. */
export function LearningPathPreview({ onStart }: LearningPathPreviewProps) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [milestoneIndex, setMilestoneIndex] = useState(1);
  const [finePointer, setFinePointer] = useState(false);
  const reduceMotion = useReducedMotion();
  const detailsId = useId();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothX = useSpring(rotateX, { stiffness: 170, damping: 24 });
  const smoothY = useSpring(rotateY, { stiffness: 170, damping: 24 });
  const canAnimate = reduceMotion === false;
  const canTilt = canAnimate && finePointer;
  const track = tracks[trackIndex];
  const milestone = track.milestones[milestoneIndex];

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFinePointer(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  function resetTilt() {
    rotateX.set(0);
    rotateY.set(0);
  }

  function moveTilt(event: PointerEvent<HTMLDivElement>) {
    if (!canTilt || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    rotateX.set(-((event.clientY - bounds.top) / bounds.height - 0.5) * 5);
    rotateY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 5);
  }

  return (
    <div className="relative mx-auto w-full max-w-[560px] text-left [perspective:1200px]" onPointerMove={moveTilt} onPointerLeave={resetTilt} onPointerCancel={resetTilt}>
      <div aria-hidden="true" className="pointer-events-none absolute -inset-7 rounded-full bg-[#a9e950]/10 blur-3xl" />
      <motion.div
        style={{ rotateX: canTilt ? smoothX : 0, rotateY: canTilt ? smoothY : 0 }}
        className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#10251c] text-white shadow-[0_24px_90px_-25px_rgba(13,40,27,0.6)] sm:rounded-[32px]"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl border border-[#c8ff65]/20 bg-[#c8ff65]/10 text-[#c8ff65]"><Route size={18} aria-hidden="true" /></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#b3c8bc]">The big picture</p><p className="mt-0.5 text-sm font-semibold tracking-tight">Your next chapter, mapped.</p></div>
          </div>
          <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-medium text-[#bed0c5]">Sample path</span>
        </div>

        <div role="group" aria-label="Explore sample learning tracks" className="mx-5 mt-5 grid grid-cols-3 gap-1 rounded-xl border border-white/8 bg-black/15 p-1 sm:mx-7">
          {tracks.map((item, index) => {
            const Icon = item.icon;
            return <button key={item.name} type="button" aria-label={item.name} aria-pressed={trackIndex === index} onClick={() => { setTrackIndex(index); setMilestoneIndex(0); }} className={cn("flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8ff65] sm:text-xs", trackIndex === index ? "bg-[#c8ff65] text-[#142419] shadow-sm" : "text-[#bbcdc1] hover:bg-white/8 hover:text-white")}><Icon className="size-3.5 shrink-0" aria-hidden="true" />{item.label}</button>;
          })}
        </div>

        <div className="relative mx-4 mt-1 h-[250px] sm:mx-7 sm:h-[272px]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(#a9c9b6_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse,black_30%,transparent_75%)]" />
          <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            <path d="M 15 17 C 42 17, 70 10, 70 38 S 28 38, 28 66 S 56 80, 78 80" fill="none" stroke="#a9e950" strokeOpacity=".22" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
            <path d="M 15 17 C 42 17, 70 10, 70 38 S 28 38, 28 66 S 56 80, 78 80" fill="none" stroke="#c8ff65" strokeOpacity=".65" strokeWidth="1.4" strokeDasharray="3 8" vectorEffect="non-scaling-stroke" />
          </svg>
          {track.milestones.map((item, index) => (
            <button
              key={index}
              type="button"
              aria-label={`${item.short}, ${item.timing}. Show milestone preview`}
              aria-pressed={milestoneIndex === index}
              aria-controls={detailsId}
              onClick={() => setMilestoneIndex(index)}
              style={nodePositions[index]}
              className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8ff65] focus-visible:ring-offset-4 focus-visible:ring-offset-[#10251c]"
            >
              <motion.span animate={{ scale: canAnimate && milestoneIndex === index ? 1.12 : 1 }} transition={{ type: "spring", stiffness: 350, damping: 25 }} className={cn("relative flex size-11 items-center justify-center rounded-full border text-xs font-semibold transition-colors", milestoneIndex === index ? "border-[#c8ff65] bg-[#c8ff65] text-[#122519] shadow-[0_0_30px_3px_rgba(200,255,101,0.16)]" : "border-[#769c84]/50 bg-[#1c3528] text-[#d1e6d6] group-hover:border-[#c8ff65] group-hover:text-[#c8ff65]")}>{String(index + 1).padStart(2, "0")}</motion.span>
              <span className={cn("absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#10251c]/90 px-1.5 py-0.5 text-[10px] font-semibold sm:text-xs", milestoneIndex === index ? "text-[#c8ff65]" : "text-[#c3d7ca]")}>{item.short}</span>
            </button>
          ))}
          <span className="absolute bottom-1 left-0 text-[10px] text-[#94b4a0]">Choose a step to explore</span>
        </div>

        <div id={detailsId} aria-live="polite" aria-atomic="true" className="relative mx-5 mb-5 min-h-[176px] overflow-hidden rounded-2xl border border-white/10 bg-white/[.035] p-4 sm:mx-7 sm:p-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={`${trackIndex}-${milestoneIndex}`} initial={canAnimate ? { opacity: 0, y: 5 } : false} animate={{ opacity: 1, y: 0 }} exit={canAnimate ? { opacity: 0, y: -3 } : {}} transition={{ duration: 0.12 }}>
              <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#c8ff65]">Milestone {String(milestoneIndex + 1).padStart(2, "0")}</span><span className="text-[10px] text-[#a9c4b2]">{milestone.timing}</span></div>
              <h3 className="mt-2 text-base font-semibold tracking-tight">{milestone.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#bbd0c2] sm:text-[13px]">{milestone.detail}</p>
              <p className="mt-3 flex items-center gap-2 text-[11px] font-medium text-[#d8eabf]"><Sparkles size={12} className="shrink-0 text-[#c8ff65]" aria-hidden="true" />{milestone.output}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/10 px-5 py-4 sm:px-7">
          <p className="flex items-center gap-2 text-[11px] text-[#b6cdbf]"><Map size={13} aria-hidden="true" />4 milestones<span aria-hidden="true" className="text-[#658873]">/</span>{track.duration}</p>
          {onStart ? <button type="button" onClick={() => onStart(track.prompt)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 text-xs font-semibold text-[#c8ff65] transition-colors hover:bg-[#c8ff65]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8ff65]">Make it yours<ArrowUpRight size={15} aria-hidden="true" /></button> : <span className="text-[10px] text-[#94b4a0]">A small preview of what&apos;s possible</span>}
        </div>
      </motion.div>
    </div>
  );
}
