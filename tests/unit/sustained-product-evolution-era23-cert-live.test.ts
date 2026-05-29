import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SUSTAINED_PRODUCT_EVOLUTION_ERA23_CI_SCRIPTS,
  SUSTAINED_PRODUCT_EVOLUTION_ERA23_OPS_SCRIPTS,
  SUSTAINED_PRODUCT_EVOLUTION_ERA23_POLICY_ID,
  SUSTAINED_PRODUCT_EVOLUTION_ERA23_PRODUCT_SURFACES,
  SUSTAINED_PRODUCT_EVOLUTION_ERA23_UNIT_TESTS,
} from "@/lib/commercial/sustained-product-evolution-era23-policy";
import { SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC } from "@/lib/commercial/sustained-product-evolution-phases-era23";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("sustained product evolution era23 CI certification (live repo)", () => {
  it("locks era23 product evolution policy id", () => {
    expect(SUSTAINED_PRODUCT_EVOLUTION_ERA23_POLICY_ID).toBe("era23-sustained-product-evolution-v1");
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...SUSTAINED_PRODUCT_EVOLUTION_ERA23_OPS_SCRIPTS,
      ...SUSTAINED_PRODUCT_EVOLUTION_ERA23_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 11 execution", () => {
    const step11 = readFileSync(join(ROOT, SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC), "utf8");
    expect(step11).toContain("era23-sustained-product-evolution-v1");
    expect(step11).toContain(
      "run-sustained-product-evolution-post-improvement-loop-orchestrator",
    );
    expect(step11).toContain("operator_feedback_score");
    expect(step11).toContain("#sustained-product-evolution");
  });

  it("wires product surfaces", () => {
    for (const rel of SUSTAINED_PRODUCT_EVOLUTION_ERA23_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, ".github/workflows/ops-sustained-product-evolution-validate.yml"))).toBe(
      true,
    );
    for (const rel of SUSTAINED_PRODUCT_EVOLUTION_ERA23_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
