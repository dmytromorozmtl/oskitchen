import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_REALTIME_E2E_CANONICAL_DOC_PATHS,
  KDS_REALTIME_E2E_CANONICAL_MARKERS,
  KDS_REALTIME_E2E_CI_SCRIPTS,
  KDS_REALTIME_E2E_FORBIDDEN_GTM_PHRASES,
  KDS_REALTIME_E2E_IN_DEFAULT_CI,
  KDS_REALTIME_E2E_STAGING_POLICY_ID,
  KDS_REALTIME_E2E_UNIT_TESTS,
} from "@/lib/kitchen/kds-realtime-e2e-staging-policy";

const ROOT = process.cwd();
const CI_WORKFLOW = join(ROOT, ".github/workflows/ci.yml");

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("kds realtime e2e staging CI certification (live repo)", () => {
  it("locks era8 kds realtime e2e staging policy id", () => {
    expect(KDS_REALTIME_E2E_STAGING_POLICY_ID).toBe("era8-kds-realtime-e2e-staging-v1");
    expect(KDS_REALTIME_E2E_IN_DEFAULT_CI).toBe(false);
  });

  it("defines kds realtime e2e staging CI scripts in governance bundles", () => {
    const scripts = readPackageScripts();
    for (const name of KDS_REALTIME_E2E_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:governance-bundles"]).toContain(
      "test:ci:kds-realtime-e2e-staging:cert",
    );
    expect(scripts["test:ci:governance-bundles"]).toContain(
      "test:ci:kds-realtime-e2e-staging",
    );
  });

  it("has policy module and unit tests on disk", () => {
    expect(existsSync(join(ROOT, "lib/kitchen/kds-realtime-e2e-staging-policy.ts"))).toBe(
      true,
    );
    for (const rel of KDS_REALTIME_E2E_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("does not wire kds realtime playwright into default ci workflow jobs", () => {
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    expect(workflow).not.toMatch(/playwright.*kds-realtime/i);
    expect(workflow).not.toContain("test:ci:kds-realtime-e2e-staging");
  });

  it("documents staging-only scope in canonical docs without forbidden claims", () => {
    for (const rel of KDS_REALTIME_E2E_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of KDS_REALTIME_E2E_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
      for (const phrase of KDS_REALTIME_E2E_FORBIDDEN_GTM_PHRASES) {
        expect(text, `${rel} contains forbidden "${phrase}"`).not.toContain(phrase);
      }
    }
    const matrix = readFileSync(join(ROOT, "docs/feature-maturity-matrix.md"), "utf8");
    expect(matrix).toContain(KDS_REALTIME_E2E_STAGING_POLICY_ID);
  });
});
