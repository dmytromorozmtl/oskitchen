import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditMarketplaceMaturityE2E } from "@/lib/marketplace/marketplace-maturity-e2e-audit";
import {
  MARKETPLACE_CART_PATH,
  MARKETPLACE_MATURITY_E2E_AUDIT_SCRIPT,
  MARKETPLACE_MATURITY_E2E_CI_WORKFLOW,
  MARKETPLACE_MATURITY_E2E_FLOW_STEPS,
  MARKETPLACE_MATURITY_E2E_NPM_SCRIPT,
  MARKETPLACE_MATURITY_E2E_POLICY_ID,
  MARKETPLACE_MATURITY_E2E_SPEC,
  MARKETPLACE_MATURITY_E2E_UNIT_TEST,
  MARKETPLACE_MATURITY_LIFECYCLE_UNIT_TEST,
  MARKETPLACE_PO_CHECKOUT_PATH,
  MARKETPLACE_VENDOR_FINANCE_PATH,
  hasMarketplaceMaturityE2ECredentials,
  isMarketplacePayoutEligible,
  vendorOrderPath,
} from "@/lib/marketplace/marketplace-maturity-e2e-policy";

const ROOT = process.cwd();

describe("Marketplace maturity E2E (P2-122)", () => {
  it("locks policy id, routes, and five-step flow", () => {
    expect(MARKETPLACE_MATURITY_E2E_POLICY_ID).toBe("marketplace-maturity-e2e-v1");
    expect(MARKETPLACE_CART_PATH).toBe("/dashboard/marketplace/catalog");
    expect(MARKETPLACE_PO_CHECKOUT_PATH).toBe("/dashboard/marketplace/checkout");
    expect(MARKETPLACE_VENDOR_FINANCE_PATH).toBe("/vendor/finance");
    expect(vendorOrderPath("ord-1")).toBe("/vendor/orders/ord-1");
    expect(MARKETPLACE_MATURITY_E2E_FLOW_STEPS).toEqual([
      "cart_add",
      "checkout_po",
      "buyer_po",
      "vendor_fulfill",
      "vendor_payout",
    ]);
  });

  it("payout eligibility requires positive available balance", () => {
    expect(isMarketplacePayoutEligible(47.5)).toBe(true);
    expect(isMarketplacePayoutEligible(0)).toBe(false);
  });

  it("audits E2E spec, flow helper, cart PO fulfill, and vendor finance wiring", () => {
    const summary = auditMarketplaceMaturityE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.readyHelperPresent).toBe(true);
    expect(summary.cartPoFulfillWired).toBe(true);
    expect(summary.vendorFinancePagePresent).toBe(true);
    expect(summary.lifecycleUnitTestPresent).toBe(true);
    expect(summary.flowStepCount).toBe(5);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, lifecycle test, and deploy gate", () => {
    expect(existsSync(join(ROOT, MARKETPLACE_MATURITY_E2E_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, MARKETPLACE_MATURITY_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, MARKETPLACE_MATURITY_E2E_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, MARKETPLACE_MATURITY_LIFECYCLE_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[MARKETPLACE_MATURITY_E2E_NPM_SCRIPT]).toContain(
      "audit-marketplace-maturity-e2e.ts",
    );
    expect(pkg.scripts?.["test:ci:marketplace-maturity-e2e"]).toContain(
      MARKETPLACE_MATURITY_E2E_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, MARKETPLACE_MATURITY_E2E_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:marketplace-maturity-e2e");
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasMarketplaceMaturityE2ECredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
