import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_CI_SCRIPTS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_OPS_SCRIPTS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POLICY_ID,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PRODUCT_SURFACES,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_UNIT_TESTS,
  SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC,
} from "@/lib/commercial/series-a-partner-expansion-convergence-era25-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("series a partner expansion convergence era25 CI certification (live repo)", () => {
  it("locks era25 convergence policy id", () => {
    expect(SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_POLICY_ID).toBe(
      "era25-series-a-partner-expansion-convergence-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_OPS_SCRIPTS,
      ...SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents convergence slice with ops wiring", () => {
    const doc = readFileSync(join(ROOT, SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_DOC), "utf8");
    expect(doc).toContain("series-a-partner-expansion-convergence");
    expect(doc).toContain(
      "run-series-a-partner-expansion-convergence-post-scale-convergence-orchestrator-era25",
    );
    expect(doc).toContain("seriesAPartnerExpansionConvergenceEra25Milestone");
    expect(doc).toContain("#era25-series-a-partner-expansion-convergence");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-series-a-partner-expansion-convergence-era25-validate.yml",
        ),
      ),
    ).toBe(true);
    for (const rel of SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
