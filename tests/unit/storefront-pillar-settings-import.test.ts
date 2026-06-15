import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("storefront pillar settings import guard", () => {
  it("imports revalidateStorefrontDashboardAndPublic before use", () => {
    const p = join(process.cwd(), "actions/storefront-pillar-settings.ts");
    const src = readFileSync(p, "utf8");
    const importIdx = src.indexOf('from "@/lib/storefront/revalidate-storefront-dashboard"');
    const useIdx = src.indexOf("revalidateStorefrontDashboardAndPublic(");
    expect(importIdx).toBeGreaterThan(-1);
    expect(useIdx).toBeGreaterThan(-1);
    expect(importIdx).toBeLessThan(useIdx);
  });
});
