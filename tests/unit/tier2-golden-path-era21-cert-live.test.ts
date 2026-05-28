import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  TIER2_STAGING_GOLDEN_PATH_ERA21_CI_SCRIPTS,
  TIER2_STAGING_GOLDEN_PATH_ERA21_OPS_SCRIPTS,
  TIER2_STAGING_GOLDEN_PATH_ERA21_POLICY_ID,
  TIER2_STAGING_GOLDEN_PATH_ERA21_PRODUCT_SURFACES,
  TIER2_STAGING_GOLDEN_PATH_ERA21_STEP2_DOC,
  TIER2_STAGING_GOLDEN_PATH_ERA21_UNIT_TESTS,
} from "@/lib/commercial/tier2-staging-golden-path-era21-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("tier2 golden path era21 CI certification (live repo)", () => {
  it("locks era21 tier2 policy id", () => {
    expect(TIER2_STAGING_GOLDEN_PATH_ERA21_POLICY_ID).toBe("era21-tier2-golden-path-v1");
  });

  it("defines era21 tier2 ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...TIER2_STAGING_GOLDEN_PATH_ERA21_OPS_SCRIPTS,
      ...TIER2_STAGING_GOLDEN_PATH_ERA21_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 2 execution playbook chain", () => {
    const step2 = readFileSync(join(ROOT, TIER2_STAGING_GOLDEN_PATH_ERA21_STEP2_DOC), "utf8");
    expect(step2).toContain("smoke:tier2-staging-golden-path");
    expect(step2).toContain("TIER2_CHANNEL_WEBHOOK_MANUAL");
    expect(step2).toContain("ops:run-tier2-golden-path-post-p0-orchestrator");
  });

  it("wires product surfaces and unit tests", () => {
    for (const rel of TIER2_STAGING_GOLDEN_PATH_ERA21_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, ".github/workflows/ops-tier2-golden-path-validate.yml"))).toBe(
      true,
    );
    for (const rel of TIER2_STAGING_GOLDEN_PATH_ERA21_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
