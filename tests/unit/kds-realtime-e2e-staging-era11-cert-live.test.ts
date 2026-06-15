import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  KDS_REALTIME_E2E_STAGING_CANONICAL_DOC_PATHS,
  KDS_REALTIME_E2E_STAGING_CANONICAL_MARKERS,
  KDS_REALTIME_E2E_STAGING_CI_SCRIPTS,
  KDS_REALTIME_E2E_STAGING_PLAYWRIGHT_SPEC,
  KDS_REALTIME_E2E_STAGING_SUMMARY_POLICY_ID,
  KDS_REALTIME_E2E_STAGING_UNIT_TESTS,
} from "@/lib/ci/kds-realtime-e2e-staging-summary-policy";
import { KDS_REALTIME_E2E_STAGING_ERA11_POLICY_ID } from "@/lib/kitchen/kds-realtime-e2e-staging-era11-policy";

const ROOT = process.cwd();
const CI_WORKFLOW = join(ROOT, ".github/workflows/ci.yml");

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("kds realtime e2e staging era11 CI certification (live repo)", () => {
  it("locks era11 kds realtime staging policy id", () => {
    expect(KDS_REALTIME_E2E_STAGING_SUMMARY_POLICY_ID).toBe(
      "era11-kds-realtime-e2e-staging-v1",
    );
    expect(KDS_REALTIME_E2E_STAGING_ERA11_POLICY_ID).toBe(
      "era11-kds-realtime-e2e-staging-v1",
    );
  });

  it("defines era11 scripts and chains cert into kds realtime e2e staging bundle", () => {
    const scripts = readPackageScripts();
    for (const name of KDS_REALTIME_E2E_STAGING_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:kds-realtime-e2e-staging:cert"]).toContain(
      "kds-realtime-e2e-staging-era11-cert-live",
    );
    expect(
      governanceBundlesIncludesCert(scripts, "test:ci:kds-realtime-e2e-staging:cert"),
    ).toBe(true);
    expect(existsSync(join(ROOT, KDS_REALTIME_E2E_STAGING_PLAYWRIGHT_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, "scripts/kds-realtime-e2e-staging-ci-policy.ts"))).toBe(true);
  });

  it("does not wire kds realtime playwright into default ci workflow jobs", () => {
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    expect(workflow).not.toMatch(/playwright.*kds-realtime/i);
    expect(workflow).not.toContain("test:ci:kds-realtime-e2e-staging:playwright");
    expect(workflow).not.toContain("kds-realtime-e2e-staging-ci-policy");
  });

  it("documents era11 staging playwright in canonical docs", () => {
    for (const rel of KDS_REALTIME_E2E_STAGING_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of KDS_REALTIME_E2E_STAGING_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(KDS_REALTIME_E2E_STAGING_ERA11_POLICY_ID);
    for (const rel of KDS_REALTIME_E2E_STAGING_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
