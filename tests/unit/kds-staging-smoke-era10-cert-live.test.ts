import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  KDS_STAGING_SMOKE_ERA10_CANONICAL_DOC_PATHS,
  KDS_STAGING_SMOKE_ERA10_CANONICAL_MARKERS,
  KDS_STAGING_SMOKE_ERA10_CI_SCRIPTS,
  KDS_STAGING_SMOKE_ERA10_INTEGRATION_TESTS,
  KDS_STAGING_SMOKE_ERA10_POLICY_ID,
  KDS_STAGING_SMOKE_ERA10_UNIT_TESTS,
} from "@/lib/kitchen/kds-staging-smoke-era10-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("KDS staging smoke era10 CI certification (live repo)", () => {
  it("locks era10 KDS staging smoke recert policy id", () => {
    expect(KDS_STAGING_SMOKE_ERA10_POLICY_ID).toBe("era10-kds-staging-smoke-recert-v1");
  });

  it("defines era10 recert CI scripts and chains cert into staging-smoke bundle", () => {
    const scripts = readPackageScripts();
    for (const name of KDS_STAGING_SMOKE_ERA10_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:kds-staging-smoke:cert"]).toContain(
      "kds-staging-smoke-era10-cert-live",
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:kds-staging-smoke:cert")).toBe(true);
    expect(governanceBundlesIncludesCert(scripts, "test:ci:kds-staging-smoke")).toBe(true);
  });

  it("has era10 policy module, integration tests, and unit tests on disk", () => {
    expect(existsSync(join(ROOT, "lib/kitchen/kds-staging-smoke-era10-policy.ts"))).toBe(true);
    for (const rel of KDS_STAGING_SMOKE_ERA10_INTEGRATION_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    for (const rel of KDS_STAGING_SMOKE_ERA10_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    const integration = readFileSync(
      join(ROOT, KDS_STAGING_SMOKE_ERA10_INTEGRATION_TESTS[0]),
      "utf8",
    );
    expect(integration).toContain("recall from READY");
    expect(integration).toContain("bump");
  });

  it("documents era10 recert in canonical docs without rush-hour certification", () => {
    for (const rel of KDS_STAGING_SMOKE_ERA10_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of KDS_STAGING_SMOKE_ERA10_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(KDS_STAGING_SMOKE_ERA10_POLICY_ID);
    const matrix = readFileSync(join(ROOT, "docs/feature-maturity-matrix.md"), "utf8");
    expect(matrix).not.toMatch(/rush[- ]?hour certified/i);
  });
});
