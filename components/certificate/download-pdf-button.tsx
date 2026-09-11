"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { CertificateShareDialog } from "@/components/certificate/certificate-share-dialog";

type DownloadPDFButtonProps = {
  targetId: string;
  roadmapTitle: string;
  roadmapDuration: string;
  viewerKey: string;
  isAdmin: boolean;
  fileName?: string;
};

const CERTIFICATE_WIDTH = 1120;
const CERTIFICATE_HEIGHT = 792;

export function DownloadPDFButton({
  targetId,
  roadmapTitle,
  roadmapDuration,
  viewerKey,
  isAdmin,
  fileName = "LearnX-Certificate.pdf",
}: DownloadPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
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
      await document.fonts.ready;

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(certificate, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: CERTIFICATE_WIDTH,
        height: CERTIFICATE_HEIGHT,
        windowWidth: CERTIFICATE_WIDTH,
        windowHeight: CERTIFICATE_HEIGHT,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        onclone: (clonedDocument) => {
          const clonedCertificate = clonedDocument.getElementById(targetId);
          if (!clonedCertificate) return;

          // Render an isolated, fixed-size A4-landscape canvas regardless of
          // the user's viewport. This avoids responsive reflow and clipping.
          Object.assign(clonedCertificate.style, {
            width: `${CERTIFICATE_WIDTH}px`,
            height: `${CERTIFICATE_HEIGHT}px`,
            minWidth: `${CERTIFICATE_WIDTH}px`,
            maxWidth: `${CERTIFICATE_WIDTH}px`,
            minHeight: `${CERTIFICATE_HEIGHT}px`,
            maxHeight: `${CERTIFICATE_HEIGHT}px`,
            aspectRatio: "auto",
            margin: "0",
            transform: "none",
          });
          clonedCertificate.setAttribute("data-pdf-capture", "true");
        },
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
      setShareOpen(true);
    } catch (cause) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Certificate PDF generation failed:", cause);
      }
      setError(
        cause instanceof Error
          ? `PDF generation failed: ${cause.message}`
          : "PDF generation failed. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return <>
    <div className="flex min-w-0 flex-col items-end gap-2">
      <button
        type="button"
        aria-label={isGenerating ? "Creating certificate PDF" : "Download certificate PDF"}
        onClick={handleDownload}
        disabled={isGenerating}
        className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#173f2c] px-4 py-2 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 sm:px-6 sm:py-3 sm:text-base"
      >
        {isGenerating ? (
          <LoaderCircle className="animate-spin" size={17} />
        ) : (
          <Download size={17} />
        )}
        <span className="hidden min-[390px]:inline">{isGenerating ? "Creating PDF..." : "Download PDF"}</span>
      </button>
      {error && (
        <p role="alert" className="max-w-sm text-right text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
    <CertificateShareDialog
      open={shareOpen}
      onOpenChange={setShareOpen}
      roadmapTitle={roadmapTitle}
      roadmapDuration={roadmapDuration}
      viewerKey={viewerKey}
      isAdmin={isAdmin}
    />
  </>;
}
