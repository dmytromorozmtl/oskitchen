export type CohortKitchenStatus = "pending" | "preflight_ok" | "live" | "paused" | "churned";

export type CohortKitchen = {
  email: string;
  businessName?: string;
  status: CohortKitchenStatus;
  goLiveAt?: string;
  lastPreflightAt?: string;
  lastPreflightOk?: boolean;
  notes?: string;
};

export type CohortRegistry = {
  version: 1;
  cohortName: string;
  createdAt: string;
  updatedAt: string;
  kitchens: CohortKitchen[];
};

export type KitchenPreflightGate = {
  ok: boolean;
  label: string;
  detail?: string;
  blocking: boolean;
};

export type KitchenPreflightResult = {
  email: string;
  ownerUserId: string;
  businessName: string | null;
  workspaceName: string | null;
  ready: boolean;
  gates: KitchenPreflightGate[];
  metrics: {
    orderCount: number;
    ordersLast7d: number;
    staffMembers: number;
    integrations: number;
  };
};

export type DailyOpsReport = {
  generatedAt: string;
  day: string;
  cohortName: string;
  kitchens: Array<{
    email: string;
    status: CohortKitchenStatus;
    preflightOk: boolean;
    metrics: KitchenPreflightResult["metrics"];
    alerts: string[];
  }>;
  support: {
    emailConfigured: boolean;
    slackWebhookConfigured: boolean;
  };
  summary: {
    live: number;
    unhealthy: number;
    readyForCheckIn: boolean;
  };
};
