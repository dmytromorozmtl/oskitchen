import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_CANONICAL_DOC_PATHS,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_CANONICAL_MARKERS,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_CI_SCRIPTS,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_ORCHESTRATOR_SCRIPT,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_REVIEW_SECTION,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_SUMMARY_ARTIFACT,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_UNIT_TESTS,
} from "@/lib/commercial/pilot-forbidden-claims-enforcement-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("pilot forbidden-claims enforcement era17 CI certification (live repo)", () => {
  it("locks era17 forbidden-claims enforcement policy id", () => {
    expect(PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID).toBe(
      "era17-pilot-forbidden-claims-enforcement-v1",
    );
  });

  it("defines era17 forbidden-claims enforcement scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:pilot-forbidden-claims-enforcement"]).toContain(
      PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:commercial-pilot-runbook:cert"]).toContain(
      "pilot-forbidden-claims-enforcement-era17-cert-live",
    );
  });

  it("documents era17 forbidden-claims enforcement in canonical docs", () => {
    expect(existsSync(join(ROOT, PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
    for (const rel of PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(
        PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID.toLowerCase(),
      );
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_REVIEW_SECTION);
    expect(runbook).toContain(PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_SUMMARY_ARTIFACT);
    for (const marker of PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID);
    for (const rel of PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
