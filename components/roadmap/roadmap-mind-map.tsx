"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LoaderCircle, TriangleAlert } from "lucide-react";

type RoadmapMindMapProps = {
  syntax: string;
};

export function RoadmapMindMap({ syntax }: RoadmapMindMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderId = useId().replace(/[^a-zA-Z0-9_-]/gu, "");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      setStatus("loading");

      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          suppressErrorRendering: true,
          theme: "base",
          themeVariables: {
            primaryColor: "#f0f7e7",
            primaryTextColor: "#17211b",
            primaryBorderColor: "#3c7156",
            lineColor: "#3c7156",
            secondaryColor: "#c8ff65",
            tertiaryColor: "#ffffff",
            fontFamily: "inherit",
          },
          flowchart: { curve: "basis", htmlLabels: false },
        });

        await mermaid.parse(syntax);
        const { svg, bindFunctions } = await mermaid.render(
          `learnx-mind-map-${renderId}`,
          syntax,
        );
        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = svg;
        bindFunctions?.(containerRef.current);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void renderDiagram();
    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [renderId, syntax]);

  return (
    <div className="relative min-h-80 overflow-auto rounded-2xl border border-black/8 bg-[#fbfdf8] p-4 dark:border-white/10 dark:bg-white/[.025] sm:min-h-96 sm:p-8">
      {status === "loading" && (
        <div className="absolute inset-0 grid place-items-center" role="status">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-black/45 dark:text-white/45">
            <LoaderCircle className="size-4 animate-spin" /> Drawing your learning path…
          </span>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 grid place-items-center px-6 text-center" role="alert">
          <span className="max-w-md text-sm font-semibold text-black/55 dark:text-white/55">
            <TriangleAlert className="mx-auto mb-3 size-6 text-amber-500" />
            This mind map could not be drawn. Your timeline remains available.
          </span>
        </div>
      )}
      <div
        ref={containerRef}
        aria-label="Learning roadmap mind map"
        className="mx-auto min-w-[40rem] [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-none sm:[&_svg]:max-w-full"
      />
    </div>
  );
}
