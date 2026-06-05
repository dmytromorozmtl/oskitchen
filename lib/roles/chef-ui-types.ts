import type { CHEF_ROLE_UI_POLICY_ID } from "@/lib/roles/chef-ui-policy";
import type {
  OwnerDailyBriefingNextAction,
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
} from "@/lib/briefing/owner-daily-briefing-era19";

export type ChefRoleShortcut = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type ChefRoleKpi = {
  id: string;
  label: string;
  value: string;
  hint: string | null;
  href: string | null;
};

export type ChefRoleUiSnapshot = {
  policyId: typeof CHEF_ROLE_UI_POLICY_ID;
  generatedAtIso: string;
  workspaceLabel: string;
  rolePackLabel: string;
  rolePackHeadline: string;
  kpis: ChefRoleKpi[];
  shortcuts: ChefRoleShortcut[];
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
