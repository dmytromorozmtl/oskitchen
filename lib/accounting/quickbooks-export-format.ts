import type { PnlLine } from "@/services/accounting/restaurant-pnl-service";

export type QuickBooksInvoiceRow = {
  invoiceNumber: string;
  invoiceDate: Date;
  totalAmount: unknown;
  status: string;
  supplierName?: string | null;
};

export type QuickBooksSalesSummary = {
  orderCount: number;
  grossSales: number;
  periodStart: string;
  periodEnd: string;
};

const IIF_HEADERS = [
  "!TRNS\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO",
  "!SPL\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO",
  "!ENDTRNS",
] as const;

export function formatQuickBooksDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function balancedJournalIif(
  date: string,
  debitAccount: string,
  creditAccount: string,
  amount: number,
  memo: string,
): string[] {
  const abs = Math.round(Math.abs(amount) * 100) / 100;
  if (abs === 0) return [];
  return [
    `TRNS\tGENERAL JOURNAL\t${date}\t${debitAccount}\t\t\t${abs}\t\t${memo}`,
    `SPL\tGENERAL JOURNAL\t${date}\t${creditAccount}\t\t\t${-abs}\t\t${memo}`,
    "ENDTRNS",
  ];
}

/** Balanced GENERAL JOURNAL entries — one TRNS/SPL pair per P&L line. */
export function pnlLinesToQuickBooksIif(
  lines: PnlLine[],
  opts?: { date?: Date; memo?: string; offsetAccount?: string },
): string {
  const date = formatQuickBooksDate(opts?.date ?? new Date());
  const memo = opts?.memo ?? "OS Kitchen P&L export";
  const offset = opts?.offsetAccount ?? "Equity:Retained Earnings";
  const rows: string[] = [...IIF_HEADERS];

  for (const line of lines) {
    if (line.isSubtotal || line.actual === 0) continue;
    const isRevenue = line.key === "revenue";
    if (isRevenue) {
      rows.push(
        ...balancedJournalIif(date, offset, line.label, line.actual, `${memo} — ${line.label}`),
      );
    } else {
      rows.push(
        ...balancedJournalIif(date, line.label, offset, line.actual, `${memo} — ${line.label}`),
      );
    }
  }

  return rows.join("\n");
}

export function salesSummaryToQuickBooksIif(
  summary: QuickBooksSalesSummary,
  opts?: { date?: Date; salesAccount?: string; depositAccount?: string },
): string {
  const date = formatQuickBooksDate(opts?.date ?? new Date());
  const salesAccount = opts?.salesAccount ?? "Food & Beverage Sales";
  const depositAccount = opts?.depositAccount ?? "Undeposited Funds";
  const memo = `OS Kitchen sales ${summary.periodStart} — ${summary.periodEnd} (${summary.orderCount} orders)`;
  const rows: string[] = [...IIF_HEADERS];

  if (summary.grossSales > 0) {
    rows.push(
      ...balancedJournalIif(date, depositAccount, salesAccount, summary.grossSales, memo),
    );
  }

  return rows.join("\n");
}

export function quickBooksInvoicesToCsv(invoices: QuickBooksInvoiceRow[]): string {
  const header = "Invoice Number,Date,Supplier,Total,Status";
  const rows = invoices.map((i) => {
    const supplier = (i.supplierName ?? "").replace(/"/g, '""');
    return `"${i.invoiceNumber}",${i.invoiceDate.toISOString().slice(0, 10)},"${supplier}",${Number(i.totalAmount)},${i.status}`;
  });
  return [header, ...rows].join("\n");
}

export function salesSummaryToCsv(summary: QuickBooksSalesSummary): string {
  return [
    "Period Start,Period End,Order Count,Gross Sales",
    `${summary.periodStart},${summary.periodEnd},${summary.orderCount},${summary.grossSales}`,
  ].join("\n");
}
