export type QuickBooksLiveConnectionSettings = {
  realmId?: string | null;
  salesAccountId?: string | null;
  salesAccountName?: string | null;
  depositAccountId?: string | null;
  depositAccountName?: string | null;
  lastJournalPostedAt?: string | null;
  lastJournalAmount?: number | null;
};

export type QuickBooksAccountRow = {
  id: string;
  name: string;
  accountType: string;
  accountSubType?: string | null;
  active: boolean;
};

export type QuickBooksLiveDashboard = {
  mode: "placeholder" | "live";
  oauthAuthorizeUrl: string | null;
  connected: boolean;
  realmId: string | null;
  salesAccountName: string | null;
  depositAccountName: string | null;
  lastJournalPostedAt: string | null;
  lastJournalAmount: number | null;
  message: string;
};
