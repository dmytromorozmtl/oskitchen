/**
 * Era 20 — Owner Daily Briefing production-grade ranking and empty states.
 */

import type {
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
} from "@/lib/briefing/owner-daily-briefing-era19";
import { OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-production-grade-era20-policy";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";

const INTEGRATION_HEALTH_PATH = "/dashboard/integration-health";
const ORDER_HUB_PATH = "/dashboard/order-hub";

export type OwnerDailyBriefingOperationalEmptyState = {
  policyId: typeof OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_POLICY_ID;
  title: string;
  detail: string;
  href: string;
  ctaLabel: string;
};

export function normalizeBriefingActionPath(href: string): string {
  const withoutHash = href.split("#")[0] ?? href;
  const withoutQuery = withoutHash.split("?")[0] ?? withoutHash;
  if (withoutQuery.startsWith("http")) {
    try {
      return new URL(withoutQuery).pathname;
    } catch {
      return withoutQuery;
    }
  }
  return withoutQuery;
}

function isLaunchWizardPath(path: string): boolean {
  return path === LAUNCH_WIZARD_ROUTE || path.startsWith(`${LAUNCH_WIZARD_ROUTE}/`);
}

function isIntegrationHealthPath(path: string): boolean {
  return path === INTEGRATION_HEALTH_PATH || path.startsWith(`${INTEGRATION_HEALTH_PATH}`);
}

/**
 * Collapse duplicate CTAs (same route / launch wizard / integration health) while preserving rank order.
 */
export function finalizeOwnerDailyBriefingTopActions(
  actions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  const sorted = [...actions].sort((a, b) => a.priority - b.priority);
  const seenPaths = new Set<string>();
  let launchWizardKept = false;
  let integrationHealthKept = false;
  const result: OwnerDailyBriefingRankedAction[] = [];

  for (const action of sorted) {
    const path = normalizeBriefingActionPath(action.href);

    if (isLaunchWizardPath(path)) {
      if (launchWizardKept) continue;
      launchWizardKept = true;
    }

    if (isIntegrationHealthPath(path)) {
      if (integrationHealthKept) continue;
      integrationHealthKept = true;
    }

    if (seenPaths.has(path)) continue;
    seenPaths.add(path);
    result.push(action);
  }

  return result.slice(0, 3);
}

/** One hero metric per category — reduces KPI duplication on Today. */
export function dedupeOwnerDailyBriefingHeroTilesByCategory(
  tiles: readonly OwnerDailyBriefingTile[],
): OwnerDailyBriefingTile[] {
  const seenCategories = new Set<string>();
  const result: OwnerDailyBriefingTile[] = [];

  for (const tile of tiles) {
    if (seenCategories.has(tile.category)) continue;
    seenCategories.add(tile.category);
    result.push(tile);
  }

  return result;
}

export function buildOwnerDailyBriefingOperationalEmptyState(input: {
  topActionsCount: number;
  activeOrders: number;
  readinessOverall: number;
  riskAllClear: boolean;
  pureOperationalMode?: boolean;
  continuousImprovementHref?: string;
  maintenanceModeActive?: boolean;
  maintenanceModeHref?: string;
}): OwnerDailyBriefingOperationalEmptyState | null {
  if (input.topActionsCount > 0) return null;

  if (input.maintenanceModeActive) {
    const title =
      input.activeOrders > 0
        ? "Maintenance mode — shift is moving"
        : "Maintenance mode — commercial pilot path complete";

    const detail =
      input.activeOrders > 0
        ? `${input.activeOrders} active order(s). Era21→era24 path complete — follow weekly/monthly rhythms on Platform ops.`
        : `Go-live readiness ${input.readinessOverall}%. Repeat maintenance rhythms forever — no Step 13 gates.`;

    return {
      policyId: OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_POLICY_ID,
      title,
      detail,
      href: input.maintenanceModeHref ?? input.continuousImprovementHref ?? ORDER_HUB_PATH,
      ctaLabel: input.maintenanceModeHref ? "Open maintenance mode" : "Open improvement loop",
    };
  }

  if (input.pureOperationalMode) {
    const title =
      input.activeOrders > 0
        ? "Pure operational mode — shift is moving"
        : "Pure operational mode — no gate blockers";

    const detail =
      input.activeOrders > 0
        ? `${input.activeOrders} active order(s). Risk radar is ${
            input.riskAllClear ? "clear" : "shown below"
          } — recurring improvement loop tracks integration, metrics, and governance.`
        : `Go-live readiness ${input.readinessOverall}%. Era21 gate chain complete — follow the continuous improvement loop on Platform ops.`;

    return {
      policyId: OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_POLICY_ID,
      title,
      detail,
      href:
        input.continuousImprovementHref ??
        (input.activeOrders > 0 ? ORDER_HUB_PATH : LAUNCH_WIZARD_ROUTE),
      ctaLabel: input.continuousImprovementHref
        ? "Open improvement loop"
        : input.activeOrders > 0
          ? "Open Order Hub"
          : "Open Launch Wizard",
    };
  }

  const title =
    input.activeOrders > 0 ? "No ranked blockers — shift is moving" : "No ranked blockers — ready to open";

  const detail =
    input.activeOrders > 0
      ? `${input.activeOrders} active order(s) in the pipeline. Risk radar is ${
          input.riskAllClear ? "clear" : "shown below"
        } — use Order Hub for handoffs.`
      : `Go-live readiness ${input.readinessOverall}%. Verify Launch Wizard and channels before first order.`;

  return {
    policyId: OWNER_DAILY_BRIEFING_PRODUCTION_GRADE_ERA20_POLICY_ID,
    title,
    detail,
    href: input.activeOrders > 0 ? ORDER_HUB_PATH : LAUNCH_WIZARD_ROUTE,
    ctaLabel: input.activeOrders > 0 ? "Open Order Hub" : "Open Launch Wizard",
  };
}

export function resolveBriefingP0ProofBlockedLabel(
  p0ProofStatus: string | null | undefined,
): string | null {
  if (!p0ProofStatus || p0ProofStatus === "proof_passed") return null;
  if (p0ProofStatus === "awaiting_ops_credentials") {
    return "P0 staging proof blocked — ops credentials";
  }
  return `P0 staging proof: ${p0ProofStatus.replaceAll("_", " ")}`;
}
