import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_CI_SCRIPTS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_OPS_SCRIPTS,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_POLICY_ID,
  OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_UNIT_TESTS,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-integrity-era46-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("owner daily briefing breakthrough integrity era46 CI certification (live repo)", () => {
  it("locks integrity policy id", () => {
    expect(OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_POLICY_ID).toBe(
      "era46-owner-daily-briefing-breakthrough-integrity-v1",
    );
  });

  it("defines ops and ci scripts", () => {
    const scripts = readPackageScripts();
    for (const name of [
      ...OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_OPS_SCRIPTS,
      ...OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_CI_SCRIPTS,
    ]) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("wires workflow and unit tests", () => {
    expect(
      existsSync(
        join(
          ROOT,
          ".github/workflows/ops-owner-daily-briefing-breakthrough-integrity-validate.yml",
        ),
      ),
    ).toBe(true);
    for (const path of OWNER_DAILY_BRIEFING_BREAKTHROUGH_INTEGRITY_ERA46_UNIT_TESTS) {
      expect(existsSync(join(ROOT, path)), `missing ${path}`).toBe(true);
    }
  });
});
