export type OpenTableLiveConnectionSettings = {
  storefrontId?: string | null;
  lastWebhookAt?: string | null;
  lastWebhookEvent?: string | null;
  lastAvailabilitySyncAt?: string | null;
  availableSlots?: number | null;
};

export type OpenTableAvailabilitySlot = {
  date: string;
  time: string;
  partySize: number;
  tablesAvailable: number;
  open: boolean;
};

export type OpenTableLiveDashboard = {
  mode: "placeholder" | "live";
  oauthAuthorizeUrl: string | null;
  webhookUrl: string | null;
  connected: boolean;
  restaurantId: string | null;
  storefrontId: string | null;
  lastWebhookAt: string | null;
  lastAvailabilitySyncAt: string | null;
  availableSlots: number | null;
  message: string;
};
