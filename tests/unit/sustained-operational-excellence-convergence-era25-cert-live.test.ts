import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_CI_SCRIPTS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_OPS_SCRIPTS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POLICY_ID,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_PRODUCT_SURFACES,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_UNIT_TESTS,
  SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC,
} from "@/lib/commercial/sustained-operational-excellence-convergence-era25-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("sustained operational excellence convergence era25 CI certification (live repo)", () => {
  it("locks era25 convergence policy id", () => {
    expect(SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_POLICY_ID).toBe(
      "era25-sustained-operational-excellence-convergence-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_OPS_SCRIPTS,
      ...SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents convergence slice with ops wiring", () => {
    const doc = readFileSync(join(ROOT, SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_DOC), "utf8");
    expect(doc).toContain("sustained-operational-excellence-convergence");
    expect(doc).toContain(
      "run-sustained-operational-excellence-convergence-post-market-leader-convergence-orchestrator-era25",
    );
    expect(doc).toContain("sustainedOperationalExcellenceConvergenceEra25Milestone");
    expect(doc).toContain("#era25-sustained-operational-excellence-convergence");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-sustained-operational-excellence-convergence-era25-validate.yml",
        ),
      ),
    ).toBe(true);
    for (const rel of SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
