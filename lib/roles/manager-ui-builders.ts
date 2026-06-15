import type {
  OwnerDailyBriefingNextAction,
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
} from "@/lib/briefing/owner-daily-briefing-era19";
import { BRIEFING_ROLE_PACK_HEADLINE, BRIEFING_ROLE_PACK_LABEL } from "@/lib/briefing/owner-daily-briefing-role-packs-era19";
import { ratePercentLabel } from "@/lib/analytics/operational-metrics";
import {
  MANAGER_ROLE_UI_PACK,
  MANAGER_ROLE_UI_PATH,
  MANAGER_ROLE_UI_POLICY_ID,
} from "@/lib/roles/manager-ui-policy";
import type {
  ManagerRoleKpi,
  ManagerRoleShortcut,
  ManagerRoleUiSnapshot,
} from "@/lib/roles/manager-ui-types";

export const MANAGER_ROLE_SHORTCUTS: ManagerRoleShortcut[] = [
  {
    id: "today",
    label: "Today command center",
    description: "Shift priorities, blockers, and live ops.",
    href: "/dashboard/today",
  },
  {
    id: "kds-manager",
    label: "KDS Manager View",
    description: "Performance, delays, and station efficiency.",
    href: "/dashboard/kitchen/manager",
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
    id: "orders",
    label: "Orders",
    description: "Lifecycle, exceptions, and manual orders.",
    href: "/dashboard/orders",
  },
  {
    id: "pos",
    label: "POS hub",
    description: "Terminal, shifts, discounts, and receipts.",
    href: "/dashboard/pos",
  },
  {
    id: "staff",
    label: "Staff & labor",
    description: "Schedules, time clock, and coverage.",
    href: "/dashboard/staff",
  },
  {
    id: "packing-delivery",
    label: "Packing & delivery",
    description: "Fulfillment completion and route status.",
    href: "/dashboard/analytics/delivery",
  },
];

export function buildManagerRoleKpi(input: {
  id: string;
  label: string;
  value: string;
  hint?: string | null;
  href?: string | null;
}): ManagerRoleKpi {
  return {
    id: input.id,
    label: input.label,
    value: input.value,
    hint: input.hint ?? null,
    href: input.href ?? null,
  };
}

export function buildManagerRoleKpisFromExecutive(input: {
  orderCount: number;
  lateOrderCount: number;
  productionCompletionRate: number | null;
  packingCompletionRate: number | null;
  deliveryCompletionRate: number | null;
}): ManagerRoleKpi[] {
  return [
    buildManagerRoleKpi({
      id: "orders",
      label: "Orders (30d)",
      value: String(input.orderCount),
      href: "/dashboard/analytics/orders",
    }),
    buildManagerRoleKpi({
      id: "late-orders",
      label: "Late orders",
      value: String(input.lateOrderCount),
      hint: "Needs manager follow-up",
      href: "/dashboard/orders",
    }),
    buildManagerRoleKpi({
      id: "production-completion",
      label: "Production completion",
      value: ratePercentLabel(input.productionCompletionRate),
      href: "/dashboard/kitchen/production",
    }),
    buildManagerRoleKpi({
      id: "fulfillment-completion",
      label: "Packing / delivery",
      value: `${ratePercentLabel(input.packingCompletionRate)} / ${ratePercentLabel(input.deliveryCompletionRate)}`,
      href: "/dashboard/analytics/delivery",
    }),
  ];
}

export function buildManagerRoleUiSnapshot(input: {
  workspaceLabel: string;
  kpis: ManagerRoleKpi[];
  heroTiles: OwnerDailyBriefingTile[];
  topActions: OwnerDailyBriefingRankedAction[];
  nextAction: OwnerDailyBriefingNextAction;
  summary: {
    attentionTileCount: number;
    alertCount: number;
    readinessOverall: number;
  };
  analyzedAt?: Date;
}): ManagerRoleUiSnapshot {
  return {
    policyId: MANAGER_ROLE_UI_POLICY_ID,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    workspaceLabel: input.workspaceLabel,
    rolePackLabel: BRIEFING_ROLE_PACK_LABEL[MANAGER_ROLE_UI_PACK],
    rolePackHeadline: BRIEFING_ROLE_PACK_HEADLINE[MANAGER_ROLE_UI_PACK],
    kpis: input.kpis,
    shortcuts: MANAGER_ROLE_SHORTCUTS,
    heroTiles: input.heroTiles,
    topActions: input.topActions.slice(0, 5),
    nextAction: input.nextAction,
    summary: {
      ...input.summary,
      shortcutCount: MANAGER_ROLE_SHORTCUTS.length,
    },
    basePath: MANAGER_ROLE_UI_PATH,
  };
}
