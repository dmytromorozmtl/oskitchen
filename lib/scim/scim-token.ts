import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** SHA-256 hash for SCIM bearer tokens at rest. */
export function hashScimBearerToken(token: string): string {
  return createHash("sha256").update(token.trim()).digest("hex");
}

export function generateScimBearerToken(): string {
  return `kos_scim_${randomBytes(32).toString("base64url")}`;
}

export function verifyScimBearerToken(
  presented: string,
  storedHash: string,
): boolean {
  const a = createHash("sha256").update(presented.trim()).digest();
  const b = Buffer.from(storedHash, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function extractScimBearerToken(
  authHeader: string | null,
): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}
