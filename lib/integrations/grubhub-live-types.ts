export type GrubhubLiveOAuthSettings = {
  accessTokenEnc: string;
  refreshTokenEnc?: string | null;
  expiresAt: number | null;
  scope?: string | null;
  connectedAt: string;
};

export type GrubhubLiveConnectionSettings = {
  menuSyncEnabled?: boolean;
  orderIngestionEnabled?: boolean;
  liveOAuth?: GrubhubLiveOAuthSettings | null;
  lastMenuSyncAt?: string | null;
  lastOrderImportAt?: string | null;
};

export type GrubhubLiveOrderRow = {
  externalOrderId: string;
  displayId: string | null;
  status: string;
  total: number | null;
  imported: boolean;
  createdAt: string;
};

export type GrubhubLiveDashboard = {
  connectionId: string | null;
  connectionStatus: string | null;
  merchantId: string | null;
  mode: "live" | "placeholder";
  oauthConnected: boolean;
  webhookUrl: string | null;
  authorizeUrl: string | null;
  menuSyncEnabled: boolean;
  orderIngestionEnabled: boolean;
  lastMenuSyncAt: string | null;
  lastOrderImportAt: string | null;
  recentOrders: GrubhubLiveOrderRow[];
  checklist: Array<{ label: string; done: boolean }>;
};
