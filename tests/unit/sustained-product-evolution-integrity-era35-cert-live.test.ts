import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_CI_SCRIPTS,
  SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_OPS_SCRIPTS,
  SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_POLICY_ID,
  SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_UNIT_TESTS,
} from "@/lib/commercial/sustained-product-evolution-integrity-era35-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("sustained product evolution integrity era35 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_POLICY_ID).toBe(
      "era35-sustained-product-evolution-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_OPS_SCRIPTS,
      ...SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-sustained-product-evolution-integrity-validate.yml"),
      ),
    ).toBe(true);
    for (const path of SUSTAINED_PRODUCT_EVOLUTION_INTEGRITY_ERA35_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
