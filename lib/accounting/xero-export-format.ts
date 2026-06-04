import type { QuickBooksSalesSummary } from "@/lib/accounting/quickbooks-export-format";
import type { PnlLine } from "@/services/accounting/restaurant-pnl-service";

export type XeroBillRow = {
  contactName: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate?: Date;
  totalAmount: unknown;
  description?: string;
};

const JOURNAL_HEADER = "*Narration,*Date,Description,*AccountCode,*TaxType,*LineAmount" as const;
const BILLS_HEADER =
  "*ContactName,*InvoiceNumber,*InvoiceDate,*DueDate,Description,*Quantity,*UnitAmount,*AccountCode,*TaxType" as const;
const PNL_REPORT_HEADER = "Account,Actual,Budget,Variance" as const;

export function formatXeroDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function escapeCsv(value: string): string {
  return value.replace(/"/g, '""');
}

function journalRow(
  narration: string,
  date: string,
  description: string,
  accountCode: string,
  lineAmount: number,
): string {
  const amount = Math.round(lineAmount * 100) / 100;
  return `"${escapeCsv(narration)}",${date},"${escapeCsv(description)}","${escapeCsv(accountCode)}","Tax Exempt (0%)",${amount}`;
}

/** Balanced manual journal CSV — one debit/credit pair per P&L line (Xero import template). */
export function pnlLinesToXeroJournalCsv(
  lines: PnlLine[],
  opts?: { date?: Date; narration?: string; offsetAccount?: string },
): string {
  const date = formatXeroDate(opts?.date ?? new Date());
  const narration = opts?.narration ?? "OS Kitchen P&L export";
  const offset = opts?.offsetAccount ?? "Retained Earnings";
  const rows: string[] = [JOURNAL_HEADER];

  for (const line of lines) {
    if (line.isSubtotal || line.actual === 0) continue;
    const abs = Math.round(Math.abs(line.actual) * 100) / 100;
    const isRevenue = line.key === "revenue";
    if (isRevenue) {
      rows.push(journalRow(narration, date, line.label, offset, abs));
      rows.push(journalRow(narration, date, line.label, line.label, -abs));
    } else {
      rows.push(journalRow(narration, date, line.label, line.label, abs));
      rows.push(journalRow(narration, date, line.label, offset, -abs));
    }
  }

  return rows.join("\n");
}

export function pnlLinesToXeroReportCsv(lines: PnlLine[]): string {
  const rows = lines.map(
    (l) => `"${escapeCsv(l.label)}",${l.actual},${l.budget},${l.variance}`,
  );
  return [PNL_REPORT_HEADER, ...rows].join("\n");
}

export function salesSummaryToXeroJournalCsv(
  summary: QuickBooksSalesSummary,
  opts?: { date?: Date; salesAccount?: string; depositAccount?: string },
): string {
  const date = formatXeroDate(opts?.date ?? new Date());
  const salesAccount = opts?.salesAccount ?? "Food & Beverage Sales";
  const depositAccount = opts?.depositAccount ?? "Undeposited Funds";
  const narration = `OS Kitchen sales ${summary.periodStart} — ${summary.periodEnd} (${summary.orderCount} orders)`;
  const rows: string[] = [JOURNAL_HEADER];

  if (summary.grossSales > 0) {
    const abs = Math.round(summary.grossSales * 100) / 100;
    rows.push(journalRow(narration, date, "Gross sales", depositAccount, abs));
    rows.push(journalRow(narration, date, "Gross sales", salesAccount, -abs));
  }

  return rows.join("\n");
}

export function salesSummaryToXeroCsv(summary: QuickBooksSalesSummary): string {
  return [
    "Period Start,Period End,Order Count,Gross Sales",
    `${summary.periodStart},${summary.periodEnd},${summary.orderCount},${summary.grossSales}`,
  ].join("\n");
}

/** Xero ACCPAY (bills) import CSV for supplier invoices. */
export function xeroInvoicesToBillsCsv(invoices: XeroBillRow[]): string {
  const rows = invoices.map((i) => {
    const contact = escapeCsv(i.contactName ?? "");
    const invDate = formatXeroDate(i.invoiceDate);
    const due = formatXeroDate(i.dueDate ?? i.invoiceDate);
    const desc = escapeCsv(i.description ?? "Supplier invoice");
    const amount = Math.round(Number(i.totalAmount) * 100) / 100;
    return `"${contact}","${i.invoiceNumber}",${invDate},${due},"${desc}",1,${amount},"310","Tax Exempt (0%)"`;
  });
  return [BILLS_HEADER, ...rows].join("\n");
}
