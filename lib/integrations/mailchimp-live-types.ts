export type MailchimpLiveConnectionSettings = {
  datacenter?: string | null;
  apiEndpoint?: string | null;
  accountName?: string | null;
  lastListSyncAt?: string | null;
  lastListSyncCount?: number | null;
  lastAutomationTriggerAt?: string | null;
  lastAutomationTriggered?: number | null;
  selectedListId?: string | null;
  selectedAutomationId?: string | null;
};

export type MailchimpListRow = {
  id: string;
  name: string;
  memberCount: number;
};

export type MailchimpAutomationRow = {
  id: string;
  listId: string;
  title: string;
  status: string;
  emailId: string | null;
};

export type MailchimpLiveDashboard = {
  mode: "placeholder" | "live";
  oauthAuthorizeUrl: string | null;
  connected: boolean;
  listCount: number;
  automationCount: number;
  listId: string | null;
  lastListSyncAt: string | null;
  lastListSyncCount: number | null;
  lastAutomationTriggerAt: string | null;
  lastAutomationTriggered: number | null;
  message: string;
};

export type MailchimpCampaignAutomationResult = {
  ok: boolean;
  triggered: number;
  failed: number;
  message: string;
  errors?: string[];
};
