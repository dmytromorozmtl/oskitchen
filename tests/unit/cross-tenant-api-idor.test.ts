import { describe, expect, it } from "vitest";

import {
  CROSS_TENANT_API_IDOR_ROUTE_FAMILIES,
  resolveAuditExportWorkspaceId,
  runCrossTenantApiIdorContract,
} from "@/lib/qa/cross-tenant-api-idor-contract";
import { TENANT_A, TENANT_B } from "@/lib/qa/cross-tenant-isolation-contract";

describe("cross-tenant API IDOR contract (P0-6)", () => {
  it("covers orders, customers, finance, marketplace route families", () => {
    expect(CROSS_TENANT_API_IDOR_ROUTE_FAMILIES).toEqual([
      "orders",
      "customers",
      "finance",
      "marketplace",
    ]);
  });

  it("audit export never binds foreign workspaceId when not owned", () => {
    const ws = resolveAuditExportWorkspaceId({
      requestedWorkspaceId: TENANT_B.workspaceId,
      ownedWorkspaceIds: [TENANT_A.workspaceId],
    });
    expect(ws).toBe(TENANT_A.workspaceId);
    expect(ws).not.toBe(TENANT_B.workspaceId);
  });

  it("passes all API IDOR denial scenarios", () => {
    const scenarios = runCrossTenantApiIdorContract();
    expect(scenarios.length).toBeGreaterThanOrEqual(4);
    const failed = scenarios.filter((row) => !row.passed);
    expect(failed, failed.map((f) => f.detail).join("; ")).toEqual([]);
  });
});
