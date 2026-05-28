import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  ENTERPRISE_IDENTITY_ERA13_CANONICAL_DOC_PATHS,
  ENTERPRISE_IDENTITY_ERA13_CANONICAL_MARKERS,
  ENTERPRISE_IDENTITY_ERA13_CI_SCRIPTS,
  ENTERPRISE_IDENTITY_ERA13_EXTENDS_POLICIES,
  ENTERPRISE_IDENTITY_ERA13_FORBIDDEN_DELIVERY_CLAIMS,
  ENTERPRISE_IDENTITY_ERA13_POLICY_ID,
  ENTERPRISE_IDENTITY_ERA13_REVIEW_SECTION,
  ENTERPRISE_IDENTITY_ERA13_SPIKE_DOC,
  ENTERPRISE_IDENTITY_ERA13_UNIT_TESTS,
} from "@/lib/enterprise/enterprise-identity-era13-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("enterprise identity era13 CI certification (live repo)", () => {
  it("locks era13 enterprise identity recert policy id", () => {
    expect(ENTERPRISE_IDENTITY_ERA13_POLICY_ID).toBe("era13-enterprise-identity-recert-v1");
  });

  it("defines era13 identity scripts and chains into enterprise-identity-roadmap cert", () => {
    const scripts = readPackageScripts();
    for (const name of ENTERPRISE_IDENTITY_ERA13_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:enterprise-identity-roadmap:cert"]).toContain(
      "enterprise-identity-era13-cert-live",
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:enterprise-identity-roadmap:cert")).toBe(
      true,
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:enterprise-sso-spike:cert")).toBe(true);
  });

  it("documents era13 recert in procurement pack without forbidden delivery claims", () => {
    const pack = readFileSync(
      join(ROOT, "docs/enterprise-procurement-pack.md"),
      "utf8",
    ).toLowerCase();
    expect(pack).toContain(ENTERPRISE_IDENTITY_ERA13_REVIEW_SECTION.toLowerCase());
    for (const policyId of ENTERPRISE_IDENTITY_ERA13_EXTENDS_POLICIES) {
      expect(pack).toContain(policyId.toLowerCase());
    }
    for (const marker of ENTERPRISE_IDENTITY_ERA13_CANONICAL_MARKERS) {
      expect(pack, marker).toContain(marker.toLowerCase());
    }
    for (const forbidden of ENTERPRISE_IDENTITY_ERA13_FORBIDDEN_DELIVERY_CLAIMS) {
      expect(pack).not.toContain(forbidden.toLowerCase());
    }
    expect(existsSync(join(ROOT, ENTERPRISE_IDENTITY_ERA13_SPIKE_DOC))).toBe(true);
  });

  it("documents era13 recert in canonical docs and policy module on disk", () => {
    const procurement = readFileSync(
      join(ROOT, "docs/enterprise-procurement-pack.md"),
      "utf8",
    ).toLowerCase();
    for (const marker of ENTERPRISE_IDENTITY_ERA13_CANONICAL_MARKERS) {
      expect(procurement, `procurement pack missing ${marker}`).toContain(
        marker.toLowerCase(),
      );
    }
    for (const rel of ENTERPRISE_IDENTITY_ERA13_CANONICAL_DOC_PATHS) {
      if (rel === "docs/enterprise-procurement-pack.md") continue;
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(ENTERPRISE_IDENTITY_ERA13_POLICY_ID.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(ENTERPRISE_IDENTITY_ERA13_POLICY_ID);
    for (const rel of ENTERPRISE_IDENTITY_ERA13_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, "lib/enterprise/enterprise-identity-era13-policy.ts"))).toBe(
      true,
    );
  });
});
