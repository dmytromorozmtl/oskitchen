import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_CI_SCRIPTS,
  POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_OPS_SCRIPTS,
  POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_POLICY_ID,
  POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_UNIT_TESTS,
} from "@/lib/commercial/post-terminus-steady-state-integrity-era38-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("post-terminus steady state integrity era38 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_POLICY_ID).toBe(
      "era38-post-terminus-steady-state-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_OPS_SCRIPTS,
      ...POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(ROOT, ".github/workflows/ops-post-terminus-steady-state-integrity-validate.yml"),
      ),
    ).toBe(true);
    for (const path of POST_TERMINUS_STEADY_STATE_INTEGRITY_ERA38_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
