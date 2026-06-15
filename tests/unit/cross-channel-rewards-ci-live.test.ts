import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  CROSS_CHANNEL_REWARDS_CI_SCRIPTS,
  CROSS_CHANNEL_REWARDS_POLICY_ID,
  CROSS_CHANNEL_REWARDS_UNIT_TESTS,
} from "@/lib/rewards/cross-channel-rewards-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("cross-channel rewards CI certification (live repo)", () => {
  it("locks era4 cross-channel rewards policy id", () => {
    expect(CROSS_CHANNEL_REWARDS_POLICY_ID).toBe("era4-cross-channel-rewards-v1");
  });

  it("defines cross-channel rewards CI scripts and unit bundle", () => {
    const scripts = readPackageScripts();
    for (const name of CROSS_CHANNEL_REWARDS_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:cross-channel-rewards"]).toContain("pos-rewards-checkout-wiring");
    expect(scripts["test:ci:cross-channel-rewards"]).toContain("storefront-rewards-honesty");
  });

  it("includes cross-channel rewards cert in governance bundles", () => {
    const scripts = readPackageScripts();
    expect(governanceBundlesIncludesCert(scripts, "test:ci:cross-channel-rewards:cert")).toBe(
      true,
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:cross-channel-rewards")).toBe(true);
  });

  it("has policy module and unit tests on disk", () => {
    for (const rel of CROSS_CHANNEL_REWARDS_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(existsSync(join(ROOT, "lib/rewards/cross-channel-rewards-policy.ts"))).toBe(true);
  });

  it("documents dual-ledger honesty in feature maturity matrix", () => {
    const matrix = readFileSync(join(ROOT, "docs/feature-maturity-matrix.md"), "utf8");
    expect(matrix).toContain("era4-cross-channel-rewards-v1");
    expect(matrix).toMatch(/separate.*ledger|dual.*ledger|not unified/i);
  });
});
