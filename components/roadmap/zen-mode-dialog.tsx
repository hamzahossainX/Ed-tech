"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pause, Play, RotateCcw, TimerReset } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const POMODORO_SECONDS = 25 * 60;

type ZenModeDialogProps = {
  milestone: { title: string; description: string; isCompleted: boolean } | null;
  onOpenChange: (open: boolean) => void;
  onMarkDone: () => void;
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function ZenModeDialog({
  milestone,
  onOpenChange,
  onMarkDone,
}: ZenModeDialogProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(POMODORO_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const deadlineRef = useRef<number | null>(null);
  const completionAnnouncedRef = useRef(false);

  useEffect(() => {
    setRemainingSeconds(POMODORO_SECONDS);
    setIsRunning(false);
    deadlineRef.current = null;
    completionAnnouncedRef.current = false;
  }, [milestone?.title]);

  useEffect(() => {
    if (!isRunning || deadlineRef.current === null) return;

    function updateTimer() {
      const deadline = deadlineRef.current;
      if (deadline === null) return;

      const nextSeconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1_000));
      setRemainingSeconds(nextSeconds);

      if (nextSeconds === 0) {
        setIsRunning(false);
        deadlineRef.current = null;
        if (!completionAnnouncedRef.current) {
          completionAnnouncedRef.current = true;
          toast.success("Pomodoro complete! Take a 5-minute break.", {
            duration: 10_000,
          });
        }
      }
    }

    updateTimer();
    const interval = window.setInterval(updateTimer, 250);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  function startTimer() {
    if (remainingSeconds === 0) setRemainingSeconds(POMODORO_SECONDS);
    const secondsToRun = remainingSeconds === 0 ? POMODORO_SECONDS : remainingSeconds;
    deadlineRef.current = Date.now() + secondsToRun * 1_000;
    completionAnnouncedRef.current = false;
    setIsRunning(true);
  }

  function pauseTimer() {
    const deadline = deadlineRef.current;
    if (deadline !== null) {
      setRemainingSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1_000)));
    }
    deadlineRef.current = null;
    setIsRunning(false);
  }

  function resetTimer() {
    deadlineRef.current = null;
    completionAnnouncedRef.current = false;
    setIsRunning(false);
    setRemainingSeconds(POMODORO_SECONDS);
  }

  function handleOpenChange(open: boolean) {
    if (!open) pauseTimer();
    onOpenChange(open);
  }

  function handleMarkDone() {
    pauseTimer();
    onOpenChange(false);
    onMarkDone();
  }

  return (
    <Dialog open={Boolean(milestone)} onOpenChange={handleOpenChange}>
      <DialogContent
        overlayClassName="bg-[#07110b]/85 backdrop-blur-xl"
        className="w-[95vw] max-w-3xl overflow-hidden rounded-[2rem] border-white/10 bg-[#0d1711] p-0 text-white shadow-[0_40px_140px_rgba(0,0,0,.75)] sm:p-0"
      >
        {milestone && (
          <div className="relative isolate overflow-hidden px-6 py-8 sm:px-12 sm:py-12">
            <div aria-hidden="true" className="absolute -right-32 -top-32 -z-10 size-80 rounded-full bg-[#c8ff65]/10 blur-3xl" />
            <DialogHeader className="text-center sm:text-center">
              <div className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-[#c8ff65]/20 bg-[#c8ff65]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.2em] text-[#c8ff65] sm:text-xs">
                <TimerReset className="size-4" /> Zen Mode
              </div>
              <DialogTitle className="mx-auto mt-4 max-w-xl text-2xl font-black tracking-[-.04em] text-white sm:text-4xl">
                {milestone.title}
              </DialogTitle>
              <DialogDescription className="mx-auto max-w-xl text-sm leading-6 text-white/50 sm:text-base">
                {milestone.description}
              </DialogDescription>
            </DialogHeader>

            <div className="my-9 text-center sm:my-12">
              <div
                role="timer"
                aria-live="off"
                aria-label={`${Math.floor(remainingSeconds / 60)} minutes and ${remainingSeconds % 60} seconds remaining`}
                className="font-mono text-6xl font-black tabular-nums tracking-[-.08em] text-[#c8ff65] drop-shadow-[0_0_30px_rgba(200,255,101,.18)] sm:text-8xl"
              >
                {formatTime(remainingSeconds)}
              </div>
              <p className="mt-3 text-xs font-bold uppercase tracking-[.18em] text-white/35">
                {isRunning ? "Deep work in progress" : remainingSeconds === 0 ? "Session complete" : "Ready when you are"}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {isRunning ? (
                <button type="button" onClick={pauseTimer} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#17211b] transition hover:scale-[1.03] hover:bg-white/90">
                  <Pause className="size-4" fill="currentColor" /> Pause
                </button>
              ) : (
                <button type="button" onClick={startTimer} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#c8ff65] px-5 py-2.5 text-sm font-black text-[#17211b] transition hover:scale-[1.03] hover:bg-[#d5ff84]">
                  <Play className="size-4" fill="currentColor" /> {remainingSeconds === 0 ? "Start again" : "Start"}
                </button>
              )}
              <button type="button" onClick={resetTimer} disabled={remainingSeconds === POMODORO_SECONDS && !isRunning} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-black text-white/75 transition hover:border-white/25 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35">
                <RotateCcw className="size-4" /> Reset
              </button>
              <button type="button" onClick={handleMarkDone} disabled={milestone.isCompleted} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#c8ff65]/25 bg-[#c8ff65]/10 px-5 py-2.5 text-sm font-black text-[#c8ff65] transition hover:border-[#c8ff65]/45 hover:bg-[#c8ff65]/15 disabled:cursor-default disabled:opacity-50">
                <Check className="size-4" strokeWidth={3} /> {milestone.isCompleted ? "Already complete" : "Mark Done"}
              </button>
            </div>
            {!milestone.isCompleted && (
              <p className="mt-5 text-center text-xs text-white/35">
                Marking done continues to the milestone knowledge check.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
