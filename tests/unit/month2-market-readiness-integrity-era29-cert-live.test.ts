import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MONTH2_MARKET_READINESS_INTEGRITY_ERA29_CI_SCRIPTS,
  MONTH2_MARKET_READINESS_INTEGRITY_ERA29_OPS_SCRIPTS,
  MONTH2_MARKET_READINESS_INTEGRITY_ERA29_POLICY_ID,
  MONTH2_MARKET_READINESS_INTEGRITY_ERA29_UNIT_TESTS,
} from "@/lib/commercial/month2-market-readiness-integrity-era29-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("month2 market readiness integrity era29 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(MONTH2_MARKET_READINESS_INTEGRITY_ERA29_POLICY_ID).toBe(
      "era29-month2-market-readiness-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...MONTH2_MARKET_READINESS_INTEGRITY_ERA29_OPS_SCRIPTS,
      ...MONTH2_MARKET_READINESS_INTEGRITY_ERA29_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-month2-market-readiness-integrity-validate.yml"),
      ),
    ).toBe(true);
    for (const rel of MONTH2_MARKET_READINESS_INTEGRITY_ERA29_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
