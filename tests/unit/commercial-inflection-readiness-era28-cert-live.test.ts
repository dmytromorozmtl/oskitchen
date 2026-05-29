import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_INFLECTION_READINESS_ERA28_CI_SCRIPTS,
  COMMERCIAL_INFLECTION_READINESS_ERA28_OPS_SCRIPTS,
  COMMERCIAL_INFLECTION_READINESS_POLICY_ID,
  COMMERCIAL_INFLECTION_READINESS_ERA28_PRODUCT_SURFACES,
  COMMERCIAL_INFLECTION_READINESS_ERA28_UNIT_TESTS,
} from "@/lib/commercial/commercial-inflection-readiness-era28-policy";
import { COMMERCIAL_INFLECTION_EXECUTION_STEP_DOC } from "@/lib/commercial/commercial-inflection-readiness-era28";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("commercial inflection readiness era28 CI certification (live repo)", () => {
  it("locks commercial inflection policy id", () => {
    expect(COMMERCIAL_INFLECTION_READINESS_POLICY_ID).toBe("commercial-inflection-readiness-v1");
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...COMMERCIAL_INFLECTION_READINESS_ERA28_OPS_SCRIPTS,
      ...COMMERCIAL_INFLECTION_READINESS_ERA28_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents execution step with ops wiring", () => {
    const execution = readFileSync(join(ROOT, COMMERCIAL_INFLECTION_EXECUTION_STEP_DOC), "utf8");
    expect(execution).toContain("commercial-inflection-readiness-v1");
    expect(execution).toContain("run-commercial-inflection-readiness-orchestrator");
    expect(execution).toContain("ops:validate-commercial-inflection-readiness");
    expect(execution).toContain("#commercial-inflection-readiness");
    expect(execution).toContain("p0_ops_vault_blocked");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of COMMERCIAL_INFLECTION_READINESS_ERA28_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(join(ROOT, ".github/workflows/ops-commercial-inflection-readiness-validate.yml")),
    ).toBe(true);
    for (const rel of COMMERCIAL_INFLECTION_READINESS_ERA28_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
