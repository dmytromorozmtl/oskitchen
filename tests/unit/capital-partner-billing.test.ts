import { describe, expect, it } from "vitest";

import {
  computeCapitalReferralFeeCents,
  hashCapitalLenderWebhookPayload,
} from "@/services/commercial/capital-partner-billing-service";
import {
  currentCapitalBillingPeriodMonth,
  loadCapitalPartnerBillingConfig,
  resetCapitalPartnerBillingConfigCache,
  resolveCapitalPartnerBillingRates,
} from "@/lib/commercial/capital-partner-billing-config";
import {
  buildCapitalPartnerApplyUrl,
  isCapitalPartnerPullIpAllowed,
  resolveCapitalPartnerApplyUrlTemplate,
} from "@/lib/commercial/capital-lender-offers";
import {
  getCapitalPartnerBySlug,
  isCapitalProductionMerchantView,
  listLiveLenderOfferPartners,
  listMerchantVisibleLenderPartners,
  resetCapitalPartnersConfigCache,
  validateCapitalPartnersConfig,
  loadCapitalPartnersConfig,
} from "@/lib/commercial/capital-partners";

describe("capital-partner-billing-config", () => {
  it("loads billing rate cards for live partners", () => {
    resetCapitalPartnerBillingConfigCache();
    const config = loadCapitalPartnerBillingConfig();
    expect(config.partners.some((p) => p.partnerSlug === "flexcap-rbf-us")).toBe(true);
    const rates = resolveCapitalPartnerBillingRates("flexcap-rbf-us");
    expect(rates.referralFeeBps).toBe(250);
  });

  it("computes referral fee cents from funded amount", () => {
    expect(
      computeCapitalReferralFeeCents({ fundedAmountCents: 1_000_000, referralFeeBps: 250 }),
    ).toBe(25_000);
    expect(computeCapitalReferralFeeCents({ fundedAmountCents: 0, referralFeeBps: 250 })).toBe(0);
  });

  it("formats billing period month", () => {
    expect(currentCapitalBillingPeriodMonth(new Date("2026-05-15T12:00:00.000Z"))).toBe("2026-05");
  });
});

describe("capital live lender gating", () => {
  it("validates live partner registry including flexcap", () => {
    resetCapitalPartnersConfigCache();
    const config = loadCapitalPartnersConfig();
    expect(validateCapitalPartnersConfig(config)).toEqual([]);
    const flexcap = getCapitalPartnerBySlug("flexcap-rbf-us");
    expect(flexcap?.offerLifecycleStatus).toBe("live");
    expect(flexcap?.referralFeeBps).toBe(250);
    expect(listLiveLenderOfferPartners({ region: "US" }).some((p) => p.slug === "flexcap-rbf-us")).toBe(
      true,
    );
  });

  it("hides sandbox lenders from merchant view in production mode", () => {
    resetCapitalPartnersConfigCache();
    const prevNode = process.env.NODE_ENV;
    const prevSandbox = process.env.CAPITAL_SHOW_SANDBOX_LENDERS;
    process.env.NODE_ENV = "production";
    delete process.env.CAPITAL_SHOW_SANDBOX_LENDERS;
    expect(isCapitalProductionMerchantView()).toBe(true);

    const visible = listMerchantVisibleLenderPartners({ region: "US" });
    expect(visible.some((p) => p.slug === "flexcap-rbf-us")).toBe(true);
    expect(visible.some((p) => p.slug === "pilot-rbf-partner")).toBe(false);

    process.env.NODE_ENV = prevNode;
    if (prevSandbox) process.env.CAPITAL_SHOW_SANDBOX_LENDERS = prevSandbox;
  });

  it("resolves apply URL template from partner config", () => {
    const flexcap = getCapitalPartnerBySlug("flexcap-rbf-us");
    expect(flexcap).toBeTruthy();
    if (!flexcap) return;
    expect(resolveCapitalPartnerApplyUrlTemplate(flexcap)).toContain("flexcap.example");
    expect(
      buildCapitalPartnerApplyUrl(flexcap, {
        referralId: "abc",
        shareToken: "tok",
      }),
    ).toContain("referralId=abc");
  });

  it("enforces optional pull IP allowlist", () => {
    const flexcap = getCapitalPartnerBySlug("flexcap-rbf-us");
    expect(flexcap).toBeTruthy();
    if (!flexcap) return;
    expect(isCapitalPartnerPullIpAllowed(flexcap, "203.0.113.10")).toBe(true);
    const restricted = { ...flexcap, pullIpAllowlist: ["203.0.113.10"] };
    expect(isCapitalPartnerPullIpAllowed(restricted, "203.0.113.10")).toBe(true);
    expect(isCapitalPartnerPullIpAllowed(restricted, "198.51.100.1")).toBe(false);
  });

  it("hashes webhook payloads for idempotency fallback", () => {
    const hash = hashCapitalLenderWebhookPayload('{"referralId":"x","status":"FUNDED"}');
    expect(hash).toHaveLength(64);
    expect(hash).toBe(hashCapitalLenderWebhookPayload('{"referralId":"x","status":"FUNDED"}'));
  });
});
