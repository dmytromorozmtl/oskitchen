import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { mapWithConcurrency } from "@/lib/async/map-with-concurrency";

const ROOT = process.cwd();

const P0_N_PLUS_ONE_FILES: Record<string, readonly string[]> = {
  "services/brand/brand-analytics.ts": ["groupBy", "brandIds"],
  "services/order-hub/order-hub-exact-counts-service.ts": ["Promise.allSettled"],
  "services/pos/pos-shift-service.ts": ["shiftId: { in: shiftIds }"],
  "services/beta/beta-service.ts": ["findMany", "groupBy"],
  "services/data/export-service.ts": ["mapWithConcurrency"],
  "services/platform/partner-oauth-service.ts": ["getMergedPartnerOAuthAppsByClientIds"],
  "services/cron/cron-execution-evidence.ts": ["loadActiveSlaPolicyRows"],
  "services/marketplace/vendor-api-service.ts": ["mapWithConcurrency"],
};

describe("P0 N+1 query pattern fixes (task 6)", () => {
  it("locks all 8 audited service files", () => {
    expect(Object.keys(P0_N_PLUS_ONE_FILES)).toHaveLength(8);
  });

  for (const [relPath, markers] of Object.entries(P0_N_PLUS_ONE_FILES)) {
    it(`uses batched queries in ${relPath}`, () => {
      const source = readFileSync(join(ROOT, relPath), "utf8");
      for (const marker of markers) {
        expect(source, `${relPath} missing ${marker}`).toContain(marker);
      }
      if (relPath !== "services/order-hub/order-hub-exact-counts-service.ts") {
        expect(source).not.toMatch(/\.map\s*\(\s*async\s*\(/);
      }
    });
  }

  it("mapWithConcurrency preserves order", async () => {
    const out = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (n) => n * 2);
    expect(out).toEqual([2, 4, 6, 8, 10]);
  });
});
