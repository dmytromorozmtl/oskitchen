import { describe, expect, it } from "vitest";

import {
  POS_ONLY_INVENTORY_LOCK_ERA17_BACKLOG_ID,
  POS_ONLY_INVENTORY_LOCK_ERA17_FORBIDDEN_CLAIMS,
  POS_ONLY_INVENTORY_LOCK_ERA17_POLICY_ID,
  POS_ONLY_INVENTORY_LOCK_ERA17_PROOF_STATUS,
  POS_ONLY_INVENTORY_LOCK_ERA17_STOREFRONT_HOOK_STATUS,
} from "@/lib/inventory/pos-only-inventory-lock-era17-policy";

describe("pos only inventory lock era17 policy", () => {
  it("locks era17 pos-only inventory lock policy id", () => {
    expect(POS_ONLY_INVENTORY_LOCK_ERA17_POLICY_ID).toBe("era17-pos-only-inventory-lock-v1");
    expect(POS_ONLY_INVENTORY_LOCK_ERA17_PROOF_STATUS).toBe("pos_only_lock_recertified");
    expect(POS_ONLY_INVENTORY_LOCK_ERA17_STOREFRONT_HOOK_STATUS).toBe("deferred_locked");
    expect(POS_ONLY_INVENTORY_LOCK_ERA17_BACKLOG_ID).toBe("KOS-E17-028");
  });

  it("forbids unified inventory depletion claims", () => {
    expect(POS_ONLY_INVENTORY_LOCK_ERA17_FORBIDDEN_CLAIMS).toContain(
      "unified inventory depletion",
    );
  });
});
