import type {
  OwnerDailyBriefingNextAction,
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
} from "@/lib/briefing/owner-daily-briefing-era19";
import { BRIEFING_ROLE_PACK_HEADLINE } from "@/lib/briefing/owner-daily-briefing-role-packs-era19";
import { ratePercentLabel } from "@/lib/analytics/operational-metrics";
import {
  CHEF_ROLE_UI_LABEL,
  CHEF_ROLE_UI_PACK,
  CHEF_ROLE_UI_PATH,
  CHEF_ROLE_UI_POLICY_ID,
} from "@/lib/roles/chef-ui-policy";
import type {
  ChefRoleKpi,
  ChefRoleShortcut,
  ChefRoleUiSnapshot,
} from "@/lib/roles/chef-ui-types";

export const CHEF_ROLE_SHORTCUTS: ChefRoleShortcut[] = [
  {
    id: "kds",
    label: "Kitchen display",
    description: "Bump, recall, and station filters.",
    href: "/dashboard/kitchen",
  },
  {
    id: "kds-tablet",
    label: "KDS tablet",
    description: "Fullscreen line-friendly ticket view.",
    href: "/dashboard/kitchen/tablet",
  },
  {
    id: "production",
    label: "Production View",
    description: "Station load, bottlenecks, and ETA.",
    href: "/dashboard/kitchen/production",
  },
  {
    id: "expo",
    label: "Expo View",
    description: "Ready, waiting, and delayed handoffs.",
    href: "/dashboard/kitchen/expo",
  },
  {
    id: "packing",
    label: "Packing",
    description: "Fulfillment checklist and waves.",
    href: "/dashboard/packing",
  },
  {
    id: "order-hub",
    label: "Order hub",
    description: "Cross-channel queue and stuck orders.",
    href: "/dashboard/order-hub",
  },
  {
    id: "production-board",
    label: "Production board",
    description: "Prep board and production runs.",
    href: "/dashboard/production",
  },
  {
    id: "analytics-production",
    label: "Production analytics",
    description: "Completion rates and batch history.",
    href: "/dashboard/analytics/production",
  },
];

export function buildChefRoleKpi(input: {
  id: string;
  label: string;
  value: string;
  hint?: string | null;
  href?: string | null;
}): ChefRoleKpi {
  return {
    id: input.id,
    label: input.label,
    value: input.value,
    hint: input.hint ?? null,
    href: input.href ?? null,
  };
}

export function buildChefRoleKpisFromProduction(input: {
  completionRate: number | null;
  delayedBatches: number;
  completedItems: number;
  totalItems: number;
  packingCompletionRate: number | null;
}): ChefRoleKpi[] {
  return [
    buildChefRoleKpi({
      id: "production-completion",
      label: "Production completion",
      value: ratePercentLabel(input.completionRate),
      href: "/dashboard/kitchen/production",
    }),
    buildChefRoleKpi({
      id: "delayed-batches",
      label: "Delayed batches",
      value: String(input.delayedBatches),
      hint: "Behind schedule",
      href: "/dashboard/kitchen/production",
    }),
    buildChefRoleKpi({
      id: "items-progress",
      label: "Items completed",
      value: `${input.completedItems} / ${input.totalItems}`,
      href: "/dashboard/analytics/production",
    }),
    buildChefRoleKpi({
      id: "packing-handoff",
      label: "Packing handoff",
      value: ratePercentLabel(input.packingCompletionRate),
      href: "/dashboard/kitchen/expo",
    }),
  ];
}

export function buildChefRoleUiSnapshot(input: {
  workspaceLabel: string;
  kpis: ChefRoleKpi[];
  heroTiles: OwnerDailyBriefingTile[];
  topActions: OwnerDailyBriefingRankedAction[];
  nextAction: OwnerDailyBriefingNextAction;
  summary: {
    attentionTileCount: number;
    alertCount: number;
    readinessOverall: number;
  };
  analyzedAt?: Date;
}): ChefRoleUiSnapshot {
  return {
    policyId: CHEF_ROLE_UI_POLICY_ID,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    workspaceLabel: input.workspaceLabel,
    rolePackLabel: CHEF_ROLE_UI_LABEL,
    rolePackHeadline: BRIEFING_ROLE_PACK_HEADLINE[CHEF_ROLE_UI_PACK],
    kpis: input.kpis,
    shortcuts: CHEF_ROLE_SHORTCUTS,
    heroTiles: input.heroTiles,
    topActions: input.topActions.slice(0, 5),
    nextAction: input.nextAction,
    summary: {
      ...input.summary,
      shortcutCount: CHEF_ROLE_SHORTCUTS.length,
    },
    basePath: CHEF_ROLE_UI_PATH,
  };
}
