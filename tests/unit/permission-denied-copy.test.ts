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
});
