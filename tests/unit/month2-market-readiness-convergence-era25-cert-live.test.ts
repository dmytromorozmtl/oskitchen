import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_CI_SCRIPTS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_OPS_SCRIPTS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POLICY_ID,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PRODUCT_SURFACES,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_UNIT_TESTS,
  MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC,
} from "@/lib/commercial/month2-market-readiness-convergence-era25-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("month2 market readiness convergence era25 CI certification (live repo)", () => {
  it("locks era25 convergence policy id", () => {
    expect(MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_POLICY_ID).toBe(
      "era25-month2-market-readiness-convergence-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_OPS_SCRIPTS,
      ...MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents convergence slice with ops wiring", () => {
    const doc = readFileSync(join(ROOT, MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_DOC), "utf8");
    expect(doc).toContain("month2-market-readiness-convergence");
    expect(doc).toContain(
      "run-month2-market-readiness-convergence-post-week1-convergence-orchestrator-era25",
    );
    expect(doc).toContain("month2MarketReadinessConvergenceEra25Milestone");
    expect(doc).toContain("#era25-month2-market-readiness-convergence");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-month2-market-readiness-convergence-era25-validate.yml"),
      ),
    ).toBe(true);
    for (const rel of MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
