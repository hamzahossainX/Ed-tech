"use client";

import { useState } from "react";
import { Check, ClipboardCopy } from "lucide-react";
import { toast } from "sonner";
import { roadmapToNotionMarkdown } from "@/lib/roadmap-markdown";
import type { RecoverableRoadmap } from "@/lib/roadmap-storage";

type RoadmapNotionButtonProps = {
  roadmap: RecoverableRoadmap;
  disabled?: boolean;
};

async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back for browsers that expose Clipboard API but deny permission.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard copy failed.");
}

export function RoadmapNotionButton({ roadmap, disabled = false }: RoadmapNotionButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await copyText(roadmapToNotionMarkdown(roadmap));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
      toast.success("Copied as Markdown! Paste it directly into your Notion workspace.", {
        duration: 8_000,
      });
    } catch {
      toast.error("We couldn't copy the roadmap. Please try again.", {
        duration: 20_000,
      });
    }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => void handleCopy()}
      className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-[#173f2c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#3c7156]/30 hover:shadow-md disabled:cursor-wait disabled:opacity-60 dark:border-white/10 dark:bg-white/8 dark:text-white sm:text-sm"
    >
      {copied ? <Check className="size-4" aria-hidden="true" /> : <ClipboardCopy className="size-4" aria-hidden="true" />}
      {copied ? "Copied" : "Export to Notion"}
    </button>
  );
}
