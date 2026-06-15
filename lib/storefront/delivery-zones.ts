export type StorefrontDeliveryZone = {
  name?: string;
  enabled?: boolean;
  /** Optional flat fee override for this zone */
  fee?: number;
  minimumOrder?: number;
  freeDeliveryThreshold?: number;
  /** Optional list of postal / ZIP fragments (case-insensitive contains match on normalized address) */
  postalCodes?: string[];
  /** Optional ISO region codes e.g. CA, NY */
  regions?: string[];
  notes?: string;
};

export function parseDeliveryZonesJson(raw: unknown): { zones: StorefrontDeliveryZone[]; error?: string } {
  if (raw == null) return { zones: [] };
  if (!Array.isArray(raw)) {
    return { zones: [], error: "deliveryZonesJson must be a JSON array of zone objects." };
  }
  const zones: StorefrontDeliveryZone[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const z = row as Record<string, unknown>;
    zones.push({
      name: typeof z.name === "string" ? z.name : undefined,
      enabled: typeof z.enabled === "boolean" ? z.enabled : z.enabled == null ? true : Boolean(z.enabled),
      fee: typeof z.fee === "number" ? z.fee : z.fee != null ? Number(z.fee) : undefined,
      minimumOrder:
        typeof z.minimumOrder === "number" ? z.minimumOrder : z.minimumOrder != null ? Number(z.minimumOrder) : undefined,
      freeDeliveryThreshold:
        typeof z.freeDeliveryThreshold === "number"
          ? z.freeDeliveryThreshold
          : z.freeDeliveryThreshold != null
            ? Number(z.freeDeliveryThreshold)
            : undefined,
      postalCodes: Array.isArray(z.postalCodes) ? z.postalCodes.filter((x): x is string => typeof x === "string") : undefined,
      regions: Array.isArray(z.regions) ? z.regions.filter((x): x is string => typeof x === "string") : undefined,
      notes: typeof z.notes === "string" ? z.notes : undefined,
    });
  }
  return { zones };
}

export function normalizeAddressForMatching(address: string): string {
  return address.toUpperCase().replace(/\s+/g, " ").trim();
}

/** Extract likely postal/ZIP token from free-text address (best-effort, no geocoding). */
export function extractPostalTokens(address: string): string[] {
  const norm = normalizeAddressForMatching(address);
  const out = new Set<string>();
  const us = /\b(\d{5})(?:-\d{4})?\b/g;
  let m: RegExpExecArray | null;
  while ((m = us.exec(norm)) !== null) {
    out.add(m[1]);
  }
  const ca = /\b([A-Z]\d[A-Z])\s*(\d[A-Z]\d)\b/g;
  while ((m = ca.exec(norm)) !== null) {
    out.add(`${m[1]}${m[2]}`);
    out.add(`${m[1]} ${m[2]}`);
  }
  return [...out];
}
