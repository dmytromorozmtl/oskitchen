import { describe, expect, it } from "vitest";

import {
  pnlLinesToQuickBooksIif,
  quickBooksInvoicesToCsv,
  salesSummaryToQuickBooksIif,
} from "@/lib/accounting/quickbooks-export-format";
import type { PnlLine } from "@/services/accounting/restaurant-pnl-service";

const SAMPLE_LINES: PnlLine[] = [
  { key: "revenue", label: "Food & beverage sales", actual: 10000, budget: 10000, variance: 0 },
  { key: "food_cost", label: "Food cost", actual: 3000, budget: 3000, variance: 0 },
  { key: "gross", label: "Gross profit", actual: 7000, budget: 7000, variance: 0, isSubtotal: true },
];

describe("quickbooks export format", () => {
  it("builds balanced IIF with TRNS/SPL/ENDTRNS per line", () => {
    const iif = pnlLinesToQuickBooksIif(SAMPLE_LINES, {
      date: new Date("2026-06-15"),
      memo: "Test export",
    });
    expect(iif).toContain("!TRNS");
    expect(iif).toContain("!SPL");
    expect(iif).toContain("!ENDTRNS");
    expect(iif.split("\n").filter((l) => l.startsWith("ENDTRNS")).length).toBe(2);
    expect(iif).toContain("Food & beverage sales");
    expect(iif).toContain("Food cost");
    expect(iif).not.toContain("Gross profit");
  });

  it("exports supplier invoices with supplier column", () => {
    const csv = quickBooksInvoicesToCsv([
      {
        invoiceNumber: "INV-1",
        invoiceDate: new Date("2026-06-01"),
        totalAmount: 150.5,
        status: "PENDING",
        supplierName: "Sysco",
      },
    ]);
    expect(csv).toContain("Supplier");
    expect(csv).toContain("INV-1");
    expect(csv).toContain("Sysco");
  });

  it("builds sales journal IIF from order summary", () => {
    const iif = salesSummaryToQuickBooksIif(
      {
        orderCount: 42,
        grossSales: 8500,
        periodStart: "2026-06-01",
        periodEnd: "2026-06-15",
      },
      { date: new Date("2026-06-15") },
    );
    expect(iif).toContain("8500");
    expect(iif).toContain("Food & Beverage Sales");
    expect(iif).toContain("42 orders");
  });
});
