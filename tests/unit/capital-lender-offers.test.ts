import { describe, expect, it } from "vitest";

import {
  buildPartnerApplyUrl,
  signCapitalLenderPartnerPull,
  signCapitalLenderWebhookBody,
  verifyCapitalLenderPartnerPull,
  verifyCapitalLenderWebhookSignature,
} from "@/lib/commercial/capital-lender-offers";

describe("capital-lender-offers helpers", () => {
  const secret = "test-capital-lender-webhook-secret";

  it("builds partner apply URLs from template variables", () => {
    const url = buildPartnerApplyUrl(
      "https://partners.example.com/apply?referralId={{referralId}}&shareToken={{shareToken}}",
      { referralId: "ref-123", shareToken: "tok-abc" },
    );
    expect(url).toBe(
      "https://partners.example.com/apply?referralId=ref-123&shareToken=tok-abc",
    );
  });

  it("signs and verifies webhook bodies", () => {
    const body = JSON.stringify({ referralId: "11111111-1111-1111-1111-111111111111", status: "APPLIED" });
    const signature = signCapitalLenderWebhookBody(body, secret);
    expect(verifyCapitalLenderWebhookSignature(body, signature, secret)).toBe(true);
    expect(verifyCapitalLenderWebhookSignature(body, "bad-signature", secret)).toBe(false);
  });

  it("signs and verifies partner pull requests", () => {
    const signature = signCapitalLenderPartnerPull("pilot-rbf-partner", "share-token-xyz", secret);
    expect(
      verifyCapitalLenderPartnerPull("pilot-rbf-partner", "share-token-xyz", signature, secret),
    ).toBe(true);
    expect(
      verifyCapitalLenderPartnerPull("pilot-rbf-partner", "wrong-token", signature, secret),
    ).toBe(false);
  });
});
