import { prisma } from "@/lib/prisma";
import { supplierInvoiceListWhereForOwner } from "@/lib/scope/workspace-accounting-scope";
import {
  getRestaurantPnLStatement,
  type PnlPeriod,
} from "@/services/accounting/restaurant-pnl-service";

export function isQuickBooksConfigured(): boolean {
  return Boolean(process.env.QUICKBOOKS_CLIENT_ID?.trim());
}

export async function exportQuickBooksData(userId: string, period: "month" | "quarter" = "month") {
  const p = (period === "quarter" ? "quarter" : "month") as PnlPeriod;
  const { lines } = await getRestaurantPnLStatement(userId, p);
  const invoiceScope = await supplierInvoiceListWhereForOwner(userId);
  const invoices = await prisma.supplierInvoice.findMany({
    where: invoiceScope,
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  return { lines, invoices };
}

export function quickBooksPnlToIif(
  pnlLines: Awaited<ReturnType<typeof getRestaurantPnLStatement>>["lines"],
): string {
  const lines = ["!TRNS\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tMEMO"];
  for (const row of pnlLines) {
    lines.push(
      `TRNS\tGENERAL JOURNAL\t${new Date().toISOString().slice(0, 10)}\t${row.label}\t\t${row.actual}\tP&L export`,
    );
  }
  return lines.join("\n");
}

export function quickBooksInvoicesToCsv(
  invoices: Awaited<ReturnType<typeof exportQuickBooksData>>["invoices"],
): string {
  const header = "Invoice Number,Date,Total,Status";
  const rows = invoices.map(
    (i) =>
      `"${i.invoiceNumber}",${i.invoiceDate.toISOString().slice(0, 10)},${Number(i.totalAmount)},${i.status}`,
  );
  return [header, ...rows].join("\n");
}
