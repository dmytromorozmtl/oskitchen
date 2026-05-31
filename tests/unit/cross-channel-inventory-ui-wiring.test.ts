import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("cross-channel inventory UI wiring", () => {
  it("ships inventory dashboard page with panel", () => {
    const page = readFileSync(
      join(ROOT, "app/dashboard/inventory/cross-channel/page.tsx"),
      "utf8",
    );
    expect(page).toContain("CrossChannelInventoryPanel");
    expect(page).toContain("loadCrossChannelInventorySnapshot");
    expect(page).toContain("DOORDASH");
  });

  it("panel exposes channel tabs and conflict resolution", () => {
    const panel = readFileSync(
      join(ROOT, "components/inventory/cross-channel-inventory-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("cross-channel-inventory-panel");
    expect(panel).toContain('data-testid={`cross-channel-tab-${tab.id}`}');
    expect(panel).toContain("SHOPIFY");
    expect(panel).toContain("WOOCOMMERCE");
    expect(panel).toContain("DOORDASH");
    expect(panel).toContain("resolveCrossChannelConflictAction");
    expect(panel).toContain("Low-stock alerts");
  });

  it("wires server actions for pull and push", () => {
    expect(
      existsSync(join(ROOT, "actions/inventory/cross-channel-inventory.ts")),
    ).toBe(true);
    const actions = readFileSync(
      join(ROOT, "actions/inventory/cross-channel-inventory.ts"),
      "utf8",
    );
    expect(actions).toContain("runCrossChannelInventorySyncPull");
    expect(actions).toContain("runCrossChannelInventorySyncPush");
  });

  it("links cross-channel route from inventory navigation", () => {
    const nav = readFileSync(join(ROOT, "lib/navigation/final-navigation-groups.ts"), "utf8");
    expect(nav).toContain("/dashboard/inventory/cross-channel");
  });
});
