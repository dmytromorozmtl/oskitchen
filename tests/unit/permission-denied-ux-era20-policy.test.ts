import { describe, expect, it } from "vitest";

import {
  PERMISSION_DENIED_UX_ERA20_ALL_WIRED_PAGE_PATHS,
  PERMISSION_DENIED_UX_ERA20_POLICY_ID,
  PERMISSION_DENIED_UX_ERA20_SPOTCHECK_SURFACES,
  PERMISSION_DENIED_UX_ERA20_WIRED_PAGE_PATHS,
} from "@/lib/ux/permission-denied-ux-era20-policy";

describe("permission-denied-ux-era20-policy", () => {
  it("extends era17+era19 wired pages with order hub and integration health", () => {
    expect(PERMISSION_DENIED_UX_ERA20_POLICY_ID).toBe(
      "era20-permission-denied-order-hub-integration-health-v1",
    );
    expect(PERMISSION_DENIED_UX_ERA20_WIRED_PAGE_PATHS).toContain(
      "app/dashboard/order-hub/page.tsx",
    );
    expect(PERMISSION_DENIED_UX_ERA20_WIRED_PAGE_PATHS).toContain(
      "app/dashboard/integration-health/page.tsx",
    );
    expect(PERMISSION_DENIED_UX_ERA20_SPOTCHECK_SURFACES).toEqual([
      "order_hub",
      "integration_health",
      "reports_hub",
      "inventory_operations",
    ]);
    expect(PERMISSION_DENIED_UX_ERA20_ALL_WIRED_PAGE_PATHS.length).toBeGreaterThan(10);
  });
});
