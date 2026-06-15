import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  ENTERPRISE_IDENTITY_CI_SCRIPTS,
  ENTERPRISE_IDENTITY_REQUIRED_MARKERS,
  ENTERPRISE_IDENTITY_ROADMAP_POLICY_ID,
  ENTERPRISE_IDENTITY_UNIT_TESTS,
} from "@/lib/enterprise/enterprise-identity-roadmap-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("enterprise identity roadmap CI certification (live repo)", () => {
  it("locks era6 enterprise identity roadmap policy id", () => {
    expect(ENTERPRISE_IDENTITY_ROADMAP_POLICY_ID).toBe("era6-enterprise-identity-roadmap-v1");
  });

  it("defines identity roadmap CI scripts in package.json", () => {
    const scripts = readPackageScripts();
    for (const name of ENTERPRISE_IDENTITY_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(governanceBundlesIncludesCert(scripts, "test:ci:enterprise-identity-roadmap:cert")).toBe(
      true,
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:enterprise-identity-roadmap")).toBe(true);
    expect(scripts["test:ci:enterprise-identity-roadmap:cert"]).toContain(
      "enterprise-identity-era13-cert-live",
    );
    expect(scripts["test:ci:enterprise-identity-roadmap:cert"]).toContain(
      "enterprise-sso-r2-pilot-era16-cert-live",
    );
    expect(scripts["test:ci:enterprise-identity-roadmap:cert"]).toContain(
      "enterprise-sso-idp-staging-smoke-era17-cert-live",
    );
  });

  it("has policy module and unit tests on disk", () => {
    expect(existsSync(join(ROOT, "lib/enterprise/enterprise-identity-roadmap-policy.ts"))).toBe(
      true,
    );
    for (const rel of ENTERPRISE_IDENTITY_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("publishes annual review markers in procurement pack", () => {
    const pack = readFileSync(join(ROOT, "docs/enterprise-procurement-pack.md"), "utf8");
    for (const marker of ENTERPRISE_IDENTITY_REQUIRED_MARKERS) {
      expect(pack, `missing ${marker}`).toContain(marker);
    }
  });
});
