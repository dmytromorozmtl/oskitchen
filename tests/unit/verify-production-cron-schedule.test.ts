import { describe, expect, it } from "vitest";

import {
  P0_CRITICAL_CRON_SLUGS,
  verifyProductionCronScheduleLocal,
} from "@/lib/cron/verify-production-cron-schedule";
import { PRODUCTION_CRON_SCHEDULES } from "@/services/cron/production-manifest";

describe("verify production cron schedule (P0-1)", () => {
  it("lists the five P0 critical crons with manifest schedules", () => {
    expect(P0_CRITICAL_CRON_SLUGS).toEqual([
      "webhook-jobs",
      "storefront-edge-sync",
      "doordash-sync",
      "grubhub-sync",
      "kds-overdue-alerts",
    ]);
    for (const slug of P0_CRITICAL_CRON_SLUGS) {
      expect(PRODUCTION_CRON_SCHEDULES[slug]).toBeTruthy();
    }
  });

  it("passes local reconciliation for vercel.json and critical crons", () => {
    const report = verifyProductionCronScheduleLocal();
    expect(report.ok).toBe(true);
    expect(report.failures).toEqual([]);
    expect(report.criticalCrons.every((row) => row.inVercelJson && row.scheduleMatch)).toBe(true);
    expect(report.reconciliation.ok).toBe(true);
  });
});
