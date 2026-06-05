import type { MANAGER_ROLE_UI_POLICY_ID } from "@/lib/roles/manager-ui-policy";
import type {
  OwnerDailyBriefingNextAction,
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
} from "@/lib/briefing/owner-daily-briefing-era19";

export type ManagerRoleShortcut = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type ManagerRoleKpi = {
  id: string;
  label: string;
  value: string;
  hint: string | null;
  href: string | null;
};

export type ManagerRoleUiSnapshot = {
  policyId: typeof MANAGER_ROLE_UI_POLICY_ID;
  generatedAtIso: string;
  workspaceLabel: string;
  rolePackLabel: string;
  rolePackHeadline: string;
  kpis: ManagerRoleKpi[];
  shortcuts: ManagerRoleShortcut[];
  heroTiles: OwnerDailyBriefingTile[];
  topActions: OwnerDailyBriefingRankedAction[];
  nextAction: OwnerDailyBriefingNextAction;
  summary: {
    attentionTileCount: number;
    alertCount: number;
    readinessOverall: number;
    shortcutCount: number;
  };
  basePath: string;
};
