import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("mutation registry dashboard wiring", () => {
  it("ships dashboard route and sales doc", () => {
    expect(
      existsSync(join(ROOT, "app/dashboard/platform/mutation-registry/page.tsx")),
    ).toBe(true);
    expect(existsSync(join(ROOT, "docs/mutation-registry-enterprise-sales.md"))).toBe(true);
    expect(
      existsSync(join(ROOT, "services/platform/mutation-registry-dashboard-service.ts")),
    ).toBe(true);
  });
});
