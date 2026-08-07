"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { Award, Sparkles } from "lucide-react";
import Link from "next/link";
import { claimCertificate } from "@/app/actions/claim-certificate";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Props = { roadmapId: string; isComplete: boolean; claimedName?: string | null };

export function ClaimCertificateDialog({ roadmapId, isComplete, claimedName }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (isComplete && !claimedName) setOpen(true);
  }, [isComplete, claimedName]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("fullName") ?? "");
    startTransition(async () => {
      try { await claimCertificate(roadmapId, name); }
      catch (cause) { setError(cause instanceof Error ? cause.message : "Could not claim the certificate."); }
    });
  }

  if (!isComplete) return null;
  if (claimedName) return <div className="mt-6 flex justify-center"><Link href={`/certificate/${roadmapId}`} className="flex items-center gap-2 rounded-full bg-[#c8ff65] px-6 py-3 font-black text-[#17211b] shadow-[3px_3px_0_#17211b] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"><Award size={18} />View certificate</Link></div>;

  return <div className="mt-6 flex justify-center"><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><button className="flex items-center gap-2 rounded-full bg-[#c8ff65] px-6 py-3 font-black text-[#17211b] shadow-[3px_3px_0_#17211b] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"><Award size={18} />Claim certificate</button></DialogTrigger><DialogContent><DialogHeader><div className="mb-3 grid size-14 place-items-center rounded-2xl bg-[#c8ff65]"><Sparkles size={25} /></div><DialogTitle>You completed the path.</DialogTitle><DialogDescription>Enter your full name exactly as you want it printed on your certificate.</DialogDescription></DialogHeader><form onSubmit={submit} className="mt-6"><label htmlFor="certificate-name" className="text-xs font-black uppercase tracking-[.16em] text-black/45">Full name</label><input id="certificate-name" name="fullName" required minLength={2} maxLength={100} autoComplete="name" placeholder="Ada Lovelace" className="mt-2 h-14 w-full rounded-2xl border border-black/10 bg-white px-4 text-lg font-semibold outline-none transition focus:border-[#3c7156] focus:ring-4 focus:ring-[#3c7156]/10" />{error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}<button disabled={pending} className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#173f2c] font-black text-white transition hover:bg-[#21573d] disabled:cursor-wait disabled:opacity-60">{pending ? "Preparing certificate..." : "Create my certificate"}</button></form></DialogContent></Dialog></div>;
}
