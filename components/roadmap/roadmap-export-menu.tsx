"use client";

import { useState } from "react";
import { Check, ChevronDown, ClipboardCopy, Download, FileText, LoaderCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ResourceLink } from "@/db/schema";

type ExportMilestone = {
  id: string;
  title: string;
  description: string;
  duration: string;
  position: number;
  isCompleted: boolean;
  resourceLinks: ResourceLink[];
  exhaustiveDeepDive: string | null;
  eli5Explanation: string[] | null;
};

type ExportRoadmap = {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  milestones: ExportMilestone[];
};

type Props = {
  roadmap: ExportRoadmap;
  disabled?: boolean;
};

function escapeMarkdownLabel(value: string) {
  return value.replace(/([\\`*_[\]<>])/g, "\\$1");
}

export function roadmapToMarkdown(roadmap: ExportRoadmap) {
  const completed = roadmap.milestones.filter((item) => item.isCompleted).length;
  const lines = [
    `# ${roadmap.title}`,
    "",
    roadmap.description,
    "",
    `- **Estimated duration:** ${roadmap.estimatedDuration}`,
    `- **Progress:** ${completed}/${roadmap.milestones.length} milestones completed`,
    `- **LearnX roadmap ID:** \`${roadmap.id}\``,
    "",
  ];

  for (const milestone of roadmap.milestones) {
    lines.push(
      `## ${milestone.position}. ${milestone.title}`,
      "",
      `- **Status:** ${milestone.isCompleted ? "Completed" : "Not completed"}`,
      `- **Duration:** ${milestone.duration}`,
      "",
      milestone.description,
      "",
    );

    if (milestone.resourceLinks.length) {
      lines.push("### Resources", "");
      for (const resource of milestone.resourceLinks) {
        lines.push(`- [${escapeMarkdownLabel(resource.title)}](${resource.url})`);
      }
      lines.push("");
    }

    if (milestone.eli5Explanation?.length) {
      lines.push("### Explain Like I'm 5", "");
      for (const explanation of milestone.eli5Explanation) {
        lines.push(`- ${explanation}`);
      }
      lines.push("");
    }

    if (milestone.exhaustiveDeepDive) {
      lines.push("### Deep Dive", "", milestone.exhaustiveDeepDive, "");
    }

    lines.push("---", "");
  }

  lines.push("Generated with LearnX.", "");
  return lines.join("\n");
}

export function safeFileName(title: string) {
  const slug = title
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70);

  return `${slug || "LearnX-Roadmap"}.pdf`;
}

async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Some privacy-focused browsers expose the API but deny access. Fall
      // through to the selection-based copy path for wider compatibility.
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
  textarea.setSelectionRange(0, textarea.value.length);
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) throw new Error("Clipboard copy was rejected.");
}

