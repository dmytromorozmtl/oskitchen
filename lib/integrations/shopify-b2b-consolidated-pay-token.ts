import { createHmac, randomUUID, timingSafeEqual } from "crypto";

import { resolveB2bConsolidatedPayTokenTtlDays } from "@/lib/commercial/shopify-market-b2b-consolidated-pay";

export type B2bConsolidatedPayTokenPayload = {
  v: 2;
  batchId: string;
  orderIds: string[];
  userId: string;
  iat: number;
  exp: number;
};

function payPortalSecret(): string {
  return (
    process.env.B2B_PAY_PORTAL_TOKEN_SECRET?.trim() ||
    process.env.ENCRYPTION_KEY?.trim() ||
    "kitchenos-dev-b2b-pay-portal"
  );
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64url");
}

function unb64url(input: string): Buffer {
  return Buffer.from(input, "base64url");
}

export function mintB2bConsolidatedPayBatchId(): string {
  return randomUUID();
}

export function mintB2bConsolidatedPayToken(input: {
  batchId: string;
  orderIds: string[];
  userId: string;
  ttlDays?: number;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const ttlDays = resolveB2bConsolidatedPayTokenTtlDays(input.ttlDays);
  const payload: B2bConsolidatedPayTokenPayload = {
    v: 2,
    batchId: input.batchId,
    orderIds: input.orderIds,
    userId: input.userId,
    iat: now,
    exp: now + ttlDays * 86400,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", payPortalSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyB2bConsolidatedPayToken(token: string): B2bConsolidatedPayTokenPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = createHmac("sha256", payPortalSecret()).update(body).digest("base64url");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(unb64url(body).toString("utf8")) as B2bConsolidatedPayTokenPayload;
    if (payload.v !== 2) return null;
    if (!payload.batchId || !payload.userId) return null;
    if (!Array.isArray(payload.orderIds) || payload.orderIds.length === 0) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function buildB2bConsolidatedPayUrl(token: string, siteUrl: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/pay/b2b/batch/${encodeURIComponent(token)}`;
}
