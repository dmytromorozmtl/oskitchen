import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_CANONICAL_DOC_PATHS,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_CANONICAL_MARKERS,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_CI_SCRIPTS,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_DOC,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_ORCHESTRATOR_SCRIPT,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_POLICY_ID,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_REVIEW_SECTION,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_SUMMARY_ARTIFACT,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_UNIT_TESTS,
} from "@/lib/commercial/pilot-operator-golden-path-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("pilot operator golden path era17 CI certification (live repo)", () => {
  it("locks era17 pilot operator golden path policy id", () => {
    expect(PILOT_OPERATOR_GOLDEN_PATH_ERA17_POLICY_ID).toBe(
      "era17-pilot-operator-golden-path-v1",
    );
  });

  it("defines era17 pilot operator golden path cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of PILOT_OPERATOR_GOLDEN_PATH_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:commercial-pilot-runbook:cert"]).toContain(
      "pilot-operator-golden-path-era17-cert-live",
    );
    expect(scripts["smoke:pilot-operator-golden-path"]).toContain(
      "smoke-pilot-operator-golden-path-era17",
    );
  });

  it("documents era17 pilot operator golden path in canonical docs", () => {
    expect(existsSync(join(ROOT, PILOT_OPERATOR_GOLDEN_PATH_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
    const guide = readFileSync(join(ROOT, PILOT_OPERATOR_GOLDEN_PATH_ERA17_DOC), "utf8");
    expect(guide).toContain("awaiting_operator_execution");
    expect(guide).toContain(PILOT_OPERATOR_GOLDEN_PATH_ERA17_SUMMARY_ARTIFACT);
    for (const rel of PILOT_OPERATOR_GOLDEN_PATH_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(PILOT_OPERATOR_GOLDEN_PATH_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(PILOT_OPERATOR_GOLDEN_PATH_ERA17_REVIEW_SECTION);
    for (const marker of PILOT_OPERATOR_GOLDEN_PATH_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(PILOT_OPERATOR_GOLDEN_PATH_ERA17_POLICY_ID);
    for (const rel of PILOT_OPERATOR_GOLDEN_PATH_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
