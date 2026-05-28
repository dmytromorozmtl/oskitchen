import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PERMISSION_DENIED_UX_ERA17_CANONICAL_DOC_PATHS,
  PERMISSION_DENIED_UX_ERA17_CANONICAL_MARKERS,
  PERMISSION_DENIED_UX_ERA17_CI_SCRIPTS,
  PERMISSION_DENIED_UX_ERA17_COPY_MODULE,
  PERMISSION_DENIED_UX_ERA17_ORCHESTRATOR_SCRIPT,
  PERMISSION_DENIED_UX_ERA17_POLICY_ID,
  PERMISSION_DENIED_UX_ERA17_REVIEW_SECTION,
  PERMISSION_DENIED_UX_ERA17_SHELL_MODULE,
  PERMISSION_DENIED_UX_ERA17_TEST_ID,
  PERMISSION_DENIED_UX_ERA17_UNIT_TESTS,
  PERMISSION_DENIED_UX_ERA17_WIRED_PAGE_PATHS,
} from "@/lib/ux/permission-denied-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("permission denied ux era17 CI certification (live repo)", () => {
  it("locks era17 permission denied ux policy id", () => {
    expect(PERMISSION_DENIED_UX_ERA17_POLICY_ID).toBe("era17-permission-denied-ux-v1");
  });

  it("defines era17 permission denied ux scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:permission-denied-ux"]).toContain(
      PERMISSION_DENIED_UX_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of PERMISSION_DENIED_UX_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:pos-tablet-ux-era17:cert"]).toContain(
      "permission-denied-ux-era17-cert-live",
    );
  });

  it("wires standardized copy and card test id", () => {
    expect(existsSync(join(ROOT, PERMISSION_DENIED_UX_ERA17_COPY_MODULE))).toBe(true);
    expect(existsSync(join(ROOT, PERMISSION_DENIED_UX_ERA17_SHELL_MODULE))).toBe(true);
    const card = readFileSync(join(ROOT, "components/dashboard/pos-access-card.tsx"), "utf8");
    expect(card).toContain("PERMISSION_DENIED_UX_ERA17_TEST_ID");
    expect(card).toContain("data-testid={PERMISSION_DENIED_UX_ERA17_TEST_ID}");
  });

  it("uses PermissionDeniedSurfaceCard or resolvePermissionDeniedSurface on wired pages", () => {
    for (const rel of PERMISSION_DENIED_UX_ERA17_WIRED_PAGE_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8");
      const usesStandard =
        text.includes("PermissionDeniedSurfaceCard") ||
        text.includes("resolvePermissionDeniedSurface");
      expect(usesStandard, rel).toBe(true);
    }
  });

  it("documents era17 permission denied ux in canonical docs", () => {
    for (const rel of PERMISSION_DENIED_UX_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(PERMISSION_DENIED_UX_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(PERMISSION_DENIED_UX_ERA17_REVIEW_SECTION);
    for (const marker of PERMISSION_DENIED_UX_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of PERMISSION_DENIED_UX_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
