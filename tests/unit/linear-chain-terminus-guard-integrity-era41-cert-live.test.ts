import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_CI_SCRIPTS,
  LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_OPS_SCRIPTS,
  LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_POLICY_ID,
  LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_UNIT_TESTS,
} from "@/lib/commercial/linear-chain-terminus-guard-integrity-era41-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("linear chain terminus guard integrity era41 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_POLICY_ID).toBe(
      "era41-linear-chain-terminus-guard-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_OPS_SCRIPTS,
      ...LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-linear-chain-terminus-guard-integrity-validate.yml"),
      ),
    ).toBe(true);
    for (const path of LINEAR_CHAIN_TERMINUS_GUARD_INTEGRITY_ERA41_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
