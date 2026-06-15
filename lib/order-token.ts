import { randomBytes } from "crypto";

export function generatePublicLookupToken(): string {
  return randomBytes(8).toString("hex");
}
