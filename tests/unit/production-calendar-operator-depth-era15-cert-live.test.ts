import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_CANONICAL_DOC_PATHS,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_CANONICAL_MARKERS,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_CI_SCRIPTS,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_OPS_DOC,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_PAGE_FILE,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_POLICY_ID,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_SMOKE_NPM_SCRIPT,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_SMOKE_SCRIPT,
  PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_UNIT_TESTS,
} from "@/lib/production/production-calendar-operator-depth-era15-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("production calendar operator depth era15 CI certification (live repo)", () => {
  it("locks era15 production calendar operator recert policy id", () => {
    expect(PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_POLICY_ID).toBe(
      "era15-production-calendar-operator-recert-v1",
    );
  });

  it("defines era15 scripts and chains cert into production calendar move-ui bundle", () => {
    const scripts = readPackageScripts();
    for (const name of PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts[PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_SMOKE_NPM_SCRIPT]).toContain(
      PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_SMOKE_SCRIPT,
    );
    expect(scripts["test:ci:production-calendar-move-ui:cert"]).toContain(
      "production-calendar-operator-depth-era15-cert-live",
    );
    expect(
      governanceBundlesIncludesCert(scripts, "test:ci:production-calendar-move-ui:cert"),
    ).toBe(true);
  });

  it("wires certified actions on the production calendar page", () => {
    const page = readFileSync(
      join(ROOT, PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_PAGE_FILE),
      "utf8",
    );
    expect(page).toContain("createPlanTaskAction");
    expect(page).toContain("movePlanTaskAction");
    expect(page).toContain("updatePlanTaskStatusAction");
  });

  it("documents era15 operator recert in canonical docs", () => {
    const checklist = readFileSync(join(ROOT, PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_OPS_DOC), "utf8");
    for (const marker of PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_CANONICAL_MARKERS) {
      expect(checklist.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(
        PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_POLICY_ID.toLowerCase(),
      );
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_POLICY_ID);
    expect(existsSync(join(ROOT, PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_SMOKE_SCRIPT))).toBe(
      true,
    );
    for (const rel of PRODUCTION_CALENDAR_OPERATOR_DEPTH_ERA15_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
