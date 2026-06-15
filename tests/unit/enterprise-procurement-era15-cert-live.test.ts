import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  ENTERPRISE_PROCUREMENT_ERA15_CANONICAL_DOC_PATHS,
  ENTERPRISE_PROCUREMENT_ERA15_CANONICAL_MARKERS,
  ENTERPRISE_PROCUREMENT_ERA15_CI_SCRIPTS,
  ENTERPRISE_PROCUREMENT_ERA15_OPS_DOC,
  ENTERPRISE_PROCUREMENT_ERA15_POLICY_ID,
  ENTERPRISE_PROCUREMENT_ERA15_SMOKE_NPM_SCRIPT,
  ENTERPRISE_PROCUREMENT_ERA15_SMOKE_SCRIPT,
  ENTERPRISE_PROCUREMENT_ERA15_UNIT_TESTS,
} from "@/lib/enterprise/enterprise-procurement-era15-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("enterprise procurement era15 CI certification (live repo)", () => {
  it("locks era15 enterprise procurement recert policy id", () => {
    expect(ENTERPRISE_PROCUREMENT_ERA15_POLICY_ID).toBe(
      "era15-enterprise-procurement-recert-v1",
    );
  });

  it("defines era15 scripts and chains cert into enterprise procurement bundle", () => {
    const scripts = readPackageScripts();
    for (const name of ENTERPRISE_PROCUREMENT_ERA15_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts[ENTERPRISE_PROCUREMENT_ERA15_SMOKE_NPM_SCRIPT]).toContain(
      ENTERPRISE_PROCUREMENT_ERA15_SMOKE_SCRIPT,
    );
    expect(scripts["test:ci:enterprise-procurement:cert"]).toContain(
      "enterprise-procurement-era15-cert-live",
    );
    expect(
      governanceBundlesIncludesCert(scripts, "test:ci:enterprise-procurement:cert"),
    ).toBe(true);
  });

  it("documents era15 recert in canonical docs without live SSO/SOC2 delivery claims", () => {
    const ops = readFileSync(join(ROOT, ENTERPRISE_PROCUREMENT_ERA15_OPS_DOC), "utf8");
    for (const marker of ENTERPRISE_PROCUREMENT_ERA15_CANONICAL_MARKERS) {
      expect(ops.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of ENTERPRISE_PROCUREMENT_ERA15_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(ENTERPRISE_PROCUREMENT_ERA15_POLICY_ID.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(ENTERPRISE_PROCUREMENT_ERA15_POLICY_ID);
    for (const rel of ENTERPRISE_PROCUREMENT_ERA15_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, ENTERPRISE_PROCUREMENT_ERA15_SMOKE_SCRIPT))).toBe(true);
  });
});
