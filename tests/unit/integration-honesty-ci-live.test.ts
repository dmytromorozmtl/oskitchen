import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  MARKETPLACE_PLACEHOLDER_INTEGRATION_IDS,
  MARKETPLACE_PLACEHOLDER_PROVIDER_KEYS,
  marketplacePlaceholderIntegrationPage,
} from "@/lib/integrations/integration-honesty";
import { NAV_MATURITY_RULES } from "@/lib/navigation/nav-maturity-governance";

const ROOT = process.cwd();
const CHANNEL_CARD = join(ROOT, "components/channels/channel-card.tsx");
const SALES_CHANNELS = join(ROOT, "app/dashboard/sales-channels/available/page.tsx");
const MATURITY_MATRIX = join(ROOT, "docs/feature-maturity-matrix.md");

const REQUIRED_SCRIPTS = ["test:ci:integration-honesty", "test:ci:integration-honesty:cert"] as const;

const REQUIRED_FILES = [
  "lib/integrations/integration-honesty.ts",
  "lib/integrations/integration-registry.ts",
  "lib/channels/channel-registry.ts",
  "tests/unit/integration-honesty-alignment.test.ts",
  "tests/unit/partner-integration-placeholder.test.ts",
  "components/channels/channel-card.tsx",
  "app/dashboard/sales-channels/available/page.tsx",
] as const;

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("integration honesty CI certification (live repo)", () => {
  it("defines integration honesty unit bundle and wiring cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of REQUIRED_SCRIPTS) {
      expect(scripts[name], `missing package.json script "${name}"`).toBeTruthy();
    }
    expect(scripts["test:ci:integration-honesty"]).toContain("integration-honesty-alignment.test.ts");
    expect(scripts["test:ci:integration-honesty"]).toContain("partner-integration-placeholder.test.ts");
  });

  it("includes integration honesty cert and unit bundle in default quality governance bundles", () => {
    const scripts = readPackageScripts();
    expect(governanceBundlesIncludesCert(scripts, "test:ci:integration-honesty:cert")).toBe(
      true,
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:integration-honesty")).toBe(true);
  });

  it("aligns marketplace placeholder registry with nav maturity placeholder rules", () => {
    for (const id of MARKETPLACE_PLACEHOLDER_INTEGRATION_IDS) {
      const page = marketplacePlaceholderIntegrationPage(id);
      const navRule = NAV_MATURITY_RULES.find((r) => r.prefix === page);
      expect(navRule, `missing nav rule for ${id}`).toBeDefined();
      expect(navRule?.exposure).toBe("placeholder");
    }
    expect(MARKETPLACE_PLACEHOLDER_PROVIDER_KEYS).toEqual(["uber-direct"]);
  });

  it("labels marketplace placeholders in channel UI without fake health scores", () => {
    const channelCard = readFileSync(CHANNEL_CARD, "utf8");
    expect(channelCard).toContain("isMarketplacePlaceholderProvider");
    expect(channelCard).toContain("marketplacePlaceholderHonestyLabel");
    expect(channelCard).toContain("return null");

    const salesChannels = readFileSync(SALES_CHANNELS, "utf8");
    expect(salesChannels).toContain("marketplacePlaceholderHonestyLabel");
  });

  it("documents integration honesty in feature maturity matrix", () => {
    expect(existsSync(MATURITY_MATRIX)).toBe(true);
    const matrix = readFileSync(MATURITY_MATRIX, "utf8");
    expect(matrix).toContain("integration-honesty.ts");
    expect(matrix).toContain("PLACEHOLDER");
    expect(matrix).toMatch(/DoorDash|Grubhub|Uber Eats/i);
  });

  it("requires integration honesty artifacts on disk", () => {
    for (const rel of REQUIRED_FILES) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
  });
});
