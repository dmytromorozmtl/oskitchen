import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  LINEAR_CHAIN_TERMINUS_GUARD_ERA24_CI_SCRIPTS,
  LINEAR_CHAIN_TERMINUS_GUARD_ERA24_OPS_SCRIPTS,
  LINEAR_CHAIN_TERMINUS_GUARD_ERA24_POLICY_ID,
  LINEAR_CHAIN_TERMINUS_GUARD_ERA24_PRODUCT_SURFACES,
  LINEAR_CHAIN_TERMINUS_GUARD_ERA24_UNIT_TESTS,
} from "@/lib/commercial/linear-chain-terminus-guard-era24-policy";
import { LINEAR_CHAIN_STEP17_FORBIDDEN_DOC } from "@/lib/commercial/linear-chain-terminus-guard-era24";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("linear chain terminus guard era24 CI certification (live repo)", () => {
  it("locks era24 terminus guard policy id", () => {
    expect(LINEAR_CHAIN_TERMINUS_GUARD_ERA24_POLICY_ID).toBe(
      "era24-linear-chain-terminus-guard-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...LINEAR_CHAIN_TERMINUS_GUARD_ERA24_OPS_SCRIPTS,
      ...LINEAR_CHAIN_TERMINUS_GUARD_ERA24_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 17 forbidden with ops wiring", () => {
    const step17 = readFileSync(join(ROOT, LINEAR_CHAIN_STEP17_FORBIDDEN_DOC), "utf8");
    expect(step17).toContain("era24-linear-chain-terminus-guard-v1");
    expect(step17).toContain(
      "run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator",
    );
    expect(step17).toContain("linearChainTerminusGuardMilestone");
    expect(step17).toContain("#linear-chain-step17-forbidden");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of LINEAR_CHAIN_TERMINUS_GUARD_ERA24_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(join(ROOT, ".github/workflows/ops-linear-chain-terminus-guard-validate.yml")),
    ).toBe(true);
    for (const rel of LINEAR_CHAIN_TERMINUS_GUARD_ERA24_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
