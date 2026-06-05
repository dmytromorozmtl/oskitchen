import { CRM_AUTOMATION_PATH, CRM_AUTOMATION_POLICY_ID } from "@/lib/crm/automation-policy";
import type {
  CrmAutomationConfig,
  CrmAutomationKind,
  CrmAutomationLane,
  CrmAutomationQueueItem,
  CrmAutomationSnapshot,
} from "@/lib/crm/automation-types";

const LANE_LABELS: Record<CrmAutomationKind, string> = {
  win_back: "Win-back",
  birthday: "Birthday",
  favorites: "Favorites",
};

export function buildCrmAutomationQueueItem(input: {
  kind: CrmAutomationKind;
  customerId: string;
  customerName: string;
  message: string;
  requiresConsent: boolean;
  hasConsent: boolean;
}): CrmAutomationQueueItem {
  return {
    id: `${input.kind}-${input.customerId}`,
    kind: input.kind,
    customerId: input.customerId,
    customerName: input.customerName,
    message: input.message,
    requiresConsent: input.requiresConsent,
    hasConsent: input.hasConsent,
    href: `/dashboard/customers/${input.customerId}`,
  };
}

export function buildCrmAutomationLane(input: {
  kind: CrmAutomationKind;
  enabled: boolean;
  items: CrmAutomationQueueItem[];
}): CrmAutomationLane {
  return {
    kind: input.kind,
    label: LANE_LABELS[input.kind],
    enabled: input.enabled,
    pendingCount: input.items.length,
    items: input.items,
  };
}

export function buildCrmAutomationSnapshot(input: {
  config: CrmAutomationConfig;
  lanes: CrmAutomationLane[];
  followUpsCreatedToday: number;
  analyzedAt?: Date;
}): CrmAutomationSnapshot {
  const winBackCount = input.lanes.find((lane) => lane.kind === "win_back")?.pendingCount ?? 0;
  const birthdayCount = input.lanes.find((lane) => lane.kind === "birthday")?.pendingCount ?? 0;
  const favoritesCount = input.lanes.find((lane) => lane.kind === "favorites")?.pendingCount ?? 0;

  return {
    policyId: CRM_AUTOMATION_POLICY_ID,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    config: input.config,
    lanes: input.lanes,
    summary: {
      totalPending: winBackCount + birthdayCount + favoritesCount,
      winBackCount,
      birthdayCount,
      favoritesCount,
      followUpsCreatedToday: input.followUpsCreatedToday,
    },
    basePath: CRM_AUTOMATION_PATH,
  };
}
