import type { StorefrontSettings } from "@prisma/client";

import type { DeliveryValidationInput, DeliveryValidationResult } from "@/lib/storefront/delivery-validation";
import { validateStorefrontDelivery } from "@/lib/storefront/delivery-validation";

/** Thin service wrapper so checkout and future workers call one entry point. */
export function validateDeliveryForStorefrontCheckout(
  sf: Pick<
    StorefrontSettings,
    "deliveryEnabled" | "deliveryRadiusKm" | "deliveryZonesJson" | "storefrontDeliveryFee" | "freeDeliveryThreshold"
  >,
  input: DeliveryValidationInput,
): DeliveryValidationResult {
  return validateStorefrontDelivery(sf, input);
}
