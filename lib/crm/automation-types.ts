import type { CRM_AUTOMATION_POLICY_ID } from "@/lib/crm/automation-policy";

export type CrmAutomationKind = "win_back" | "birthday" | "favorites";

export type CrmAutomationConfig = {
  winBackEnabled: boolean;
  winBackInactiveDays: number;
  birthdayEnabled: boolean;
  favoritesEnabled: boolean;
  favoritesInactiveDays: number;
  requireMarketingConsent: boolean;
};

export type CrmAutomationQueueItem = {
  id: string;
  kind: CrmAutomationKind;
  customerId: string;
  customerName: string;
  message: string;
  requiresConsent: boolean;
  hasConsent: boolean;
  href: string;
};

export type CrmAutomationLane = {
  kind: CrmAutomationKind;
  label: string;
  enabled: boolean;
  pendingCount: number;
  items: CrmAutomationQueueItem[];
};

export type CrmAutomationSnapshot = {
  policyId: typeof CRM_AUTOMATION_POLICY_ID;
  generatedAtIso: string;
  config: CrmAutomationConfig;
  lanes: CrmAutomationLane[];
  summary: {
    totalPending: number;
    winBackCount: number;
    birthdayCount: number;
    favoritesCount: number;
    followUpsCreatedToday: number;
  };
  basePath: string;
};
