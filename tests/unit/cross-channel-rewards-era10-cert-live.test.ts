import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  KITCHEN_REWARDS_SERVICES,
  POS_REWARDS_CHECKOUT_CERTIFIED,
  STOREFRONT_REWARDS_HONEST_SCOPE,
  STOREFRONT_REWARDS_SERVICES,
} from "@/lib/rewards/cross-channel-rewards-policy";
import {
  CROSS_CHANNEL_REWARDS_ERA10_CANONICAL_DOC_PATHS,
  CROSS_CHANNEL_REWARDS_ERA10_CANONICAL_MARKERS,
  CROSS_CHANNEL_REWARDS_ERA10_CI_SCRIPTS,
  CROSS_CHANNEL_REWARDS_ERA10_POLICY_ID,
  CROSS_CHANNEL_REWARDS_ERA10_POS_CERTIFIED,
  CROSS_CHANNEL_REWARDS_ERA10_SCHEMA_MODELS,
  CROSS_CHANNEL_REWARDS_ERA10_UNIT_TESTS,
} from "@/lib/rewards/cross-channel-rewards-era10-policy";

const ROOT = process.cwd();
const PRISMA_SCHEMA = join(ROOT, "prisma/schema.prisma");

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("cross-channel rewards era10 CI certification (live repo)", () => {
  it("locks era10 cross-channel rewards recert policy id", () => {
    expect(CROSS_CHANNEL_REWARDS_ERA10_POLICY_ID).toBe(
      "era10-cross-channel-rewards-recert-v1",
    );
  });

  it("defines cross-channel rewards CI scripts and era10 cert on disk", () => {
    const scripts = readPackageScripts();
    for (const name of CROSS_CHANNEL_REWARDS_ERA10_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:cross-channel-rewards:cert"]).toContain(
      "cross-channel-rewards-era10-cert-live",
    );
    for (const rel of CROSS_CHANNEL_REWARDS_ERA10_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("wires cross-channel rewards cert in governance money-path partition", () => {
    const scripts = readPackageScripts();
    expect(
      governanceBundlesIncludesCert(scripts, "test:ci:cross-channel-rewards:cert"),
    ).toBe(true);
    expect(
      governanceBundlesIncludesCert(scripts, "test:ci:cross-channel-rewards"),
    ).toBe(true);
    const moneyPath = scripts["test:ci:governance-bundles:partition-money-path"] ?? "";
    expect(moneyPath).toContain("test:ci:cross-channel-rewards:cert");
  });

  it("keeps separate prisma models and POS-only kitchen ledger wiring", () => {
    const schema = readFileSync(PRISMA_SCHEMA, "utf8");
    for (const model of CROSS_CHANNEL_REWARDS_ERA10_SCHEMA_MODELS) {
      expect(schema, `missing model ${model}`).toMatch(
        new RegExp(`model\\s+${model}\\s+\\{`),
      );
    }
    const posCheckout = readFileSync(join(ROOT, KITCHEN_REWARDS_SERVICES.posCheckout), "utf8");
    for (const fn of CROSS_CHANNEL_REWARDS_ERA10_POS_CERTIFIED) {
      expect(posCheckout).toContain(fn);
    }
    expect(POS_REWARDS_CHECKOUT_CERTIFIED.giftCardRedeem).toBe(true);
    expect(STOREFRONT_REWARDS_HONEST_SCOPE.giftCardCheckoutRedeemWired).toBe(false);
    expect(existsSync(join(ROOT, STOREFRONT_REWARDS_SERVICES.giftCard))).toBe(true);
    expect(existsSync(join(ROOT, KITCHEN_REWARDS_SERVICES.giftCard))).toBe(true);
  });

  it("documents era10 dual-ledger recert in canonical docs", () => {
    for (const rel of CROSS_CHANNEL_REWARDS_ERA10_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of CROSS_CHANNEL_REWARDS_ERA10_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(CROSS_CHANNEL_REWARDS_ERA10_POLICY_ID);
  });
});
