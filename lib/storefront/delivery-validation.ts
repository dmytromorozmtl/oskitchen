import type { StorefrontSettings } from "@prisma/client";

import { extractPostalTokens, normalizeAddressForMatching, parseDeliveryZonesJson } from "@/lib/storefront/delivery-zones";

export type DeliveryValidationInput = {
  fulfillmentType: "PICKUP" | "DELIVERY";
  deliveryAddress?: string | null;
  subtotal: number;
};

export type DeliveryValidationResult = {
  ok: boolean;
  error?: string;
  /** Human-readable diagnostics for admins / logs — not shown to guests unless error */
  diagnostics: string[];
  matchedZoneName?: string;
};

/**
 * Server-side delivery checks without geocoding.
 * - deliveryRadiusKm: NOT enforced (requires lat/lng) — diagnostics only.
 * - deliveryZonesJson: enforced when zones define postalCodes or regions and at least one enabled zone matches.
 * - If zones exist but none match → reject delivery.
 * - If no zones and no matchable rules → allow (fee still applied elsewhere).
 */
export function validateStorefrontDelivery(
  sf: Pick<
    StorefrontSettings,
    "deliveryEnabled" | "deliveryRadiusKm" | "deliveryZonesJson" | "storefrontDeliveryFee" | "freeDeliveryThreshold"
  >,
  input: DeliveryValidationInput,
): DeliveryValidationResult {
  const diagnostics: string[] = [];
  if (input.fulfillmentType !== "DELIVERY") {
    return { ok: true, diagnostics: ["Pickup — no delivery zone checks."] };
  }
  if (!sf.deliveryEnabled) {
    return { ok: false, error: "Delivery is not enabled for this storefront.", diagnostics };
  }
  const addr = input.deliveryAddress?.trim();
  if (!addr) {
    return { ok: false, error: "Delivery address is required.", diagnostics };
  }

  if (sf.deliveryRadiusKm != null && sf.deliveryRadiusKm > 0) {
    diagnostics.push(
      `deliveryRadiusKm=${sf.deliveryRadiusKm} is saved but radius is not enforced without geocoded coordinates — use delivery zones with postal codes or manual review.`,
    );
  }

  const parsed = parseDeliveryZonesJson(sf.deliveryZonesJson);
  if (parsed.error) {
    return { ok: false, error: "Delivery zones configuration is invalid.", diagnostics: [...diagnostics, parsed.error] };
  }
  const zones = parsed.zones.filter((z) => z.enabled !== false);
  if (zones.length === 0) {
    diagnostics.push("No enabled delivery zones in JSON — address not matched to a zone (allowed).");
    return { ok: true, diagnostics };
  }

  const norm = normalizeAddressForMatching(addr);
  const postalTokens = extractPostalTokens(addr);

  for (const z of zones) {
    const zName = z.name ?? "Zone";
    let match = false;

    if (z.postalCodes?.length) {
      const codes = z.postalCodes.map((c) => c.toUpperCase().replace(/\s+/g, ""));
      match = codes.some((c) => postalTokens.some((t) => t.includes(c) || norm.includes(c)));
    } else if (z.regions?.length) {
      const regs = z.regions.map((r) => r.toUpperCase());
      match = regs.some((r) => norm.includes(r));
    } else {
      diagnostics.push(`Zone "${zName}" has no postalCodes or regions — skipped for matching.`);
      continue;
    }

    if (!match) continue;

    const min = z.minimumOrder;
    if (min != null && Number.isFinite(min) && input.subtotal < min) {
      return {
        ok: false,
        error: `This delivery address is in "${zName}" which requires a higher minimum subtotal.`,
        diagnostics: [...diagnostics, `Matched ${zName} but below minimumOrder.`],
        matchedZoneName: zName,
      };
    }

    return {
      ok: true,
      diagnostics: [...diagnostics, `Matched delivery zone: ${zName}.`],
      matchedZoneName: zName,
    };
  }

  const hasMatchers = zones.some((z) => (z.postalCodes?.length ?? 0) > 0 || (z.regions?.length ?? 0) > 0);
  if (!hasMatchers) {
    diagnostics.push("Zones defined but none have postalCodes/regions — not enforced.");
    return { ok: true, diagnostics };
  }

  return {
    ok: false,
    error: "Delivery is not available for this address under the configured zones.",
    diagnostics: [...diagnostics, "No zone matched address tokens."],
  };
}
