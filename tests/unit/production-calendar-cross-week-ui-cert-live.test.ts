import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  PRODUCTION_CALENDAR_CROSS_WEEK_UI_CANONICAL_DOC_PATHS,
  PRODUCTION_CALENDAR_CROSS_WEEK_UI_CANONICAL_MARKERS,
  PRODUCTION_CALENDAR_CROSS_WEEK_UI_CI_SCRIPTS,
  PRODUCTION_CALENDAR_CROSS_WEEK_UI_PAGE_FILE,
  PRODUCTION_CALENDAR_CROSS_WEEK_UI_POLICY_ID,
  PRODUCTION_CALENDAR_CROSS_WEEK_UI_UNIT_TESTS,
  productionCalendarPageWiresCrossWeekNavigation,
} from "@/lib/production/production-calendar-cross-week-ui-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("production calendar cross-week UI CI certification (live repo)", () => {
  it("locks era10 production calendar cross-week UI policy id", () => {
    expect(PRODUCTION_CALENDAR_CROSS_WEEK_UI_POLICY_ID).toBe(
      "era10-production-calendar-cross-week-ui-v1",
    );
  });

  it("defines cross-week UI CI scripts and chains cert into move-ui bundle", () => {
    const scripts = readPackageScripts();
    for (const name of PRODUCTION_CALENDAR_CROSS_WEEK_UI_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:production-calendar-move-ui:cert"]).toContain(
      "production-calendar-cross-week-ui-cert-live",
    );
    expect(
      governanceBundlesIncludesCert(scripts, "test:ci:production-calendar-move-ui:cert"),
    ).toBe(true);
  });

  it("has policy module, week navigation helpers, and unit tests on disk", () => {
    expect(
      existsSync(join(ROOT, "lib/production/production-calendar-cross-week-ui-policy.ts")),
    ).toBe(true);
    expect(existsSync(join(ROOT, "lib/production/production-calendar-week-navigation.ts"))).toBe(
      true,
    );
    for (const rel of PRODUCTION_CALENDAR_CROSS_WEEK_UI_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires cross-week navigation and boundary moves on the calendar page", () => {
    const page = readFileSync(join(ROOT, PRODUCTION_CALENDAR_CROSS_WEEK_UI_PAGE_FILE), "utf8");
    expect(productionCalendarPageWiresCrossWeekNavigation(page)).toBe(true);
  });

  it("documents cross-week UI policy in canonical docs", () => {
    for (const rel of PRODUCTION_CALENDAR_CROSS_WEEK_UI_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of PRODUCTION_CALENDAR_CROSS_WEEK_UI_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(PRODUCTION_CALENDAR_CROSS_WEEK_UI_POLICY_ID);
  });
});
