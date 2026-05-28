import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  CROSS_CHANNEL_REWARDS_ERA14_CANONICAL_DOC_PATHS,
  CROSS_CHANNEL_REWARDS_ERA14_CANONICAL_MARKERS,
  CROSS_CHANNEL_REWARDS_ERA14_CI_SCRIPTS,
  CROSS_CHANNEL_REWARDS_ERA14_OPS_DOC,
  CROSS_CHANNEL_REWARDS_ERA14_POLICY_ID,
  CROSS_CHANNEL_REWARDS_ERA14_SMOKE_NPM_SCRIPT,
  CROSS_CHANNEL_REWARDS_ERA14_SMOKE_SCRIPT,
  CROSS_CHANNEL_REWARDS_ERA14_UNIT_TESTS,
} from "@/lib/rewards/cross-channel-rewards-era14-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("cross-channel rewards era14 CI certification (live repo)", () => {
  it("locks era14 cross-channel rewards recert policy id", () => {
    expect(CROSS_CHANNEL_REWARDS_ERA14_POLICY_ID).toBe(
      "era14-cross-channel-rewards-recert-v1",
    );
  });

  it("defines era14 cross-channel rewards scripts", () => {
    const scripts = readPackageScripts();
    for (const name of CROSS_CHANNEL_REWARDS_ERA14_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts[CROSS_CHANNEL_REWARDS_ERA14_SMOKE_NPM_SCRIPT]).toContain(
      CROSS_CHANNEL_REWARDS_ERA14_SMOKE_SCRIPT,
    );
    expect(scripts["test:ci:cross-channel-rewards:cert"]).toContain(
      "cross-channel-rewards-era14-cert-live",
    );
    expect(
      governanceBundlesIncludesCert(scripts, "test:ci:cross-channel-rewards:cert"),
    ).toBe(true);
  });

  it("does not wire unified cross-channel rewards e2e into default ci.yml", () => {
    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8").toLowerCase();
    expect(ci).not.toMatch(/cross[- ]channel.*reward/);
    expect(ci).not.toContain("unified-rewards-e2e");
  });

  it("documents era14 dual-ledger recert in canonical docs", () => {
    const ops = readFileSync(join(ROOT, CROSS_CHANNEL_REWARDS_ERA14_OPS_DOC), "utf8");
    for (const marker of CROSS_CHANNEL_REWARDS_ERA14_CANONICAL_MARKERS) {
      expect(ops.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of CROSS_CHANNEL_REWARDS_ERA14_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(CROSS_CHANNEL_REWARDS_ERA14_POLICY_ID.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(CROSS_CHANNEL_REWARDS_ERA14_POLICY_ID);
    for (const rel of CROSS_CHANNEL_REWARDS_ERA14_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, CROSS_CHANNEL_REWARDS_ERA14_SMOKE_SCRIPT))).toBe(true);
  });
});
