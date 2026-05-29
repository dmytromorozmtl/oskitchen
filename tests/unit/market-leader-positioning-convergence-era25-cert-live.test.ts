import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_CI_SCRIPTS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_OPS_SCRIPTS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POLICY_ID,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PRODUCT_SURFACES,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_UNIT_TESTS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC,
} from "@/lib/commercial/market-leader-positioning-convergence-era25-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("market leader positioning convergence era25 CI certification (live repo)", () => {
  it("locks era25 convergence policy id", () => {
    expect(MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_POLICY_ID).toBe(
      "era25-market-leader-positioning-convergence-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_OPS_SCRIPTS,
      ...MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents convergence slice with ops wiring", () => {
    const doc = readFileSync(join(ROOT, MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_DOC), "utf8");
    expect(doc).toContain("market-leader-positioning-convergence");
    expect(doc).toContain(
      "run-market-leader-positioning-convergence-post-series-a-convergence-orchestrator-era25",
    );
    expect(doc).toContain("marketLeaderPositioningConvergenceEra25Milestone");
    expect(doc).toContain("#era25-market-leader-positioning-convergence");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-market-leader-positioning-convergence-era25-validate.yml",
        ),
      ),
    ).toBe(true);
    for (const rel of MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
