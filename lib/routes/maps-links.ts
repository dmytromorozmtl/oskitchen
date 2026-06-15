/**
 * Maps helpers. Never imports `GOOGLE_MAPS_API_KEY` directly; callers pass it
 * (via `getServerEnv`) so we can stay safe in client-bundled paths.
 */

export type AddressLike = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
  notes?: string | null;
};

export function formatAddress(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as AddressLike;
  const parts = [a.line1, a.line2, a.city, a.region, a.postalCode, a.country]
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean);
  if (parts.length === 0) {
    return typeof a.notes === "string" && a.notes.trim() ? a.notes.trim() : null;
  }
  return parts.join(", ");
}

export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mapsDirectionsUrl(stops: readonly string[]): string {
  if (stops.length === 0) return "https://www.google.com/maps";
  const [destination, ...rest] = stops.slice().reverse();
  const origin = rest.length ? rest[rest.length - 1] : destination;
  const waypoints = rest.slice(0, -1).reverse();
  const url = new URL("https://www.google.com/maps/dir/?api=1");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  if (waypoints.length > 0) url.searchParams.set("waypoints", waypoints.join("|"));
  url.searchParams.set("travelmode", "driving");
  return url.toString();
}

export function callPhoneHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.length < 5) return null;
  return `tel:${cleaned}`;
}

/**
 * Build a Google Maps embed URL. Returns null when no API key is configured —
 * callers must fall back to the external link rather than crash.
 */
export function mapsEmbedUrl(query: string, apiKey: string | undefined): string | null {
  if (!apiKey) return null;
  const u = new URL("https://www.google.com/maps/embed/v1/place");
  u.searchParams.set("q", query);
  u.searchParams.set("key", apiKey);
  return u.toString();
}
