export type MailchimpMemberRow = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  externalId: string;
  orderCount: number;
  lifetimeSpend: number;
};

export type MailchimpSyncResult = {
  ok: boolean;
  synced: number;
  skipped: number;
  failed: number;
  message: string;
  errors?: string[];
};

export type MailchimpCustomerInput = {
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
