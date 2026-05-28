import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  E2E_STAGING_AUTH_ERA12_AUTHED_COMMAND,
  E2E_STAGING_AUTH_ERA12_CANONICAL_DOC_PATHS,
  E2E_STAGING_AUTH_ERA12_CANONICAL_MARKERS,
  E2E_STAGING_AUTH_ERA12_CI_SCRIPTS,
  E2E_STAGING_AUTH_ERA12_HONEST_SCOPE,
  E2E_STAGING_AUTH_ERA12_POLICY_ID,
  E2E_STAGING_AUTH_ERA12_SETUP_STEP,
  E2E_STAGING_AUTH_ERA12_UNIT_TESTS,
  E2E_STAGING_AUTH_ERA12_WORKFLOW,
} from "@/lib/ci/e2e-staging-auth-era12-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("e2e staging auth era12 CI certification (live repo)", () => {
  it("locks era12 staging auth wiring policy id", () => {
    expect(E2E_STAGING_AUTH_ERA12_POLICY_ID).toBe("era12-e2e-staging-auth-wiring-v1");
    expect(E2E_STAGING_AUTH_ERA12_HONEST_SCOPE.notInDefaultCi).toBe(true);
  });

  it("defines era12 staging auth scripts in governance platform partition", () => {
    const scripts = readPackageScripts();
    for (const name of E2E_STAGING_AUTH_ERA12_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(governanceBundlesIncludesCert(scripts, "test:ci:e2e-staging-auth-era12:cert")).toBe(
      true,
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:e2e-staging-auth-era12")).toBe(true);
  });

  it("wires auth.setup and dashboard-authed smoke in e2e-staging workflow", () => {
    const workflow = readFileSync(join(ROOT, E2E_STAGING_AUTH_ERA12_WORKFLOW), "utf8");
    expect(workflow).toContain(E2E_STAGING_AUTH_ERA12_SETUP_STEP.command);
    expect(workflow).toContain(E2E_STAGING_AUTH_ERA12_AUTHED_COMMAND);
    expect(workflow).toContain("E2E_LOGIN_PASSWORD: ${{ secrets.E2E_LOGIN_PASSWORD || secrets.E2E_PASSWORD }}");
    expect(workflow).not.toContain("pos-checkout-flow.spec.ts");
    expect(workflow).not.toContain("remediation-delivery-idor.spec.ts");
    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
    expect(ci).not.toContain("e2e-staging.yml");
    expect(ci).not.toContain("dashboard-auth.spec.ts");
  });

  it("documents era12 staging auth wiring in canonical docs", () => {
    for (const rel of E2E_STAGING_AUTH_ERA12_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of E2E_STAGING_AUTH_ERA12_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(E2E_STAGING_AUTH_ERA12_POLICY_ID);
    for (const rel of E2E_STAGING_AUTH_ERA12_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
