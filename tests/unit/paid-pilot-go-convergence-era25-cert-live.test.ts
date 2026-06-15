import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PAID_PILOT_GO_CONVERGENCE_ERA25_CI_SCRIPTS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_OPS_SCRIPTS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_POLICY_ID,
  PAID_PILOT_GO_CONVERGENCE_ERA25_PRODUCT_SURFACES,
  PAID_PILOT_GO_CONVERGENCE_ERA25_UNIT_TESTS,
  PAID_PILOT_GO_CONVERGENCE_ERA25_DOC,
} from "@/lib/commercial/paid-pilot-go-convergence-era25-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("paid pilot go convergence era25 CI certification (live repo)", () => {
  it("locks era25 convergence policy id", () => {
    expect(PAID_PILOT_GO_CONVERGENCE_ERA25_POLICY_ID).toBe(
      "era25-paid-pilot-go-convergence-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...PAID_PILOT_GO_CONVERGENCE_ERA25_OPS_SCRIPTS,
      ...PAID_PILOT_GO_CONVERGENCE_ERA25_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents convergence slice with ops wiring", () => {
    const doc = readFileSync(join(ROOT, PAID_PILOT_GO_CONVERGENCE_ERA25_DOC), "utf8");
    expect(doc).toContain("paid-pilot-go-convergence");
    expect(doc).toContain("run-paid-pilot-go-convergence-post-breakthrough-orchestrator-era25");
    expect(doc).toContain("paidPilotGoConvergenceEra25Milestone");
    expect(doc).toContain("#era25-paid-pilot-go-convergence");
    expect(doc).toContain("B3");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of PAID_PILOT_GO_CONVERGENCE_ERA25_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-paid-pilot-go-convergence-era25-validate.yml"),
      ),
    ).toBe(true);
    for (const rel of PAID_PILOT_GO_CONVERGENCE_ERA25_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
