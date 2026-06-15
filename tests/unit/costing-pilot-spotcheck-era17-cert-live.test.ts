import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  COSTING_PILOT_SPOTCHECK_ERA17_CANONICAL_DOC_PATHS,
  COSTING_PILOT_SPOTCHECK_ERA17_CANONICAL_MARKERS,
  COSTING_PILOT_SPOTCHECK_ERA17_CI_SCRIPTS,
  COSTING_PILOT_SPOTCHECK_ERA17_MATH_MODULE,
  COSTING_PILOT_SPOTCHECK_ERA17_OPERATOR_DOC,
  COSTING_PILOT_SPOTCHECK_ERA17_ORCHESTRATOR_SCRIPT,
  COSTING_PILOT_SPOTCHECK_ERA17_POLICY_ID,
  COSTING_PILOT_SPOTCHECK_ERA17_REVIEW_SECTION,
  COSTING_PILOT_SPOTCHECK_ERA17_UNIT_TESTS,
} from "@/lib/costing/costing-pilot-spotcheck-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("costing pilot spotcheck era17 CI certification (live repo)", () => {
  it("locks era17 costing pilot spotcheck policy id", () => {
    expect(COSTING_PILOT_SPOTCHECK_ERA17_POLICY_ID).toBe(
      "era17-costing-pilot-spotcheck-v1",
    );
  });

  it("defines era17 costing pilot spotcheck scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:costing-pilot-spotcheck"]).toContain(
      COSTING_PILOT_SPOTCHECK_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of COSTING_PILOT_SPOTCHECK_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:rbac-wave3"]).toContain(
      "costing-pilot-spotcheck-era17-cert-live",
    );
  });

  it("wires spotcheck math module", () => {
    expect(existsSync(join(ROOT, COSTING_PILOT_SPOTCHECK_ERA17_MATH_MODULE))).toBe(
      true,
    );
    const reportService = readFileSync(
      join(ROOT, "services/reports/report-service.ts"),
      "utf8",
    );
    expect(reportService).toContain("margin_report");
    expect(reportService).toContain("foodCostPercent");
  });

  it("documents era17 costing pilot spotcheck in canonical docs", () => {
    expect(existsSync(join(ROOT, COSTING_PILOT_SPOTCHECK_ERA17_OPERATOR_DOC))).toBe(
      true,
    );
    for (const rel of COSTING_PILOT_SPOTCHECK_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(COSTING_PILOT_SPOTCHECK_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(COSTING_PILOT_SPOTCHECK_ERA17_REVIEW_SECTION);
    for (const marker of COSTING_PILOT_SPOTCHECK_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of COSTING_PILOT_SPOTCHECK_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
