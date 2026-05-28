import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CRON_SURFACE_ERA9_CANONICAL_DOC_PATHS,
  CRON_SURFACE_ERA9_CANONICAL_MARKERS,
  CRON_SURFACE_ERA9_ACTIVE_ROUTE_COUNT,
  CRON_SURFACE_ERA9_CI_SCRIPTS,
  CRON_SURFACE_ERA9_EXPERIMENTAL_ON_DISK_MAX,
  CRON_SURFACE_ERA9_PILOT_FORBIDDEN_ENV,
  CRON_SURFACE_ERA9_PILOT_PREFLIGHT_SCRIPT,
  CRON_SURFACE_ERA9_POLICY_ID,
  CRON_SURFACE_ERA9_UNIT_TESTS,
  CRON_SURFACE_ERA9_VALIDATION_SCRIPTS,
} from "@/lib/cron/cron-surface-era9-policy";
import { validateCronRouteInventory } from "@/services/cron/cron-route-inventory-validation";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("cron surface era9 CI certification (live repo)", () => {
  it("locks era9 cron surface recert policy id", () => {
    expect(CRON_SURFACE_ERA9_POLICY_ID).toBe("era9-cron-surface-recert-v1");
  });

  it("defines cron validation scripts and hygiene CI wiring", () => {
    const scripts = readPackageScripts();
    for (const name of CRON_SURFACE_ERA9_VALIDATION_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    for (const name of CRON_SURFACE_ERA9_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:cron-hygiene:cert"]).toContain("cron-surface-era9-cert-live");
    expect(scripts["test:ci:governance-bundles:partition-platform"]).toContain(
      "test:ci:cron-hygiene:cert",
    );
  });

  it("has era9 policy module and unit tests on disk", () => {
    expect(existsSync(join(ROOT, "lib/cron/cron-surface-era9-policy.ts"))).toBe(true);
    for (const rel of CRON_SURFACE_ERA9_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("recertifies 16 production crons and zero experimental App Router routes", () => {
    const report = validateCronRouteInventory();
    expect(report.ok).toBe(true);
    expect(report.productionOnDisk).toBe(CRON_SURFACE_ERA9_ACTIVE_ROUTE_COUNT);
    expect(report.experimentalOnDisk).toBeLessThanOrEqual(
      CRON_SURFACE_ERA9_EXPERIMENTAL_ON_DISK_MAX,
    );
    expect(existsSync(join(ROOT, "config/cron-archive-manifest.json"))).toBe(true);
  });

  it("blocks ENABLE_EXPERIMENTAL_CRONS in pilot preflight", () => {
    const preflight = readFileSync(join(ROOT, CRON_SURFACE_ERA9_PILOT_PREFLIGHT_SCRIPT), "utf8");
    expect(preflight).toContain(CRON_SURFACE_ERA9_PILOT_FORBIDDEN_ENV);
    expect(preflight).toMatch(/must not be true for pilot/i);
  });

  it("documents era9 cron surface recert in canonical docs", () => {
    const cronFocusedDocs = CRON_SURFACE_ERA9_CANONICAL_DOC_PATHS.filter(
      (rel) => rel !== "docs/commercial-pilot-runbook.md",
    );
    for (const rel of cronFocusedDocs) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of CRON_SURFACE_ERA9_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const pilot = readFileSync(
      join(ROOT, "docs/commercial-pilot-runbook.md"),
      "utf8",
    ).toLowerCase();
    expect(pilot).toContain(CRON_SURFACE_ERA9_POLICY_ID);
    expect(pilot).toContain("16 production");
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(CRON_SURFACE_ERA9_POLICY_ID);
  });
});
