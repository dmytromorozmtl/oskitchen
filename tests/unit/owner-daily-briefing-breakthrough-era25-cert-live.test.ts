import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_CI_SCRIPTS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_OPS_SCRIPTS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POLICY_ID,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PRODUCT_SURFACES,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_UNIT_TESTS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-era25-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("owner daily briefing breakthrough era25 CI certification (live repo)", () => {
  it("locks era25 product policy id", () => {
    expect(OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_POLICY_ID).toBe(
      "era25-owner-daily-briefing-breakthrough-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_OPS_SCRIPTS,
      ...OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents product slice with ops wiring", () => {
    const doc = readFileSync(join(ROOT, OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_DOC), "utf8");
    expect(doc).toContain("owner-daily-briefing-breakthrough");
    expect(doc).toContain("run-owner-daily-briefing-breakthrough-post-gates-orchestrator-era25");
    expect(doc).toContain("ownerDailyBriefingBreakthroughEra25Milestone");
    expect(doc).toContain("#era25-owner-daily-briefing-breakthrough");
    expect(doc).toContain("B0");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-owner-daily-briefing-breakthrough-era25-validate.yml"),
      ),
    ).toBe(true);
    for (const rel of OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
