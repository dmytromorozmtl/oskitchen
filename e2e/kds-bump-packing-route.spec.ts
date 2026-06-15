import { expect, test } from "@playwright/test";

import {
  KDS_BUMP_PACKING_ROUTE_E2E_POLICY_ID,
  KDS_KITCHEN_PATH,
  PACKING_VERIFY_PATH,
  ROUTES_PLANNER_PATH,
  kdsBumpPackingRouteTicketTestId,
} from "@/lib/kitchen/kds-bump-packing-route-e2e-policy";
import { defaultStorefrontE2ESlug } from "@/lib/storefront/storefront-checkout-kds-e2e-policy";

import {
  assertKdsKitchenReadyOrSkip,
  buildRouteForDeliveryDate,
  bumpOrderOnKds,
  completeStorefrontDeliveryCheckout,
  verifyOrderInPackingConsole,
} from "./helpers/kds-bump-packing-route-flow";
import { skipKdsBumpPackingRouteIfNotAuthed } from "./helpers/kds-bump-packing-route-ready";
import {
  ensureStorefrontDevServer,
  loadStorefrontCartProduct,
  seedStorefrontCart,
  skipStorefrontCheckoutIfTurnstileEnabled,
} from "./helpers/storefront-checkout-kds-flow";

/**
 * KDS bump → packing verify → delivery route E2E.
 *
 * Delivery storefront checkout → kitchen bump to ready → packing QC pass → route stop.
 *
 * @see e2e/kds-staging.spec.ts
 * @see e2e/storefront-checkout-kds.spec.ts
 * @see docs/PACKING_VERIFICATION.md
 */

const kdsGateEnabled =
  process.env.NODE_ENV === "production" ||
  process.env.ENABLE_KDS_V1_CERTIFIED === "true";

test.describe("kds bump packing route policy", () => {
  test("exports route and testid contract", () => {
    expect(KDS_BUMP_PACKING_ROUTE_E2E_POLICY_ID).toBe("kds-bump-packing-route-e2e-v1");
    expect(KDS_KITCHEN_PATH).toBe("/dashboard/kitchen");
    expect(PACKING_VERIFY_PATH).toBe("/dashboard/packing/verify");
    expect(ROUTES_PLANNER_PATH).toBe("/dashboard/routes/planner");
    expect(kdsBumpPackingRouteTicketTestId("ord-1")).toBe("kds-ticket-ord-1");
  });
});

test.describe("kds bump packing route (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "KDS bump packing route runs in chromium-authed project only",
    );
    test.skip(
      !kdsGateEnabled,
      "Set ENABLE_KDS_V1_CERTIFIED=true for non-production KDS v1 gate",
    );
    skipStorefrontCheckoutIfTurnstileEnabled();
    skipKdsBumpPackingRouteIfNotAuthed();
  });

  test("delivery order bumps on KDS, passes packing verify, and lands on route", async ({
    page,
    request,
  }) => {
    await ensureStorefrontDevServer(request);
    const slug = defaultStorefrontE2ESlug();
    const product = await loadStorefrontCartProduct(request, slug);
    await seedStorefrontCart(request, product.id, slug);

    const { orderId, deliveryDate, customerName } = await completeStorefrontDeliveryCheckout(
      page,
      slug,
    );

    await bumpOrderOnKds(page, orderId);
    await verifyOrderInPackingConsole(page, orderId, customerName);
    await buildRouteForDeliveryDate(page, deliveryDate, customerName, orderId);
  });
});
