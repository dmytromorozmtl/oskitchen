/**
 * User-facing error copy — keep non-technical; log stack traces server-side only.
 */
export const ErrorMessages = {
  generic:
    "Something went wrong. Try again in a moment. If it keeps happening, contact support.",
  unauthorized: "You need to sign in again to continue.",
  forbidden: "You don’t have access to this.",
  dbUnavailable:
    "We couldn’t reach the database. Check your connection or try again shortly.",
  encryptionMissing:
    "Encryption isn’t configured on this server. Your operator needs to set ENCRYPTION_KEY before saving API keys.",
  integrationCredentials:
    "Those store credentials didn’t work. Double-check the URL, keys, and that REST/API access is enabled.",
  webhookSignature:
    "This webhook couldn’t be verified. Check the signing secret matches your store configuration.",
  duplicateWebhook:
    "We’ve already processed this event — no action needed.",
  syncFailed:
    "Sync didn’t finish. Check your connection status, then try again.",
  unmatchedProduct:
    "Some line items don’t match your menu yet. Map them in Sales channels → incoming orders.",
  emailNotConfigured:
    "Email isn’t configured (missing RESEND_API_KEY). Notifications are paused until your operator adds it.",
  deliveryPlaceholder:
    "Delivery quotes aren’t live yet — finish Uber Direct setup when your account is provisioned.",
  demoResetWarning:
    "Reset removes demo menus, orders, and sample channel rows tied to demo mode from this workspace.",
} as const;

export function friendlyError(err: unknown, fallbackKey: keyof typeof ErrorMessages = "generic"): string {
  if (err instanceof Error) {
    const m = err.message.toLowerCase();
    if (m.includes("unauthorized") || m.includes("401")) return ErrorMessages.unauthorized;
    if (m.includes("forbidden") || m.includes("403")) return ErrorMessages.forbidden;
    if (m.includes("prisma") || m.includes("database") || m.includes("connect econnrefused")) {
      return ErrorMessages.dbUnavailable;
    }
    if (m.includes("encryption_key")) return ErrorMessages.encryptionMissing;
    return err.message || ErrorMessages[fallbackKey];
  }
  return ErrorMessages[fallbackKey];
}
