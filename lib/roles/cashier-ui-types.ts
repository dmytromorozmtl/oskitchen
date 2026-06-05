import type { CASHIER_ROLE_UI_POLICY_ID } from "@/lib/roles/cashier-ui-policy";
import type {
  OwnerDailyBriefingNextAction,
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
} from "@/lib/briefing/owner-daily-briefing-era19";

export type CashierRoleShortcut = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type CashierRoleKpi = {
  id: string;
  label: string;
  value: string;
  hint: string | null;
  href: string | null;
};

export type CashierRoleUiSnapshot = {
  policyId: typeof CASHIER_ROLE_UI_POLICY_ID;
  generatedAtIso: string;
  workspaceLabel: string;
  rolePackLabel: string;
  rolePackHeadline: string;
  kpis: CashierRoleKpi[];
  shortcuts: CashierRoleShortcut[];
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
