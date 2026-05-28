import { describe, expect, it } from "vitest";

import {
  PILOT_INVENTORY_MESSAGING_ERA17_BACKLOG_ID,
  PILOT_INVENTORY_MESSAGING_ERA17_FORBIDDEN_CLAIMS,
  PILOT_INVENTORY_MESSAGING_ERA17_POLICY_ID,
  PILOT_INVENTORY_MESSAGING_ERA17_STATUS,
  PILOT_INVENTORY_MESSAGING_ERA17_STOREFRONT_HOOK_STATUS,
} from "@/lib/inventory/pilot-inventory-messaging-era17-policy";

describe("pilot inventory messaging era17 policy", () => {
  it("locks era17 pilot inventory messaging policy id", () => {
    expect(PILOT_INVENTORY_MESSAGING_ERA17_POLICY_ID).toBe(
      "era17-pilot-inventory-messaging-v1",
    );
    expect(PILOT_INVENTORY_MESSAGING_ERA17_STATUS).toBe("pilot_inventory_messaging_ready");
    expect(PILOT_INVENTORY_MESSAGING_ERA17_STOREFRONT_HOOK_STATUS).toBe("deferred_locked");
    expect(PILOT_INVENTORY_MESSAGING_ERA17_BACKLOG_ID).toBe("KOS-E17-029");
  });

  it("forbids unified inventory sales claims", () => {
    expect(PILOT_INVENTORY_MESSAGING_ERA17_FORBIDDEN_CLAIMS).toContain(
      "unified inventory depletion",
    );
  });
});
