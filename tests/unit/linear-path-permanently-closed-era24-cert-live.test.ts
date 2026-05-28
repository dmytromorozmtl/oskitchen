import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_CI_SCRIPTS,
  LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_OPS_SCRIPTS,
  LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_POLICY_ID,
  LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_PRODUCT_SURFACES,
  LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_UNIT_TESTS,
  LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC,
} from "@/lib/commercial/linear-path-permanently-closed-era24-policy";
import { LINEAR_PATH_DOC_CHAIN_STEP_DOCS } from "@/lib/commercial/linear-path-permanently-closed-phases-era24";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("linear path permanently closed era24 CI certification (live repo)", () => {
  it("locks era24 terminal closure policy id", () => {
    expect(LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_POLICY_ID).toBe(
      "era24-linear-path-permanently-closed-v1",
    );
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_OPS_SCRIPTS,
      ...LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 16 with ops wiring", () => {
    const step16 = readFileSync(join(ROOT, LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC), "utf8");
    expect(step16).toContain("era24-linear-path-permanently-closed-v1");
    expect(step16).toContain("ops:validate-linear-path-permanently-closed");
    expect(step16).toContain("#linear-path-permanently-closed");
  });

  it("wires doc chain, surfaces, and workflow", () => {
    for (const doc of LINEAR_PATH_DOC_CHAIN_STEP_DOCS) {
      expect(existsSync(join(ROOT, doc)), doc).toBe(true);
    }
    for (const rel of LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(join(ROOT, ".github/workflows/ops-linear-path-permanently-closed-validate.yml")),
    ).toBe(true);
    for (const rel of LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
