export type KlaviyoProfileRow = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  externalId: string;
  properties: Record<string, string | number | boolean>;
};

export type KlaviyoSyncResult = {
  ok: boolean;
  synced: number;
  skipped: number;
  failed: number;
  message: string;
  errors?: string[];
};

export type KlaviyoCustomerInput = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  phone?: string | null;
  consentEvents: { consentType: string; value: boolean; createdAt: Date }[];
  orderCount?: number;
  lifetimeSpend?: number;
};
