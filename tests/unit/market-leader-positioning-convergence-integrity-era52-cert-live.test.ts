import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_CI_SCRIPTS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_OPS_SCRIPTS,
  MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_POLICY_ID,
  MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_UNIT_TESTS,
} from "@/lib/commercial/market-leader-positioning-convergence-integrity-era52-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("market leader positioning convergence integrity era52 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_POLICY_ID).toBe(
      "era52-market-leader-positioning-convergence-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_OPS_SCRIPTS,
      ...MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-market-leader-positioning-convergence-integrity-validate.yml",
        ),
      ),
    ).toBe(true);
    for (const path of MARKET_LEADER_POSITIONING_CONVERGENCE_INTEGRITY_ERA52_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
