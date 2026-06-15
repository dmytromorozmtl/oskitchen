import type { DRIVER_ROLE_UI_POLICY_ID } from "@/lib/roles/driver-ui-policy";
import type {
  OwnerDailyBriefingNextAction,
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
} from "@/lib/briefing/owner-daily-briefing-era19";

export type DriverRoleShortcut = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type DriverRoleKpi = {
  id: string;
  label: string;
  value: string;
  hint: string | null;
  href: string | null;
};

export type DriverRoleUiSnapshot = {
  policyId: typeof DRIVER_ROLE_UI_POLICY_ID;
  generatedAtIso: string;
  workspaceLabel: string;
  rolePackLabel: string;
  rolePackHeadline: string;
  kpis: DriverRoleKpi[];
  shortcuts: DriverRoleShortcut[];
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
