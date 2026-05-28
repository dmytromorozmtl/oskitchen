import { describe, expect, it } from "vitest";

import type { PermissionKey } from "@/lib/permissions/permissions";
import {
  hasIntegrationHealthPageAccess,
  hasInventoryOperationsPageAccess,
  hasLaunchWizardPageAccess,
  hasOrderHubPageAccess,
  hasReportsHubPageAccess,
} from "@/lib/ux/permission-denied-page-access-era19";
import { resolvePermissionDeniedSurface } from "@/lib/ux/permission-denied-copy";
import { PERMISSION_DENIED_UX_ERA20_POLICY_ID } from "@/lib/ux/permission-denied-ux-era20-policy";

function actorWith(permissions: PermissionKey[]) {
  return {
    granted: new Set(permissions),
  } as Parameters<typeof hasOrderHubPageAccess>[0];
}

describe("permission-denied-page-access-era20", () => {
  it("locks era20 policy id", () => {
    expect(PERMISSION_DENIED_UX_ERA20_POLICY_ID).toBe(
      "era20-permission-denied-order-hub-integration-health-v1",
    );
  });

  it("requires orders.manage for order hub", () => {
    expect(hasOrderHubPageAccess(actorWith(["orders.manage"]))).toBe(true);
    expect(hasOrderHubPageAccess(actorWith(["kitchen.view"]))).toBe(false);
    expect(hasOrderHubPageAccess(actorWith(["integrations.read"]))).toBe(false);
  });

  it("allows integrations.read or manage for integration health", () => {
    expect(hasIntegrationHealthPageAccess(actorWith(["integrations.read"]))).toBe(true);
    expect(hasIntegrationHealthPageAccess(actorWith(["integrations.manage"]))).toBe(true);
    expect(hasIntegrationHealthPageAccess(actorWith(["kitchen.view"]))).toBe(false);
  });

  it("routes denied order hub users to Today not back into order hub", () => {
    const surface = resolvePermissionDeniedSurface("order_hub");
    expect(surface.primaryHref).toBe("/dashboard/today");
    expect(surface.primaryHref).not.toContain("order-hub");
  });

  it("routes denied integration health users to safe recovery paths", () => {
    const surface = resolvePermissionDeniedSurface("integration_health");
    expect(surface.primaryHref).toBe("/dashboard/today");
    expect(surface.secondaryHref).toBe("/dashboard/sales-channels/connected");
  });

  it("requires any reports.read permission for reports hub", () => {
    expect(hasReportsHubPageAccess(actorWith(["reports.read.operations"]))).toBe(true);
    expect(hasReportsHubPageAccess(actorWith(["reports.read.financial"]))).toBe(true);
    expect(hasReportsHubPageAccess(actorWith(["kitchen.view"]))).toBe(false);
  });

  it("requires production.manage for inventory section", () => {
    expect(hasInventoryOperationsPageAccess(actorWith(["production.manage"]))).toBe(true);
    expect(hasInventoryOperationsPageAccess(actorWith(["packing.manage"]))).toBe(false);
  });

  it("routes denied reports users to Today", () => {
    const surface = resolvePermissionDeniedSurface("reports_hub");
    expect(surface.primaryHref).toBe("/dashboard/today");
  });

  it("requires owner or workspace.view for launch wizard", () => {
    const ownerActor = {
      workspaceRole: "OWNER",
      granted: new Set<PermissionKey>(),
    } as Parameters<typeof hasLaunchWizardPageAccess>[0];
    expect(hasLaunchWizardPageAccess(ownerActor)).toBe(true);
    expect(hasLaunchWizardPageAccess(actorWith(["workspace.view"]))).toBe(true);
    expect(hasLaunchWizardPageAccess(actorWith(["kitchen.view"]))).toBe(false);
  });

  it("routes denied launch wizard users to Today", () => {
    const surface = resolvePermissionDeniedSurface("launch_wizard");
    expect(surface.primaryHref).toBe("/dashboard/today");
    expect(surface.secondaryHref).toBe("/dashboard/implementation");
  });
});
