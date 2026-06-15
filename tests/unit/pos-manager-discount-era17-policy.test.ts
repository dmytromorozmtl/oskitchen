import { describe, expect, it } from "vitest";

import {
  POS_MANAGER_DISCOUNT_ERA17_BACKLOG_ID,
  POS_MANAGER_DISCOUNT_ERA17_EDGE_CASES,
  POS_MANAGER_DISCOUNT_ERA17_POLICY_ID,
  POS_MANAGER_DISCOUNT_ERA17_PROOF_STATUS,
  POS_MANAGER_DISCOUNT_ERA17_REQUIRED_PERMISSION,
} from "@/lib/pos/pos-manager-discount-era17-policy";

describe("POS manager discount era17 policy", () => {
  it("locks policy id and proof status", () => {
    expect(POS_MANAGER_DISCOUNT_ERA17_POLICY_ID).toBe("era17-pos-manager-discount-v1");
    expect(POS_MANAGER_DISCOUNT_ERA17_PROOF_STATUS).toBe("discount_guard_depth_enforced");
    expect(POS_MANAGER_DISCOUNT_ERA17_BACKLOG_ID).toBe("KOS-E17-022");
    expect(POS_MANAGER_DISCOUNT_ERA17_REQUIRED_PERMISSION).toBe("pos.discount.apply");
  });

  it("documents edge cases for manager discount gate", () => {
    expect(POS_MANAGER_DISCOUNT_ERA17_EDGE_CASES.length).toBeGreaterThanOrEqual(5);
    expect(POS_MANAGER_DISCOUNT_ERA17_EDGE_CASES.join(" ")).toContain("COMPED");
    expect(POS_MANAGER_DISCOUNT_ERA17_EDGE_CASES.join(" ")).toContain("gift card");
  });
});
