import type { OWNER_ROLE_UI_POLICY_ID } from "@/lib/roles/owner-ui-policy";
import type {
  OwnerDailyBriefingNextAction,
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
} from "@/lib/briefing/owner-daily-briefing-era19";

export type OwnerRoleShortcut = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type OwnerRoleKpi = {
  id: string;
  label: string;
  value: string;
  hint: string | null;
  href: string | null;
};

export type OwnerRoleUiSnapshot = {
  policyId: typeof OWNER_ROLE_UI_POLICY_ID;
  generatedAtIso: string;
  workspaceLabel: string;
  rolePackLabel: string;
  rolePackHeadline: string;
  kpis: OwnerRoleKpi[];
  shortcuts: OwnerRoleShortcut[];
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
