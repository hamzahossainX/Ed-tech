"use client";

import { useState } from "react";
import { Facebook, Linkedin, Share2, Twitter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SharePlatform = "x" | "linkedin" | "facebook";

type CertificateShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roadmapTitle: string;
  roadmapDuration: string;
  viewerKey: string;
  isAdmin: boolean;
};

type DailyShareUsage = {
  date: string;
  count: number;
};

const DAILY_SHARE_LIMIT = 3;

function localDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashViewerKey(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function getStorageKey(viewerKey: string) {
  return `learnx:certificate-shares:v1:${hashViewerKey(viewerKey.toLowerCase())}`;
}

function readDailyUsage(storageKey: string): DailyShareUsage {
  const today = localDateKey();
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) return { date: today, count: 0 };

  try {
    const parsed: unknown = JSON.parse(saved);
    if (
      typeof parsed === "object"
      && parsed !== null
      && "date" in parsed
      && "count" in parsed
      && typeof parsed.date === "string"
      && typeof parsed.count === "number"
      && Number.isInteger(parsed.count)
      && parsed.count >= 0
    ) {
      return parsed.date === today ? parsed as DailyShareUsage : { date: today, count: 0 };
    }
  } catch {
    // Replace malformed local data with a clean daily counter.
  }

  return { date: today, count: 0 };
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard access failed.");
}

function createIntentUrl(platform: SharePlatform, pageUrl: string, caption: string) {
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedCaption = encodeURIComponent(caption);

  if (platform === "x") {
    return `https://twitter.com/intent/tweet?text=${encodedCaption}&url=${encodedUrl}`;
  }
  if (platform === "linkedin") {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  }
  return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedCaption}`;
}

export function CertificateShareDialog({
  open,
  onOpenChange,
  roadmapTitle,
  roadmapDuration,
  viewerKey,
  isAdmin,
}: CertificateShareDialogProps) {
  const [activePlatform, setActivePlatform] = useState<SharePlatform | null>(null);

  async function share(platform: SharePlatform) {
    if (activePlatform) return;

    const storageKey = getStorageKey(viewerKey);
    let usage: DailyShareUsage | null = null;

    if (!isAdmin) {
      try {
        usage = readDailyUsage(storageKey);
      } catch {
        toast.error("Sharing is unavailable because browser storage could not be accessed.");
        return;
      }

      if (usage.count >= DAILY_SHARE_LIMIT) {
        toast.error("You've reached your daily sharing limit. Come back tomorrow!", {
          duration: 10_000,
        });
        return;
      }
    }

    setActivePlatform(platform);
    const pageUrl = window.location.href;
    const caption = `I just completed my custom roadmap for ${roadmapTitle} in ${roadmapDuration} on LearnX! 🚀 Thanks to AI, I have a clear path to follow. Check it out!`;

    try {
      await copyToClipboard(caption);

      if (!isAdmin && usage) {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({ date: usage.date, count: usage.count + 1 }),
        );
      }

      toast.success("Caption copied! Paste it in your post", { duration: 6_000 });
      window.open(
        createIntentUrl(platform, pageUrl, caption),
        "_blank",
        "noopener,noreferrer",
      );
    } catch {
      toast.error("We couldn't prepare your post. Please try again.", { duration: 8_000 });
    } finally {
      setActivePlatform(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-[#c8ff65] text-[#17211b]">
            <Share2 size={24} aria-hidden="true" />
          </div>
          <DialogTitle>Share your achievement</DialogTitle>
          <DialogDescription>
            Your certificate is downloaded. Choose a network and we’ll copy a ready-to-post caption for you.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 grid gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={activePlatform !== null}
            onClick={() => void share("x")}
            className="justify-start"
          >
            <Twitter size={18} aria-hidden="true" />
            Share on X (Twitter)
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={activePlatform !== null}
            onClick={() => void share("linkedin")}
            className="justify-start"
          >
            <Linkedin size={18} aria-hidden="true" />
            Share on LinkedIn
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={activePlatform !== null}
            onClick={() => void share("facebook")}
            className="justify-start"
          >
            <Facebook size={18} aria-hidden="true" />
            Share on Facebook
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
