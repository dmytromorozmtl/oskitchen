import type { StorefrontSettings } from "@prisma/client";

import {
  extractPostalTokens,
  normalizeAddressForMatching,
  parseDeliveryZonesJson,
  type StorefrontDeliveryZone,
} from "@/lib/storefront/delivery-zones";
import type { CheckoutLineItem } from "@/lib/storefront/checkout-totals";

export type ShippingQuoteInput = {
  fulfillmentType: "PICKUP" | "DELIVERY";
  deliveryAddress?: string | null;
  subtotal: number;
};

export type ShippingQuote = {
  ok: boolean;
  error?: string;
  deliveryFee: number;
  matchedZoneName?: string;
  lines: CheckoutLineItem[];
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function resolveZoneFee(
  zone: StorefrontDeliveryZone | null,
  sf: Pick<StorefrontSettings, "storefrontDeliveryFee" | "freeDeliveryThreshold">,
  subtotal: number,
): number {
  const baseFee =
    zone?.fee != null && Number.isFinite(zone.fee)
      ? zone.fee
      : sf.storefrontDeliveryFee != null
        ? Number(sf.storefrontDeliveryFee)
        : 0;
  const freeThreshold =
    zone?.freeDeliveryThreshold != null
      ? zone.freeDeliveryThreshold
      : sf.freeDeliveryThreshold != null
        ? Number(sf.freeDeliveryThreshold)
        : null;
  if (freeThreshold != null && subtotal >= freeThreshold) return 0;
  return roundMoney(Math.max(0, baseFee));
}

function matchZone(
  zones: StorefrontDeliveryZone[],
  address: string,
): StorefrontDeliveryZone | null {
  const norm = normalizeAddressForMatching(address);
  const postalTokens = extractPostalTokens(address);
  for (const z of zones) {
    if (z.enabled === false) continue;
    let match = false;
    if (z.postalCodes?.length) {
      const codes = z.postalCodes.map((c) => c.toUpperCase().replace(/\s+/g, ""));
      match = codes.some((c) => postalTokens.some((t) => t.includes(c) || norm.includes(c)));
    } else if (z.regions?.length) {
      const regs = z.regions.map((r) => r.toUpperCase());
      match = regs.some((r) => norm.includes(r));
    }
    if (match) return z;
  }
  return null;
}

/**
 * Computes delivery fee as a checkout line item from zones + storefront defaults.
 */
export function quoteStorefrontShipping(
  sf: Pick<
    StorefrontSettings,
    | "deliveryEnabled"
    | "deliveryZonesJson"
    | "storefrontDeliveryFee"
    | "freeDeliveryThreshold"
  >,
  input: ShippingQuoteInput,
): ShippingQuote {
  const subtotal = roundMoney(Math.max(0, input.subtotal));
  const lines: CheckoutLineItem[] = [];

  if (input.fulfillmentType !== "DELIVERY") {
    return { ok: true, deliveryFee: 0, lines };
  }
  if (!sf.deliveryEnabled) {
    return { ok: false, error: "Delivery is not enabled.", deliveryFee: 0, lines };
  }
  const addr = input.deliveryAddress?.trim();
  if (!addr) {
    return { ok: false, error: "Delivery address is required.", deliveryFee: 0, lines };
  }

  const parsed = parseDeliveryZonesJson(sf.deliveryZonesJson);
  if (parsed.error) {
    return { ok: false, error: "Delivery zones configuration is invalid.", deliveryFee: 0, lines };
  }

  const enabled = parsed.zones.filter((z) => z.enabled !== false);
  const hasMatchers = enabled.some((z) => (z.postalCodes?.length ?? 0) > 0 || (z.regions?.length ?? 0) > 0);
  let matched: StorefrontDeliveryZone | null = null;
  if (hasMatchers) {
    matched = matchZone(enabled, addr);
    if (!matched) {
      return {
        ok: false,
        error: "Delivery is not available for this address.",
        deliveryFee: 0,
        lines,
      };
    }
    const min = matched.minimumOrder;
    if (min != null && subtotal < min) {
      return {
        ok: false,
        error: `Minimum subtotal for ${matched.name ?? "this zone"} is ${min.toFixed(2)}.`,
        deliveryFee: 0,
        lines,
        matchedZoneName: matched.name,
      };
    }
  }

  const deliveryFee = resolveZoneFee(matched, sf, subtotal);
  if (deliveryFee > 0) {
    lines.push({
      key: "delivery",
      label: matched?.name ? `Delivery (${matched.name})` : "Delivery",
      amount: deliveryFee,
    });
  }

  return {
    ok: true,
    deliveryFee,
    matchedZoneName: matched?.name,
    lines,
  };
}
