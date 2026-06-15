import type {
  OwnerDailyBriefingNextAction,
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
} from "@/lib/briefing/owner-daily-briefing-era19";
import {
  BRIEFING_ROLE_PACK_HEADLINE,
  BRIEFING_ROLE_PACK_LABEL,
} from "@/lib/briefing/owner-daily-briefing-role-packs-era19";
import { formatCurrency } from "@/lib/utils";
import {
  CASHIER_ROLE_UI_PACK,
  CASHIER_ROLE_UI_PATH,
  CASHIER_ROLE_UI_POLICY_ID,
} from "@/lib/roles/cashier-ui-policy";
import type {
  CashierRoleKpi,
  CashierRoleShortcut,
  CashierRoleUiSnapshot,
} from "@/lib/roles/cashier-ui-types";

export const CASHIER_ROLE_SHORTCUTS: CashierRoleShortcut[] = [
  {
    id: "pos-terminal",
    label: "POS Terminal",
    description: "Ring counter sales with large tap targets.",
    href: "/dashboard/pos/terminal",
  },
  {
    id: "pos-tablet",
    label: "POS Tablet",
    description: "iPad/Android optimized checkout.",
    href: "/dashboard/pos/tablet",
  },
  {
    id: "pos-mobile",
    label: "POS Mobile",
    description: "Phone-as-terminal with swipe checkout.",
    href: "/dashboard/pos/mobile",
  },
  {
    id: "pos-cash",
    label: "Cash management",
    description: "Open, count, close, and report drawers.",
    href: "/dashboard/pos/cash",
  },
  {
    id: "pos-hub",
    label: "POS hub",
    description: "Transactions, receipts, and registers.",
    href: "/dashboard/pos",
  },
  {
    id: "orders",
    label: "Orders",
    description: "Look up and update open orders.",
    href: "/dashboard/orders",
  },
  {
    id: "transactions",
    label: "POS transactions",
    description: "Today's sales and payment history.",
    href: "/dashboard/pos/transactions",
  },
  {
    id: "today",
    label: "Today",
    description: "See what needs attention right now.",
    href: "/dashboard/today",
  },
];

export function buildCashierRoleKpi(input: {
  id: string;
  label: string;
  value: string;
  hint?: string | null;
  href?: string | null;
}): CashierRoleKpi {
  return {
    id: input.id,
    label: input.label,
    value: input.value,
    hint: input.hint ?? null,
    href: input.href ?? null,
  };
}

export function buildCashierRoleKpisFromToday(input: {
  posTransactionsToday: number;
  ordersToday: number;
  openPosShifts: number;
  revenueToday: number;
}): CashierRoleKpi[] {
  return [
    buildCashierRoleKpi({
      id: "pos-transactions",
      label: "POS transactions today",
      value: String(input.posTransactionsToday),
      href: "/dashboard/pos/transactions",
    }),
    buildCashierRoleKpi({
      id: "orders-today",
      label: "Orders today",
      value: String(input.ordersToday),
      href: "/dashboard/orders",
    }),
    buildCashierRoleKpi({
      id: "open-shifts",
      label: "Open POS shifts",
      value: String(input.openPosShifts),
      hint: "Active registers",
      href: "/dashboard/pos",
    }),
    buildCashierRoleKpi({
      id: "revenue-today",
      label: "Revenue today",
      value: formatCurrency(input.revenueToday),
      href: "/dashboard/pos/transactions",
    }),
  ];
}

export function buildCashierRoleUiSnapshot(input: {
  workspaceLabel: string;
  kpis: CashierRoleKpi[];
  heroTiles: OwnerDailyBriefingTile[];
  topActions: OwnerDailyBriefingRankedAction[];
  nextAction: OwnerDailyBriefingNextAction;
  summary: {
    attentionTileCount: number;
    alertCount: number;
    readinessOverall: number;
  };
  analyzedAt?: Date;
}): CashierRoleUiSnapshot {
  return {
    policyId: CASHIER_ROLE_UI_POLICY_ID,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    workspaceLabel: input.workspaceLabel,
    rolePackLabel: BRIEFING_ROLE_PACK_LABEL[CASHIER_ROLE_UI_PACK],
    rolePackHeadline: BRIEFING_ROLE_PACK_HEADLINE[CASHIER_ROLE_UI_PACK],
    kpis: input.kpis,
    shortcuts: CASHIER_ROLE_SHORTCUTS,
    heroTiles: input.heroTiles,
    topActions: input.topActions.slice(0, 5),
    nextAction: input.nextAction,
    summary: {
      ...input.summary,
      shortcutCount: CASHIER_ROLE_SHORTCUTS.length,
    },
    basePath: CASHIER_ROLE_UI_PATH,
  };
}
