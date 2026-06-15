import { describe, expect, it } from "vitest";

import {
  ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_BACKLOG_ID,
  ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_CI_SCRIPTS,
  ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_HOP_IDS,
} from "@/lib/commercial/era20-manager-discount-audit-flow-proof-era20-policy";

describe("era20-manager-discount-audit-flow-proof-cert-live", () => {
  it("locks cert bundle", () => {
    expect(ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_BACKLOG_ID).toBe("KOS-E20-013");
    expect(ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_HOP_IDS).toHaveLength(5);
    expect(ERA20_MANAGER_DISCOUNT_AUDIT_FLOW_PROOF_CI_SCRIPTS).toContain(
      "test:ci:era20-manager-discount-audit-flow-proof",
    );
  });
});
