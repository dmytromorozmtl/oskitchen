import { describe, expect, it } from "vitest";

import type { PermissionKey } from "@/lib/permissions/permissions";
import {
  hasBillingHubPageAccess,
  hasCrmCustomersPageAccess,
  hasGoLiveHubPageAccess,
  hasImplementationHubPageAccess,
  hasStaffHubPageAccess,
} from "@/lib/ux/permission-denied-page-access-era19";
import { resolvePermissionDeniedSurface } from "@/lib/ux/permission-denied-copy";
import { PERMISSION_DENIED_UX_ERA20_CYCLE10_POLICY_ID } from "@/lib/ux/permission-denied-ux-era20-cycle10-policy";

function actorWith(permissions: PermissionKey[]) {
  return {
    granted: new Set(permissions),
    platformBypass: false,
    workspaceRole: "STAFF" as const,
  } as Parameters<typeof hasCrmCustomersPageAccess>[0];
}

describe("permission-denied-page-access-era20-cycle10", () => {
  it("locks era20 cycle10 policy id", () => {
    expect(PERMISSION_DENIED_UX_ERA20_CYCLE10_POLICY_ID).toBe(
      "era20-permission-denied-pilot-hubs-cycle10-v1",
    );
  });

  it("requires customers.read or manage for CRM hub", () => {
    expect(hasCrmCustomersPageAccess(actorWith(["customers.read"]))).toBe(true);
    expect(hasCrmCustomersPageAccess(actorWith(["customers.manage"]))).toBe(true);
    expect(hasCrmCustomersPageAccess(actorWith(["kitchen.view"]))).toBe(false);
  });

  it("requires staff.manage or owner for staff hub", () => {
    const ownerScope = { isOwner: true, role: "owner" };
    expect(hasStaffHubPageAccess(actorWith([]), ownerScope)).toBe(true);
    expect(hasStaffHubPageAccess(actorWith(["staff.manage"]), { isOwner: false, role: "viewer" })).toBe(
      true,
    );
    expect(
      hasStaffHubPageAccess(actorWith(["kitchen.view"]), {
        isOwner: false,
        role: "unknown_role",
      }),
    ).toBe(false);
  });

  it("requires workspace.view and go-live role grant for go-live hub", () => {
    expect(
      hasGoLiveHubPageAccess(actorWith(["workspace.view"]), {
        isOwner: false,
        role: "manager",
      }),
    ).toBe(true);
    expect(
      hasGoLiveHubPageAccess(actorWith(["kitchen.view"]), {
        isOwner: false,
        role: "manager",
      }),
    ).toBe(false);
  });

  it("allows owner implementation scope", () => {
    expect(hasImplementationHubPageAccess({ isOwner: true, role: "owner" })).toBe(true);
    expect(hasImplementationHubPageAccess({ isOwner: false, role: "unknown_role" })).toBe(false);
  });

  it("requires billing.view grant for billing hub helper", () => {
    expect(
      hasBillingHubPageAccess(actorWith(["billing.view"]), { isOwner: false }),
    ).toBe(true);
    expect(
      hasBillingHubPageAccess(actorWith(["kitchen.view"]), { isOwner: false }),
    ).toBe(false);
  });

  it("routes denied CRM users to Today not customers list", () => {
    const surface = resolvePermissionDeniedSurface("crm_customers");
    expect(surface.primaryHref).toBe("/dashboard/today");
    expect(surface.primaryHref).not.toContain("/customers");
  });
});
