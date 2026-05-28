import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PERMISSION_DENIED_UX_ERA20_CI_SCRIPTS,
  PERMISSION_DENIED_UX_ERA20_POLICY_ID,
  PERMISSION_DENIED_UX_ERA20_REVIEW_SECTION,
  PERMISSION_DENIED_UX_ERA20_UNIT_TESTS,
  PERMISSION_DENIED_UX_ERA20_WIRED_PAGE_PATHS,
} from "@/lib/ux/permission-denied-ux-era20-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("permission denied ux era20 CI certification (live repo)", () => {
  it("defines era20 permission denied scripts", () => {
    const scripts = readPackageScripts();
    for (const name of PERMISSION_DENIED_UX_ERA20_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(PERMISSION_DENIED_UX_ERA20_POLICY_ID).toBe(
      "era20-permission-denied-order-hub-integration-health-v1",
    );
  });

  it("guards order hub and integration health before data queries", () => {
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(PERMISSION_DENIED_UX_ERA20_REVIEW_SECTION);
    expect(existsSync(join(ROOT, "app/dashboard/inventory/layout.tsx"))).toBe(true);
    for (const rel of PERMISSION_DENIED_UX_ERA20_WIRED_PAGE_PATHS) {
      const page = readFileSync(join(ROOT, rel), "utf8");
      expect(page, rel).toContain("PermissionDeniedSurfaceCard");
      const denyAt = page.indexOf("PermissionDeniedSurfaceCard");
      const dataAt = Math.min(
        ...["loadOrderHubPageData", "prisma."].map((needle) => {
          const i = page.indexOf(needle);
          return i >= 0 ? i : Number.MAX_SAFE_INTEGER;
        }),
      );
      expect(denyAt, rel).toBeGreaterThanOrEqual(0);
      expect(denyAt, rel).toBeLessThan(dataAt);
    }
    for (const rel of PERMISSION_DENIED_UX_ERA20_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
