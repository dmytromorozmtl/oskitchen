import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("cross-channel inventory sync wiring", () => {
  it("ships cross-channel inventory sync engine", () => {
    const source = readFileSync(
      join(ROOT, "services/inventory/cross-channel-inventory-sync.ts"),
      "utf8",
    );
    expect(source).toContain("runCrossChannelInventorySyncPull");
    expect(source).toContain("reserveCrossChannelInventory");
    expect(source).toContain("handleCrossChannelInventoryChangeEvent");
    expect(source).toContain("detectCrossChannelLowStockAlerts");
    expect(source).toContain("DOORDASH");
  });

  it("ships cross-channel settings helpers", () => {
    expect(
      existsSync(join(ROOT, "lib/inventory/cross-channel-inventory-settings.ts")),
    ).toBe(true);
  });
});
