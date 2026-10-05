"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BrainCircuit,
  CalendarPlus,
  Command,
  Home,
  ListTree,
  MoonStar,
  PlayCircle,
  Sparkles,
  Timer,
  Workflow,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DEMO_ROADMAP } from "@/lib/demo-roadmap";
import {
  ROADMAP_CALENDAR_EVENT,
  ROADMAP_CRITIC_EVENT,
  ROADMAP_VIEW_EVENT,
  ROADMAP_ZEN_EVENT,
  type RoadmapView,
} from "@/lib/roadmap-events";
import { encodeRoadmapForUrl } from "@/lib/roadmap-sharing";

type PaletteAction = {
  id: string;
  label: string;
  hint: string;
  icon: typeof Home;
  run: () => void | Promise<void>;
};

function dispatchRoadmapView(view: RoadmapView) {
  window.dispatchEvent(new CustomEvent(ROADMAP_VIEW_EVENT, { detail: view }));
}

export function CommandPalette() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const isRoadmapPage = pathname.startsWith("/roadmap/");

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const actions = useMemo<PaletteAction[]>(() => {
    const globalActions: PaletteAction[] = [
      {
        id: "new-roadmap",
        label: "Create a new roadmap",
        hint: "Return to the AI path builder",
        icon: Home,
        run: () => router.push("/"),
      },
      {
        id: "offline-demo",
        label: "Open offline demo",
        hint: "Explore LearnX without an API call",
        icon: PlayCircle,
        run: async () => {
          const encoded = await encodeRoadmapForUrl(DEMO_ROADMAP, { compress: false });
          router.push(`/roadmap/demo?roadmap=${encodeURIComponent(encoded)}`);
        },
      },
      {
        id: "theme",
        label: `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`,
        hint: "Change the LearnX color theme",
        icon: MoonStar,
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
    ];

    if (!isRoadmapPage) return globalActions;
    return [
      {
        id: "timeline",
        label: "Show Timeline View",
        hint: "Return to milestone cards",
        icon: ListTree,
        run: () => dispatchRoadmapView("timeline"),
      },
      {
        id: "mind-map",
        label: "Show Mind Map View",
        hint: "Visualize the learning sequence",
        icon: Workflow,
        run: () => dispatchRoadmapView("mind-map"),
      },
      {
        id: "zen-mode",
        label: "Start Zen Mode",
        hint: "Focus on the next unfinished milestone",
        icon: Timer,
        run: () => window.dispatchEvent(new Event(ROADMAP_ZEN_EVENT)),
      },
      {
        id: "critic",
        label: "Run AI Roadmap Critic",
        hint: "Check realism, risks, and improvements",
        icon: BrainCircuit,
        run: () => window.dispatchEvent(new Event(ROADMAP_CRITIC_EVENT)),
      },
      {
        id: "calendar",
        label: "Export study calendar",
        hint: "Download the roadmap as an .ics file",
        icon: CalendarPlus,
        run: () => window.dispatchEvent(new Event(ROADMAP_CALENDAR_EVENT)),
      },
      ...globalActions,
    ];
  }, [isRoadmapPage, resolvedTheme, router, setTheme]);

  const visibleActions = actions.filter((action) =>
    `${action.label} ${action.hint}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => setActiveIndex(0), [query, open]);

  async function runAction(action: PaletteAction) {
    setOpen(false);
    setQuery("");
    await action.run();
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Open command palette" title="Command palette (Ctrl or Command + K)" className="inline-flex size-10 shrink-0 items-center justify-center gap-2 rounded-full border border-black/8 bg-black/[.025] text-xs font-black text-black/50 transition hover:bg-black/[.06] hover:text-black dark:border-white/10 dark:bg-white/[.06] dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white sm:w-auto sm:px-3">
        <Command className="size-4" /> <span className="hidden sm:inline">Commands</span> <kbd className="hidden rounded-md border border-black/10 bg-white px-1.5 py-0.5 font-mono text-[10px] dark:border-white/10 dark:bg-white/10 sm:inline">⌘K</kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl overflow-hidden p-0 sm:p-0">
          <DialogHeader className="border-b border-black/8 px-6 pb-4 pt-6 pr-16 dark:border-white/10">
            <DialogTitle className="flex items-center gap-2 text-xl"><Sparkles className="size-5 text-[#3c7156] dark:text-[#c8ff65]" /> LearnX Commands</DialogTitle>
            <DialogDescription>Jump anywhere without leaving your keyboard.</DialogDescription>
          </DialogHeader>
          <div className="px-3 pb-3">
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
              if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, visibleActions.length - 1)); }
              if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)); }
              if (event.key === "Enter" && visibleActions[activeIndex]) { event.preventDefault(); void runAction(visibleActions[activeIndex]); }
            }} placeholder="Search actions…" aria-label="Search commands" className="my-3 h-12 w-full rounded-xl border border-black/10 bg-black/[.025] px-4 text-sm font-semibold outline-none ring-[#3c7156] placeholder:text-black/30 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:ring-[#c8ff65] dark:placeholder:text-white/30" />
            <div className="max-h-80 space-y-1 overflow-y-auto" role="listbox" aria-label="Available commands">
              {visibleActions.map((action, index) => {
                const Icon = action.icon;
                return <button key={action.id} type="button" role="option" aria-selected={index === activeIndex} onMouseEnter={() => setActiveIndex(index)} onClick={() => void runAction(action)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${index === activeIndex ? "bg-[#f0f7e7] dark:bg-[#c8ff65]/10" : "hover:bg-black/[.035] dark:hover:bg-white/5"}`}><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#28583f] shadow-sm dark:bg-white/10 dark:text-[#c8ff65]"><Icon className="size-4" /></span><span className="min-w-0"><span className="block text-sm font-black">{action.label}</span><span className="block truncate text-xs text-black/40 dark:text-white/40">{action.hint}</span></span></button>;
              })}
              {visibleActions.length === 0 && <p className="px-4 py-10 text-center text-sm text-black/45 dark:text-white/45">No matching command.</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
