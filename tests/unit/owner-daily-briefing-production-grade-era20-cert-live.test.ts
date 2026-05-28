import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_CANONICAL_MARKERS,
  OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_CI_SCRIPTS,
  OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_DOC,
  OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_REVIEW_SECTION,
  OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_UNIT_TESTS,
} from "@/lib/briefing/owner-daily-briefing-production-grade-era20-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("owner daily briefing production-grade era20 CI certification (live repo)", () => {
  it("defines era20 briefing production-grade cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:owner-daily-briefing-era19"]).toContain(
      "owner-daily-briefing-production-grade-era20",
    );
  });

  it("documents production-grade pass in canonical docs and hero", () => {
    expect(existsSync(join(ROOT, OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_DOC))).toBe(true);
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_REVIEW_SECTION);
    for (const marker of OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const hero = readFileSync(join(ROOT, "components/dashboard/owner-daily-briefing-hero.tsx"), "utf8");
    expect(hero).toContain("owner-briefing-p0-proof-blocked");
    expect(hero).toContain("owner-briefing-operational-empty-state");
    const service = readFileSync(
      join(ROOT, "services/briefing/owner-daily-briefing-service.ts"),
      "utf8",
    );
    expect(service).toContain("finalizeOwnerDailyBriefingTopActions");
    for (const rel of OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
