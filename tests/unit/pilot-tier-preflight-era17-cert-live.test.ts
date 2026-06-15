import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PILOT_TIER_PREFLIGHT_ERA17_CANONICAL_DOC_PATHS,
  PILOT_TIER_PREFLIGHT_ERA17_CANONICAL_MARKERS,
  PILOT_TIER_PREFLIGHT_ERA17_CI_SCRIPTS,
  PILOT_TIER_PREFLIGHT_ERA17_ORCHESTRATOR_SCRIPT,
  PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID,
  PILOT_TIER_PREFLIGHT_ERA17_REVIEW_SECTION,
  PILOT_TIER_PREFLIGHT_ERA17_SUMMARY_ARTIFACT,
  PILOT_TIER_PREFLIGHT_ERA17_UNIT_TESTS,
} from "@/lib/commercial/pilot-tier-preflight-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("pilot tier preflight era17 CI certification (live repo)", () => {
  it("locks era17 pilot tier preflight policy id", () => {
    expect(PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID).toBe("era17-pilot-tier-preflight-v1");
  });

  it("defines era17 pilot tier preflight cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of PILOT_TIER_PREFLIGHT_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:commercial-pilot-runbook:cert"]).toContain(
      "pilot-tier-preflight-era17-cert-live",
    );
    expect(scripts["smoke:pilot-tier-preflight"]).toContain("smoke-pilot-tier-preflight-era17");
  });

  it("documents era17 pilot tier preflight in canonical docs", () => {
    expect(existsSync(join(ROOT, PILOT_TIER_PREFLIGHT_ERA17_ORCHESTRATOR_SCRIPT))).toBe(true);
    for (const rel of PILOT_TIER_PREFLIGHT_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(PILOT_TIER_PREFLIGHT_ERA17_REVIEW_SECTION);
    expect(runbook).toContain(PILOT_TIER_PREFLIGHT_ERA17_SUMMARY_ARTIFACT);
    for (const marker of PILOT_TIER_PREFLIGHT_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID);
    for (const rel of PILOT_TIER_PREFLIGHT_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
