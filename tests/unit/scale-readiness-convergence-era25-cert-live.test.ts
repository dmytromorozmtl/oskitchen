import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SCALE_READINESS_CONVERGENCE_ERA25_CI_SCRIPTS,
  SCALE_READINESS_CONVERGENCE_ERA25_OPS_SCRIPTS,
  SCALE_READINESS_CONVERGENCE_ERA25_POLICY_ID,
  SCALE_READINESS_CONVERGENCE_ERA25_PRODUCT_SURFACES,
  SCALE_READINESS_CONVERGENCE_ERA25_UNIT_TESTS,
  SCALE_READINESS_CONVERGENCE_ERA25_DOC,
} from "@/lib/commercial/scale-readiness-convergence-era25-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("scale readiness convergence era25 CI certification (live repo)", () => {
  it("locks era25 convergence policy id", () => {
    expect(SCALE_READINESS_CONVERGENCE_ERA25_POLICY_ID).toBe(
      "era25-scale-readiness-convergence-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...SCALE_READINESS_CONVERGENCE_ERA25_OPS_SCRIPTS,
      ...SCALE_READINESS_CONVERGENCE_ERA25_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents convergence slice with ops wiring", () => {
    const doc = readFileSync(join(ROOT, SCALE_READINESS_CONVERGENCE_ERA25_DOC), "utf8");
    expect(doc).toContain("scale-readiness-convergence");
    expect(doc).toContain(
      "run-scale-readiness-convergence-post-month2-convergence-orchestrator-era25",
    );
    expect(doc).toContain("scaleReadinessConvergenceEra25Milestone");
    expect(doc).toContain("#era25-scale-readiness-convergence");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of SCALE_READINESS_CONVERGENCE_ERA25_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-scale-readiness-convergence-era25-validate.yml"),
      ),
    ).toBe(true);
    for (const rel of SCALE_READINESS_CONVERGENCE_ERA25_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
