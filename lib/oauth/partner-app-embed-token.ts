import { createHmac, timingSafeEqual } from "crypto";

export type PartnerAppEmbedTokenPayload = {
  v: 1;
  installationId: string;
  workspaceId: string | null;
  clientId: string;
  userId: string;
  iat: number;
  exp: number;
};

const TOKEN_TTL_SECONDS = 15 * 60;

function embedSecret(): string {
  return (
    process.env.PARTNER_EMBED_TOKEN_SECRET?.trim() ||
    process.env.ENCRYPTION_KEY?.trim() ||
    "kitchenos-dev-embed-secret"
  );
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64url");
}

function unb64url(input: string): Buffer {
  return Buffer.from(input, "base64url");
}

export function mintPartnerAppEmbedToken(input: {
  installationId: string;
  workspaceId: string | null;
  clientId: string;
  userId: string;
  ttlSeconds?: number;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: PartnerAppEmbedTokenPayload = {
    v: 1,
    installationId: input.installationId,
    workspaceId: input.workspaceId,
    clientId: input.clientId,
    userId: input.userId,
    iat: now,
    exp: now + (input.ttlSeconds ?? TOKEN_TTL_SECONDS),
  };
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", embedSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyPartnerAppEmbedToken(
  token: string,
): PartnerAppEmbedTokenPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = createHmac("sha256", embedSecret()).update(body).digest("base64url");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(unb64url(body).toString("utf8")) as PartnerAppEmbedTokenPayload;
    if (payload.v !== 1) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function partnerAppEmbedTokenTtlSeconds(): number {
  return TOKEN_TTL_SECONDS;
}
