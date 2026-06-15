import { createHmac, timingSafeEqual } from "crypto";

import {
  resolveB2bPayPortalTokenTtlDays,
} from "@/lib/commercial/shopify-market-b2b-pay-portal";

export type B2bPayPortalTokenPayload = {
  v: 1;
  orderId: string;
  invoiceId: string;
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

export function mintB2bPayPortalToken(input: {
  orderId: string;
  invoiceId: string;
  userId: string;
  ttlDays?: number;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const ttlDays = resolveB2bPayPortalTokenTtlDays(input.ttlDays);
  const payload: B2bPayPortalTokenPayload = {
    v: 1,
    orderId: input.orderId,
    invoiceId: input.invoiceId,
    userId: input.userId,
    iat: now,
    exp: now + ttlDays * 86400,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", payPortalSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyB2bPayPortalToken(token: string): B2bPayPortalTokenPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = createHmac("sha256", payPortalSecret()).update(body).digest("base64url");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(unb64url(body).toString("utf8")) as B2bPayPortalTokenPayload;
    if (payload.v !== 1) return null;
    if (!payload.orderId || !payload.invoiceId || !payload.userId) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function buildB2bPayPortalUrl(token: string, siteUrl: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/pay/b2b/${encodeURIComponent(token)}`;
}
