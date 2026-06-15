import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_CI_SCRIPTS,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_OPS_SCRIPTS,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_POLICY_ID,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_PRODUCT_SURFACES,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_UNIT_TESTS,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC,
} from "@/lib/commercial/era25-first-product-slice-blueprint-era24-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("era25 first product slice blueprint era24 CI certification (live repo)", () => {
  it("locks era24 blueprint policy id", () => {
    expect(ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_POLICY_ID).toBe(
      "era24-era25-first-product-slice-blueprint-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_OPS_SCRIPTS,
      ...ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents blueprint with ops wiring", () => {
    const doc = readFileSync(join(ROOT, ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_DOC), "utf8");
    expect(doc).toContain("era25-first-product-slice-blueprint");
    expect(doc).toContain("run-era25-first-product-slice-blueprint-post-gates-orchestrator");
    expect(doc).toContain("era25FirstProductSliceBlueprintMilestone");
    expect(doc).toContain("#era25-first-product-slice-blueprint");
    expect(doc).toContain("owner-daily-briefing-breakthrough");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-era25-first-product-slice-blueprint-validate.yml"),
      ),
    ).toBe(true);
    for (const rel of ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ERA24_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
