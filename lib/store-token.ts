import { randomBytes } from "crypto";

/** URL-safe token for public storefront order confirmation links. */
export function generateStorefrontPublicToken(): string {
  return randomBytes(24).toString("base64url");
}
