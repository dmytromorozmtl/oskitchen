import { timingSafeEqual } from "node:crypto";

/**
 * Step-up token for platform impersonation (paid pilot gate).
 * Set `PLATFORM_IMPERSONATION_STEP_UP_TOKEN` in production before enabling impersonation.
 */
export function isImpersonationStepUpConfigured(): boolean {
  return Boolean(process.env.PLATFORM_IMPERSONATION_STEP_UP_TOKEN?.trim());
}

export function verifyImpersonationStepUp(provided: string | null | undefined): boolean {
  const expected = process.env.PLATFORM_IMPERSONATION_STEP_UP_TOKEN?.trim();
  if (!expected) return process.env.NODE_ENV !== "production";
  const token = (provided ?? "").trim();
  if (!token) return false;
  try {
    const a = Buffer.from(token, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
