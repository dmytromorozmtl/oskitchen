import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MARKETPLACE_CHECKOUT_APPROVAL_LIMIT_USD,
  marketplaceCheckoutRequiresApproval,
} from "@/lib/marketplace/checkout-utils";

const GATE_PATH = join(process.cwd(), "components/marketplace/checkout-approval-gate.tsx");
const CHECKOUT_CLIENT_PATH = join(
  process.cwd(),
  "components/marketplace/marketplace-checkout-client.tsx",
);

describe("CheckoutApprovalGate", () => {
  const source = readFileSync(GATE_PATH, "utf8");
  const checkoutSource = readFileSync(CHECKOUT_CLIENT_PATH, "utf8");

  it("uses the shared manager approval threshold", () => {
    expect(MARKETPLACE_CHECKOUT_APPROVAL_LIMIT_USD).toBe(2500);
    expect(marketplaceCheckoutRequiresApproval(2400)).toBe(false);
    expect(marketplaceCheckoutRequiresApproval(2600)).toBe(true);
  });

  it("ships auto-submit and approval-required states", () => {
    expect(source).toContain("export function CheckoutApprovalGate");
    expect(source).toContain('data-testid="checkout-approval-gate-auto"');
    expect(source).toContain('data-testid="checkout-approval-gate-required"');
    expect(source).toContain("Manager approval required");
    expect(source).toContain("status=PENDING_APPROVAL");
  });

  it("is wired into marketplace checkout before payment actions", () => {
    expect(checkoutSource).toContain("CheckoutApprovalGate");
    expect(checkoutSource).toContain("subtotal={cart.subtotal}");
  });
});
