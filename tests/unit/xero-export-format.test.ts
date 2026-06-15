import { describe, expect, it } from "vitest";

import {
  pnlLinesToXeroJournalCsv,
  pnlLinesToXeroReportCsv,
  salesSummaryToXeroJournalCsv,
  xeroInvoicesToBillsCsv,
} from "@/lib/accounting/xero-export-format";
import type { PnlLine } from "@/services/accounting/restaurant-pnl-service";

const SAMPLE_LINES: PnlLine[] = [
  { key: "revenue", label: "Food & beverage sales", actual: 10000, budget: 10000, variance: 0 },
  { key: "food_cost", label: "Food cost", actual: 3000, budget: 3000, variance: 0 },
  { key: "gross", label: "Gross profit", actual: 7000, budget: 7000, variance: 0, isSubtotal: true },
];

describe("xero export format", () => {
  it("builds balanced manual journal CSV with debit/credit pairs", () => {
    const csv = pnlLinesToXeroJournalCsv(SAMPLE_LINES, {
      date: new Date("2026-06-15"),
      narration: "Test export",
    });
    expect(csv).toContain("*Narration,*Date,Description,*AccountCode,*TaxType,*LineAmount");
    expect(csv).toContain("Food & beverage sales");
    expect(csv).toContain("Food cost");
    expect(csv).not.toContain("Gross profit");
    const amounts = csv.match(/,-?\d+(\.\d+)?$/gm) ?? [];
    const sum = amounts.reduce((acc, m) => acc + Number(m.slice(1)), 0);
    expect(Math.round(sum * 100) / 100).toBe(0);
  });

  it("exports P&L report CSV with variance columns", () => {
    const csv = pnlLinesToXeroReportCsv(SAMPLE_LINES);
    expect(csv).toContain("Account,Actual,Budget,Variance");
    expect(csv).toContain("10000");
    expect(csv).toContain("3000");
  });

  it("exports supplier bills with contact and account code", () => {
    const csv = xeroInvoicesToBillsCsv([
      {
        contactName: "Sysco",
        invoiceNumber: "INV-1",
        invoiceDate: new Date("2026-06-01"),
        totalAmount: 150.5,
      },
    ]);
    expect(csv).toContain("*ContactName");
    expect(csv).toContain("Sysco");
    expect(csv).toContain("INV-1");
    expect(csv).toContain("310");
  });

  it("builds sales journal CSV from order summary", () => {
    const csv = salesSummaryToXeroJournalCsv(
      {
        orderCount: 42,
        grossSales: 8500,
        periodStart: "2026-06-01",
        periodEnd: "2026-06-15",
      },
      { date: new Date("2026-06-15") },
    );
    expect(csv).toContain("8500");
    expect(csv).toContain("Food & Beverage Sales");
    expect(csv).toContain("42 orders");
  });
});
