import { buildScheduledReportPdfRows } from "@/lib/analytics/scheduled-reports-p2-48-measurement";
import type { ReportResult } from "@/services/reports/report-service";

export async function buildScheduledReportPdfAttachment(
  result: ReportResult,
): Promise<{ filename: string; content: string }> {
  const detailHead = result.columns.map((c) => c.label);
  const detailRows = result.rows.slice(0, 40).map((row) =>
    result.columns.map((c) => {
      const value = (row as Record<string, unknown>)[c.key];
      if (value == null) return "—";
      return typeof value === "number" ? value : String(value);
    }),
  );

  const pdfRows = buildScheduledReportPdfRows({
    title: result.definition.title,
    rangeLabel: result.rangeLabel,
    summary: result.summary,
    detailHead,
    detailRows,
  });

  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  doc.setFontSize(16);
  doc.text(pdfRows.title, 40, 48);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(pdfRows.subtitle, 40, 66);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 84,
    head: [pdfRows.summaryHead],
    body: pdfRows.summaryBody,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [40, 106, 184] },
  });

  const summaryEndY =
    (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 140;

  autoTable(doc, {
    startY: summaryEndY + 24,
    head: [pdfRows.detailHead],
    body: pdfRows.detailBody,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [55, 65, 81] },
  });

  const stamp = new Date().toISOString().slice(0, 10);
  const safeKey = result.definition.key.replace(/[^a-z0-9_]/gi, "_");
  const arrayBuffer = doc.output("arraybuffer");
  const content = Buffer.from(arrayBuffer).toString("base64");

  return {
    filename: `${safeKey}_weekly_${stamp}.pdf`,
    content,
  };
}
