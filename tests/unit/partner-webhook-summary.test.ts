import { describe, expect, it } from "vitest";

import {
  buildPartnerWebhookSummary,
  resolvePartnerWebhookProofStatus,
} from "@/lib/developer/partner-webhook-summary";

describe("partner webhook summary", () => {
  it("marks proof failed when cert fails", () => {
    expect(
      resolvePartnerWebhookProofStatus({ certPassed: false, partnerAttestationEmail: "a@b.com" }),
    ).toBe("proof_failed");
  });

  it("marks docs ready without attestation email", () => {
    expect(resolvePartnerWebhookProofStatus({ certPassed: true })).toBe(
      "docs_ready_awaiting_partner_attestation",
    );
  });

  it("marks proof passed with attestation email", () => {
    expect(
      resolvePartnerWebhookProofStatus({
        certPassed: true,
        partnerAttestationEmail: "integrations@partner.example",
      }),
    ).toBe("proof_passed");
  });

  it("builds summary with readiness decision", () => {
    const summary = buildPartnerWebhookSummary({ certPassed: true });
    expect(summary.certPassed).toBe(true);
    expect(summary.partnerWebhookProofStatus).toBe("docs_ready_awaiting_partner_attestation");
    expect(summary.readinessDecision).toBe("READY");
  });
});