export function RoadmapExportMenu({ roadmap, disabled = false }: Props) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfTargetId = `roadmap-pdf-${roadmap.id}`;

  async function handleCopyForNotion() {
    try {
      await copyText(roadmapToMarkdown(roadmap));
      toast.success("Roadmap copied! Paste it into Notion to keep the formatting.", {
        duration: 8_000,
      });
    } catch {
      toast.error("We couldn't copy the roadmap. Please try again.", {
        duration: 20_000,
      });
    }
  }

  async function handleDownloadPdf() {
    const target = document.getElementById(pdfTargetId);
    if (!target) {
      toast.error("We couldn't prepare the roadmap PDF. Please try again.", {
        duration: 20_000,
      });
      return;
    }

    setIsGeneratingPdf(true);
    try {
      await document.fonts?.ready;
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(target, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      if (!canvas.width || !canvas.height) {
        throw new Error("The roadmap rendered to an empty canvas.");
      }

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pageWidth - margin * 2;
      const pixelsPerMillimeter = canvas.width / imageWidth;
      const pageSliceHeight = Math.floor((pageHeight - margin * 2) * pixelsPerMillimeter);

      for (let offset = 0, page = 0; offset < canvas.height; offset += pageSliceHeight, page += 1) {
        const sliceHeight = Math.min(pageSliceHeight, canvas.height - offset);
        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sliceHeight;
        const context = slice.getContext("2d");
        if (!context) throw new Error("Could not create a PDF canvas page.");

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, slice.width, slice.height);
        context.drawImage(
          canvas,
          0,
          offset,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight,
        );

        if (page > 0) pdf.addPage();
        pdf.addImage(
          slice.toDataURL("image/jpeg", 0.92),
          "JPEG",
          margin,
          margin,
          imageWidth,
          sliceHeight / pixelsPerMillimeter,
          undefined,
          "FAST",
        );
      }

      pdf.save(safeFileName(roadmap.title));
      toast.success("Your roadmap PDF is ready.", { duration: 8_000 });
    } catch {
      toast.error("PDF generation failed. Please try again.", {
        duration: 20_000,
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={disabled || isGeneratingPdf}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black text-[#173f2c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#3c7156]/30 hover:shadow-md disabled:cursor-wait disabled:opacity-60 dark:border-white/10 dark:bg-white/8 dark:text-white sm:text-sm"
          >
            {isGeneratingPdf ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            {isGeneratingPdf ? "Creating PDF..." : "Export"}
            {!isGeneratingPdf && <ChevronDown className="size-3.5 opacity-50" aria-hidden="true" />}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={() => void handleDownloadPdf()}>
            <FileText className="size-4" aria-hidden="true" />
            Download as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void handleCopyForNotion()}>
            <ClipboardCopy className="size-4" aria-hidden="true" />
            Copy for Notion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <section
        id={pdfTargetId}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          width: "794px",
          padding: "48px",
          pointerEvents: "none",
          backgroundColor: "#ffffff",
          color: "#17211b",
          fontFamily: "Arial, sans-serif",
          zIndex: 9999,
        }}
      >
        <header style={{ borderBottom: "3px solid #173f2c", paddingBottom: "24px", marginBottom: "28px" }}>
          <p style={{ margin: 0, color: "#3c7156", fontSize: "13px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            LearnX AI Learning Roadmap
          </p>
          <h1 style={{ margin: "10px 0 0", fontSize: "34px", lineHeight: 1.15 }}>{roadmap.title}</h1>
          <p style={{ margin: "14px 0 0", color: "#536159", fontSize: "16px", lineHeight: 1.6 }}>{roadmap.description}</p>
          <p style={{ margin: "12px 0 0", fontSize: "14px", fontWeight: 700 }}>Estimated duration: {roadmap.estimatedDuration}</p>
        </header>

        {roadmap.milestones.map((milestone) => (
          <article key={milestone.id} style={{ breakInside: "avoid", border: "1px solid #dce5df", borderRadius: "14px", padding: "24px", marginBottom: "22px" }}>
            <p style={{ margin: 0, color: "#3c7156", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Milestone {milestone.position} · {milestone.duration}
            </p>
            <h2 style={{ margin: "8px 0 0", fontSize: "24px", lineHeight: 1.25 }}>{milestone.title}</h2>
            <p style={{ margin: "12px 0 0", color: "#536159", fontSize: "15px", lineHeight: 1.6 }}>{milestone.description}</p>
            <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: "12px 0 0", color: milestone.isCompleted ? "#2d6a47" : "#778079", fontSize: "13px", fontWeight: 700 }}>
              {milestone.isCompleted && <Check size={15} />} {milestone.isCompleted ? "Completed" : "Not completed"}
            </p>

            {milestone.resourceLinks.length > 0 && (
              <div style={{ marginTop: "18px" }}>
                <h3 style={{ margin: 0, fontSize: "16px" }}>Resources</h3>
                <ul style={{ margin: "8px 0 0", paddingLeft: "20px", fontSize: "13px", lineHeight: 1.7 }}>
                  {milestone.resourceLinks.map((resource) => (
                    <li key={resource.url}>{resource.title}: {resource.url}</li>
                  ))}
                </ul>
              </div>
            )}

            {milestone.eli5Explanation?.length ? (
              <div style={{ marginTop: "18px", borderLeft: "4px solid #c6f85e", padding: "10px 14px", backgroundColor: "#f4fae9" }}>
                <h3 style={{ margin: 0, fontSize: "16px" }}>Explain Like I&apos;m 5</h3>
                <ul style={{ margin: "8px 0 0", paddingLeft: "20px", fontSize: "13px", lineHeight: 1.7 }}>
                  {milestone.eli5Explanation.map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}
                </ul>
              </div>
            ) : null}

            {milestone.exhaustiveDeepDive && (
              <div className="roadmap-pdf-markdown" style={{ marginTop: "22px", fontSize: "13px", lineHeight: 1.65 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{milestone.exhaustiveDeepDive}</ReactMarkdown>
              </div>
            )}
          </article>
        ))}

        <footer style={{ borderTop: "1px solid #dce5df", paddingTop: "18px", color: "#6d776f", fontSize: "12px", textAlign: "center" }}>
          Generated with LearnX · {roadmap.id}
        </footer>
      </section>
    </>
  );
}
