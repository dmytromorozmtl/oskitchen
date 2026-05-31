import { describe, expect, it } from "vitest";

import {
  CRON_SURFACE_ERA14_ACTIVE_ROUTE_COUNT,
  CRON_SURFACE_ERA14_EXPERIMENTAL_ON_DISK_MAX,
  CRON_SURFACE_ERA14_EXTENDS_POLICIES,
  CRON_SURFACE_ERA14_POLICY_ID,
} from "@/lib/cron/cron-surface-era14-policy";
import { validateCronRouteInventory } from "@/services/cron/cron-route-inventory-validation";

describe("cron surface era14 policy", () => {
  it("locks era14 cron surface recert policy id", () => {
    expect(CRON_SURFACE_ERA14_POLICY_ID).toBe("era14-cron-surface-recert-v1");
    expect(CRON_SURFACE_ERA14_EXTENDS_POLICIES).toContain("era4-active-production-only-v1");
    expect(CRON_SURFACE_ERA14_EXTENDS_POLICIES).toContain("era9-cron-surface-recert-v1");
    expect(CRON_SURFACE_ERA14_ACTIVE_ROUTE_COUNT).toBe(19);
    expect(CRON_SURFACE_ERA14_EXPERIMENTAL_ON_DISK_MAX).toBe(0);
  });

  it("recertifies inventory: 19 production, zero experimental on disk", () => {
    const report = validateCronRouteInventory();
    expect(report.ok).toBe(true);
    expect(report.productionOnDisk).toBe(CRON_SURFACE_ERA14_ACTIVE_ROUTE_COUNT);
    expect(report.experimentalOnDisk).toBeLessThanOrEqual(
      CRON_SURFACE_ERA14_EXPERIMENTAL_ON_DISK_MAX,
    );
    expect(report.archivedRoutes).toBeGreaterThanOrEqual(121);
  });
});
