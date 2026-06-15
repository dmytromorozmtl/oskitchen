import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("shopify b2b ar sales deck wiring", () => {
  it("ships sales deck and credit/auto panels", () => {
    expect(existsSync(join(ROOT, "docs/shopify-b2b-ar-sales-deck.md"))).toBe(true);
    expect(
      existsSync(join(ROOT, "components/dashboard/receivables/b2b-ar-credit-auto-panels.tsx")),
    ).toBe(true);
    expect(existsSync(join(ROOT, "lib/integrations/shopify-b2b-credit-limit-metadata.ts"))).toBe(
      true,
    );
  });
});
