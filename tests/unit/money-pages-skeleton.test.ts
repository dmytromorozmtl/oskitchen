import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MarketplaceCartSkeleton,
  POSCheckoutSkeleton,
  VendorFinanceSkeleton,
} from "@/components/dashboard/money-page-skeletons";
import {
  MONEY_PAGES_SKELETON_POLICY_ID,
  MONEY_PAGES_SKELETON_ROUTES,
} from "@/lib/ux/money-pages-skeleton-policy";

const ROOT = process.cwd();

describe("money pages skeleton (P1-29)", () => {
  it("locks policy id", () => {
    expect(MONEY_PAGES_SKELETON_POLICY_ID).toBe("money-pages-skeleton-p1-29-v1");
    expect(MONEY_PAGES_SKELETON_ROUTES).toHaveLength(3);
  });

  it.each(MONEY_PAGES_SKELETON_ROUTES)(
    "route $route imports $skeleton",
    ({ route, skeleton }) => {
      const source = readFileSync(join(ROOT, route), "utf8");
      expect(source).toContain(skeleton);
      expect(source).toContain("money-page-skeletons");
    },
  );

  it("exports dedicated test ids for money surfaces", () => {
    expect(POSCheckoutSkeleton.name).toBe("POSCheckoutSkeleton");
    expect(MarketplaceCartSkeleton.name).toBe("MarketplaceCartSkeleton");
    expect(VendorFinanceSkeleton.name).toBe("VendorFinanceSkeleton");
  });
});
