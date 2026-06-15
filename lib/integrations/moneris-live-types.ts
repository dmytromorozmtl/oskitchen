export type MonerisLiveConnectionSettings = {
  storeId?: string | null;
  lastPaymentAt?: string | null;
  lastTransactionId?: string | null;
  lastGatewayStatus?: string | null;
};

export type MonerisLiveDashboard = {
  mode: "placeholder" | "live";
  oauthAuthorizeUrl: string | null;
  connected: boolean;
  storeId: string | null;
  lastPaymentAt: string | null;
  lastTransactionId: string | null;
  lastGatewayStatus: string | null;
  message: string;
};

export type MonerisPaymentGatewayResult = {
  ok: boolean;
  transactionId: string | null;
  status: string | null;
  amountCents: number;
  currency: string;
  message: string;
};
