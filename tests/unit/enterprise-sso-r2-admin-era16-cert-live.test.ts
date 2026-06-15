import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_R2_ADMIN_ERA16_ADMIN_MODULES,
  ENTERPRISE_SSO_R2_ADMIN_ERA16_CANONICAL_DOC_PATHS,
  ENTERPRISE_SSO_R2_ADMIN_ERA16_CANONICAL_MARKERS,
  ENTERPRISE_SSO_R2_ADMIN_ERA16_CI_SCRIPTS,
  ENTERPRISE_SSO_R2_ADMIN_ERA16_EXTENDS_POLICIES,
  ENTERPRISE_SSO_R2_ADMIN_ERA16_FORBIDDEN_DELIVERY_CLAIMS,
  ENTERPRISE_SSO_R2_ADMIN_ERA16_POLICY_ID,
  ENTERPRISE_SSO_R2_ADMIN_ERA16_REVIEW_SECTION,
  ENTERPRISE_SSO_R2_ADMIN_ERA16_SMOKE_SCRIPT,
  ENTERPRISE_SSO_R2_ADMIN_ERA16_UNIT_TESTS,
} from "@/lib/enterprise/enterprise-sso-r2-admin-era16-policy";
import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("enterprise SSO R2 admin era16 CI certification (live repo)", () => {
  it("locks era16 SSO admin policy id", () => {
    expect(ENTERPRISE_SSO_R2_ADMIN_ERA16_POLICY_ID).toBe("era16-enterprise-sso-r2-admin-v1");
  });

  it("defines admin CI scripts, smoke script, and governance bundle wiring", () => {
    const scripts = readPackageScripts();
    for (const name of ENTERPRISE_SSO_R2_ADMIN_ERA16_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts[ENTERPRISE_SSO_R2_ADMIN_ERA16_SMOKE_SCRIPT]).toContain(
      "smoke-enterprise-sso-r2-pilot",
    );
    expect(scripts["test:ci:enterprise-sso-r2-pilot-era16:cert"]).toContain(
      "enterprise-sso-r2-admin-era16-cert-live",
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:enterprise-sso-r2-admin-era16:cert")).toBe(
      true,
    );
  });

  it("documents admin wiring in procurement pack without forbidden delivery claims", () => {
    const pack = readFileSync(join(ROOT, "docs/enterprise-procurement-pack.md"), "utf8").toLowerCase();
    expect(pack).toContain(ENTERPRISE_SSO_R2_ADMIN_ERA16_REVIEW_SECTION.toLowerCase());
    for (const policyId of ENTERPRISE_SSO_R2_ADMIN_ERA16_EXTENDS_POLICIES) {
      expect(pack).toContain(policyId.toLowerCase());
    }
    for (const forbidden of ENTERPRISE_SSO_R2_ADMIN_ERA16_FORBIDDEN_DELIVERY_CLAIMS) {
      expect(pack).not.toContain(forbidden.toLowerCase());
    }
  });

  it("has admin modules, SSO login entry, and unit tests on disk", () => {
    for (const rel of ENTERPRISE_SSO_R2_ADMIN_ERA16_ADMIN_MODULES) {
      expect(readFileSync(join(ROOT, rel), "utf8").length).toBeGreaterThan(0);
    }
    const loginEntry = readFileSync(join(ROOT, "components/auth/sso-login-entry.tsx"), "utf8");
    expect(loginEntry).toContain("Sign in with SSO");
    expect(readFileSync(join(ROOT, "app/login/page.tsx"), "utf8")).toContain("SsoLoginEntry");
    for (const rel of ENTERPRISE_SSO_R2_ADMIN_ERA16_UNIT_TESTS) {
      expect(readFileSync(join(ROOT, rel), "utf8").length).toBeGreaterThan(0);
    }
  });

  it("documents admin era16 in canonical docs", () => {
    for (const rel of ENTERPRISE_SSO_R2_ADMIN_ERA16_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of ENTERPRISE_SSO_R2_ADMIN_ERA16_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(ENTERPRISE_SSO_R2_ADMIN_ERA16_POLICY_ID);
  });
});
