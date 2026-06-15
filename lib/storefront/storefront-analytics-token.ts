import { createHash } from "node:crypto";
import { hmacSha256Hex, timingSafeEqualHex } from "@/lib/storefront/analytics-signature";

export type StorefrontAnalyticsTokenPayload = {
  v: 1;
  /** Storefront row id (UUID) — not a secret; binds token to tenant. */
  sid: string;
  /** Public slug — must match ingest body. */
  slug: string;
  /** Issued-at unix seconds. */
  iat: number;
  /** Expiry unix seconds. */
  exp: number;
  /** Logical emitter (first-party beacon). */
  src: "storefront_beacon";
};

const SRC: StorefrontAnalyticsTokenPayload["src"] = "storefront_beacon";

function canonicalPayloadString(p: StorefrontAnalyticsTokenPayload): string {
  return JSON.stringify({
    v: p.v,
    sid: p.sid,
    slug: p.slug,
    iat: p.iat,
    exp: p.exp,
    src: p.src,
  });
}

export function encodeStorefrontAnalyticsToken(
  payload: StorefrontAnalyticsTokenPayload,
  secret: string,
): string {
  const body = canonicalPayloadString(payload);
  const sig = hmacSha256Hex(body, secret);
  const combined = `${body}\n${sig}`;
  return Buffer.from(combined, "utf8").toString("base64url");
}

export type VerifiedStorefrontAnalyticsToken = StorefrontAnalyticsTokenPayload;

export function decodeStorefrontAnalyticsToken(
  token: string,
  secret: string,
): VerifiedStorefrontAnalyticsToken | null {
  let raw: string;
  try {
    raw = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const nl = raw.lastIndexOf("\n");
  if (nl === -1) return null;
  const body = raw.slice(0, nl);
  const sig = raw.slice(nl + 1);
  const expected = hmacSha256Hex(body, secret);
  if (!timingSafeEqualHex(expected, sig)) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(body) as unknown;
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;
  if (o.v !== 1 || o.src !== SRC) return null;
  if (typeof o.sid !== "string" || typeof o.slug !== "string") return null;
  if (typeof o.iat !== "number" || typeof o.exp !== "number") return null;
  const now = Math.floor(Date.now() / 1000);
  if (o.exp < now) return null;
  if (o.iat > now + 120) return null; // clock skew / not-yet-valid
  return {
    v: 1,
    sid: o.sid,
    slug: o.slug,
    iat: o.iat,
    exp: o.exp,
    src: SRC,
  };
}

/** Fingerprint for logs only (no PII). */
export function storefrontAnalyticsTokenDebugFingerprint(token: string): string {
  try {
    return createHash("sha256").update(token).digest("hex").slice(0, 12);
  } catch {
    return "invalid";
  }
}
