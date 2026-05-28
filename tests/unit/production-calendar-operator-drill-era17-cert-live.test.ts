import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_CANONICAL_DOC_PATHS,
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_CANONICAL_MARKERS,
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_CI_SCRIPTS,
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_ORCHESTRATOR_SCRIPT,
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_POLICY_ID,
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_REVIEW_SECTION,
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_SUMMARY_ARTIFACT,
  PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_UNIT_TESTS,
} from "@/lib/production/production-calendar-operator-drill-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("production calendar operator drill era17 CI certification (live repo)", () => {
  it("locks era17 production calendar operator drill policy id", () => {
    expect(PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_POLICY_ID).toBe(
      "era17-production-calendar-operator-drill-v1",
    );
  });

  it("defines era17 production calendar operator drill scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:production-calendar-drill"]).toContain(
      PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_ORCHESTRATOR_SCRIPT,
    );
    for (const name of PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:production-calendar-move-ui:cert"]).toContain(
      "production-calendar-operator-drill-era17-cert-live",
    );
  });

  it("documents era17 production calendar operator drill in canonical docs", () => {
    expect(existsSync(join(ROOT, PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_ORCHESTRATOR_SCRIPT))).toBe(
      true,
    );
    for (const rel of PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(
        PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_POLICY_ID.toLowerCase(),
      );
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_REVIEW_SECTION);
    expect(runbook).toContain(PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_SUMMARY_ARTIFACT);
    for (const marker of PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_POLICY_ID);
    for (const rel of PRODUCTION_CALENDAR_OPERATOR_DRILL_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
