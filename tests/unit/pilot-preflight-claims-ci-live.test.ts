import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  PILOT_PREFLIGHT_CLAIMS_CANONICAL_DOC_PATHS,
  PILOT_PREFLIGHT_CLAIMS_CANONICAL_MARKERS,
  PILOT_PREFLIGHT_CLAIMS_CI_SCRIPTS,
  PILOT_PREFLIGHT_CLAIMS_POLICY_ID,
  PILOT_PREFLIGHT_CLAIMS_UNIT_TESTS,
  PILOT_PREFLIGHT_SCRIPT_PATH,
  pilotPreflightEnforcesStrictClaims,
} from "@/lib/governance/pilot-preflight-claims-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("pilot preflight claims CI certification (live repo)", () => {
  it("locks era8 pilot preflight strict claims policy id", () => {
    expect(PILOT_PREFLIGHT_CLAIMS_POLICY_ID).toBe("era8-pilot-preflight-claims-strict-v1");
  });

  it("defines pilot preflight claims CI scripts wired into governance bundles", () => {
    const scripts = readPackageScripts();
    for (const name of PILOT_PREFLIGHT_CLAIMS_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(governanceBundlesIncludesCert(scripts, "test:ci:pilot-preflight-claims:cert")).toBe(
      true,
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:pilot-preflight-claims")).toBe(true);
  });

  it("has policy module, preflight script, and unit tests on disk", () => {
    expect(existsSync(join(ROOT, "lib/governance/pilot-preflight-claims-policy.ts"))).toBe(true);
    expect(existsSync(join(ROOT, PILOT_PREFLIGHT_SCRIPT_PATH))).toBe(true);
    for (const rel of PILOT_PREFLIGHT_CLAIMS_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("runs verify-claims with MARKETING_CLAIMS_STRICT=1 in pilot-preflight.sh", () => {
    const script = readFileSync(join(ROOT, PILOT_PREFLIGHT_SCRIPT_PATH), "utf8");
    expect(pilotPreflightEnforcesStrictClaims(script)).toBe(true);
  });

  it("documents strict pilot preflight claims in canonical docs", () => {
    for (const rel of PILOT_PREFLIGHT_CLAIMS_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of PILOT_PREFLIGHT_CLAIMS_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(PILOT_PREFLIGHT_CLAIMS_POLICY_ID);
  });
});
