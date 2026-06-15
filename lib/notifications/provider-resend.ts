import type { ProviderMode } from "@/lib/notifications/notification-types";

export type ResendDiagnosticsRow = {
  key: string;
  /** "present" / "missing" / "optional" / "warning" — never the value. */
  status: "present" | "missing" | "optional" | "warning";
  hint?: string;
};

export type ResendDiagnostics = {
  mode: ProviderMode;
  sendingEnabled: boolean;
  webhookEnabled: boolean;
  fromAddress: string | null;
  rows: ResendDiagnosticsRow[];
};

function present(v: string | undefined | null): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

export function getResendDiagnostics(): ResendDiagnostics {
  const p = process.env;
  const hasKey = present(p.RESEND_API_KEY);
  const hasFrom = present(p.RESEND_FROM_EMAIL);
  const hasReplyTo = present(p.RESEND_REPLY_TO_EMAIL);
  const hasWebhookSecret = present(p.RESEND_WEBHOOK_SECRET);
  const hasDomainHint = present(p.RESEND_DOMAIN_VERIFIED) || hasFrom;
  const devMode = (p.NODE_ENV ?? "development") !== "production";
  const logOnly = present(p.NOTIFICATIONS_LOG_ONLY);

  const mode: ProviderMode = !hasKey
    ? logOnly ? "DEVELOPMENT_LOG_ONLY" : devMode ? "DEVELOPMENT_LOG_ONLY" : "DISABLED"
    : logOnly
      ? "DEVELOPMENT_LOG_ONLY"
      : "RESEND";

  const sendingEnabled = mode === "RESEND";
  const webhookEnabled = sendingEnabled && hasWebhookSecret;

  return {
    mode,
    sendingEnabled,
    webhookEnabled,
    fromAddress: hasFrom ? (p.RESEND_FROM_EMAIL ?? null) : null,
    rows: [
      { key: "RESEND_API_KEY", status: hasKey ? "present" : "missing", hint: "Server-only secret. Never returned." },
      { key: "RESEND_FROM_EMAIL", status: hasFrom ? "present" : "missing", hint: "Verified sender address." },
      { key: "RESEND_REPLY_TO_EMAIL", status: hasReplyTo ? "present" : "optional" },
      { key: "RESEND_WEBHOOK_SECRET", status: hasWebhookSecret ? "present" : "optional", hint: "Required for delivery status webhooks." },
      { key: "RESEND_DOMAIN_VERIFIED", status: hasDomainHint ? "present" : "warning", hint: "Set this flag when DNS records pass at Resend." },
      { key: "NOTIFICATIONS_LOG_ONLY", status: logOnly ? "present" : "optional", hint: "Force log-only mode even when a key is present." },
    ],
  };
}

export function getProviderMode(): ProviderMode {
  return getResendDiagnostics().mode;
}

export function canSendEmails(): boolean {
  return getResendDiagnostics().sendingEnabled;
}
