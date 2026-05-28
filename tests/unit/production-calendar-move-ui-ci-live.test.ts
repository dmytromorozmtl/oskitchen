import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  PRODUCTION_CALENDAR_MOVE_UI_CANONICAL_DOC_PATHS,
  PRODUCTION_CALENDAR_MOVE_UI_CANONICAL_MARKERS,
  PRODUCTION_CALENDAR_MOVE_UI_CI_SCRIPTS,
  PRODUCTION_CALENDAR_MOVE_UI_PAGE_FILE,
  PRODUCTION_CALENDAR_MOVE_UI_POLICY_ID,
  PRODUCTION_CALENDAR_MOVE_UI_UNIT_TESTS,
  productionCalendarPageWiresMoveTaskAction,
} from "@/lib/production/production-calendar-move-ui-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("production calendar move UI CI certification (live repo)", () => {
  it("locks era8 production calendar move UI policy id", () => {
    expect(PRODUCTION_CALENDAR_MOVE_UI_POLICY_ID).toBe(
      "era8-production-calendar-move-ui-v1",
    );
  });

  it("defines production calendar move UI CI scripts wired into governance bundles", () => {
    const scripts = readPackageScripts();
    for (const name of PRODUCTION_CALENDAR_MOVE_UI_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(governanceBundlesIncludesCert(scripts, "test:ci:production-calendar-move-ui:cert")).toBe(
      true,
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:production-calendar-move-ui")).toBe(
      true,
    );
  });

  it("has policy module, calendar page, and unit tests on disk", () => {
    expect(existsSync(join(ROOT, "lib/production/production-calendar-move-ui-policy.ts"))).toBe(
      true,
    );
    expect(existsSync(join(ROOT, PRODUCTION_CALENDAR_MOVE_UI_PAGE_FILE))).toBe(true);
    for (const rel of PRODUCTION_CALENDAR_MOVE_UI_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires movePlanTaskAction forms on the production calendar page", () => {
    const page = readFileSync(join(ROOT, PRODUCTION_CALENDAR_MOVE_UI_PAGE_FILE), "utf8");
    expect(productionCalendarPageWiresMoveTaskAction(page)).toBe(true);
  });

  it("documents move UI policy in canonical docs", () => {
    for (const rel of PRODUCTION_CALENDAR_MOVE_UI_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of PRODUCTION_CALENDAR_MOVE_UI_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(PRODUCTION_CALENDAR_MOVE_UI_POLICY_ID);
  });
});
