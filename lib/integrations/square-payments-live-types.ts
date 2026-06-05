export type SquarePaymentsLiveConnectionSettings = {
  merchantId?: string | null;
  lastPaymentAt?: string | null;
  lastPaymentId?: string | null;
  lastRefundSyncAt?: string | null;
  lastRefundSynced?: number | null;
};

export type SquarePaymentsLiveDashboard = {
  mode: "placeholder" | "live";
  oauthAuthorizeUrl: string | null;
  connected: boolean;
  locationId: string | null;
  lastPaymentAt: string | null;
  lastPaymentId: string | null;
  lastRefundSyncAt: string | null;
  lastRefundSynced: number | null;
  message: string;
};

export type SquarePaymentProcessResult = {
  ok: boolean;
  paymentId: string | null;
  status: string | null;
  amountCents: number;
  currency: string;
  message: string;
};

export type SquareRefundSyncResult = {
  ok: boolean;
  synced: number;
  failed: number;
  message: string;
  errors?: string[];
};
