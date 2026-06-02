export type DoorDashLiveOAuthSettings = {
  accessTokenEnc: string;
  refreshTokenEnc?: string | null;
  expiresAt: number | null;
  scope?: string | null;
  connectedAt: string;
};

export type DoorDashLiveConnectionSettings = {
  menuSyncEnabled?: boolean;
  orderIngestionEnabled?: boolean;
  liveOAuth?: DoorDashLiveOAuthSettings | null;
  lastMenuSyncAt?: string | null;
  lastOrderImportAt?: string | null;
};

export type DoorDashLiveOrderRow = {
  externalOrderId: string;
  displayId: string | null;
  status: string;
  total: number | null;
  imported: boolean;
  createdAt: string;
};

export type DoorDashLiveDashboard = {
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
  recentOrders: DoorDashLiveOrderRow[];
  checklist: Array<{ label: string; done: boolean }>;
};
