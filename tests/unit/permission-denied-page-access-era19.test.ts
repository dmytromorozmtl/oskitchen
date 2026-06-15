import { describe, expect, it } from "vitest";

import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import {
  hasPackingManagePageAccess,
  hasProductionManagePageAccess,
  resolvePackingDeniedSurfaceId,
  resolveProductionDeniedSurfaceId,
  PERMISSION_DENIED_PAGE_ACCESS_ERA19_POLICY_ID,
} from "@/lib/ux/permission-denied-page-access-era19";
import { resolvePermissionDeniedSurface } from "@/lib/ux/permission-denied-copy";

function actorWith(permissions: PermissionKey[]) {
  return {
    granted: new Set(permissions),
  } as Parameters<typeof hasPackingManagePageAccess>[0];
}

describe("permission-denied-page-access-era19", () => {
  it("registers era19 page access policy", () => {
    expect(PERMISSION_DENIED_PAGE_ACCESS_ERA19_POLICY_ID).toBe(
      "era19-permission-denied-page-access-v1",
    );
  });

  it("checks packing.manage for packing pages", () => {
    expect(hasPackingManagePageAccess(actorWith(["packing.manage"]))).toBe(true);
    expect(hasPackingManagePageAccess(actorWith(["kitchen.view"]))).toBe(false);
    expect(hasPermission(actorWith(["packing.manage"]).granted, "packing.manage")).toBe(true);
  });

  it("checks production.manage for production pages", () => {
    expect(hasProductionManagePageAccess(actorWith(["production.manage"]))).toBe(true);
    expect(hasProductionManagePageAccess(actorWith(["kitchen.view"]))).toBe(false);
  });

  it("maps packing sub-routes to denial surfaces", () => {
    expect(resolvePackingDeniedSurfaceId("command")).toBe("packing_command");
    expect(resolvePackingDeniedSurfaceId("verify")).toBe("packing_verify");
    expect(resolvePackingDeniedSurfaceId("scanner")).toBe("packing_command");
    expect(resolvePackingDeniedSurfaceId("reports")).toBe("packing_command");
  });

  it("maps production sub-routes to denial surfaces", () => {
    expect(resolveProductionDeniedSurfaceId("calendar")).toBe("production_calendar");
    expect(resolveProductionDeniedSurfaceId("board")).toBe("production_board");
    expect(resolveProductionDeniedSurfaceId("templates")).toBe("production_board");
    expect(resolveProductionDeniedSurfaceId("batch")).toBe("production_board");
  });

  it("avoids packing verify denial recovery loop back into gated packing routes", () => {
    const verify = resolvePermissionDeniedSurface("packing_verify");
    expect(verify.primaryHref).toBe("/dashboard/today");
    expect(verify.primaryHref).not.toBe("/dashboard/packing");
    expect(verify.secondaryHref).not.toBe("/dashboard/packing");
  });
});
