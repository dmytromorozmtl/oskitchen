import { describe, expect, it } from "vitest";

import {
  PARTNER_WEBHOOK_CHECKLIST,
  buildPartnerWebhookConfidenceSummary,
  evaluatePartnerWebhookReadiness,
} from "@/lib/developer/partner-webhook-pack";
import { PARTNER_WEBHOOK_ERA17_POLICY_ID } from "@/lib/developer/partner-webhook-era17-policy";
import { WEBHOOK_EVENT_TYPES } from "@/lib/developer/webhook-event-types";

describe("partner webhook pack", () => {
  it("exports eight checklist items with honesty blocker", () => {
    expect(PARTNER_WEBHOOK_CHECKLIST).toHaveLength(8);
    expect(PARTNER_WEBHOOK_CHECKLIST.some((item) => item.id === "partner-honesty")).toBe(true);
  });

  it("returns NOT_READY when certs fail", () => {
    const result = evaluatePartnerWebhookReadiness({
      policyCertPass: false,
      webhookSecurityCertPass: true,
      partnerDocExists: true,
      contractMaturityDocExists: true,
    });
    expect(result.decision).toBe("NOT_READY");
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it("returns READY when engineering prerequisites pass", () => {
    const result = evaluatePartnerWebhookReadiness({
      policyCertPass: true,
      webhookSecurityCertPass: true,
      partnerDocExists: true,
      contractMaturityDocExists: true,
    });
    expect(result.decision).toBe("READY");
  });

  it("builds confidence summary with outbound event types", () => {
    const summary = buildPartnerWebhookConfidenceSummary({
      policyCertPass: true,
      webhookSecurityCertPass: true,
      partnerDocExists: true,
      contractMaturityDocExists: true,
    });
    expect(summary.version).toBe(PARTNER_WEBHOOK_ERA17_POLICY_ID);
    expect(summary.outboundEventTypes).toEqual(WEBHOOK_EVENT_TYPES);
    expect(summary.inboundCommerceRoutes).toHaveLength(3);
    expect(summary.readiness.decision).toBe("READY");
  });
});
