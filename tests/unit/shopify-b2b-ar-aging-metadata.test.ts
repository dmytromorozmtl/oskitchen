import { describe, expect, it } from "vitest";

import {
  assignB2bArAgingBucket,
  buildB2bArAgingRow,
  buildB2bArAgingSnapshot,
  computeB2bInvoiceDaysPastDue,
  incrementB2bArAgingStats,
  patchInvoiceDraftReminderSent,
  snapshotToB2bArAgingStats,
} from "@/lib/integrations/shopify-b2b-ar-aging-metadata";
import { resolveB2bArReminderEnabled } from "@/lib/commercial/shopify-market-b2b-ar-aging";

const draft = {
  invoiceId: "inv-1",
  invoiceNumber: "B2B-20260601-A1B2C3D4",
  status: "draft" as const,
  amountCents: 50000,
  currency: "usd",
  dueAt: "2026-06-01T02:00:00.000Z",
  generatedAt: "2026-05-15T03:00:00.000Z",
  paymentTermsLabel: "Net 30",
  poNumber: "PO-100",
  companyName: "Office Lunch Co",
};

describe("shopify-b2b-ar-aging-metadata", () => {
  it("assigns aging buckets by days past due", () => {
    expect(assignB2bArAgingBucket(0)).toBe("current");
    expect(assignB2bArAgingBucket(15)).toBe("days_0_30");
    expect(assignB2bArAgingBucket(45)).toBe("days_31_60");
    expect(assignB2bArAgingBucket(90)).toBe("days_61_plus");
  });

  it("computes days past due from due date", () => {
    const nowMs = new Date("2026-07-01T02:00:00.000Z").getTime();
    expect(computeB2bInvoiceDaysPastDue(draft, nowMs)).toBe(30);
  });

  it("builds aging rows for open invoices", () => {
    const nowMs = new Date("2026-07-01T03:00:00.000Z").getTime();
    const row = buildB2bArAgingRow({
      orderId: "order-1",
      customerEmail: "ap@office.com",
      customerName: "AP Team",
      draft,
      nowMs,
    });
    expect(row?.bucket).toBe("days_0_30");
    expect(row?.daysPastDue).toBe(30);
    expect(row?.openAmountCents).toBe(50000);
  });

  it("aggregates snapshot bucket counts and amounts", () => {
    const rows = [
      buildB2bArAgingRow({
        orderId: "o1",
        customerEmail: "a@test.com",
        customerName: "A",
        draft,
        nowMs: new Date("2026-08-01T00:00:00.000Z").getTime(),
      })!,
      buildB2bArAgingRow({
        orderId: "o2",
        customerEmail: "b@test.com",
        customerName: "B",
        draft: { ...draft, invoiceId: "inv-2", amountCents: 10000, dueAt: "2026-04-01T00:00:00.000Z" },
        nowMs: new Date("2026-08-01T00:00:00.000Z").getTime(),
      })!,
    ];
    const snapshot = buildB2bArAgingSnapshot(rows);
    expect(snapshot.openTotal).toBe(2);
    expect(snapshot.buckets.days_61_plus).toBeGreaterThanOrEqual(1);
    expect(snapshotToB2bArAgingStats(snapshot).bucket61Plus).toBe(snapshot.buckets.days_61_plus);
  });

  it("patches reminder metadata on invoice draft", () => {
    const next = patchInvoiceDraftReminderSent(draft, "2026-07-01T12:00:00.000Z");
    expect(next.reminderCount).toBe(1);
    expect(next.lastReminderAt).toBe("2026-07-01T12:00:00.000Z");
  });

  it("defaults reminder enabled unless explicitly false", () => {
    expect(resolveB2bArReminderEnabled(undefined)).toBe(true);
    expect(resolveB2bArReminderEnabled(false)).toBe(false);
  });

  it("increments aging stats", () => {
    const next = incrementB2bArAgingStats(null, {
      bucket0_30: 2,
      remindersSent: 1,
    });
    expect(next.bucket0_30).toBe(2);
    expect(next.remindersSent).toBe(1);
  });
});
