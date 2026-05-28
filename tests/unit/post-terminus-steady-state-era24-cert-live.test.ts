import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POST_TERMINUS_STEADY_STATE_ERA24_CI_SCRIPTS,
  POST_TERMINUS_STEADY_STATE_ERA24_OPS_SCRIPTS,
  POST_TERMINUS_STEADY_STATE_ERA24_POLICY_ID,
  POST_TERMINUS_STEADY_STATE_ERA24_PRODUCT_SURFACES,
  POST_TERMINUS_STEADY_STATE_ERA24_UNIT_TESTS,
  POST_TERMINUS_STEADY_STATE_STEP14_DOC,
} from "@/lib/commercial/post-terminus-steady-state-era24-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("post-terminus steady state era24 CI certification (live repo)", () => {
  it("locks era24 post-terminus steady state policy id", () => {
    expect(POST_TERMINUS_STEADY_STATE_ERA24_POLICY_ID).toBe("era24-post-terminus-steady-state-v1");
  });

  it("defines ops and cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...POST_TERMINUS_STEADY_STATE_ERA24_OPS_SCRIPTS,
      ...POST_TERMINUS_STEADY_STATE_ERA24_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("documents step 14 execution", () => {
    const step14 = readFileSync(join(ROOT, POST_TERMINUS_STEADY_STATE_STEP14_DOC), "utf8");
    expect(step14).toContain("era24-post-terminus-steady-state-v1");
    expect(step14).toContain("ops:validate-steady-state-operator-loop");
    expect(step14).toContain("#post-terminus-steady-state");
  });

  it("wires product surfaces and workflow", () => {
    for (const rel of POST_TERMINUS_STEADY_STATE_ERA24_PRODUCT_SURFACES) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(
      existsSync(join(ROOT, ".github/workflows/ops-steady-state-operator-loop-validate.yml")),
    ).toBe(true);
    for (const rel of POST_TERMINUS_STEADY_STATE_ERA24_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
