import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  NAV_MATURITY_SWEEP_ERA17_CANONICAL_DOC_PATHS,
  NAV_MATURITY_SWEEP_ERA17_CANONICAL_MARKERS,
  NAV_MATURITY_SWEEP_ERA17_CI_SCRIPTS,
  NAV_MATURITY_SWEEP_ERA17_NEW_PREVIEW_PREFIXES,
  NAV_MATURITY_SWEEP_ERA17_ORCHESTRATOR_SCRIPT,
  NAV_MATURITY_SWEEP_ERA17_POLICY_ID,
  NAV_MATURITY_SWEEP_ERA17_REVIEW_SECTION,
  NAV_MATURITY_SWEEP_ERA17_UNIT_TESTS,
} from "@/lib/navigation/nav-maturity-sweep-era17-policy";
import { runNavMaturitySweepEra17Audit } from "@/lib/navigation/nav-maturity-sweep-era17-audit";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("nav maturity sweep era17 CI certification (live repo)", () => {
  it("locks era17 nav maturity sweep policy id", () => {
    expect(NAV_MATURITY_SWEEP_ERA17_POLICY_ID).toBe("era17-nav-maturity-sweep-v1");
  });

  it("defines era17 nav maturity sweep scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:nav-maturity-sweep-era17"]).toContain(
      NAV_MATURITY_SWEEP_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of NAV_MATURITY_SWEEP_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:page-maturity-sweep:cert"]).toContain(
      "nav-maturity-sweep-era17-cert-live",
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:page-maturity-sweep:cert")).toBe(
      true,
    );
  });

  it("registers era17 preview prefixes in nav maturity governance", () => {
    const governance = readFileSync(
      join(ROOT, "lib/navigation/nav-maturity-governance.ts"),
      "utf8",
    );
    for (const prefix of NAV_MATURITY_SWEEP_ERA17_NEW_PREVIEW_PREFIXES) {
      expect(governance).toContain(prefix);
    }
  });

  it("documents era17 nav maturity sweep in canonical docs", () => {
    for (const rel of NAV_MATURITY_SWEEP_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(NAV_MATURITY_SWEEP_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(NAV_MATURITY_SWEEP_ERA17_REVIEW_SECTION);
    for (const marker of NAV_MATURITY_SWEEP_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of NAV_MATURITY_SWEEP_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("passes era17 nav maturity audit with zero gaps", () => {
    const audit = runNavMaturitySweepEra17Audit();
    expect(audit.passed).toBe(true);
  });
});
