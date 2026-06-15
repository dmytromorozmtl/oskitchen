import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PLAN_PATH = join(process.cwd(), "docs/instant-payouts-plan.md");
const CONNECT_PLAN_PATH = join(process.cwd(), "docs/stripe-connect-vendor-test-plan.md");
const PRICING_PATH = join(process.cwd(), "docs/marketplace-pricing-strategy.md");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("instant payouts plan doc", () => {
  it("exists with payout models, phases, and Stripe Connect references", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    expect(doc).toContain("# Instant payouts plan — marketplace vendors");
    expect(doc).toContain("instant-payouts-plan-v1");
    expect(doc).toContain("processPayout");
    expect(doc).toContain("MARKETPLACE_VENDOR_STRIPE_CONNECT");
    expect(doc).toContain("## Maturity phases");
    expect(doc).toContain("Phase 3 — Instant payout MVP");
    expect(doc).toContain("instant-payouts-service.ts");
    expect(doc).toContain("application_fee");
    expect(doc).toContain("stripe-connect-vendor-test-plan.md");
  });

  it("reflects NO-GO baseline and links from Connect test plan", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const connectPlan = readFileSync(CONNECT_PLAN_PATH, "utf8");
    const pricing = readFileSync(PRICING_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("instant payouts not implemented");
    expect(doc).toContain("0 live GMV");
    expect(doc).toContain("sales-safe-claims-registry.md");
    expect(connectPlan).toContain("Instant payouts (Task 116)");
    expect(pricing).toContain("stripe-connect-vendor-test-plan.md");
  });
});
