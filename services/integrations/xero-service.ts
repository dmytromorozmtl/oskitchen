import { exportQuickBooksData, quickBooksInvoicesToCsv } from "@/services/integrations/quickbooks-service";

export function isXeroConfigured(): boolean {
  return Boolean(process.env.XERO_CLIENT_ID?.trim());
}

export async function exportXeroData(userId: string, period: "month" | "quarter" = "month") {
  return exportQuickBooksData(userId, period);
}

export function xeroPnlToCsv(
  pnlLines: Awaited<ReturnType<typeof exportXeroData>>["lines"],
): string {
  const header = "Account,Actual,Budget,Variance";
  const rows = pnlLines.map(
    (l) => `"${l.label}",${l.actual},${l.budget},${l.variance}`,
  );
  return [header, ...rows].join("\n");
}

export function xeroInvoicesToCsv(
  invoices: Awaited<ReturnType<typeof exportXeroData>>["invoices"],
): string {
  return quickBooksInvoicesToCsv(invoices);
}
