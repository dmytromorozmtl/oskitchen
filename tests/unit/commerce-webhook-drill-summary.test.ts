import { describe, expect, it } from "vitest";

import {
  buildCommerceWebhookDrillSummary,
  resolveCommerceWebhookDrillProofStatus,
} from "@/lib/security/commerce-webhook-drill-summary";

describe("commerce webhook drill summary", () => {
  it("marks proof skipped when no steps passed", () => {
    const summary = buildCommerceWebhookDrillSummary({ drillMode: "unset" });
    expect(summary.commerceWebhookProofStatus).toBe("proof_skipped_missing_prerequisites");
  });

  it("marks proof passed when all six steps pass", () => {
    const summary = buildCommerceWebhookDrillSummary({
      drillMode: "tabletop",
      operatorEmail: "ops@example.com",
      incidentProvider: "stripe",
      stepStatuses: {
        1: "PASSED",
        2: "PASSED",
        3: "PASSED",
        4: "PASSED",
        5: "PASSED",
        6: "PASSED",
      },
      postmortem: "Rotate Stripe secret via dashboard checklist",
    });
    expect(summary.commerceWebhookProofStatus).toBe("proof_passed");
    expect(summary.postmortem).toContain("Stripe");
  });

  it("marks proof failed when any step fails", () => {
    const steps = [
      { order: 1, action: "a", owner: "o", status: "PASSED" as const },
      { order: 2, action: "b", owner: "o", status: "FAILED" as const },
    ];
    expect(resolveCommerceWebhookDrillProofStatus(steps)).toBe("proof_failed");
  });
});
