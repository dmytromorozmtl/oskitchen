"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildMultiLocationPdfRows } from "@/lib/analytics/multi-location-pdf-rows";
import type { MultiLocationAnalyticsSnapshot } from "@/services/analytics/multi-location-analytics";

type Props = {
  snapshot: MultiLocationAnalyticsSnapshot;
};

export function MultiLocationPdfExportButton({ snapshot }: Props) {
  async function exportPdf() {
    const { title, head, body } = buildMultiLocationPdfRows(snapshot);
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text(title, 40, 48);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("OS Kitchen multi-location report", 40, 66);
    doc.setTextColor(0);
    autoTable(doc, {
      startY: 84,
      head: [head],
      body,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [40, 106, 184] },
    });
    doc.save(`multi-location-report-${snapshot.rangeLabel.replace(/\s+/g, "-")}.pdf`);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-full"
      data-testid="multi-location-pdf-export"
      onClick={() => void exportPdf()}
    >
      <Download className="mr-1.5 h-4 w-4" aria-hidden />
      Export PDF
    </Button>
  );
}
