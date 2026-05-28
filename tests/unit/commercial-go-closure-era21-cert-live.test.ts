import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_GO_CLOSURE_ERA21_CI_SCRIPTS,
  COMMERCIAL_GO_CLOSURE_ERA21_OPS_SCRIPTS,
  COMMERCIAL_GO_CLOSURE_ERA21_POLICY_ID,
  COMMERCIAL_GO_CLOSURE_ERA21_PRODUCT_SURFACES,
  COMMERCIAL_GO_CLOSURE_ERA21_UNIT_TESTS,
} from "@/lib/commercial/commercial-go-closure-era21-policy";
import { COMMERCIAL_GO_CLOSURE_STEP3_DOC } from "@/lib/commercial/commercial-go-closure-phases-era21";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("commercial go closure era21 CI certification (live repo)", () => {
  it("locks era21 commercial go closure policy id", () => {
    expect(COMMERCIAL_GO_CLOSURE_ERA21_POLICY_ID).toBe("era21-commercial-go-closure-v1");
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...COMMERCIAL_GO_CLOSURE_ERA21_OPS_SCRIPTS,
      ...COMMERCIAL_GO_CLOSURE_ERA21_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 3 execution", () => {
    const step3 = readFileSync(join(ROOT, COMMERCIAL_GO_CLOSURE_STEP3_DOC), "utf8");
    expect(step3).toContain("smoke:pilot-gono-go");
    expect(step3).toContain("PILOT_GONOGO_ICP_INPUT_JSON");
    expect(step3).toContain("ops:run-commercial-go-closure-post-tier2-orchestrator");
  });

  it("wires product surfaces", () => {
    for (const rel of COMMERCIAL_GO_CLOSURE_ERA21_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, ".github/workflows/ops-commercial-go-closure-validate.yml"))).toBe(
      true,
    );
    for (const rel of COMMERCIAL_GO_CLOSURE_ERA21_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
