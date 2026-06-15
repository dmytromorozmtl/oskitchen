export type StripeLiveConnectionSettings = {
  lastPaymentIntentAt?: string | null;
  lastPaymentIntentId?: string | null;
  lastPayoutReconcileAt?: string | null;
  lastPayoutReconcileCount?: number | null;
  lastWebhookAt?: string | null;
  lastWebhookType?: string | null;
};

export type StripeLiveDashboard = {
  mode: "placeholder" | "live";
  connected: boolean;
  webhookConfigured: boolean;
  lastPaymentIntentAt: string | null;
  lastPayoutReconcileAt: string | null;
  lastPayoutReconcileCount: number | null;
  pendingPayoutCents: number | null;
  message: string;
};

export type StripePaymentIntentResult = {
  ok: boolean;
  paymentIntentId: string | null;
  clientSecret: string | null;
  amountCents: number;
  currency: string;
  message: string;
};

export type StripePayoutReconciliationRow = {
  payoutId: string;
  amountCents: number;
  currency: string;
  status: string;
  arrivalDate: string | null;
  matchedPayments: number;
};

export type StripePayoutReconciliationResult = {
  ok: boolean;
  reconciled: number;
  rows: StripePayoutReconciliationRow[];
  message: string;
};
