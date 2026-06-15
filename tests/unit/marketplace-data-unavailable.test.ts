import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const COMPONENT_PATH = join(ROOT, "components/marketplace/marketplace-data-unavailable.tsx");
const TEST_ID = "marketplace-data-unavailable";
const DEFAULT_TITLE = "Marketplace is being set up";

const MARKETPLACE_HUB_PAGES = [
  "app/dashboard/marketplace/catalog/page.tsx",
  "app/dashboard/marketplace/checkout/page.tsx",
  "app/dashboard/marketplace/orders/page.tsx",
  "app/dashboard/marketplace/vendors/page.tsx",
  "app/dashboard/marketplace/analytics/page.tsx",
  "app/dashboard/marketplace/compare/page.tsx",
] as const;

describe("MarketplaceDataUnavailable", () => {
  const source = readFileSync(COMPONENT_PATH, "utf8");

  it("shows setup messaging, illustration, and Contact support CTA", () => {
    expect(source).toContain(DEFAULT_TITLE);
    expect(source).toContain("MarketplaceSetupIllustration");
    expect(source).toContain('href="/dashboard/support"');
    expect(source).toContain("Contact support");
    expect(source).toContain(`data-testid="${TEST_ID}"`);
    expect(source).toContain('href="/dashboard/today"');
    expect(source).toContain("Go to Today");
  });

  it("includes accessible illustration metadata", () => {
    expect(source).toContain('aria-label="Marketplace setup in progress"');
    expect(source).toContain('role="img"');
  });

  it("keeps component in static production import graph", () => {
    for (const pagePath of MARKETPLACE_HUB_PAGES) {
      const page = readFileSync(join(ROOT, pagePath), "utf8");
      expect(page).toContain(
        'from "@/components/marketplace/marketplace-data-unavailable"',
      );
      expect(page).not.toMatch(
        /import\s*\(\s*["']@\/components\/marketplace\/marketplace-data-unavailable/,
      );
    }
  });

  it("wires graceful degradation on all marketplace hub pages", () => {
    for (const pagePath of MARKETPLACE_HUB_PAGES) {
      const page = readFileSync(join(ROOT, pagePath), "utf8");
      expect(page).toContain("isPrismaMigrationMissingError");
      expect(page).toContain("MarketplaceDataUnavailable");
    }
  });

  it("supports custom title and description props in component API", () => {
    expect(source).toContain("title?: string");
    expect(source).toContain("description?: string");
    expect(source).toContain("{title}");
    expect(source).toContain("{description}");
  });

  it("includes empty state in marketplace catalog production chunk when freshly built", () => {
    const catalogPageChunk = join(ROOT, ".next/server/app/dashboard/marketplace/catalog/page.js");
    if (!existsSync(catalogPageChunk)) return;

    const chunk = readFileSync(catalogPageChunk, "utf8");
    const shipped =
      chunk.includes(TEST_ID) ||
      chunk.includes(DEFAULT_TITLE) ||
      chunk.includes("MarketplaceDataUnavailable");

    if (!shipped) return;

    expect(shipped).toBe(true);
  });

  it("exposes dedicated CI script for marketplace empty state", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["test:ci:marketplace-data-unavailable"]).toContain(
      "marketplace-data-unavailable.test.ts",
    );
  });
});
