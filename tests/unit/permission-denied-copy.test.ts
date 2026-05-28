import { describe, expect, it } from "vitest";

import {
  buildPermissionDeniedDescription,
  resolvePermissionDeniedSurface,
} from "@/lib/ux/permission-denied-copy";

describe("permission denied copy", () => {
  it("builds description with permission key", () => {
    expect(buildPermissionDeniedDescription("pos.access")).toContain("pos.access");
  });

  it("resolves POS terminal surface", () => {
    const surface = resolvePermissionDeniedSurface("pos_terminal");
    expect(surface.title).toBe("POS terminal");
    expect(surface.permissionKey).toBe("pos.access");
    expect(surface.primaryHref).toBe("/dashboard/pos");
  });

  it("resolves KDS surface", () => {
    const surface = resolvePermissionDeniedSurface("kds");
    expect(surface.permissionKey).toBe("kitchen.view");
  });

  it("resolves packing command surface", () => {
    const surface = resolvePermissionDeniedSurface("packing_command");
    expect(surface.permissionKey).toBe("packing.manage");
    expect(surface.primaryHref).toBe("/dashboard/today");
    expect(surface.secondaryHref).toBe("/dashboard/kitchen");
  });

  it("resolves packing verify surface without looping back to gated packing route", () => {
    const surface = resolvePermissionDeniedSurface("packing_verify");
    expect(surface.primaryHref).toBe("/dashboard/today");
    expect(surface.secondaryHref).toBe("/dashboard/kitchen");
  });

  it("resolves order hub surface", () => {
    const surface = resolvePermissionDeniedSurface("order_hub");
    expect(surface.permissionKey).toBe("orders.manage");
    expect(surface.primaryHref).toBe("/dashboard/today");
  });

  it("resolves integration health surface", () => {
    const surface = resolvePermissionDeniedSurface("integration_health");
    expect(surface.permissionKey).toBe("integrations.read");
  });

  it("resolves reports hub surface", () => {
    const surface = resolvePermissionDeniedSurface("reports_hub");
    expect(surface.permissionKey).toBe("reports.read.operations");
  });

  it("resolves inventory operations surface", () => {
    const surface = resolvePermissionDeniedSurface("inventory_operations");
    expect(surface.permissionKey).toBe("production.manage");
  });

  it("resolves production calendar surface", () => {
    const surface = resolvePermissionDeniedSurface("production_calendar");
    expect(surface.permissionKey).toBe("production.manage");
    expect(surface.secondaryHref).toBe("/dashboard/production");
  });
});
