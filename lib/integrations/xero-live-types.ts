export type XeroLiveConnectionSettings = {
  tenantId?: string | null;
  tenantName?: string | null;
  expenseAccountCode?: string | null;
  bankAccountCode?: string | null;
  lastInvoiceSyncAt?: string | null;
  lastInvoicesSynced?: number | null;
  lastBankReconcileAt?: string | null;
  lastBankMatched?: number | null;
  lastBankUnmatched?: number | null;
  syncedInvoiceIds?: string[];
};

export type XeroBankTransactionRow = {
  id: string;
  date: string;
  amount: number;
  reference: string;
  status: string;
};

export type XeroLiveDashboard = {
  mode: "placeholder" | "live";
  oauthAuthorizeUrl: string | null;
  connected: boolean;
  tenantId: string | null;
  tenantName: string | null;
  lastInvoiceSyncAt: string | null;
  lastInvoicesSynced: number | null;
  lastBankReconcileAt: string | null;
  lastBankMatched: number | null;
  message: string;
};
