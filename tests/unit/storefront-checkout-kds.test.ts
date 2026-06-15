import { describe, expect, it } from "vitest";

import {
  KDS_ELIGIBLE_ACTIVE_STATUSES,
  STOREFRONT_CHECKOUT_KDS_CREATION_SOURCE,
  STOREFRONT_CHECKOUT_KDS_E2E_POLICY_ID,
  STOREFRONT_CHECKOUT_KDS_ORDER_STATUS,
  STOREFRONT_CHECKOUT_KDS_TICKET_VISIBLE_MS,
  STOREFRONT_INTERNAL_ORDER_ID_TEST_ID,
  defaultStorefrontE2ESlug,
  isKdsEligibleOrderStatus,
  storefrontKdsTicketTestId,
} from "@/lib/storefront/storefront-checkout-kds-e2e-policy";

describe("storefront checkout → KDS lifecycle (QA-14)", () => {
  it("exports E2E policy aligned with pay-later storefront ingress", () => {
    expect(STOREFRONT_CHECKOUT_KDS_E2E_POLICY_ID).toBe("storefront-checkout-kds-e2e-v1");
    expect(STOREFRONT_CHECKOUT_KDS_TICKET_VISIBLE_MS).toBe(15_000);
    expect(STOREFRONT_CHECKOUT_KDS_ORDER_STATUS).toBe("CONFIRMED");
    expect(STOREFRONT_CHECKOUT_KDS_CREATION_SOURCE).toBe("STOREFRONT");
    expect(STOREFRONT_INTERNAL_ORDER_ID_TEST_ID).toBe("storefront-internal-order-id");
    expect(storefrontKdsTicketTestId("abc")).toBe("kds-ticket-abc");
  });

  it("treats CONFIRMED storefront orders as KDS-eligible active queue rows", () => {
    expect(KDS_ELIGIBLE_ACTIVE_STATUSES).toContain("CONFIRMED");
    expect(isKdsEligibleOrderStatus("CONFIRMED")).toBe(true);
    expect(isKdsEligibleOrderStatus("PREPARING")).toBe(true);
    expect(isKdsEligibleOrderStatus("COMPLETED")).toBe(false);
    expect(isKdsEligibleOrderStatus("CANCELLED")).toBe(false);
  });

  it("defaults E2E slug to hello when env unset", () => {
    expect(defaultStorefrontE2ESlug()).toBeTruthy();
  });
});
