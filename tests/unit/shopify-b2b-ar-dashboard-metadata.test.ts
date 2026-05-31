import { describe, expect, it } from "vitest";

import {
  buildB2bArCompanyRollups,
  buildB2bArDashboardSnapshot,
  b2bArDashboardRowsToCsv,
  computeB2bArHealthScore,
  filterDashboardRowsByBucket,
  incrementB2bArDashboardStats,
  resolveB2bArHealthLevel,
} from "@/lib/integrations/shopify-b2b-ar-dashboard-metadata";
import { buildB2bArAgingSnapshot } from "@/lib/integrations/shopify-b2b-ar-aging-metadata";
import {
  resolveB2bArDashboardEnabled,
} from "@/lib/commercial/shopify-market-b2b-ar-dashboard";

const row = {
  orderId: "order-1",
  invoiceNumber: "B2B-20260601-A1B2C3D4",
  invoiceId: "inv-1",
  companyName: "Office Lunch Co",
  poNumber: "PO-100",
  amountCents: 50000,
  openAmountCents: 50000,
  dueAt: "2026-06-01T00:00:00.000Z",
  daysPastDue: 45,
  bucket: "days_31_60" as const,
  customerEmail: "ap@office.com",
  customerName: "AP Team",
  lastReminderAt: null,
  reminderCount: 0,
  companyAccountId: "company-1",
  osMarketId: "us",
  externalOrderNumber: "#1042",
  kitchenPaymentStatus: "UNPAID",
  shopifyFinancialStatus: "PENDING",
  payPortalIssued: true,
  payPortalCheckoutStarted: false,
  collectionPriority: "high" as const,
  assignedCollector: "Alex",
};

describe("shopify-b2b-ar-dashboard-metadata", () => {
  it("computes health score and level", () => {
    const aging = buildB2bArAgingSnapshot([row]);
    const score = computeB2bArHealthScore(aging);
    expect(score).toBeLessThan(100);
    expect(resolveB2bArHealthLevel(score)).toMatch(/healthy|attention|critical/);
  });

  it("builds company rollups", () => {
    const companies = buildB2bArCompanyRollups([row], { "company-1": "Alex" });
    expect(companies).toHaveLength(1);
    expect(companies[0]?.openAmountCents).toBe(50000);
    expect(companies[0]?.assignedCollector).toBe("Alex");
  });

  it("builds dashboard snapshot with health metadata", () => {
    const aging = buildB2bArAgingSnapshot([row]);
    const snapshot = buildB2bArDashboardSnapshot({
      aging,
      rows: [row],
      collectorsByCompanyId: { "company-1": "Alex" },
    });
    expect(snapshot.companies).toHaveLength(1);
    expect(snapshot.healthScore).toBeGreaterThanOrEqual(0);
    expect(snapshot.shopifyMirrorCount).toBe(1);
  });

  it("exports csv rows", () => {
    const csv = b2bArDashboardRowsToCsv([row]);
    expect(csv).toContain("invoice_number");
    expect(csv).toContain("B2B-20260601-A1B2C3D4");
    expect(csv).toContain("Office Lunch Co");
  });

  it("filters rows by bucket", () => {
    const current = { ...row, bucket: "current" as const, daysPastDue: 0 };
    expect(filterDashboardRowsByBucket([row, current], "overdue")).toHaveLength(1);
    expect(filterDashboardRowsByBucket([row, current], "days_31_60")).toHaveLength(1);
  });

  it("increments dashboard stats", () => {
    const next = incrementB2bArDashboardStats(null, { views: 1, csvExports: 1 });
    expect(next.views).toBe(1);
    expect(next.csvExports).toBe(1);
  });

  it("defaults dashboard enabled unless explicitly false", () => {
    expect(resolveB2bArDashboardEnabled(undefined)).toBe(true);
    expect(resolveB2bArDashboardEnabled(false)).toBe(false);
  });
});
