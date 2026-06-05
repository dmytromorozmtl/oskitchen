export type ResyLiveConnectionSettings = {
  storefrontId?: string | null;
  lastReservationSyncAt?: string | null;
  lastReservationsSynced?: number | null;
  lastWaitlistSyncAt?: string | null;
  lastWaitlistSynced?: number | null;
  syncedWaitlistIds?: string[];
};

export type ResyWaitlistRow = {
  id: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  quotedMinutes: number;
  status: string;
};

export type ResyLiveDashboard = {
  mode: "placeholder" | "live";
  oauthAuthorizeUrl: string | null;
  webhookUrl: string | null;
  connected: boolean;
  venueId: string | null;
  storefrontId: string | null;
  lastReservationSyncAt: string | null;
  lastWaitlistSyncAt: string | null;
  message: string;
};
