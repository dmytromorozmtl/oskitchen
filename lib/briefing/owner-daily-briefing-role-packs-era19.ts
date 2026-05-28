import type { UserRole } from "@prisma/client";

import type {
  OwnerDailyBriefingActionRole,
  OwnerDailyBriefingAlert,
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
} from "@/lib/briefing/owner-daily-briefing-era19";
import type { OperatorHomePersona } from "@/lib/navigation/operator-home-era18";

export const OWNER_DAILY_BRIEFING_ROLE_PACKS_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-role-packs-v1" as const;

export type BriefingRolePack = "owner" | "manager" | "kitchen" | "cashier";

export const BRIEFING_ROLE_PACK_TILE_IDS: Record<BriefingRolePack, readonly string[]> = {
  owner: [
    "revenue-snapshot",
    "pilot-status",
    "integration-health",
    "stuck-orders",
    "go-live-readiness",
    "sso-proof",
    "orders-today",
    "low-stock",
  ],
  manager: [
    "labor-coverage",
    "kds-pressure",
    "packing-status",
    "stuck-orders",
    "orders-today",
    "production-priorities",
    "production-calendar-today",
    "low-stock",
  ],
  kitchen: [
    "kds-pressure",
    "production-priorities",
    "production-calendar-today",
    "packing-status",
  ],
  cashier: [
    "pos-open-shifts",
    "pos-transactions-today",
    "orders-today",
    "stuck-orders",
  ],
};

export const BRIEFING_ROLE_PACK_ACTION_ROLES: Record<
  BriefingRolePack,
  readonly OwnerDailyBriefingActionRole[]
> = {
  owner: ["owner", "manager", "kitchen", "support"],
  manager: ["manager", "kitchen", "owner"],
  kitchen: ["kitchen", "manager"],
  cashier: ["manager"],
};

export const BRIEFING_ROLE_PACK_LABEL: Record<BriefingRolePack, string> = {
  owner: "Owner command center",
  manager: "Manager command center",
  kitchen: "Kitchen command center",
  cashier: "Cashier command center",
};

export const BRIEFING_ROLE_PACK_HEADLINE: Record<BriefingRolePack, string> = {
  owner: "Leadership priorities — revenue, pilot readiness, integrations, and blockers.",
  manager: "Shift operations — labor, kitchen pressure, packing, and today's orders.",
  kitchen: "Line priorities — KDS pressure, production batches, and packing handoff.",
  cashier: "Register focus — open shifts, POS activity, and order lookups.",
};

export function resolveBriefingRolePack(input: {
  workspaceRole: UserRole;
  persona: OperatorHomePersona;
}): BriefingRolePack {
  if (input.workspaceRole === "OWNER") return "owner";
  if (input.persona === "kitchen") return "kitchen";
  if (input.persona === "cashier") return "cashier";
  if (input.persona === "manager") return "manager";
  return "manager";
}

export function shouldShowBriefingForPersona(input: {
  workspaceRole: UserRole;
  persona: OperatorHomePersona;
}): boolean {
  if (input.workspaceRole === "OWNER") return true;
  return (
    input.persona === "manager" ||
    input.persona === "kitchen" ||
    input.persona === "cashier"
  );
}

export function filterBriefingTilesForRolePack(
  tiles: readonly OwnerDailyBriefingTile[],
  pack: BriefingRolePack,
): OwnerDailyBriefingTile[] {
  const allowed = new Set(BRIEFING_ROLE_PACK_TILE_IDS[pack]);
  return tiles.filter((tile) => allowed.has(tile.id));
}

export function filterBriefingActionsForRolePack(
  actions: readonly OwnerDailyBriefingRankedAction[],
  pack: BriefingRolePack,
): OwnerDailyBriefingRankedAction[] {
  const allowedRoles = new Set(BRIEFING_ROLE_PACK_ACTION_ROLES[pack]);
  return actions.filter((action) => allowedRoles.has(action.ownerRole));
}

export function filterBriefingAlertsForRolePack(
  alerts: readonly OwnerDailyBriefingAlert[],
  pack: BriefingRolePack,
): OwnerDailyBriefingAlert[] {
  if (pack === "owner") return [...alerts];

  if (pack === "manager") {
    return alerts.filter(
      (alert) =>
        !alert.id.includes("pilot") &&
        !alert.id.includes("sso") &&
        !alert.id.startsWith("gate-"),
    );
  }

  if (pack === "kitchen") {
    return alerts.filter(
      (alert) =>
        alert.id.startsWith("production-calendar-") ||
        alert.id === "overdue-tasks" ||
        alert.id.startsWith("blocker-ext-orders") ||
        alert.id.startsWith("blocker-webhooks") ||
        alert.id.startsWith("blocker-dispatch"),
    );
  }

  return alerts.filter(
    (alert) =>
      alert.id.startsWith("blocker-ext-orders") ||
      alert.id.startsWith("blocker-pickup") ||
      alert.id === "overdue-tasks",
  );
}

export function shouldShowBriefingProductionCalendarLane(pack: BriefingRolePack): boolean {
  return pack === "owner" || pack === "manager" || pack === "kitchen";
}

export function pickBriefingHeroTilesForRolePack(
  tiles: readonly OwnerDailyBriefingTile[],
  pack: BriefingRolePack,
  pickHero: (filtered: readonly OwnerDailyBriefingTile[]) => OwnerDailyBriefingTile[],
): OwnerDailyBriefingTile[] {
  const filtered = filterBriefingTilesForRolePack(tiles, pack);
  const attention = filtered.filter((tile) => tile.tone === "attention");
  if (attention.length >= 4) {
    return attention.slice(0, 8);
  }
  return pickHero(filtered);
}
