import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_SPIKE_CANONICAL_DOC_PATHS,
  ENTERPRISE_SSO_SPIKE_CANONICAL_MARKERS,
  ENTERPRISE_SSO_SPIKE_CI_SCRIPTS,
  ENTERPRISE_SSO_SPIKE_DOC,
  ENTERPRISE_SSO_SPIKE_EVIDENCE_PATHS,
  ENTERPRISE_SSO_SPIKE_POLICY_ID,
  ENTERPRISE_SSO_SPIKE_UNIT_TESTS,
  enterpriseSsoSpikeDocCoversRequiredSections,
} from "@/lib/enterprise/enterprise-sso-architecture-spike-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("enterprise SSO architecture spike CI certification (live repo)", () => {
  it("locks era9 enterprise SSO spike policy id", () => {
    expect(ENTERPRISE_SSO_SPIKE_POLICY_ID).toBe("era9-enterprise-sso-architecture-spike-v1");
  });

  it("defines enterprise SSO spike CI scripts wired into governance bundles", () => {
    const scripts = readPackageScripts();
    for (const name of ENTERPRISE_SSO_SPIKE_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:enterprise-sso-spike:cert");
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:enterprise-sso-spike");
  });

  it("has policy module, spike doc, evidence paths, and unit tests on disk", () => {
    expect(existsSync(join(ROOT, "lib/enterprise/enterprise-sso-architecture-spike-policy.ts"))).toBe(
      true,
    );
    expect(existsSync(join(ROOT, ENTERPRISE_SSO_SPIKE_DOC))).toBe(true);
    for (const rel of ENTERPRISE_SSO_SPIKE_EVIDENCE_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    for (const rel of ENTERPRISE_SSO_SPIKE_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("spike doc covers required sections and forbids live SSO delivery claims in body", () => {
    const doc = readFileSync(join(ROOT, ENTERPRISE_SSO_SPIKE_DOC), "utf8");
    expect(enterpriseSsoSpikeDocCoversRequiredSections(doc)).toBe(true);
    expect(doc).toContain("not_implemented");
    expect(doc.toLowerCase()).not.toMatch(/\bsso is available in production\b/);
  });

  it("documents spike policy in canonical docs", () => {
    for (const rel of ENTERPRISE_SSO_SPIKE_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of ENTERPRISE_SSO_SPIKE_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(ENTERPRISE_SSO_SPIKE_POLICY_ID);
  });
});
