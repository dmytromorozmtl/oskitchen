import { createHash } from "crypto";

import { fingerprintFromCartSnapshotJson } from "@/lib/storefront/cart-snapshot";

/** Stable key for duplicate-submit detection (same cart lines, any order). */
export function stableCartFingerprint(
  lines: { productId: string; quantity: number }[],
): string {
  const norm = [...lines]
    .map((l) => ({ productId: l.productId, quantity: l.quantity }))
    .sort((a, b) => a.productId.localeCompare(b.productId));
  return createHash("sha256").update(JSON.stringify(norm)).digest("hex").slice(0, 64);
}

/**
 * After local `orderCutoffTime` (HH:mm) in the storefront timezone, block new checkouts for the day.
 * Uses `Intl` with the storefront `timeZone` string (IANA). Invalid timezone → no cutoff enforcement.
 */
export function isPastDailyOrderCutoff(
  orderCutoffTime: string | null | undefined,
  timeZone: string | null | undefined,
): boolean {
  const t = orderCutoffTime?.trim();
  if (!t) return false;
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(t);
  if (!m) return false;
  const cutoffH = parseInt(m[1], 10);
  const cutoffM = parseInt(m[2], 10);
  const tz = timeZone?.trim() || "UTC";
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    const min = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    return h > cutoffH || (h === cutoffH && min >= cutoffM);
  } catch {
    return false;
  }
}

export function parsePickupDeliveryNotes(raw: string | undefined): string | null {
  const s = raw?.trim();
  if (!s) return null;
  return s.slice(0, 2000);
}

export function fingerprintFromStorefrontCartJson(json: unknown): string | null {
  return fingerprintFromCartSnapshotJson(json);
}
