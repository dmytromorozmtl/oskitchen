import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  CRON_SURFACE_ERA14_CANONICAL_DOC_PATHS,
  CRON_SURFACE_ERA14_CANONICAL_MARKERS,
  CRON_SURFACE_ERA14_CI_SCRIPTS,
  CRON_SURFACE_ERA14_OPS_DOC,
  CRON_SURFACE_ERA14_PILOT_FORBIDDEN_ENV,
  CRON_SURFACE_ERA14_PILOT_PREFLIGHT_SCRIPT,
  CRON_SURFACE_ERA14_POLICY_ID,
  CRON_SURFACE_ERA14_SMOKE_NPM_SCRIPT,
  CRON_SURFACE_ERA14_SMOKE_SCRIPT,
  CRON_SURFACE_ERA14_UNIT_TESTS,
  CRON_SURFACE_ERA14_VALIDATION_SCRIPTS,
} from "@/lib/cron/cron-surface-era14-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("cron surface era14 CI certification (live repo)", () => {
  it("locks era14 cron surface recert policy id", () => {
    expect(CRON_SURFACE_ERA14_POLICY_ID).toBe("era14-cron-surface-recert-v1");
  });

  it("defines era14 cron scripts and chains cert into cron-hygiene bundle", () => {
    const scripts = readPackageScripts();
    for (const name of CRON_SURFACE_ERA14_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    for (const name of CRON_SURFACE_ERA14_VALIDATION_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts[CRON_SURFACE_ERA14_SMOKE_NPM_SCRIPT]).toContain(
      CRON_SURFACE_ERA14_SMOKE_SCRIPT,
    );
    expect(scripts["test:ci:cron-hygiene:cert"]).toContain("cron-surface-era14-cert-live");
    expect(
      governanceBundlesIncludesCert(scripts, "test:ci:cron-hygiene:cert"),
    ).toBe(true);
  });

  it("blocks ENABLE_EXPERIMENTAL_CRONS in pilot preflight", () => {
    const preflight = readFileSync(join(ROOT, CRON_SURFACE_ERA14_PILOT_PREFLIGHT_SCRIPT), "utf8");
    expect(preflight).toContain(CRON_SURFACE_ERA14_PILOT_FORBIDDEN_ENV);
    expect(preflight).toMatch(/must not be true for pilot/i);
  });

  it("documents era14 cron surface recert in canonical docs", () => {
    const ops = readFileSync(join(ROOT, CRON_SURFACE_ERA14_OPS_DOC), "utf8");
    for (const marker of CRON_SURFACE_ERA14_CANONICAL_MARKERS) {
      expect(ops.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of CRON_SURFACE_ERA14_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(CRON_SURFACE_ERA14_POLICY_ID.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(CRON_SURFACE_ERA14_POLICY_ID);
    for (const rel of CRON_SURFACE_ERA14_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, CRON_SURFACE_ERA14_SMOKE_SCRIPT))).toBe(true);
  });
});
