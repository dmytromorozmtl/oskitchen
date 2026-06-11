import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditMarketplaceCartPoFulfillE2E } from "@/lib/marketplace/marketplace-cart-po-fulfill-e2e-audit";
import {
  MARKETPLACE_CART_PO_FULFILL_AUDIT_SCRIPT,
  MARKETPLACE_CART_PO_FULFILL_CI_WORKFLOW,
  MARKETPLACE_CART_PO_FULFILL_E2E_POLICY_ID,
  MARKETPLACE_CART_PO_FULFILL_E2E_SPEC,
  MARKETPLACE_CART_PO_FULFILL_FLOW_STEPS,
  MARKETPLACE_CART_PO_FULFILL_NPM_SCRIPT,
  MARKETPLACE_CART_PO_FULFILL_UNIT_TEST,
  MARKETPLACE_CART_PATH,
  MARKETPLACE_PO_CHECKOUT_PATH,
  hasMarketplaceCartPoFulfillCredentials,
  isMarketplaceFulfillmentTerminalStatus,
  vendorOrderPath,
} from "@/lib/marketplace/marketplace-cart-po-fulfill-e2e-policy";
import { vendorOrderFanoutCount } from "@/lib/marketplace/marketplace-catalog-checkout-vendor-order-e2e-policy";
import { splitByVendor } from "@/services/marketplace/checkout-service";

const ROOT = process.cwd();

describe("Marketplace cart → PO → fulfill E2E (P1-44)", () => {
  it("locks policy id and marketplace routes", () => {
    expect(MARKETPLACE_CART_PO_FULFILL_E2E_POLICY_ID).toBe(
      "marketplace-cart-po-fulfill-e2e-v1",
    );
    expect(MARKETPLACE_CART_PATH).toBe("/dashboard/marketplace/catalog");
    expect(MARKETPLACE_PO_CHECKOUT_PATH).toBe("/dashboard/marketplace/checkout");
    expect(vendorOrderPath("abc")).toBe("/vendor/orders/abc");
    expect(MARKETPLACE_CART_PO_FULFILL_FLOW_STEPS).toHaveLength(4);
  });

  it("checkout fans out vendor POs per cart vendor group", () => {
    const groups = splitByVendor([
      {
        productId: "p1",
        slug: "a",
        name: "A",
        sku: "A1",
        vendorId: "v1",
        vendorName: "V1",
        quantity: 1,
        unitPrice: 5,
        currency: "USD",
      },
      {
        productId: "p2",
        slug: "b",
        name: "B",
        sku: "B1",
        vendorId: "v2",
        vendorName: "V2",
        quantity: 1,
        unitPrice: 6,
        currency: "USD",
      },
    ]);
    expect(vendorOrderFanoutCount(groups.length)).toBe(2);
  });

  it("fulfillment terminal statuses include SHIPPED", () => {
    expect(isMarketplaceFulfillmentTerminalStatus("SHIPPED")).toBe(true);
    expect(isMarketplaceFulfillmentTerminalStatus("CONFIRMED")).toBe(false);
  });

  it("audits E2E spec, flow helper, and catalog checkout wiring", () => {
    const summary = auditMarketplaceCartPoFulfillE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.catalogCheckoutWired).toBe(true);
    expect(summary.marketplacePagesPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, MARKETPLACE_CART_PO_FULFILL_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, MARKETPLACE_CART_PO_FULFILL_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, MARKETPLACE_CART_PO_FULFILL_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[MARKETPLACE_CART_PO_FULFILL_NPM_SCRIPT]).toContain(
      "audit-marketplace-cart-po-fulfill-e2e.ts",
    );
    expect(pkg.scripts?.["test:ci:marketplace-cart-po-fulfill-e2e"]).toContain(
      MARKETPLACE_CART_PO_FULFILL_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, MARKETPLACE_CART_PO_FULFILL_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:marketplace-cart-po-fulfill-e2e");
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasMarketplaceCartPoFulfillCredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
