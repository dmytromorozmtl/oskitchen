import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_CANONICAL_DOC_PATHS,
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_CANONICAL_MARKERS,
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_CI_SCRIPTS,
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_EXTENDS_POLICIES,
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_FORBIDDEN_DELIVERY_CLAIMS,
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_POLICY_ID,
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_REVIEW_SECTION,
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_RUNTIME_MODULES,
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_UNIT_TESTS,
} from "@/lib/enterprise/enterprise-sso-r2-runtime-era16-policy";
import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("enterprise SSO R2 runtime era16 CI certification (live repo)", () => {
  it("locks era16 SSO runtime policy id", () => {
    expect(ENTERPRISE_SSO_R2_RUNTIME_ERA16_POLICY_ID).toBe(
      "era16-enterprise-sso-r2-runtime-v1",
    );
  });

  it("defines runtime CI scripts chained into enterprise-sso-r2-pilot-era16 cert", () => {
    const scripts = readPackageScripts();
    for (const name of ENTERPRISE_SSO_R2_RUNTIME_ERA16_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:enterprise-sso-r2-pilot-era16:cert"]).toContain(
      "enterprise-sso-r2-runtime-era16-cert-live",
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:enterprise-sso-r2-runtime-era16:cert")).toBe(
      true,
    );
  });

  it("documents runtime foundation in procurement pack without forbidden delivery claims", () => {
    const pack = readFileSync(
      join(ROOT, "docs/enterprise-procurement-pack.md"),
      "utf8",
    ).toLowerCase();
    expect(pack).toContain(ENTERPRISE_SSO_R2_RUNTIME_ERA16_REVIEW_SECTION.toLowerCase());
    for (const policyId of ENTERPRISE_SSO_R2_RUNTIME_ERA16_EXTENDS_POLICIES) {
      expect(pack).toContain(policyId.toLowerCase());
    }
    for (const forbidden of ENTERPRISE_SSO_R2_RUNTIME_ERA16_FORBIDDEN_DELIVERY_CLAIMS) {
      expect(pack).not.toContain(forbidden.toLowerCase());
    }
  });

  it("has runtime modules, callback route wiring, and unit tests on disk", () => {
    for (const rel of ENTERPRISE_SSO_R2_RUNTIME_ERA16_RUNTIME_MODULES) {
      const text = readFileSync(join(ROOT, rel), "utf8");
      expect(text.length).toBeGreaterThan(0);
    }
    const callback = readFileSync(join(ROOT, "app/auth/callback/route.ts"), "utf8");
    expect(callback).toContain("completeWorkspaceSsoCallback");
    expect(callback).toContain("sso_workspace_id");
    for (const rel of ENTERPRISE_SSO_R2_RUNTIME_ERA16_UNIT_TESTS) {
      expect(readFileSync(join(ROOT, rel), "utf8").length).toBeGreaterThan(0);
    }
  });

  it("documents runtime era16 in canonical docs", () => {
    for (const rel of ENTERPRISE_SSO_R2_RUNTIME_ERA16_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of ENTERPRISE_SSO_R2_RUNTIME_ERA16_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(ENTERPRISE_SSO_R2_RUNTIME_ERA16_POLICY_ID);
  });
});
