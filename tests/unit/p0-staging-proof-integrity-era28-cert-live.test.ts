import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  P0_STAGING_PROOF_INTEGRITY_ERA28_CI_SCRIPTS,
  P0_STAGING_PROOF_INTEGRITY_ERA28_OPS_SCRIPTS,
  P0_STAGING_PROOF_INTEGRITY_ERA28_POLICY_ID,
  P0_STAGING_PROOF_INTEGRITY_ERA28_UNIT_TESTS,
} from "@/lib/commercial/p0-staging-proof-integrity-era28-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("p0 staging proof integrity era28 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(P0_STAGING_PROOF_INTEGRITY_ERA28_POLICY_ID).toBe("era28-p0-staging-proof-integrity-v1");
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...P0_STAGING_PROOF_INTEGRITY_ERA28_OPS_SCRIPTS,
      ...P0_STAGING_PROOF_INTEGRITY_ERA28_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(join(ROOT, ".github/workflows/ops-p0-staging-proof-integrity-validate.yml")),
    ).toBe(true);
    for (const rel of P0_STAGING_PROOF_INTEGRITY_ERA28_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
