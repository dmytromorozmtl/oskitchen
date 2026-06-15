import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KITCHEN_REWARDS_SERVICES,
  STOREFRONT_REWARDS_HONEST_SCOPE,
  STOREFRONT_REWARDS_SERVICES,
} from "@/lib/rewards/cross-channel-rewards-policy";

const ROOT = process.cwd();

function listTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      out.push(...listTsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

describe("storefront rewards honesty (dual ledger)", () => {
  it("documents separate kitchen vs storefront service paths", () => {
    expect(KITCHEN_REWARDS_SERVICES.giftCard).toContain("gift-cards");
    expect(STOREFRONT_REWARDS_SERVICES.giftCard).toContain("storefront/gift-card");
    expect(KITCHEN_REWARDS_SERVICES.loyalty).not.toEqual(STOREFRONT_REWARDS_SERVICES.loyalty);
  });

  it("storefront gift card checkout redeem helper is not wired outside its service", () => {
    const giftCardService = join(ROOT, STOREFRONT_REWARDS_SERVICES.giftCard);
    const scanRoots = ["services", "app", "actions", "lib"].map((d) => join(ROOT, d));
    const externalHits = scanRoots.flatMap(listTsFiles).filter((file) => {
      if (file === giftCardService) return false;
      return readFileSync(file, "utf8").includes("redeemGiftCardPartial");
    });
    expect(externalHits).toEqual([]);
    expect(STOREFRONT_REWARDS_HONEST_SCOPE.giftCardCheckoutRedeemWired).toBe(false);
  });

  it("POS checkout imports kitchen ledger only", () => {
    const posCheckout = readFileSync(
      join(ROOT, KITCHEN_REWARDS_SERVICES.posCheckout),
      "utf8",
    );
    expect(posCheckout).toContain('from "@/services/gift-cards/gift-card-service"');
    expect(posCheckout).toContain('from "@/services/loyalty/loyalty-service"');
    expect(posCheckout).not.toContain("storefront/gift-card-service");
    expect(posCheckout).not.toContain("storefront/loyalty-service");
  });
});
