import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_CI_SCRIPTS,
  TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_OPS_SCRIPTS,
  TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_POLICY_ID,
  TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_UNIT_TESTS,
} from "@/lib/commercial/tier2-staging-golden-path-integrity-era28-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("tier2 staging golden path integrity era28 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_POLICY_ID).toBe(
      "era28-tier2-staging-golden-path-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_OPS_SCRIPTS,
      ...TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-tier2-staging-golden-path-integrity-validate.yml"),
      ),
    ).toBe(true);
    for (const rel of TIER2_STAGING_GOLDEN_PATH_INTEGRITY_ERA28_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
