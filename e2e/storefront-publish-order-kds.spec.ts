import { expect, test } from "@playwright/test";

import {
  KDS_KITCHEN_PATH,
  STOREFRONT_ADMIN_PATH,
  STOREFRONT_PUBLISH_ORDER_KDS_E2E_POLICY_ID,
  STOREFRONT_PUBLISH_ORDER_KDS_FLOW_STEPS,
  defaultStorefrontE2ESlug,
  storefrontCatalogApiPath,
  storefrontMenuPath,
} from "@/lib/qa/storefront-publish-order-kds-e2e-policy";
import { isKdsEligibleOrderStatus } from "@/lib/storefront/storefront-checkout-kds-e2e-policy";

import { runStorefrontPublishOrderKdsFlow } from "./helpers/storefront-publish-order-kds-flow";
import {
  skipStorefrontPublishOrderKdsIfGateDisabled,
  skipStorefrontPublishOrderKdsIfKdsGateDisabled,
  skipStorefrontPublishOrderKdsIfNotAuthed,
} from "./helpers/storefront-publish-order-kds-ready";
import { skipStorefrontCheckoutIfTurnstileEnabled } from "./helpers/storefront-checkout-kds-flow";

/**
 * Storefront publish → order → KDS golden path.
 *
 * Dashboard publish → public menu → guest pay-later checkout → kitchen ticket.
 *
 * @see e2e/storefront-checkout-kds.spec.ts
 * @see docs/STOREFRONT_E2E_SMOKE_TESTS.md
 */

test.describe("storefront publish order kds policy", () => {
  test("exports storefront flow routes and steps", () => {
    expect(STOREFRONT_PUBLISH_ORDER_KDS_E2E_POLICY_ID).toBe(
      "storefront-publish-order-kds-e2e-v1",
    );
    expect(STOREFRONT_ADMIN_PATH).toBe("/dashboard/storefront");
    expect(KDS_KITCHEN_PATH).toBe("/dashboard/kitchen");
    expect(STOREFRONT_PUBLISH_ORDER_KDS_FLOW_STEPS).toEqual([
      "publish_storefront",
      "verify_public_menu",
      "guest_order",
      "verify_kds",
    ]);
  });

  test("builds catalog and menu paths from slug", () => {
    const slug = defaultStorefrontE2ESlug();
    expect(storefrontMenuPath(slug)).toBe(`/s/${slug}/menu`);
    expect(storefrontCatalogApiPath(slug)).toContain("storeSlug=");
  });

  test("CONFIRMED storefront orders remain KDS-eligible", () => {
    expect(isKdsEligibleOrderStatus("CONFIRMED")).toBe(true);
  });
});

test.describe("storefront publish order kds (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Storefront publish → order → KDS runs in chromium-authed project only",
    );
    skipStorefrontPublishOrderKdsIfGateDisabled();
    skipStorefrontPublishOrderKdsIfNotAuthed();
    skipStorefrontPublishOrderKdsIfKdsGateDisabled();
    skipStorefrontCheckoutIfTurnstileEnabled();
  });

  test("published storefront order appears on kitchen display", async ({
    page,
    browser,
    request,
  }) => {
    const result = await runStorefrontPublishOrderKdsFlow(page, browser, request);
    expect(result.steps).toEqual(STOREFRONT_PUBLISH_ORDER_KDS_FLOW_STEPS);
    expect(result.orderId.length).toBeGreaterThan(0);
    expect(result.slug.length).toBeGreaterThan(0);
  });
});
