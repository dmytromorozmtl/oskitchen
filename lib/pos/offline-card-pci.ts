/**
 * PCI-DSS boundary for offline card staging — OS Kitchen never stores PAN, CVV, or track data.
 * Only opaque processor references, last4, and brand are permitted.
 */

export type OfflineCardCaptureInput = {
  offlineSaleId: string;
  registerId: string;
  amountCents: number;
  currency?: string;
  cardBrand: string;
  last4: string;
  /** Stripe Terminal offline / payment intent id — opaque token only */
  paymentIntentId?: string;
  stripeOfflineReference?: string;
  tableId?: string | null;
  deviceId?: string | null;
};

const PAN_LIKE = /\b(?:\d[ -]*?){13,19}\b/;
const CVV_LIKE = /\b(?:cvv|cvc|security code)[:\s]*\d{3,4}\b/i;
const TRACK_LIKE = /%?[A-Z0-9]{1,2}\?[A-Z0-9+/=;]+\?/i;

const FORBIDDEN_KEYS = new Set([
  "pan",
  "cardnumber",
  "card_number",
  "number",
  "cvv",
  "cvc",
  "securitycode",
  "security_code",
  "track1",
  "track2",
  "magstripe",
  "emv",
  "chipdata",
]);

export function scanForForbiddenCardholderData(text: string): string | null {
  const t = text.trim();
  if (!t) return null;
  if (PAN_LIKE.test(t.replace(/\s/g, ""))) return "Full card number patterns are not allowed.";
  if (CVV_LIKE.test(t)) return "CVV/CVC values are not allowed.";
  if (TRACK_LIKE.test(t)) return "Magnetic stripe / track data is not allowed.";
  return null;
}

export function assertPciSafeOfflineCardCapture(
  input: OfflineCardCaptureInput,
): OfflineCardCaptureInput {
  const last4 = input.last4.replace(/\D/g, "").slice(-4);
  if (last4.length !== 4) {
    throw new Error("last4 must be exactly 4 digits — never store full card numbers.");
  }

  const brand = input.cardBrand.trim().slice(0, 32);
  if (!brand) throw new Error("cardBrand is required.");

  for (const [key, value] of Object.entries(input)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
      throw new Error(`Field "${key}" is not permitted — PCI scope violation.`);
    }
  }

  const hitBrand = scanForForbiddenCardholderData(brand);
  if (hitBrand) throw new Error(hitBrand);
  if (input.stripeOfflineReference) {
    const hitRef = scanForForbiddenCardholderData(input.stripeOfflineReference);
    if (hitRef) throw new Error(hitRef);
  }

  if (input.paymentIntentId && !/^pi_[a-zA-Z0-9]+$/.test(input.paymentIntentId)) {
    throw new Error("paymentIntentId must be a Stripe payment intent id (pi_…).");
  }

  if (
    input.stripeOfflineReference &&
    input.stripeOfflineReference.length > 255
  ) {
    throw new Error("stripeOfflineReference is too long.");
  }

  return {
    ...input,
    last4,
    cardBrand: brand,
    amountCents: Math.max(0, Math.round(input.amountCents)),
    currency: (input.currency ?? "usd").toLowerCase().slice(0, 3),
  };
}

export const OFFLINE_CARD_PCI_NOTES = [
  "Card numbers, CVV, and magnetic stripe data never touch OS Kitchen servers.",
  "Offline card mode stores last4, brand, and opaque Stripe references only.",
  "Capture runs when connectivity returns via Stripe Terminal — not EMV store-and-forward.",
] as const;
