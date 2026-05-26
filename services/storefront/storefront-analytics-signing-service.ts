import type { FirstPartyAnalyticsMode } from "@/lib/storefront/consent";
import { encodeStorefrontAnalyticsToken, decodeStorefrontAnalyticsToken } from "@/lib/storefront/storefront-analytics-token";

const DEFAULT_TTL_SEC = 20 * 60;

function signingSecret(): string | null {
  const s = process.env.STOREFRONT_ANALYTICS_SIGNING_SECRET?.trim();
  return s && s.length >= 16 ? s : null;
}

export function isStorefrontAnalyticsStrictIngestEnabled(): boolean {
  return process.env.STOREFRONT_ANALYTICS_STRICT_INGEST === "true";
}

export function issueStorefrontAnalyticsToken(input: {
  storefrontId: string;
  storeSlug: string;
  ttlSec?: number;
}): string | null {
  const secret = signingSecret();
  if (!secret) return null;
  const ttl = input.ttlSec ?? DEFAULT_TTL_SEC;
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ttl;
  return encodeStorefrontAnalyticsToken(
    { v: 1, sid: input.storefrontId, slug: input.storeSlug, iat, exp, src: "storefront_beacon" },
    secret,
  );
}

export function verifyStorefrontAnalyticsTokenForIngest(input: {
  token: string;
  expectedStoreSlug: string;
  expectedStorefrontId: string;
}): boolean {
  const secret = signingSecret();
  if (!secret) return false;
  const p = decodeStorefrontAnalyticsToken(input.token, secret);
  if (!p) return false;
  return p.slug === input.expectedStoreSlug && p.sid === input.expectedStorefrontId;
}

export type StorefrontFpIngestClientPayload = {
  mode: FirstPartyAnalyticsMode;
  fpToken: string | null;
  strictIngest: boolean;
  /** When true, client must not call the ingest API (strict mode without signing secret). */
  ingestDisabled: boolean;
};

export function buildStorefrontFpIngestClientPayload(input: {
  storefrontId: string;
  storeSlug: string;
  mode: FirstPartyAnalyticsMode;
}): StorefrontFpIngestClientPayload {
  const strictIngest = isStorefrontAnalyticsStrictIngestEnabled();
  if (input.mode === "DISABLED") {
    return { mode: input.mode, fpToken: null, strictIngest, ingestDisabled: true };
  }
  const fpToken = issueStorefrontAnalyticsToken({
    storefrontId: input.storefrontId,
    storeSlug: input.storeSlug,
  });
  const ingestDisabled = Boolean(strictIngest && !fpToken);
  return { mode: input.mode, fpToken, strictIngest, ingestDisabled };
}
