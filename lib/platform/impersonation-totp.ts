import { authenticator } from "otplib";

authenticator.options = { window: 1 };

export function isImpersonationTotpConfigured(): boolean {
  return Boolean(process.env.PLATFORM_IMPERSONATION_TOTP_SECRET?.trim());
}

/** Verify 6-digit TOTP for platform impersonation (RFC 6238). */
export function verifyImpersonationTotp(code: string | null | undefined): boolean {
  const secret = process.env.PLATFORM_IMPERSONATION_TOTP_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  const token = (code ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(token)) return false;
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}
