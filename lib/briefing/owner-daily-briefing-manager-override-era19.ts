import { BRIEFING_CASHIER_POS_SHIFTS_HREF } from "@/lib/briefing/owner-daily-briefing-cashier-era19";
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
  BRIEFING_MANAGER_MANAGER_OVERRIDE_TILE_ID,
  OWNER_DAILY_BRIEFING_MANAGER_OVERRIDE_ERA19_POLICY_ID,
} from "@/lib/briefing/owner-daily-briefing-manager-override-era19-policy";
import {
  POS_MANAGER_OVERRIDE_ANCHOR,
} from "@/lib/pos/pos-manager-override-clarity-era19-policy";
import { POS_CASHIER_SPEED_MODE_ROUTE } from "@/lib/pos/pos-cashier-speed-mode-era19-policy";

export const OWNER_DAILY_BRIEFING_MANAGER_OVERRIDE_AGGREGATOR_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-manager-override-aggregator-v1" as const;

export {
  BRIEFING_MANAGER_MANAGER_OVERRIDE_TILE_ID,
  OWNER_DAILY_BRIEFING_MANAGER_OVERRIDE_ERA19_POLICY_ID,
};

export type OwnerDailyBriefingManagerOverrideInput = {
  openShiftCount: number;
  canApplyPosDiscount: boolean;
  posTransactionsToday: number;
};

export const BRIEFING_MANAGER_MANAGER_OVERRIDE_HREF =
  `${POS_CASHIER_SPEED_MODE_ROUTE}#${POS_MANAGER_OVERRIDE_ANCHOR}` as const;

function draftTile(tile: OwnerDailyBriefingTileDraft): OwnerDailyBriefingTile {
  return enrichBriefingTilesLinks([tile])[0]!;
}

export function resolveBriefingManagerOverrideHref(openShiftCount: number): string {
  return openShiftCount > 0
    ? BRIEFING_MANAGER_MANAGER_OVERRIDE_HREF
    : BRIEFING_CASHIER_POS_SHIFTS_HREF;
}

export function resolveBriefingManagerOverrideLinkState(input: {
  openShiftCount: number;
  canApplyPosDiscount: boolean;
}): BriefingTileLinkState {
  if (input.openShiftCount === 0) return "blocked";
  return input.canApplyPosDiscount ? "operational" : "setup_needed";
}

export function buildBriefingManagerOverrideTile(
  input: OwnerDailyBriefingManagerOverrideInput,
): OwnerDailyBriefingTile {
  const shiftOpen = input.openShiftCount > 0;
  const href = resolveBriefingManagerOverrideHref(input.openShiftCount);

  if (!shiftOpen) {
    return draftTile({
      id: BRIEFING_MANAGER_MANAGER_OVERRIDE_TILE_ID,
      category: "pos",
      label: "Register override",
      value: "Shift required",
      detail: "Open a register shift before supervising comps or discounts on the terminal.",
      href,
      availability: "available",
      tone: "attention",
      priority: 4,
    });
  }

  if (input.canApplyPosDiscount) {
    return draftTile({
      id: BRIEFING_MANAGER_MANAGER_OVERRIDE_TILE_ID,
      category: "pos",
      label: "Register override",
      value: "Supervise comps",
      detail:
        "pos.discount.apply granted — review the 4-step override checklist before approving register discounts.",
      href,
      availability: "available",
      tone: "success",
      priority: 4,
    });
  }

  return draftTile({
    id: BRIEFING_MANAGER_MANAGER_OVERRIDE_TILE_ID,
    category: "pos",
    label: "Register override",
    value: "Permission needed",
    detail:
      "Your session lacks pos.discount.apply — switch to a manager account or open override on an authorized register.",
    href,
    availability: "available",
    tone: "attention",
    priority: 4,
  });
}

export function enrichBriefingManagerOverridePackTiles(
  tiles: readonly OwnerDailyBriefingTile[],
  input: OwnerDailyBriefingManagerOverrideInput,
): OwnerDailyBriefingTile[] {
  const withoutDuplicate = tiles.filter(
    (tile) => tile.id !== BRIEFING_MANAGER_MANAGER_OVERRIDE_TILE_ID,
  );
  const overrideTile = buildBriefingManagerOverrideTile(input);

  const priorityLaneIndex = withoutDuplicate.findIndex(
    (tile) => tile.id === "kds-priority-lane",
  );
  if (priorityLaneIndex >= 0) {
    const next = [...withoutDuplicate];
    next.splice(priorityLaneIndex + 1, 0, overrideTile);
    return next;
  }

  const laborIndex = withoutDuplicate.findIndex((tile) => tile.id === "labor-coverage");
  if (laborIndex >= 0) {
    const next = [...withoutDuplicate];
    next.splice(laborIndex + 1, 0, overrideTile);
    return next;
  }

  return [overrideTile, ...withoutDuplicate];
}

export function buildOwnerDailyBriefingManagerOverrideActions(
  input: OwnerDailyBriefingManagerOverrideInput,
): OwnerDailyBriefingRankedAction[] {
  const actions: OwnerDailyBriefingRankedAction[] = [];

  if (input.openShiftCount === 0) {
    actions.push({
      id: "manager-pos-override-shift",
      title: "Open shift for register overrides",
      reason: "No open POS shift — managers cannot supervise comps or discounts until a drawer opens.",
      severity: "normal",
      ownerRole: "manager",
      href: BRIEFING_CASHIER_POS_SHIFTS_HREF,
      status: "open",
      unblockCondition: "Cashier or manager opens a register shift on the shifts page.",
      priority: 11,
      ctaLabel: "Open shifts",
      tone: "normal",
    });
    return actions;
  }

  if (input.canApplyPosDiscount) {
    actions.push({
      id: "manager-pos-override-supervise",
      title: "Supervise register override checklist",
      reason:
        input.posTransactionsToday > 0
          ? `${input.posTransactionsToday} POS sale(s) today — confirm comps and discounts follow the 4-step override flow.`
          : "Shift is open — review override checklist before approving register discounts.",
      severity: "normal",
      ownerRole: "manager",
      href: BRIEFING_MANAGER_MANAGER_OVERRIDE_HREF,
      status: "ready",
      unblockCondition: "Override checklist complete and ticket totals match review hero on terminal.",
      priority: 6,
      ctaLabel: "Open override",
      tone: "normal",
    });
    return actions;
  }

  actions.push({
    id: "manager-pos-override-permission",
    title: "Authorize manager override session",
    reason:
      "This manager session lacks pos.discount.apply — use an authorized account at the register override checklist.",
    severity: "normal",
    ownerRole: "manager",
    href: BRIEFING_MANAGER_MANAGER_OVERRIDE_HREF,
    status: "monitor",
    unblockCondition: "Manager with pos.discount.apply completes override on terminal.",
    priority: 10,
    ctaLabel: "Override checklist",
    tone: "normal",
  });

  return actions;
}

export function mergeBriefingManagerOverrideActions(
  managerActions: readonly OwnerDailyBriefingRankedAction[],
  overrideActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [...managerActions, ...overrideActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
