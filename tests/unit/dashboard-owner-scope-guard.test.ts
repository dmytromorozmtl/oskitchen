import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("dashboard owner scope guard (static)", () => {
  it("pilot pages do not pass session user.id to owner loaders", () => {
    const samples = [
      "app/dashboard/product-mapping/conflicts/page.tsx",
      "app/dashboard/go-live/page.tsx",
      "app/dashboard/today/page.tsx",
      "app/dashboard/page.tsx",
      "app/dashboard/costing/page.tsx",
    ];

    const ownerLoader = /(listMappings|loadTodayCommandCenter|loadCostingOverviewData|HomeOverview)\(/;

    for (const rel of samples) {
      const content = readFileSync(join(ROOT, rel), "utf8");
      if (!content.includes("dataUserId")) continue;
      expect(content).not.toMatch(/loadTodayCommandCenter\(sessionUser\.id\)/);
      expect(content).not.toMatch(/HomeOverview\s+userId=\{sessionUser\.id\}/);
      if (ownerLoader.test(content)) {
        expect(content).not.toMatch(new RegExp(`${ownerLoader.source}user\\.id`));
      }
    }
  });
});
