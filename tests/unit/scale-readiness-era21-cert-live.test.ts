import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SCALE_READINESS_ERA21_CI_SCRIPTS,
  SCALE_READINESS_ERA21_OPS_SCRIPTS,
  SCALE_READINESS_ERA21_POLICY_ID,
  SCALE_READINESS_ERA21_PRODUCT_SURFACES,
  SCALE_READINESS_ERA21_UNIT_TESTS,
} from "@/lib/commercial/scale-readiness-era21-policy";
import { SCALE_READINESS_STEP6_DOC } from "@/lib/commercial/scale-readiness-phases-era21";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("scale readiness era21 CI certification (live repo)", () => {
  it("locks era21 scale readiness policy id", () => {
    expect(SCALE_READINESS_ERA21_POLICY_ID).toBe("era21-scale-readiness-v1");
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [...SCALE_READINESS_ERA21_OPS_SCRIPTS, ...SCALE_READINESS_ERA21_CI_SCRIPTS]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 6 execution", () => {
    const step6 = readFileSync(join(ROOT, SCALE_READINESS_STEP6_DOC), "utf8");
    expect(step6).toContain("smoke:pilot-rollback-drill");
    expect(step6).toContain("era21-scale-readiness-v1");
    expect(step6).toContain("run-scale-readiness-post-month2-orchestrator");
    expect(step6).toContain("SCALE_PER_CUSTOMER_GO_ISOLATION");
  });

  it("wires product surfaces", () => {
    for (const rel of SCALE_READINESS_ERA21_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, ".github/workflows/ops-scale-readiness-validate.yml"))).toBe(true);
    for (const rel of SCALE_READINESS_ERA21_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
