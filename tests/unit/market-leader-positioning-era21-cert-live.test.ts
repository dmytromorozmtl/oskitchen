import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MARKET_LEADER_POSITIONING_ERA21_CI_SCRIPTS,
  MARKET_LEADER_POSITIONING_ERA21_OPS_SCRIPTS,
  MARKET_LEADER_POSITIONING_ERA21_POLICY_ID,
  MARKET_LEADER_POSITIONING_ERA21_PRODUCT_SURFACES,
  MARKET_LEADER_POSITIONING_ERA21_UNIT_TESTS,
} from "@/lib/commercial/market-leader-positioning-era21-policy";
import { MARKET_LEADER_POSITIONING_STEP8_DOC } from "@/lib/commercial/market-leader-positioning-phases-era21";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("market leader positioning era21 CI certification (live repo)", () => {
  it("locks era21 market leader policy id", () => {
    expect(MARKET_LEADER_POSITIONING_ERA21_POLICY_ID).toBe("era21-market-leader-positioning-v1");
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...MARKET_LEADER_POSITIONING_ERA21_OPS_SCRIPTS,
      ...MARKET_LEADER_POSITIONING_ERA21_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 8 execution", () => {
    const step8 = readFileSync(join(ROOT, MARKET_LEADER_POSITIONING_STEP8_DOC), "utf8");
    expect(step8).toContain("MARKET_LEADER_CATEGORY_NARRATIVE_REVIEWED");
    expect(step8).toContain("era21-market-leader-positioning-v1");
    expect(step8).toContain("run-market-leader-positioning-post-series-a-orchestrator");
    expect(step8).toContain("smoke:pilot-forbidden-claims-enforcement");
  });

  it("wires product surfaces", () => {
    for (const rel of MARKET_LEADER_POSITIONING_ERA21_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(join(ROOT, ".github/workflows/ops-market-leader-positioning-validate.yml")),
    ).toBe(true);
    for (const rel of MARKET_LEADER_POSITIONING_ERA21_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
