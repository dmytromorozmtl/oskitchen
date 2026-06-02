export type UberEatsLiveOAuthSettings = {
  accessTokenEnc: string;
  refreshTokenEnc?: string | null;
  expiresAt: number | null;
  scope?: string | null;
  connectedAt: string;
};

export type UberEatsLiveConnectionSettings = {
  menuSyncEnabled?: boolean;
  orderIngestionEnabled?: boolean;
  liveOAuth?: UberEatsLiveOAuthSettings | null;
  lastMenuSyncAt?: string | null;
  lastOrderImportAt?: string | null;
};

export type UberEatsLiveOrderRow = {
  externalOrderId: string;
  displayId: string | null;
  status: string;
  total: number | null;
  imported: boolean;
  createdAt: string;
};

export type UberEatsLiveDashboard = {
  connectionId: string | null;
  connectionStatus: string | null;
  storeId: string | null;
  mode: "live" | "placeholder";
  oauthConnected: boolean;
  webhookUrl: string | null;
  authorizeUrl: string | null;
  menuSyncEnabled: boolean;
  orderIngestionEnabled: boolean;
  lastMenuSyncAt: string | null;
  lastOrderImportAt: string | null;
  recentOrders: UberEatsLiveOrderRow[];
  checklist: Array<{ label: string; done: boolean }>;
};
