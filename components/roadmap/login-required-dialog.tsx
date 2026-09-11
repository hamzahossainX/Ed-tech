"use client";

import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AUTH_REQUIRED_MESSAGE } from "@/lib/roadmap-access";

type LoginRequiredDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Shown when a signed-out visitor tries to generate a roadmap. The primary
 * action goes straight to sign-in; the secondary covers visitors who have no
 * account yet, since the hero is their first contact with the product.
 */
export function LoginRequiredDialog({ open, onOpenChange }: LoginRequiredDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-[#c8ff65] text-[#17211b] shadow-[0_0_35px_rgba(200,255,101,.25)]">
            <LogIn size={26} aria-hidden="true" />
          </div>
          <DialogTitle>Sign in to continue</DialogTitle>
          <DialogDescription>{AUTH_REQUIRED_MESSAGE}</DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/login"
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#173f2c] px-5 font-black text-white transition hover:bg-[#21573d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c7156] focus-visible:ring-offset-2 dark:bg-[#c8ff65] dark:text-[#17211b] dark:hover:bg-[#d5ff86] dark:focus-visible:ring-offset-[#111512]"
          >
            <LogIn size={16} aria-hidden="true" /> Login Now
          </Link>
          <Link
            href="/register"
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 px-5 font-black text-[#17211b] transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c7156] focus-visible:ring-offset-2 dark:border-white/15 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-offset-[#111512]"
          >
            <UserPlus size={16} aria-hidden="true" /> Create account
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
