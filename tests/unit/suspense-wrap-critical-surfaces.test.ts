import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { countSuspenseBoundaries } from "@/lib/testing/suspense-skeleton-harness";
import { SUSPENSE_SKELETON_CRITICAL_SURFACES } from "@/lib/testing/suspense-skeleton-policy";

const ROOT = process.cwd();

describe("Suspense-wrap critical surfaces (P1-23)", () => {
  it.each(SUSPENSE_SKELETON_CRITICAL_SURFACES)(
    "$id page wraps async section in Suspense with named skeleton",
    ({ pagePath, asyncComponent, skeleton }) => {
      const page = readFileSync(join(ROOT, pagePath), "utf8");
      expect(countSuspenseBoundaries(page)).toBeGreaterThanOrEqual(1);
      expect(page).toContain("Suspense");
      expect(page).toContain(skeleton);
      expect(page).toContain(asyncComponent);
    },
  );

  it("kitchen daily mode uses KitchenDailyAsyncSection under Suspense", () => {
    const page = readFileSync(join(ROOT, "app/dashboard/kitchen/page.tsx"), "utf8");
    expect(page).toContain("KitchenDailyAsyncSection");
    expect(page).toContain("KDSSkeleton");
  });
});
