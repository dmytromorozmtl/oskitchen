import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_CANONICAL_DOC_PATHS,
  ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_CANONICAL_MARKERS,
  ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_CI_SCRIPTS,
  ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_POLICY_ID,
  ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_REVIEW_SECTION,
  ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_UNIT_TESTS,
} from "@/lib/enterprise/enterprise-sso-idp-login-proof-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("enterprise SSO IdP login proof era17 CI certification (live repo)", () => {
  it("locks era17 IdP login proof policy id", () => {
    expect(ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_POLICY_ID).toBe(
      "era17-enterprise-sso-idp-login-proof-v1",
    );
  });

  it("defines era17 IdP login proof CI scripts", () => {
    const scripts = readPackageScripts();
    for (const name of ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:enterprise-sso-idp-staging-era17:cert"]).toContain(
      "enterprise-sso-idp-login-proof-era17-cert-live",
    );
  });

  it("documents era17 Cycle 2 login proof in canonical docs", () => {
    for (const rel of ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_POLICY_ID.toLowerCase());
    }
    const opsDoc = readFileSync(join(ROOT, "docs/enterprise-sso-idp-staging-smoke-plan.md"), "utf8");
    for (const marker of ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_CANONICAL_MARKERS) {
      expect(opsDoc.toLowerCase()).toContain(marker.toLowerCase());
    }
    const designDoc = readFileSync(join(ROOT, "docs/enterprise-sso-r2-pilot-design.md"), "utf8");
    expect(designDoc).toContain(ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_REVIEW_SECTION);
    for (const rel of ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
