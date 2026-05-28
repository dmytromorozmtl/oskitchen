import {
  formatCommercialPilotOpsDecisionLabel,
  resolveCommercialPilotOpsDecision,
  type CommercialPilotOpsStatusModel,
} from "@/lib/commercial/commercial-pilot-ops-status-era18";
import {
  enrichBriefingTilesLinks,
  type BriefingTileLinkState,
} from "@/lib/briefing/owner-daily-briefing-tile-links-era19";
import type {
  OwnerDailyBriefingAlert,
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
  OwnerDailyBriefingTileDraft,
} from "@/lib/briefing/owner-daily-briefing-era19";
import type { TodayBlocker } from "@/services/today/today-command-center-service";
import { INTEGRATION_HEALTH_SUPPORT_ADMIN_ANCHOR } from "@/lib/integrations/integration-health-support-admin-era19";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";

export const OWNER_DAILY_BRIEFING_SUPPORT_ADMIN_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-support-admin-v1" as const;

export type OwnerDailyBriefingSupportAdminInput = {
  blockers: readonly TodayBlocker[];
  openSupportTickets: number;
  errorIntegrations: number;
  commercialOps: CommercialPilotOpsStatusModel | null;
};

function draftTile(
  tile: OwnerDailyBriefingTileDraft,
): OwnerDailyBriefingTile {
  return enrichBriefingTilesLinks([tile])[0]!;
}

export function buildOwnerDailyBriefingSupportAdminTiles(
  input: OwnerDailyBriefingSupportAdminInput,
): OwnerDailyBriefingTile[] {
  const tiles: OwnerDailyBriefingTileDraft[] = [];
  const blockerCount = input.blockers.length;
  const decision = input.commercialOps
    ? resolveCommercialPilotOpsDecision(input.commercialOps.goNoGo)
    : "UNKNOWN";
  const p0 = input.commercialOps?.p0Staging.summary ?? null;

  tiles.push({
    id: "support-workspace-blockers",
    category: "integrations",
    label: "Workspace blockers",
    value: blockerCount > 0 ? `${blockerCount} open` : "Clear",
    detail:
      blockerCount > 0
        ? input.blockers
            .slice(0, 2)
            .map((blocker) => blocker.title)
            .join(" · ")
        : "No operational blockers surfaced for this tenant.",
    href:
      input.blockers[0]?.href ??
      `/dashboard/integration-health${INTEGRATION_HEALTH_SUPPORT_ADMIN_ANCHOR}`,
    availability: "available",
    tone: blockerCount > 0 ? "attention" : "success",
    priority: blockerCount > 0 ? 1 : 10,
  });

  tiles.push({
    id: "support-p0-proof",
    category: "pilot",
    label: "P0 staging proof",
    value: p0 ? p0.p0ProofStatus.replaceAll("_", " ") : "Unknown",
    detail:
      p0 && p0.allMissingEnvVars.length > 0
        ? `${p0.allMissingEnvVars.length} host env var(s) missing — not a PASS claim.`
        : p0?.p0ProofStatus === "proof_passed"
          ? "Engineering P0 artifact reports proof passed."
          : "Run smoke:p0-staging-proof-unblock — SKIPPED if credentials missing.",
    href: "/dashboard/integration-health#engineering-smoke-artifacts",
    availability: p0 ? "available" : "unavailable",
    tone:
      p0?.p0ProofStatus === "proof_passed"
        ? "success"
        : p0
          ? "attention"
          : "neutral",
    priority: p0 && p0.p0ProofStatus !== "proof_passed" ? 2 : 12,
  });

  tiles.push({
    id: "support-pilot-gono-go",
    category: "pilot",
    label: "Pilot GO/NO-GO",
    value: formatCommercialPilotOpsDecisionLabel(decision).split(" — ")[0] ?? decision,
    detail:
      decision === "GO"
        ? "Commercial evidence gates passed — confirm tenant setup before cutover."
        : decision === "NO-GO"
          ? `${input.commercialOps?.goNoGo.summary?.blockers.length ?? 0} blocker(s) — never fake a paid pilot GO.`
          : "GO/NO-GO artifact missing — run smoke:pilot-gono-go.",
    href: LAUNCH_WIZARD_ROUTE,
    availability: input.commercialOps?.goNoGo.artifactPresent ? "available" : "unavailable",
    tone: decision === "GO" ? "success" : decision === "NO-GO" ? "attention" : "neutral",
    priority: decision !== "GO" ? 3 : 13,
  });

  tiles.push({
    id: "support-open-tickets",
    category: "integrations",
    label: "Open support tickets",
    value: String(input.openSupportTickets),
    detail:
      input.openSupportTickets > 0
        ? "Tenant tickets need triage — check SLA and integration-related threads."
        : "No open support tickets for this workspace.",
    href: "/dashboard/support/inbox",
    availability: "available",
    tone: input.openSupportTickets > 0 ? "attention" : "success",
    priority: input.openSupportTickets > 0 ? 4 : 14,
  });

  if (input.errorIntegrations > 0) {
    tiles.push({
      id: "support-integration-errors",
      category: "integrations",
      label: "Integration errors",
      value: String(input.errorIntegrations),
      detail: "Connection(s) in ERROR — channel orders may fail until restored.",
      href: `/dashboard/integration-health${INTEGRATION_HEALTH_SUPPORT_ADMIN_ANCHOR}`,
      availability: "available",
      tone: "attention",
      priority: 5,
    });
  }

  return tiles.map(draftTile);
}

