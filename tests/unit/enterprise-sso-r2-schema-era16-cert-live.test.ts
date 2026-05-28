import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_CANONICAL_DOC_PATHS,
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_CANONICAL_MARKERS,
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_CI_SCRIPTS,
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_EXTENDS_POLICIES,
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_FORBIDDEN_DELIVERY_CLAIMS,
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_FOUNDATION_MODULE,
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_MIGRATION,
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_POLICY_ID,
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_PRISMA_MODELS,
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_REVIEW_SECTION,
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_UNIT_TESTS,
} from "@/lib/enterprise/enterprise-sso-r2-schema-era16-policy";
import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("enterprise SSO R2 schema era16 CI certification (live repo)", () => {
  it("locks era16 SSO schema policy id", () => {
    expect(ENTERPRISE_SSO_R2_SCHEMA_ERA16_POLICY_ID).toBe(
      "era16-enterprise-sso-r2-schema-v1",
    );
  });

  it("defines schema CI scripts chained into enterprise-sso-r2-pilot-era16 cert", () => {
    const scripts = readPackageScripts();
    for (const name of ENTERPRISE_SSO_R2_SCHEMA_ERA16_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:enterprise-sso-r2-pilot-era16:cert"]).toContain(
      "enterprise-sso-r2-schema-era16-cert-live",
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:enterprise-sso-r2-schema-era16:cert")).toBe(
      true,
    );
  });

  it("documents schema foundation in procurement pack without forbidden delivery claims", () => {
    const pack = readFileSync(
      join(ROOT, "docs/enterprise-procurement-pack.md"),
      "utf8",
    ).toLowerCase();
    expect(pack).toContain(ENTERPRISE_SSO_R2_SCHEMA_ERA16_REVIEW_SECTION.toLowerCase());
    for (const policyId of ENTERPRISE_SSO_R2_SCHEMA_ERA16_EXTENDS_POLICIES) {
      expect(pack).toContain(policyId.toLowerCase());
    }
    for (const forbidden of ENTERPRISE_SSO_R2_SCHEMA_ERA16_FORBIDDEN_DELIVERY_CLAIMS) {
      expect(pack).not.toContain(forbidden.toLowerCase());
    }
  });

  it("has prisma models, migration, foundation module, and unit tests on disk", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
    for (const model of ENTERPRISE_SSO_R2_SCHEMA_ERA16_PRISMA_MODELS) {
      expect(schema).toContain(`model ${model}`);
    }
    expect(readFileSync(join(ROOT, ENTERPRISE_SSO_R2_SCHEMA_ERA16_MIGRATION), "utf8")).toContain(
      "workspace_sso_settings",
    );
    expect(readFileSync(join(ROOT, ENTERPRISE_SSO_R2_SCHEMA_ERA16_FOUNDATION_MODULE), "utf8")).toContain(
      "evaluateWorkspaceSsoRuntimeGate",
    );
    for (const rel of ENTERPRISE_SSO_R2_SCHEMA_ERA16_UNIT_TESTS) {
      expect(readFileSync(join(ROOT, rel), "utf8").length).toBeGreaterThan(0);
    }
  });

  it("documents schema era16 in canonical docs", () => {
    for (const rel of ENTERPRISE_SSO_R2_SCHEMA_ERA16_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of ENTERPRISE_SSO_R2_SCHEMA_ERA16_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(ENTERPRISE_SSO_R2_SCHEMA_ERA16_POLICY_ID);
  });
});
