import {
  BRIEFING_CASHIER_POS_SHIFTS_HREF,
  BRIEFING_CASHIER_POS_SPEED_TERMINAL_HREF,
  type OwnerDailyBriefingCashierInput,
} from "@/lib/briefing/owner-daily-briefing-cashier-era19";
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
  BRIEFING_CASHIER_MANAGER_OVERRIDE_TILE_ID,
  OWNER_DAILY_BRIEFING_CASHIER_MANAGER_OVERRIDE_ERA19_POLICY_ID,
} from "@/lib/briefing/owner-daily-briefing-cashier-manager-override-era19-policy";
import { POS_MANAGER_OVERRIDE_ANCHOR } from "@/lib/pos/pos-manager-override-clarity-era19-policy";

export const OWNER_DAILY_BRIEFING_CASHIER_MANAGER_OVERRIDE_AGGREGATOR_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-cashier-manager-override-aggregator-v1" as const;

export {
  BRIEFING_CASHIER_MANAGER_OVERRIDE_TILE_ID,
  OWNER_DAILY_BRIEFING_CASHIER_MANAGER_OVERRIDE_ERA19_POLICY_ID,
};

export type OwnerDailyBriefingCashierManagerOverrideInput = OwnerDailyBriefingCashierInput & {
  canApplyPosDiscount: boolean;
};

export const BRIEFING_CASHIER_MANAGER_OVERRIDE_HREF =
  `${BRIEFING_CASHIER_POS_SPEED_TERMINAL_HREF}#${POS_MANAGER_OVERRIDE_ANCHOR}` as const;

function draftTile(tile: OwnerDailyBriefingTileDraft): OwnerDailyBriefingTile {
  return enrichBriefingTilesLinks([tile])[0]!;
}

export function resolveBriefingCashierManagerOverrideHref(openShiftCount: number): string {
  return openShiftCount > 0
    ? BRIEFING_CASHIER_MANAGER_OVERRIDE_HREF
    : BRIEFING_CASHIER_POS_SHIFTS_HREF;
}

export function resolveBriefingCashierManagerOverrideLinkState(input: {
  openShiftCount: number;
  canApplyPosDiscount: boolean;
}): BriefingTileLinkState {
  if (input.openShiftCount === 0) return "blocked";
  return input.canApplyPosDiscount ? "operational" : "setup_needed";
}

export function buildBriefingCashierManagerOverrideTile(
  input: OwnerDailyBriefingCashierManagerOverrideInput,
): OwnerDailyBriefingTile {
  const shiftOpen = input.openShiftCount > 0;
  const href = resolveBriefingCashierManagerOverrideHref(input.openShiftCount);

  if (!shiftOpen) {
    return draftTile({
      id: BRIEFING_CASHIER_MANAGER_OVERRIDE_TILE_ID,
      category: "pos",
      label: "Manager override",
      value: "Shift required",
      detail: "Open a register shift before comps or discounts can be reviewed on the terminal.",
      href,
      availability: "available",
      tone: "attention",
      priority: 3,
    });
  }

  if (input.canApplyPosDiscount) {
    return draftTile({
      id: BRIEFING_CASHIER_MANAGER_OVERRIDE_TILE_ID,
      category: "pos",
      label: "Manager override",
      value: "Checklist ready",
      detail:
        "pos.discount.apply granted — use the 4-step override checklist before comping or discounting.",
      href,
      availability: "available",
      tone: "success",
      priority: 3,
    });
  }

  return draftTile({
    id: BRIEFING_CASHIER_MANAGER_OVERRIDE_TILE_ID,
    category: "pos",
    label: "Override handoff",
    value: "Ask manager",
    detail:
      "Comps and discounts require pos.discount.apply — hand the register to a manager at the override checklist.",
    href,
    availability: "available",
    tone: "attention",
    priority: 3,
  });
}

export function enrichBriefingCashierManagerOverridePackTiles(
  tiles: readonly OwnerDailyBriefingTile[],
  input: OwnerDailyBriefingCashierManagerOverrideInput,
): OwnerDailyBriefingTile[] {
  const withoutDuplicate = tiles.filter(
    (tile) => tile.id !== BRIEFING_CASHIER_MANAGER_OVERRIDE_TILE_ID,
  );
  const overrideTile = buildBriefingCashierManagerOverrideTile(input);

  const terminalIndex = withoutDuplicate.findIndex(
    (tile) => tile.id === "pos-terminal-register",
  );
  if (terminalIndex >= 0) {
    const next = [...withoutDuplicate];
    next.splice(terminalIndex + 1, 0, overrideTile);
    return next;
  }

  return [overrideTile, ...withoutDuplicate];
}

export function buildOwnerDailyBriefingCashierManagerOverrideActions(
  input: OwnerDailyBriefingCashierManagerOverrideInput,
): OwnerDailyBriefingRankedAction[] {
  if (input.openShiftCount === 0) return [];

  const href = BRIEFING_CASHIER_MANAGER_OVERRIDE_HREF;

  if (input.canApplyPosDiscount) {
    return [
      {
        id: "cashier-manager-override-review",
        title: "Review manager override checklist",
        reason:
          "Discounts and comps must follow the 4-step override flow before changing ticket totals.",
        severity: "normal",
        ownerRole: "manager",
        href,
        status: "ready",
        unblockCondition: "Override checklist complete and ticket total matches review hero.",
        priority: 7,
        ctaLabel: "Open override",
        tone: "normal",
      },
    ];
  }

  return [
    {
      id: "cashier-manager-override-handoff",
      title: "Hand off for manager override",
      reason:
        "Comps and discounts require pos.discount.apply — escalate to a manager on the register override checklist.",
      severity: "normal",
      ownerRole: "cashier",
      href,
      status: "monitor",
      unblockCondition: "Manager with pos.discount.apply completes override checklist on terminal.",
      priority: 9,
      ctaLabel: "Override handoff",
      tone: "normal",
    },
  ];
}

export function mergeBriefingCashierManagerOverrideActions(
  cashierActions: readonly OwnerDailyBriefingRankedAction[],
  overrideActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [...cashierActions, ...overrideActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
