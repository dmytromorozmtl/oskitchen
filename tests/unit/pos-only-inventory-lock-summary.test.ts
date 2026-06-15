import { describe, expect, it } from "vitest";

import {
  buildPosOnlyInventoryLockSummary,
  resolvePosOnlyInventoryLockProofStatus,
  scanPosOnlyInventoryLockEntrypoints,
} from "@/lib/inventory/pos-only-inventory-lock-summary";

describe("pos only inventory lock summary", () => {
  it("passes scan when cert passes and entrypoints are clean", () => {
    const scanResults = scanPosOnlyInventoryLockEntrypoints();
    const status = resolvePosOnlyInventoryLockProofStatus({
      certPassed: true,
      scanResults,
    });
    expect(status).toBe("proof_passed");
  });

  it("fails when non-depleting entrypoint contains forbidden hook", () => {
    const status = resolvePosOnlyInventoryLockProofStatus({
      certPassed: true,
      scanResults: [
        {
          path: "actions/storefront-order.ts",
          role: "non_depleting",
          ok: false,
          violations: ["forbidden symbol: recordPendingInventoryImpactsForPosOrder"],
        },
      ],
    });
    expect(status).toBe("proof_failed");
  });

  it("builds summary with deferred_locked storefront hook", () => {
    const summary = buildPosOnlyInventoryLockSummary({ certPassed: true });
    expect(summary.storefrontHookStatus).toBe("deferred_locked");
    expect(summary.lockProofStatus).toBe("proof_passed");
  });
});
