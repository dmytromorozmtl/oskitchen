import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_CANONICAL_DOC_PATHS,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_CANONICAL_MARKERS,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_CI_SCRIPTS,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_MODULE,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_NPM_SCRIPT,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_OPS_DOC,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_ORCHESTRATOR_SCRIPT,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_REVIEW_SECTION,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_UNIT_TESTS,
  enterpriseSsoIdpStagingSmokeOpsDocCoversRequiredSections,
} from "@/lib/enterprise/enterprise-sso-idp-staging-smoke-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("enterprise SSO IdP staging smoke era17 CI certification (live repo)", () => {
  it("locks era17 IdP staging smoke policy id", () => {
    expect(ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID).toBe(
      "era17-enterprise-sso-idp-staging-smoke-v1",
    );
  });

  it("defines era17 IdP staging smoke scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts[ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_NPM_SCRIPT]).toContain(
      ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:enterprise-identity-roadmap:cert"]).toContain(
      "enterprise-sso-idp-staging-smoke-era17-cert-live",
    );
  });

  it("ships summary module and orchestrator", () => {
    expect(existsSync(join(ROOT, ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_MODULE))).toBe(true);
    expect(
      existsSync(join(ROOT, ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_ORCHESTRATOR_SCRIPT)),
    ).toBe(true);
  });

  it("documents era17 IdP staging smoke plan with required sections", () => {
    const opsDoc = readFileSync(join(ROOT, ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_OPS_DOC), "utf8");
    expect(opsDoc).toContain(ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID);
    expect(enterpriseSsoIdpStagingSmokeOpsDocCoversRequiredSections(opsDoc)).toBe(true);

    for (const rel of ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID.toLowerCase());
    }
    for (const marker of ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_CANONICAL_MARKERS) {
      expect(opsDoc.toLowerCase()).toContain(marker.toLowerCase());
    }
    const designDoc = readFileSync(join(ROOT, "docs/enterprise-sso-r2-pilot-design.md"), "utf8");
    expect(designDoc).toContain(ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_REVIEW_SECTION);
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID);
    for (const rel of ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
