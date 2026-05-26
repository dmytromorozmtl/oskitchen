import { describe, expect, it } from "vitest";

import { parsePrismaMigrateStatus } from "@/lib/beta-launch/prisma-migrate-status";

describe("parsePrismaMigrateStatus", () => {
  it("detects up to date", () => {
    const r = parsePrismaMigrateStatus("Database schema is up to date!");
    expect(r.ok).toBe(true);
    expect(r.pendingCount).toBe(0);
  });

  it("flags pending remediation migrations", () => {
    const r = parsePrismaMigrateStatus(`
The following migrations have not yet been applied:
20260517120000_workspace_phase1_order_menu_product
20260517140000_workspace_phase2_integration_webhook
`);
    expect(r.pendingRemediation.length).toBeGreaterThan(0);
    expect(r.ok).toBe(false);
  });
});
