import type {
  OwnerDailyBriefingNextAction,
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
} from "@/lib/briefing/owner-daily-briefing-era19";
import { BRIEFING_ROLE_PACK_HEADLINE, BRIEFING_ROLE_PACK_LABEL } from "@/lib/briefing/owner-daily-briefing-role-packs-era19";
import { ratePercentLabel } from "@/lib/analytics/operational-metrics";
import {
  OWNER_ROLE_UI_PACK,
  OWNER_ROLE_UI_PATH,
  OWNER_ROLE_UI_POLICY_ID,
} from "@/lib/roles/owner-ui-policy";
import type {
  OwnerRoleKpi,
  OwnerRoleShortcut,
  OwnerRoleUiSnapshot,
} from "@/lib/roles/owner-ui-types";
import { formatCurrency } from "@/lib/utils";

export const OWNER_ROLE_SHORTCUTS: OwnerRoleShortcut[] = [
  {
    id: "executive",
    label: "Executive dashboard",
    description: "P&L, health scores, and strategic insights.",
    href: "/dashboard/executive",
  },
  {
    id: "analytics-suite",
    label: "Analytics Suite",
    description: "All metrics on one screen.",
    href: "/dashboard/analytics/suite",
  },
  {
    id: "multi-brand",
    label: "Multi-Brand Command Center",
    description: "Revenue per brand across the portfolio.",
    href: "/dashboard/enterprise/multi-brand",
  },
  {
    id: "franchise",
    label: "Franchise suite",
    description: "Royalty, compliance, and rollout.",
    href: "/dashboard/enterprise/franchise",
  },
  {
    id: "commissary",
    label: "Commissary OS",
    description: "Production, purchasing, and distribution.",
    href: "/dashboard/enterprise/commissary",
  },
  {
    id: "today",
    label: "Today command center",
    description: "Operational priorities and blockers.",
    href: "/dashboard/today",
  },
  {
    id: "go-live",
    label: "Go-live checklist",
    description: "Launch readiness and validation.",
    href: "/dashboard/go-live",
  },
  {
    id: "data-export",
    label: "Data portability",
    description: "Full workspace CSV + JSON manifest.",
    href: "/dashboard/data/export",
  },
];

export function buildOwnerRoleKpi(input: {
  id: string;
  label: string;
  value: string;
  hint?: string | null;
  href?: string | null;
}): OwnerRoleKpi {
  return {
    id: input.id,
    label: input.label,
    value: input.value,
    hint: input.hint ?? null,
    href: input.href ?? null,
  };
}

export function buildOwnerRoleKpisFromExecutive(input: {
  grossRevenue: number;
  orderCount: number;
  activeCustomerCount: number;
  productionCompletionRate: number | null;
}): OwnerRoleKpi[] {
  return [
    buildOwnerRoleKpi({
      id: "gross-revenue",
      label: "Gross revenue (30d)",
      value: formatCurrency(input.grossRevenue),
      href: "/dashboard/analytics/revenue",
    }),
    buildOwnerRoleKpi({
      id: "orders",
      label: "Orders (30d)",
      value: String(input.orderCount),
      href: "/dashboard/analytics/orders",
    }),
    buildOwnerRoleKpi({
      id: "active-customers",
      label: "Active customers",
      value: String(input.activeCustomerCount),
      href: "/dashboard/analytics/customers",
    }),
    buildOwnerRoleKpi({
      id: "production-completion",
      label: "Production completion",
      value: ratePercentLabel(input.productionCompletionRate),
      href: "/dashboard/analytics/production",
    }),
  ];
}

export function buildOwnerRoleUiSnapshot(input: {
  workspaceLabel: string;
  kpis: OwnerRoleKpi[];
  heroTiles: OwnerDailyBriefingTile[];
  topActions: OwnerDailyBriefingRankedAction[];
  nextAction: OwnerDailyBriefingNextAction;
  summary: {
    attentionTileCount: number;
    alertCount: number;
    readinessOverall: number;
  };
  analyzedAt?: Date;
}): OwnerRoleUiSnapshot {
  return {
    policyId: OWNER_ROLE_UI_POLICY_ID,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    workspaceLabel: input.workspaceLabel,
    rolePackLabel: BRIEFING_ROLE_PACK_LABEL[OWNER_ROLE_UI_PACK],
    rolePackHeadline: BRIEFING_ROLE_PACK_HEADLINE[OWNER_ROLE_UI_PACK],
    kpis: input.kpis,
    shortcuts: OWNER_ROLE_SHORTCUTS,
    heroTiles: input.heroTiles,
    topActions: input.topActions.slice(0, 5),
    nextAction: input.nextAction,
    summary: {
      ...input.summary,
      shortcutCount: OWNER_ROLE_SHORTCUTS.length,
    },
    basePath: OWNER_ROLE_UI_PATH,
  };
}
