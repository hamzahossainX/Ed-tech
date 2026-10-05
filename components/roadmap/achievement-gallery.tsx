"use client";

import { useState } from "react";
import { Award, Check, Footprints, LockKeyhole, Medal, Timer } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ACHIEVEMENTS, type AchievementId, type UnlockedAchievement } from "@/lib/achievements";

type AchievementGalleryProps = {
  unlocked: UnlockedAchievement[];
};

const ICONS = {
  "first-step": Footprints,
  "deep-work": Timer,
  "path-master": Medal,
} satisfies Record<AchievementId, typeof Award>;

export function AchievementGallery({ unlocked }: AchievementGalleryProps) {
  const [open, setOpen] = useState(false);
  const unlockedById = new Map(unlocked.map((item) => [item.id, item]));

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-[#173f2c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#3c7156]/30 hover:shadow-md dark:border-white/10 dark:bg-white/8 dark:text-white sm:text-sm">
        <Award className="size-4 text-amber-500" /> Badges
        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">{unlocked.length}/{ACHIEVEMENTS.length}</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="mb-2 flex w-fit items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-amber-800 dark:bg-amber-400/10 dark:text-amber-300"><Award className="size-4" /> Achievement Gallery</div>
            <DialogTitle>Your LearnX badges</DialogTitle>
            <DialogDescription>Small wins become lasting momentum. Badges are saved privately in this browser.</DialogDescription>
          </DialogHeader>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {ACHIEVEMENTS.map((achievement) => {
              const unlockedAchievement = unlockedById.get(achievement.id);
              const Icon = ICONS[achievement.id];
              return <article key={achievement.id} className={`relative overflow-hidden rounded-2xl border p-5 text-center transition ${unlockedAchievement ? "border-amber-300/50 bg-gradient-to-b from-amber-50 to-white shadow-[0_16px_45px_rgba(245,158,11,.10)] dark:border-amber-400/20 dark:from-amber-400/[.08] dark:to-transparent" : "border-black/8 bg-black/[.025] opacity-60 grayscale dark:border-white/10 dark:bg-white/[.025]"}`}>
                <div className={`mx-auto grid size-16 place-items-center rounded-full ${unlockedAchievement ? "bg-amber-400 text-amber-950 shadow-[0_0_30px_rgba(251,191,36,.3)]" : "bg-black/8 text-black/35 dark:bg-white/10 dark:text-white/35"}`}>
                  {unlockedAchievement ? <Icon className="size-8" /> : <LockKeyhole className="size-7" />}
                </div>
                <h3 className="mt-4 text-base font-black">{achievement.title}</h3>
                <p className="mt-2 text-xs leading-5 text-black/50 dark:text-white/50">{achievement.description}</p>
                {unlockedAchievement && <p className="mt-4 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400"><Check className="size-3" /> Unlocked</p>}
              </article>;
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
