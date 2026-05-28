import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MONTH2_MARKET_READINESS_ERA21_CI_SCRIPTS,
  MONTH2_MARKET_READINESS_ERA21_OPS_SCRIPTS,
  MONTH2_MARKET_READINESS_ERA21_POLICY_ID,
  MONTH2_MARKET_READINESS_ERA21_PRODUCT_SURFACES,
  MONTH2_MARKET_READINESS_ERA21_UNIT_TESTS,
} from "@/lib/commercial/month2-market-readiness-era21-policy";
import { MONTH2_MARKET_READINESS_STEP5_DOC } from "@/lib/commercial/month2-market-readiness-phases-era21";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("month2 market readiness era21 CI certification (live repo)", () => {
  it("locks era21 month2 policy id", () => {
    expect(MONTH2_MARKET_READINESS_ERA21_POLICY_ID).toBe("era21-month2-market-readiness-v1");
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...MONTH2_MARKET_READINESS_ERA21_OPS_SCRIPTS,
      ...MONTH2_MARKET_READINESS_ERA21_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 5 execution", () => {
    const step5 = readFileSync(join(ROOT, MONTH2_MARKET_READINESS_STEP5_DOC), "utf8");
    expect(step5).toContain("smoke:investor-narrative-onepager");
    expect(step5).toContain("era21-month2-market-readiness-v1");
    expect(step5).toContain("run-month2-market-readiness-post-week1-orchestrator");
    expect(step5).toContain("/solutions/ghost-kitchens");
  });

  it("wires product surfaces", () => {
    for (const rel of MONTH2_MARKET_READINESS_ERA21_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, ".github/workflows/ops-month2-market-readiness-validate.yml"))).toBe(
      true,
    );
    for (const rel of MONTH2_MARKET_READINESS_ERA21_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
