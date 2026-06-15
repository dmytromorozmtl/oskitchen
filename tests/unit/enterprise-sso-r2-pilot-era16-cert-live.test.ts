import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  ENTERPRISE_SSO_R2_PILOT_ERA16_CANONICAL_DOC_PATHS,
  ENTERPRISE_SSO_R2_PILOT_ERA16_CANONICAL_MARKERS,
  ENTERPRISE_SSO_R2_PILOT_ERA16_CI_SCRIPTS,
  ENTERPRISE_SSO_R2_PILOT_ERA16_DOC,
  ENTERPRISE_SSO_R2_PILOT_ERA16_EVIDENCE_PATHS,
  ENTERPRISE_SSO_R2_PILOT_ERA16_EXTENDS_POLICIES,
  ENTERPRISE_SSO_R2_PILOT_ERA16_FORBIDDEN_DELIVERY_CLAIMS,
  ENTERPRISE_SSO_R2_PILOT_ERA16_POLICY_ID,
  ENTERPRISE_SSO_R2_PILOT_ERA16_REVIEW_SECTION,
  ENTERPRISE_SSO_R2_PILOT_ERA16_UNIT_TESTS,
  enterpriseSsoR2PilotDocCoversRequiredSections,
} from "@/lib/enterprise/enterprise-sso-r2-pilot-era16-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("enterprise SSO R2 pilot era16 CI certification (live repo)", () => {
  it("locks era16 SSO R2 pilot policy id", () => {
    expect(ENTERPRISE_SSO_R2_PILOT_ERA16_POLICY_ID).toBe(
      "era16-enterprise-sso-r2-pilot-v1",
    );
  });

  it("defines era16 R2 pilot scripts and chains into enterprise-identity-roadmap cert", () => {
    const scripts = readPackageScripts();
    for (const name of ENTERPRISE_SSO_R2_PILOT_ERA16_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:enterprise-identity-roadmap:cert"]).toContain(
      "enterprise-sso-r2-pilot-era16-cert-live",
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:enterprise-sso-r2-pilot-era16:cert")).toBe(
      true,
    );
  });

  it("documents era16 R2 decision in procurement pack without forbidden delivery claims", () => {
    const pack = readFileSync(
      join(ROOT, "docs/enterprise-procurement-pack.md"),
      "utf8",
    ).toLowerCase();
    expect(pack).toContain(ENTERPRISE_SSO_R2_PILOT_ERA16_REVIEW_SECTION.toLowerCase());
    for (const policyId of ENTERPRISE_SSO_R2_PILOT_ERA16_EXTENDS_POLICIES) {
      expect(pack).toContain(policyId.toLowerCase());
    }
    for (const marker of ENTERPRISE_SSO_R2_PILOT_ERA16_CANONICAL_MARKERS) {
      expect(pack, marker).toContain(marker.toLowerCase());
    }
    for (const forbidden of ENTERPRISE_SSO_R2_PILOT_ERA16_FORBIDDEN_DELIVERY_CLAIMS) {
      expect(pack).not.toContain(forbidden.toLowerCase());
    }
  });

  it("has policy module, R2 design doc, evidence paths, and unit tests on disk", () => {
    expect(
      existsSync(join(ROOT, "lib/enterprise/enterprise-sso-r2-pilot-era16-policy.ts")),
    ).toBe(true);
    expect(existsSync(join(ROOT, ENTERPRISE_SSO_R2_PILOT_ERA16_DOC))).toBe(true);
    for (const rel of ENTERPRISE_SSO_R2_PILOT_ERA16_EVIDENCE_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    for (const rel of ENTERPRISE_SSO_R2_PILOT_ERA16_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("R2 design doc covers required sections and forbids live SSO delivery claims in body", () => {
    const doc = readFileSync(join(ROOT, ENTERPRISE_SSO_R2_PILOT_ERA16_DOC), "utf8");
    expect(enterpriseSsoR2PilotDocCoversRequiredSections(doc)).toBe(true);
    expect(doc).toContain("schema_ready");
    expect(doc).toContain("pilot_foundation");
    expect(doc).toContain("supabase_saml_sso");
    expect(doc.toLowerCase()).not.toMatch(/\bsso is available in production\b/);
  });

  it("documents era16 R2 pilot in canonical docs", () => {
    for (const rel of ENTERPRISE_SSO_R2_PILOT_ERA16_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(ENTERPRISE_SSO_R2_PILOT_ERA16_POLICY_ID.toLowerCase());
      expect(text, rel).toContain("supabase_saml_sso");
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(ENTERPRISE_SSO_R2_PILOT_ERA16_POLICY_ID);
  });
});
