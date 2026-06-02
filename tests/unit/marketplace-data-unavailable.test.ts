import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("MarketplaceDataUnavailable", () => {
  const source = readFileSync(
    join(process.cwd(), "components/marketplace/marketplace-data-unavailable.tsx"),
    "utf8",
  );

  it("shows setup messaging, illustration, and Contact support CTA", () => {
    expect(source).toContain("Marketplace is being set up");
    expect(source).toContain("MarketplaceSetupIllustration");
    expect(source).toContain('href="/dashboard/support"');
    expect(source).toContain("Contact support");
    expect(source).toContain('data-testid="marketplace-data-unavailable"');
  });
});
