import { describe, expect, it } from "vitest";

import {
  buildB2bArAutoReminderSummary,
  buildB2bArCreditLimitRows,
} from "@/lib/integrations/shopify-b2b-credit-limit-metadata";
import type { B2bArCompanyRollup } from "@/lib/integrations/shopify-b2b-ar-dashboard-metadata";

const company: B2bArCompanyRollup = {
  companyKey: "co-1",
  companyName: "Wholesale Foods",
  companyAccountId: "co-1",
  openInvoices: 2,
  openAmountCents: 90000,
  overdueInvoices: 1,
  maxDaysPastDue: 14,
  assignedCollector: null,
  bucketCounts: { current: 1, days_0_30: 1, days_31_60: 0, days_61_plus: 0 },
};

describe("shopify b2b credit limit metadata", () => {
  it("computes utilization and blocked status", () => {
    const rows = buildB2bArCreditLimitRows([company], {
      "co-1": { limitCents: 100000 },
    });
    expect(rows[0]?.utilizationPct).toBe(90);
    expect(rows[0]?.status).toBe("warning");
  });

  it("flags over-limit companies", () => {
    const rows = buildB2bArCreditLimitRows([company], {
      "co-1": { limitCents: 80000 },
    });
    expect(rows[0]?.status).toBe("blocked");
    expect(rows[0]?.headroomCents).toBe(0);
  });

  it("builds auto-reminder summary with cadence defaults", () => {
    const summary = buildB2bArAutoReminderSummary({
      reminderEnabled: true,
      autoDunningEnabled: true,
      operatorDigestEnabled: false,
      cadenceDays: null,
      lastRunAt: "2026-05-01T00:00:00.000Z",
      lastReminderAt: null,
      dunningStats: { autoRemindersSent: 5, digestsSent: 2 },
    });
    expect(summary.cadenceDays).toEqual([7, 14, 21]);
    expect(summary.autoRemindersSent).toBe(5);
    expect(summary.nextEligibleAt).toBeTruthy();
  });
});
