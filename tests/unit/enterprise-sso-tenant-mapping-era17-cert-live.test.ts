import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_CANONICAL_DOC_PATHS,
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_CI_SCRIPTS,
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_FOUNDATION_MODULE,
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_GUARD_MODULE,
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_POLICY_ID,
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_REQUIRED_SCENARIOS,
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_REVIEW_SECTION,
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_UNIT_TESTS,
} from "@/lib/enterprise/enterprise-sso-tenant-mapping-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("enterprise SSO tenant mapping era17 CI certification (live repo)", () => {
  it("locks era17 enterprise SSO tenant mapping policy id", () => {
    expect(ENTERPRISE_SSO_TENANT_MAPPING_ERA17_POLICY_ID).toBe(
      "era17-enterprise-sso-tenant-mapping-v1",
    );
  });

  it("defines era17 enterprise SSO tenant mapping cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of ENTERPRISE_SSO_TENANT_MAPPING_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:enterprise-sso-idp-staging-era17:cert"]).toContain(
      "enterprise-sso-tenant-mapping-era17-cert-live",
    );
    expect(scripts["test:ci:enterprise-sso-tenant-mapping-era17"]).toContain(
      "enterprise-sso-tenant-mapping-era17.test.ts",
    );
  });

  it("wires callback guard and foundation modules", () => {
    expect(existsSync(join(ROOT, ENTERPRISE_SSO_TENANT_MAPPING_ERA17_GUARD_MODULE))).toBe(true);
    expect(existsSync(join(ROOT, ENTERPRISE_SSO_TENANT_MAPPING_ERA17_FOUNDATION_MODULE))).toBe(
      true,
    );
    const guard = readFileSync(join(ROOT, ENTERPRISE_SSO_TENANT_MAPPING_ERA17_GUARD_MODULE), "utf8");
    expect(guard).toContain("validateSsoCallbackSession");
    expect(guard).toContain("domain_not_allowed");
    expect(guard).toContain("workspace_access_denied");
    expect(guard).toContain("entitlement_denied");
  });

  it("documents era17 enterprise SSO tenant mapping in canonical docs", () => {
    for (const rel of ENTERPRISE_SSO_TENANT_MAPPING_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(ENTERPRISE_SSO_TENANT_MAPPING_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(ENTERPRISE_SSO_TENANT_MAPPING_ERA17_REVIEW_SECTION);
    for (const scenario of ENTERPRISE_SSO_TENANT_MAPPING_ERA17_REQUIRED_SCENARIOS) {
      expect(runbook).toContain(scenario);
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(ENTERPRISE_SSO_TENANT_MAPPING_ERA17_POLICY_ID);
    for (const rel of ENTERPRISE_SSO_TENANT_MAPPING_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
