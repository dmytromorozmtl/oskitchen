import { BRIEFING_CASHIER_POS_SPEED_TERMINAL_HREF } from "@/lib/briefing/owner-daily-briefing-cashier-era19";
import { BRIEFING_KDS_PRIORITY_LANE_HREF } from "@/lib/kitchen/kds-priority-lane-era19-policy";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import type { BriefingRolePack } from "@/lib/briefing/owner-daily-briefing-role-packs-era19";
import type {
  BriefingTileAvailability,
  OwnerDailyBriefingTile,
  OwnerDailyBriefingTileDraft,
} from "@/lib/briefing/owner-daily-briefing-era19";

export const OWNER_DAILY_BRIEFING_TILE_LINKS_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-tile-links-v1" as const;

export type BriefingTileLinkState = "operational" | "blocked" | "empty" | "setup_needed";

export type BriefingTileLinkDefinition = {
  href: string;
  whyItMatters: string;
  rolePacks: readonly BriefingRolePack[];
};

export const BRIEFING_TILE_LINK_DEFINITIONS: Record<string, BriefingTileLinkDefinition> = {
  "orders-today": {
    href: "/dashboard/orders",
    whyItMatters: "See today's intake and due-time orders before kitchen backlog builds.",
    rolePacks: ["owner", "manager", "cashier"],
  },
  "stuck-orders": {
    href: "/dashboard/order-hub",
    whyItMatters: "Stuck orders block revenue and customer promises — triage in Order Hub first.",
    rolePacks: ["owner", "manager", "cashier"],
  },
  "kds-pressure": {
    href: "/dashboard/kitchen",
    whyItMatters: "Kitchen queue depth predicts ticket delays and missed handoffs to packing.",
    rolePacks: ["owner", "manager", "kitchen"],
  },
  "kds-priority-lane": {
    href: BRIEFING_KDS_PRIORITY_LANE_HREF,
    whyItMatters:
      "Allergy alerts and overdue tickets must bump first — the priority lane shows the exact queue order.",
    rolePacks: ["kitchen"],
  },
  "production-priorities": {
    href: "/dashboard/production",
    whyItMatters: "Open production board items feed KDS and prep — clear them before rush.",
    rolePacks: ["owner", "manager", "kitchen"],
  },
  "production-calendar-today": {
    href: "/dashboard/production/calendar",
    whyItMatters: "Calendar batches drive prep timing — overdue work blocks fulfillment.",
    rolePacks: ["owner", "manager", "kitchen"],
  },
  "packing-status": {
    href: "/dashboard/packing",
    whyItMatters: "Open pack jobs delay pickup and delivery — keep the outbound queue moving.",
    rolePacks: ["owner", "manager", "kitchen"],
  },
  "integration-health": {
    href: "/dashboard/integration-health",
    whyItMatters: "Channel and webhook health prevents silent order loss during pilot traffic.",
    rolePacks: ["owner", "manager"],
  },
  "go-live-readiness": {
    href: LAUNCH_WIZARD_ROUTE,
    whyItMatters: "Setup completeness gates safe pilot cutover — validate before taking orders.",
    rolePacks: ["owner"],
  },
  "pilot-status": {
    href: LAUNCH_WIZARD_ROUTE,
    whyItMatters: "Commercial and channel proof gaps block a paid pilot — resolve before contract GO.",
    rolePacks: ["owner"],
  },
  "sso-proof": {
    href: "/dashboard/settings/security/sso",
    whyItMatters: "Enterprise SSO pilot wiring — IdP login proof is ops-gated, not production SSO.",
    rolePacks: ["owner"],
  },
  "revenue-snapshot": {
    href: "/dashboard/analytics",
    whyItMatters: "Today's revenue confirms whether channels and POS are producing real sales.",
    rolePacks: ["owner"],
  },
  "pos-transactions-today": {
    href: "/dashboard/pos/transactions",
    whyItMatters: "Register receipts prove in-store sales landed in the workspace ledger.",
    rolePacks: ["owner", "cashier"],
  },
  "pos-open-shifts": {
    href: "/dashboard/pos/shifts",
    whyItMatters: "Cashiers need an open shift before ringing sales — close when the drawer is done.",
    rolePacks: ["cashier"],
  },
  "low-stock": {
    href: "/dashboard/purchasing",
    whyItMatters: "Below-par ingredients cause 86'd items and missed orders during service.",
    rolePacks: ["owner", "manager"],
  },
  "labor-coverage": {
    href: "/dashboard/labor",
    whyItMatters: "Staffing vs schedule affects ticket times and labor cost during the shift.",
    rolePacks: ["owner", "manager"],
  },
  "support-workspace-blockers": {
    href: "/dashboard/integration-health#support-admin-triage",
    whyItMatters: "Operational blockers stall tenant service — triage before escalating to platform ops.",
    rolePacks: ["support_admin"],
  },
  "support-p0-proof": {
    href: "/dashboard/integration-health#engineering-smoke-artifacts",
    whyItMatters: "P0 staging proof is ops-gated — never claim PASS without artifact evidence.",
    rolePacks: ["support_admin"],
  },
  "support-pilot-gono-go": {
    href: LAUNCH_WIZARD_ROUTE,
    whyItMatters: "Paid pilot GO/NO-GO must come from smoke artifact — not sales assumptions.",
    rolePacks: ["support_admin"],
  },
  "support-open-tickets": {
    href: "/dashboard/support/inbox",
    whyItMatters: "Open tickets may hide integration or launch blockers for this tenant.",
    rolePacks: ["support_admin"],
  },
  "support-integration-errors": {
    href: "/dashboard/integration-health#support-admin-triage",
    whyItMatters: "ERROR connections can silently drop channel orders during pilot traffic.",
    rolePacks: ["support_admin"],
  },
};

