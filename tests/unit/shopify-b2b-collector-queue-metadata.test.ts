import { describe, expect, it } from "vitest";

import { DEFAULT_B2B_COLLECTOR_SLA_DAYS } from "@/lib/commercial/shopify-market-b2b-collector-queue";
import {
  buildB2bCollectorQueueSnapshot,
  buildB2bCollectorTaskFromCompany,
  incrementB2bCollectorQueueStats,
  isB2bCollectorSlaBreached,
  resolveB2bCollectorTaskPriority,
  syncB2bCollectorTasks,
} from "@/lib/integrations/shopify-b2b-collector-queue-metadata";
import type { B2bArCompanyRollup, B2bArDashboardRow } from "@/lib/integrations/shopify-b2b-ar-dashboard-metadata";

const company: B2bArCompanyRollup = {
  companyKey: "company-1",
  companyName: "Office Lunch Co",
  companyAccountId: "company-1",
  openInvoices: 2,
  openAmountCents: 120000,
  overdueInvoices: 2,
  maxDaysPastDue: 50,
  assignedCollector: "Alex",
  bucketCounts: { current: 0, days_0_30: 0, days_31_60: 2, days_61_plus: 0 },
};

const row: B2bArDashboardRow = {
  orderId: "order-1",
  invoiceNumber: "B2B-001",
  invoiceId: "inv-1",
  companyName: "Office Lunch Co",
  poNumber: "PO-1",
  amountCents: 60000,
  openAmountCents: 60000,
  dueAt: "2026-05-01T00:00:00.000Z",
  daysPastDue: 50,
  bucket: "days_31_60",
  customerEmail: "ap@office.com",
  customerName: "AP",
  lastReminderAt: null,
  reminderCount: 0,
  companyAccountId: "company-1",
  osMarketId: "us",
  externalOrderNumber: "#1001",
  kitchenPaymentStatus: "UNPAID",
  shopifyFinancialStatus: "PENDING",
  paymentStatusDrift: false,
  payPortalIssued: true,
  payPortalCheckoutStarted: false,
  collectionPriority: "high",
  assignedCollector: "Alex",
};

describe("shopify-b2b-collector-queue-metadata", () => {
  it("detects SLA breach when max past due exceeds threshold", () => {
    expect(isB2bCollectorSlaBreached(50, DEFAULT_B2B_COLLECTOR_SLA_DAYS)).toBe(true);
    expect(isB2bCollectorSlaBreached(30, DEFAULT_B2B_COLLECTOR_SLA_DAYS)).toBe(false);
  });

  it("builds collector task with priority and breach flags", () => {
    const task = buildB2bCollectorTaskFromCompany({
      company,
      rows: [row],
      assignee: "Alex",
      slaByCompany: null,
      defaultSlaDays: DEFAULT_B2B_COLLECTOR_SLA_DAYS,
      existing: null,
      nowMs: Date.parse("2026-06-01T12:00:00.000Z"),
      nowIso: "2026-06-01T12:00:00.000Z",
    });
    expect(task?.slaBreached).toBe(true);
    expect(task?.priority).toBe("critical");
    expect(task?.assignee).toBe("Alex");
  });

  it("syncs tasks from company rollups and preserves done tasks without overdue", () => {
    const existing = buildB2bCollectorTaskFromCompany({
      company: { ...company, overdueInvoices: 0 },
      rows: [],
      assignee: "Alex",
      slaByCompany: null,
      defaultSlaDays: DEFAULT_B2B_COLLECTOR_SLA_DAYS,
      existing: null,
      nowMs: Date.now(),
      nowIso: new Date().toISOString(),
    });
    const { tasks, created } = syncB2bCollectorTasks({
      companies: [company],
      rows: [row],
      collectorsByCompanyId: { "company-1": "Alex" },
      slaByCompany: null,
      defaultSlaDays: DEFAULT_B2B_COLLECTOR_SLA_DAYS,
      existingTasks: existing ? [{ ...existing, status: "done", taskId: "company-1" }] : [],
    });
    expect(created).toBeGreaterThanOrEqual(0);
    expect(tasks.some((task) => task.taskId === "company-1" && task.status === "open")).toBe(true);
  });

  it("builds queue snapshot with breach counts", () => {
    const task = buildB2bCollectorTaskFromCompany({
      company,
      rows: [row],
      assignee: "Alex",
      slaByCompany: null,
      defaultSlaDays: DEFAULT_B2B_COLLECTOR_SLA_DAYS,
      existing: null,
      nowMs: Date.now(),
      nowIso: new Date().toISOString(),
    })!;
    const snapshot = buildB2bCollectorQueueSnapshot([task]);
    expect(snapshot.openCount).toBe(1);
    expect(snapshot.slaBreachedCount).toBe(1);
  });

  it("increments collector queue stats", () => {
    const next = incrementB2bCollectorQueueStats(null, { syncRuns: 1, digestsSent: 1 });
    expect(next.syncRuns).toBe(1);
    expect(next.digestsSent).toBe(1);
  });

  it("escalates priority when payment drift exists", () => {
    const priority = resolveB2bCollectorTaskPriority({
      maxDaysPastDue: 10,
      slaBreached: false,
      paymentDriftCount: 1,
      bucket61Plus: 0,
    });
    expect(priority).toBe("high");
  });
});
