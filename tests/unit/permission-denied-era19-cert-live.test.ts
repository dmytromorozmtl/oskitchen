import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PERMISSION_DENIED_UX_ERA19_ALL_WIRED_PAGE_PATHS,
  PERMISSION_DENIED_UX_ERA19_POLICY_ID,
  PERMISSION_DENIED_UX_ERA19_UNIT_TESTS,
  PERMISSION_DENIED_UX_ERA19_WIRED_PAGE_PATHS,
} from "@/lib/ux/permission-denied-era19-policy";
import { resolvePermissionDeniedSurface } from "@/lib/ux/permission-denied-copy";

const ROOT = process.cwd();

describe("permission denied ux era19 CI certification (live repo)", () => {
  it("locks era19 packing/production permission denied policy id", () => {
    expect(PERMISSION_DENIED_UX_ERA19_POLICY_ID).toBe(
      "era19-permission-denied-packing-production-v1",
    );
  });

  it("uses PermissionDeniedSurfaceCard on era19 wired pages", () => {
    for (const rel of PERMISSION_DENIED_UX_ERA19_WIRED_PAGE_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8");
      expect(text.includes("PermissionDeniedSurfaceCard"), rel).toBe(true);
      expect(text.includes("requireWorkspacePermissionActor"), rel).toBe(true);
    }
  });

  it("includes era19 pages in combined wired page registry", () => {
    for (const rel of PERMISSION_DENIED_UX_ERA19_WIRED_PAGE_PATHS) {
      expect(PERMISSION_DENIED_UX_ERA19_ALL_WIRED_PAGE_PATHS).toContain(rel);
    }
  });

  it("resolves packing and production denial surfaces with permission keys", () => {
    expect(resolvePermissionDeniedSurface("packing_command").permissionKey).toBe("packing.manage");
    expect(resolvePermissionDeniedSurface("packing_verify").primaryHref).toBe("/dashboard/packing");
    expect(resolvePermissionDeniedSurface("production_calendar").permissionKey).toBe(
      "production.manage",
    );
    expect(resolvePermissionDeniedSurface("production_board").secondaryHref).toBe(
      "/dashboard/production/calendar",
    );
  });

  it("registers era19 unit tests on disk", () => {
    for (const rel of PERMISSION_DENIED_UX_ERA19_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
