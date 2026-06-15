import { describe, expect, it } from "vitest";

import {
  buildManagerDiscountAuditFlowHops,
  buildManagerDiscountAuditFlowProofSlice,
} from "@/lib/commercial/era20-manager-discount-audit-flow-proof-era20";
import { ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_POLICY_ID } from "@/lib/commercial/era20-manager-discount-audit-flow-proof-era20-policy";

describe("era20-manager-discount-audit-flow-proof", () => {
  it("locks era20 manager discount audit policy id", () => {
    expect(ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_POLICY_ID).toBe(
      "era20-manager-discount-audit-flow-proof-v1",
    );
  });

  it("builds five hops", () => {
    const hops = buildManagerDiscountAuditFlowHops({ viewerCanApplyDiscount: true });
    expect(hops).toHaveLength(5);
    expect(hops[1]?.id).toBe("manager_permission");
  });

  it("marks manager permission rbac blocked for cashier viewer", () => {
    const hops = buildManagerDiscountAuditFlowHops({ viewerCanApplyDiscount: false });
    const perm = hops.find((h) => h.id === "manager_permission");
    expect(perm?.proofState).toBe("rbac_blocked");
  });

  it("links parent manager_discount_audit workflow", () => {
    const slice = buildManagerDiscountAuditFlowProofSlice({ viewerCanApplyDiscount: true });
    expect(slice.workflowId).toBe("manager_discount_audit");
    expect(slice.parentWorkflowBlocker).toContain("PIN");
  });
});
