"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";

type DownloadPDFButtonProps = {
  targetId: string;
  fileName?: string;
};

export function DownloadPDFButton({
  targetId,
  fileName = "SkillForge-Certificate.pdf",
}: DownloadPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setError(null);

    const certificate = document.getElementById(targetId);
    if (!certificate) {
      setError(`Could not find the certificate element with id "${targetId}".`);
      return;
    }

    setIsGenerating(true);

    try {
      // Capture only after web fonts finish loading. This prevents text from
      // moving between measurement and canvas rendering.
      await document.fonts?.ready;

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(certificate, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      if (!canvas.width || !canvas.height) {
        throw new Error("The certificate rendered to an empty canvas.");
      }

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const canvasRatio = canvas.width / canvas.height;
      const pageRatio = pageWidth / pageHeight;

      // Fit inside the PDF page without changing the canvas aspect ratio.
      const imageWidth = canvasRatio > pageRatio
        ? pageWidth
        : pageHeight * canvasRatio;
      const imageHeight = canvasRatio > pageRatio
        ? pageWidth / canvasRatio
        : pageHeight;
      const offsetX = (pageWidth - imageWidth) / 2;
      const offsetY = (pageHeight - imageHeight) / 2;

      pdf.addImage(
        canvas.toDataURL("image/png", 1),
        "PNG",
        offsetX,
        offsetY,
        imageWidth,
        imageHeight,
        undefined,
        "FAST",
      );
      pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
    } catch (cause) {
      console.error("Certificate PDF generation failed:", cause);
      setError(
        cause instanceof Error
          ? `PDF generation failed: ${cause.message}`
          : "PDF generation failed. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isGenerating}
        className="flex items-center gap-2 rounded-full bg-[#173f2c] px-6 py-3 font-black text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
      >
        {isGenerating ? (
          <LoaderCircle className="animate-spin" size={17} />
        ) : (
          <Download size={17} />
        )}
        {isGenerating ? "Creating PDF..." : "Download PDF"}
      </button>
      {error && (
        <p role="alert" className="max-w-sm text-right text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