export function buildOwnerDailyBriefingSupportAdminAlerts(input: {
  blockers: readonly TodayBlocker[];
  openSupportTickets: number;
  commercialOps: CommercialPilotOpsStatusModel | null;
}): OwnerDailyBriefingAlert[] {
  const alerts: OwnerDailyBriefingAlert[] = [];

  for (const blocker of input.blockers.slice(0, 3)) {
    alerts.push({
      id: `blocker-${blocker.id}`,
      title: blocker.title,
      detail: blocker.detail,
      href: blocker.href,
      priority: blocker.priority,
      tone: "urgent",
    });
  }

  const decision = input.commercialOps
    ? resolveCommercialPilotOpsDecision(input.commercialOps.goNoGo)
    : "UNKNOWN";
  if (decision !== "GO") {
    alerts.push({
      id: "support-gono-go-alert",
      title: formatCommercialPilotOpsDecisionLabel(decision),
      detail: "Commercial pilot cutover blocked — review launch wizard and smoke artifacts.",
      href: LAUNCH_WIZARD_ROUTE,
      priority: 6,
      tone: "urgent",
    });
  }

  const p0 = input.commercialOps?.p0Staging.summary;
  if (p0 && p0.p0ProofStatus !== "proof_passed") {
    alerts.push({
      id: "support-p0-alert",
      title: `P0 proof — ${p0.p0ProofStatus.replaceAll("_", " ")}`,
      detail:
        p0.allMissingEnvVars.length > 0
          ? `${p0.allMissingEnvVars.length} ops env var(s) missing on host.`
          : "SSO, staging first-green, or channel live smoke incomplete.",
      href: "/dashboard/integration-health#engineering-smoke-artifacts",
      priority: 7,
      tone: "urgent",
    });
  }

  if (input.openSupportTickets > 0) {
    alerts.push({
      id: "support-open",
      title: "Open support tickets",
      detail: `${input.openSupportTickets} ticket(s) awaiting resolution.`,
      href: "/dashboard/support/inbox",
      priority: 8,
      tone: "normal",
    });
  }

  return alerts.sort((a, b) => a.priority - b.priority).slice(0, 8);
}

export function buildOwnerDailyBriefingSupportAdminActions(input: {
  blockers: readonly TodayBlocker[];
  openSupportTickets: number;
  commercialOps: CommercialPilotOpsStatusModel | null;
}): OwnerDailyBriefingRankedAction[] {
  const actions: OwnerDailyBriefingRankedAction[] = [];
  const decision = input.commercialOps
    ? resolveCommercialPilotOpsDecision(input.commercialOps.goNoGo)
    : "UNKNOWN";

  if (input.blockers[0]) {
    const blocker = input.blockers[0];
    actions.push({
      id: "support-blocker-action",
      title: blocker.title,
      reason: blocker.detail,
      severity: "critical",
      ownerRole: "support",
      href: blocker.href,
      status: "open",
      unblockCondition: "Clear the workspace blocker and refresh briefing.",
      priority: blocker.priority,
      ctaLabel: "Open blocker",
      tone: "urgent",
    });
  }

  if (decision !== "GO") {
    actions.push({
      id: "support-gono-go-action",
      title: "Review pilot GO/NO-GO blockers",
      reason: formatCommercialPilotOpsDecisionLabel(decision),
      severity: decision === "NO-GO" ? "high" : "normal",
      ownerRole: "support",
      href: LAUNCH_WIZARD_ROUTE,
      status: "open",
      unblockCondition: "Resolve commercial evidence gates before paid pilot traffic.",
      priority: 5,
      ctaLabel: "Open launch wizard",
      tone: decision === "NO-GO" ? "urgent" : "normal",
    });
  }

  if (input.openSupportTickets > 0) {
    actions.push({
      id: "support-tickets-action",
      title: "Triage open support tickets",
      reason: `${input.openSupportTickets} ticket(s) open for this workspace.`,
      severity: "high",
      ownerRole: "support",
      href: "/dashboard/support/inbox",
      status: "open",
      unblockCondition: "Resolve or assign open tickets.",
      priority: 8,
      ctaLabel: "Open inbox",
      tone: "normal",
    });
  }

  actions.push({
    id: "support-integration-health-action",
    title: "Open integration health triage",
    reason: "Review tenant-scoped channel, webhook, and smoke artifact context.",
    severity: "normal",
    ownerRole: "support",
    href: `/dashboard/integration-health${INTEGRATION_HEALTH_SUPPORT_ADMIN_ANCHOR}`,
    status: "monitor",
    unblockCondition: "Integration and commercial proof signals look clear.",
    priority: 12,
    ctaLabel: "Open health center",
    tone: "normal",
  });

  return actions.sort((a, b) => a.priority - b.priority).slice(0, 3);
}

export function supportAdminTileLinkState(
  tile: Pick<OwnerDailyBriefingTile, "availability" | "tone" | "value">,
): BriefingTileLinkState {
  if (tile.availability === "unavailable") return "blocked";
  if (tile.tone === "attention") return "blocked";
  if (tile.tone === "success" && (tile.value === "Clear" || tile.value === "0")) return "empty";
  return "operational";
}
