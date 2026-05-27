import { describe, expect, it } from "vitest";

import {
  assertProductionCronReconciliation,
  reconcileProductionCronState,
} from "@/services/cron/cron-reconciliation";

describe("production cron reconciliation (live repo)", () => {
  it("reconciles manifest, routes, archive, vercel.json, and production profile", () => {
    const report = reconcileProductionCronState();
    expect(() => assertProductionCronReconciliation(report)).not.toThrow();
    expect(report.ok).toBe(true);
    expect(report.routes.missingProductionRoutes).toEqual([]);
    expect(report.vercelJson.missingPaths).toEqual([]);
    expect(report.vercelJson.extraPaths).toEqual([]);
    expect(report.productionProfile.missingPaths).toEqual([]);
    expect(report.productionProfile.extraPaths).toEqual([]);
  });
});
