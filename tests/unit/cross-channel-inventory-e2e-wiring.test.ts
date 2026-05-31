import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("cross-channel inventory E2E wiring", () => {
  it("ships playwright spec with mock channel helpers", () => {
    expect(existsSync(join(ROOT, "e2e/cross-channel-inventory.spec.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "e2e/helpers/cross-channel-inventory-mock.ts"))).toBe(true);

    const spec = readFileSync(join(ROOT, "e2e/cross-channel-inventory.spec.ts"), "utf8");
    expect(spec).toContain("buildMockCrossChannelSnapshot");
    expect(spec).toContain("cross-channel-inventory-panel");
    expect(spec).toContain("SHOPIFY");
    expect(spec).toContain("DOORDASH");
  });

  it("ships sales one-pager doc", () => {
    const doc = readFileSync(
      join(ROOT, "docs/cross-channel-inventory-sales-one-pager.md"),
      "utf8",
    );
    expect(doc).toContain("POS");
    expect(doc).toContain("Shopify");
    expect(doc).toContain("WooCommerce");
    expect(doc).toContain("DoorDash");
    expect(doc).toContain("cross-channel-inventory.spec.ts");
  });

  it("registers authed spec in playwright config", () => {
    const config = readFileSync(join(ROOT, "playwright.config.ts"), "utf8");
    expect(config).toContain("cross-channel-inventory.spec.ts");
  });
});
