/**
 * Extended subscription/billing state. The Prisma `SubscriptionStatus` enum
 * (ACTIVE, PAST_DUE, CANCELED, TRIALING) is still the source of truth in the
 * DB; this UI-side enum widens it for richer Stripe states and an
 * internal/none state.
 */
export type BillingStatusKey =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "CANCELLED"
  | "UNPAID"
  | "PAUSED"
  | "NONE"
  | "INTERNAL";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export const BILLING_STATUS_LABEL: Record<BillingStatusKey, string> = {
  TRIALING: "Trialing",
  ACTIVE: "Active",
  PAST_DUE: "Past due",
  INCOMPLETE: "Incomplete",
  INCOMPLETE_EXPIRED: "Incomplete (expired)",
  CANCELLED: "Cancelled",
  UNPAID: "Unpaid",
  PAUSED: "Paused",
  NONE: "No subscription",
  INTERNAL: "Internal",
};

export const BILLING_STATUS_TONE: Record<BillingStatusKey, Tone> = {
  TRIALING: "info",
  ACTIVE: "success",
  PAST_DUE: "warning",
  INCOMPLETE: "warning",
  INCOMPLETE_EXPIRED: "danger",
  CANCELLED: "neutral",
  UNPAID: "danger",
  PAUSED: "warning",
  NONE: "neutral",
  INTERNAL: "info",
};

export const BILLING_MODE_KEYS = [
  "STRIPE",
  "MANUAL",
  "INTERNAL_FREE",
  "ENTERPRISE_CONTRACT",
  "DEV_DISABLED",
] as const;
export type BillingModeKey = (typeof BILLING_MODE_KEYS)[number];

export const BILLING_MODE_LABEL: Record<BillingModeKey, string> = {
  STRIPE: "Stripe",
  MANUAL: "Manual",
  INTERNAL_FREE: "Internal / free",
  ENTERPRISE_CONTRACT: "Enterprise contract",
  DEV_DISABLED: "Dev disabled",
};

/** Map a Stripe subscription status string to our widened enum. */
export function mapStripeSubscriptionStatus(s: string): BillingStatusKey {
  switch (s) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "incomplete":
      return "INCOMPLETE";
    case "incomplete_expired":
      return "INCOMPLETE_EXPIRED";
    case "canceled":
      return "CANCELLED";
    case "unpaid":
      return "UNPAID";
    case "paused":
      return "PAUSED";
    default:
      return "NONE";
  }
}

/** Map widened enum back to the DB enum (only 4 values exist). */
export function dbStatusFromBilling(s: BillingStatusKey): "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" {
  if (s === "ACTIVE" || s === "INTERNAL") return "ACTIVE";
  if (s === "TRIALING") return "TRIALING";
  if (s === "PAST_DUE" || s === "UNPAID" || s === "INCOMPLETE" || s === "PAUSED") return "PAST_DUE";
  return "CANCELED";
}

export function isFunctionallyActive(s: BillingStatusKey): boolean {
  return s === "ACTIVE" || s === "TRIALING" || s === "INTERNAL";
}

export function trialDaysRemaining(trialEndsAt: Date | null | undefined, now: Date = new Date()): number | null {
  if (!trialEndsAt) return null;
  const ms = trialEndsAt.getTime() - now.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