const LOW_STOCK_SETUP_HREF = "/dashboard/inventory";

export function briefingTileLinkDefinition(tileId: string): BriefingTileLinkDefinition | null {
  return BRIEFING_TILE_LINK_DEFINITIONS[tileId] ?? null;
}

export function resolveBriefingTileCanonicalHref(
  tileId: string,
  fallbackHref: string,
  availability: BriefingTileAvailability,
): string {
  if (tileId === "low-stock" && availability === "not_configured") {
    return LOW_STOCK_SETUP_HREF;
  }
  if (
    tileId === "production-calendar-today" &&
    (fallbackHref.includes("?") || fallbackHref.includes("#"))
  ) {
    return fallbackHref;
  }
  if (tileId === "pos-terminal-register") {
    return fallbackHref;
  }
  if (tileId === "kds-priority-lane") {
    return fallbackHref;
  }
  return briefingTileLinkDefinition(tileId)?.href ?? fallbackHref;
}

export function resolveBriefingTileLinkState(
  tile: Pick<OwnerDailyBriefingTile, "availability" | "tone" | "value">,
): BriefingTileLinkState {
  if (tile.availability === "not_configured") return "setup_needed";
  if (tile.availability === "unavailable") return "blocked";
  if (
    tile.tone === "success" &&
    (tile.value === "0" || tile.value === "$0" || tile.value === "On track")
  ) {
    return "empty";
  }
  if (tile.tone === "attention") return "blocked";
  return "operational";
}

export function resolveBriefingTileWhyItMatters(tile: OwnerDailyBriefingTile): string {
  return briefingTileLinkDefinition(tile.id)?.whyItMatters ?? tile.detail;
}

export function enrichBriefingTileLinks(tile: OwnerDailyBriefingTileDraft): OwnerDailyBriefingTile {
  const href = resolveBriefingTileCanonicalHref(tile.id, tile.href, tile.availability);
  const whyItMatters = briefingTileLinkDefinition(tile.id)?.whyItMatters ?? tile.detail;
  const linkState = resolveBriefingTileLinkState(tile);

  return {
    ...tile,
    href,
    whyItMatters,
    linkState,
  };
}

export function enrichBriefingTilesLinks(
  tiles: readonly OwnerDailyBriefingTileDraft[],
): OwnerDailyBriefingTile[] {
  return tiles.map(enrichBriefingTileLinks);
}

export function normalizeBriefingOperationalHref(href: string): string {
  if (href === "/dashboard/implementation" || href.startsWith("/dashboard/implementation/")) {
    return LAUNCH_WIZARD_ROUTE;
  }
  if (href === "/dashboard/go-live") {
    return LAUNCH_WIZARD_ROUTE;
  }
  return href;
}

export function isBriefingTileAllowedForRolePack(
  tileId: string,
  pack: BriefingRolePack,
): boolean {
  const definition = briefingTileLinkDefinition(tileId);
  if (!definition) return true;
  return definition.rolePacks.includes(pack);
}

export function auditBriefingTileLinks(tiles: readonly OwnerDailyBriefingTile[]): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  for (const tile of tiles) {
    if (!tile.href.startsWith("/dashboard")) {
      issues.push(`${tile.id}: href must start with /dashboard — got ${tile.href}`);
    }
    if (!tile.whyItMatters?.trim()) {
      issues.push(`${tile.id}: missing whyItMatters microcopy`);
    }
    if (tile.id === "integration-health" && tile.href !== "/dashboard/integration-health") {
      issues.push(`${tile.id}: must link to integration health center`);
    }
    if (
      (tile.id === "pilot-status" || tile.id === "go-live-readiness") &&
      tile.href !== LAUNCH_WIZARD_ROUTE
    ) {
      issues.push(`${tile.id}: must link to launch wizard`);
    }
    if (tile.id === "stuck-orders" && tile.href !== "/dashboard/order-hub") {
      issues.push(`${tile.id}: must link to order hub`);
    }
    if (
      tile.id === "pos-terminal-register" &&
      !tile.href.startsWith("/dashboard/pos/terminal")
    ) {
      issues.push(`${tile.id}: must link to POS terminal`);
    }
  }

  return { valid: issues.length === 0, issues };
}

export function briefingTileLinkStateLabel(state: BriefingTileLinkState): string | null {
  switch (state) {
    case "blocked":
      return "Needs attention";
    case "setup_needed":
      return "Setup needed";
    case "empty":
      return "All clear";
    default:
      return null;
  }
}
