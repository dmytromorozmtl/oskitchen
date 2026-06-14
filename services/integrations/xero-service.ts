import {
  salesSummaryToXeroCsv,
  salesSummaryToXeroJournalCsv,
  pnlLinesToXeroJournalCsv,
  pnlLinesToXeroReportCsv,
  xeroInvoicesToBillsCsv,
  type XeroBillRow,
} from "@/lib/accounting/xero-export-format";
import {
  exportQuickBooksData,
  type QuickBooksExportPeriod,
  type QuickBooksExportPayload,
} from "@/services/integrations/quickbooks-service";

export type XeroExportPeriod = QuickBooksExportPeriod;
export type XeroExportPayload = QuickBooksExportPayload;

export function isXeroConfigured(): boolean {
  return Boolean(process.env.XERO_CLIENT_ID?.trim());
}

export async function exportXeroData(
  userId: string,
  period: XeroExportPeriod = "month",
): Promise<XeroExportPayload> {
  return exportQuickBooksData(userId, period);
}

export function xeroPnlToJournalCsv(
  pnlLines: XeroExportPayload["lines"],
  opts?: { periodEnd?: Date },
): string {
  return pnlLinesToXeroJournalCsv(pnlLines, {
    date: opts?.periodEnd ?? new Date(),
    narration: "OS Kitchen P&L export",
  });
}

export function xeroPnlToCsv(pnlLines: XeroExportPayload["lines"]): string {
  return pnlLinesToXeroReportCsv(pnlLines);
}

export function xeroInvoicesToCsv(
  invoices: XeroExportPayload["invoices"],
): string {
  const rows: XeroBillRow[] = invoices.map((i) => ({
    contactName: i.supplier?.name ?? "Supplier",
    invoiceNumber: i.invoiceNumber,
    invoiceDate: i.invoiceDate,
    dueDate: i.dueDate ?? undefined,
    totalAmount: i.totalAmount,
    description: `Invoice ${i.invoiceNumber}`,
  }));
  return xeroInvoicesToBillsCsv(rows);
}

export { salesSummaryToXeroCsv, salesSummaryToXeroJournalCsv };
