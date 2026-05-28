import {
  enrichBriefingTilesLinks,
  type BriefingTileLinkState,
} from "@/lib/briefing/owner-daily-briefing-tile-links-era19";
import type {
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
  OwnerDailyBriefingTileDraft,
} from "@/lib/briefing/owner-daily-briefing-era19";
import {
  POS_CASHIER_SPEED_MODE_QUERY_PARAM,
  POS_CASHIER_SPEED_MODE_ROUTE,
} from "@/lib/pos/pos-cashier-speed-mode-era19-policy";

export const OWNER_DAILY_BRIEFING_CASHIER_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-cashier-v1" as const;

export const BRIEFING_CASHIER_POS_TERMINAL_TILE_ID = "pos-terminal-register" as const;

export const BRIEFING_CASHIER_POS_SPEED_TERMINAL_HREF =
  `${POS_CASHIER_SPEED_MODE_ROUTE}?${POS_CASHIER_SPEED_MODE_QUERY_PARAM}=1` as const;

export const BRIEFING_CASHIER_POS_SHIFTS_HREF = "/dashboard/pos/shifts" as const;

export const BRIEFING_CASHIER_POS_SHIFT_CLOSE_HREF =
  `${BRIEFING_CASHIER_POS_SHIFTS_HREF}#pos-shift-close` as const;

export type OwnerDailyBriefingCashierInput = {
  openShiftCount: number;
  posTransactionsToday: number;
  blockedOrdersApprox: number;
  canApplyPosDiscount?: boolean;
};

function draftTile(tile: OwnerDailyBriefingTileDraft): OwnerDailyBriefingTile {
  return enrichBriefingTilesLinks([tile])[0]!;
}

export function resolveBriefingCashierPosTerminalHref(openShiftCount: number): string {
  return openShiftCount > 0
    ? BRIEFING_CASHIER_POS_SPEED_TERMINAL_HREF
    : BRIEFING_CASHIER_POS_SHIFTS_HREF;
}

export function resolveBriefingCashierPosTerminalLinkState(input: {
  openShiftCount: number;
}): BriefingTileLinkState {
  return input.openShiftCount > 0 ? "operational" : "blocked";
}

export function buildBriefingCashierPosTerminalTile(
  input: OwnerDailyBriefingCashierInput,
): OwnerDailyBriefingTile {
  const shiftOpen = input.openShiftCount > 0;
  const href = resolveBriefingCashierPosTerminalHref(input.openShiftCount);

  return draftTile({
    id: BRIEFING_CASHIER_POS_TERMINAL_TILE_ID,
    category: "pos",
    label: "POS register",
    value: shiftOpen ? "Speed mode" : "Shift required",
    detail: shiftOpen
      ? `${input.openShiftCount} shift(s) open — launch rush-hour speed layout at the register.`
      : "Open a register shift before ringing sales in speed mode.",
    href,
    availability: "available",
    tone: shiftOpen ? "success" : "attention",
    priority: shiftOpen ? 1 : 2,
  });
}

export function enrichBriefingCashierPackTiles(
  tiles: readonly OwnerDailyBriefingTile[],
  input: OwnerDailyBriefingCashierInput,
): OwnerDailyBriefingTile[] {
  const withoutDuplicate = tiles.filter((tile) => tile.id !== BRIEFING_CASHIER_POS_TERMINAL_TILE_ID);
  const terminalTile = buildBriefingCashierPosTerminalTile(input);

  const posOpenShiftIndex = withoutDuplicate.findIndex((tile) => tile.id === "pos-open-shifts");
  if (posOpenShiftIndex >= 0) {
    const next = [...withoutDuplicate];
    next.splice(posOpenShiftIndex, 0, terminalTile);
    return next;
  }

  return [terminalTile, ...withoutDuplicate];
}

export function buildOwnerDailyBriefingCashierActions(
  input: OwnerDailyBriefingCashierInput,
): OwnerDailyBriefingRankedAction[] {
  const actions: OwnerDailyBriefingRankedAction[] = [];
  const shiftOpen = input.openShiftCount > 0;

  if (!shiftOpen) {
    actions.push({
      id: "cashier-open-shift",
      title: "Open register shift",
      reason: "No open POS shift — cashiers cannot ring sales until a drawer is opened.",
      severity: "critical",
      ownerRole: "cashier",
      href: BRIEFING_CASHIER_POS_SHIFTS_HREF,
      status: "open",
      unblockCondition: "Open a shift on the POS shifts page, then return to Today.",
      priority: 1,
      ctaLabel: "Open shift",
      tone: "urgent",
    });
  } else {
    actions.push({
      id: "cashier-open-register",
      title: "Open register in speed mode",
      reason: `${input.openShiftCount} shift(s) open — use rush-hour layout for faster checkout.`,
      severity: "high",
      ownerRole: "cashier",
      href: BRIEFING_CASHIER_POS_SPEED_TERMINAL_HREF,
      status: "ready",
      unblockCondition: "First sale of the shift lands in POS transactions.",
      priority: 2,
      ctaLabel: "Open register",
      tone: "success",
    });

    actions.push({
      id: "cashier-close-shift",
      title: "Plan shift closeout",
      reason: "End-of-shift drawer count and variance notes live on the shifts page.",
      severity: "normal",
      ownerRole: "cashier",
      href: BRIEFING_CASHIER_POS_SHIFT_CLOSE_HREF,
      status: "monitor",
      unblockCondition: "Close the register shift when the drawer is done for the day.",
      priority: 14,
      ctaLabel: "Shift closeout",
      tone: "normal",
    });
  }

  if (input.blockedOrdersApprox > 0) {
    actions.push({
      id: "cashier-stuck-orders",
      title: "Check stuck orders",
      reason: `${input.blockedOrdersApprox} order(s) may be blocked — verify pickup or channel status.`,
      severity: "high",
      ownerRole: "cashier",
      href: "/dashboard/order-hub",
      status: "open",
      unblockCondition: "Unblock or hand off affected orders to a manager.",
      priority: 5,
      ctaLabel: "Open Order Hub",
      tone: "urgent",
    });
  }

  if (shiftOpen && input.posTransactionsToday === 0) {
    actions.push({
      id: "cashier-first-sale",
      title: "Ring first sale",
      reason: "Shift is open but no POS transactions yet today — confirm terminal and catalog.",
      severity: "normal",
      ownerRole: "cashier",
      href: BRIEFING_CASHIER_POS_SPEED_TERMINAL_HREF,
      status: "ready",
      unblockCondition: "First POS transaction appears on Today and transactions list.",
      priority: 8,
      ctaLabel: "Open register",
      tone: "normal",
    });
  }

  return actions.sort((a, b) => a.priority - b.priority);
}

export function mergeBriefingCashierTopActions(
  cashierActions: readonly OwnerDailyBriefingRankedAction[],
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [...cashierActions, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
