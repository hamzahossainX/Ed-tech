"use client";

import { useState } from "react";
import { Check, Link2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { encodeRoadmapForUrl } from "@/lib/roadmap-sharing";
import type { RecoverableRoadmap } from "@/lib/roadmap-storage";

type Props = {
  roadmap: RecoverableRoadmap;
  disabled?: boolean;
};

async function copyToClipboard(value: string) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Continue to the compatibility fallback below.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.readOnly = true;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard permission was denied.");
}

export function RoadmapShareButton({ roadmap, disabled = false }: Props) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const encodedRoadmap = await encodeRoadmapForUrl(roadmap);
      const shareUrl = new URL("/roadmap/shared", window.location.origin);
      shareUrl.searchParams.set("roadmap", encodedRoadmap);
      await copyToClipboard(shareUrl.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_500);
      toast.success("Share link copied to your clipboard.", { duration: 8_000 });
    } catch {
      toast.error(
        "This roadmap is too large to fit safely in a share link. Export it instead.",
        { duration: 20_000 },
      );
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      disabled={disabled || isSharing}
      className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-[#173f2c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#3c7156]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c7156] disabled:cursor-wait disabled:opacity-60 dark:border-white/10 dark:bg-white/8 dark:text-white dark:focus-visible:ring-[#a9e950] sm:text-sm"
    >
      {isSharing ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : copied ? (
        <Check className="size-4 text-[#3c7156] dark:text-[#a9e950]" aria-hidden="true" />
      ) : (
        <Link2 className="size-4" aria-hidden="true" />
      )}
      {isSharing ? "Creating link..." : copied ? "Copied" : "Share link"}
    </button>
  );
}
