import {
  commercialPilotBlockedLaunchesHref,
} from "@/lib/commercial/commercial-pilot-ops-go-live-bridge-era18-policy";
import type { CommercialPilotOpsAttentionItem } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import {
  resolveCommercialPilotOpsDecision,
  type CommercialPilotOpsStatusModel,
} from "@/lib/commercial/commercial-pilot-ops-status-era18";
import { COMMERCIAL_PILOT_OPS_STATUS_PLATFORM_ROUTE } from "@/lib/commercial/commercial-pilot-ops-status-era18-policy";
import {
  isPlatformGoLiveProjectActive,
  platformGoLiveProjectLabel,
  type PlatformGoLiveProjectRow,
} from "@/lib/go-live/platform-go-live-focus-era18";
import { PLATFORM_GO_LIVE_ROUTE, platformGoLiveProjectAnchor } from "@/lib/go-live/platform-go-live-focus-era18-policy";
import {
  platformWorkspaceGoLiveProjectHref,
  platformWorkspaceGoLiveSectionHref,
} from "@/lib/go-live/platform-support-session-banner-go-live-era18-policy";

export type CommercialPilotOpsGoLiveBridgeRow = PlatformGoLiveProjectRow & {
  label: string;
  workspaceGoLiveHref: string;
  workspaceProjectHref: string;
  platformGoLiveHref: string;
  blockerReason: string;
  tone: "urgent" | "normal";
};

const MS_PER_DAY = 86_400_000;

function daysUntilLaunch(launchDate: Date | null, now = Date.now()): number | null {
  if (!launchDate) return null;
  return Math.ceil((launchDate.getTime() - now) / MS_PER_DAY);
}

export function resolvePlatformPilotLaunchBlockerReason(
  row: PlatformGoLiveProjectRow,
  now = Date.now(),
): { reason: string; tone: "urgent" | "normal" } {
  if (row.status === "BLOCKED") {
    return { reason: "Launch blocked — tenant validation incomplete", tone: "urgent" };
  }
  if (row.status === "ROLLBACK_MODE") {
    return { reason: "Rollback mode — post-cutover recovery required", tone: "urgent" };
  }
  if (row.openIncidentCount > 0) {
    return {
      reason: `${row.openIncidentCount} open incident${row.openIncidentCount === 1 ? "" : "s"}`,
      tone: "urgent",
    };
  }
  const days = daysUntilLaunch(row.launchDate, now);
  if (days !== null && days < 0 && isPlatformGoLiveProjectActive(row.status)) {
    return { reason: "Launch date passed — cutover overdue", tone: "urgent" };
  }
  return { reason: "At-risk launch — review tenant readiness", tone: "normal" };
}

export function isPlatformPilotLaunchBlocker(
  row: PlatformGoLiveProjectRow,
  now = Date.now(),
): boolean {
  if (!row.workspaceId) return false;
  if (row.status === "BLOCKED" || row.status === "ROLLBACK_MODE") return true;
  if (row.openIncidentCount > 0) return true;
  const days = daysUntilLaunch(row.launchDate, now);
  if (days !== null && days < 0 && isPlatformGoLiveProjectActive(row.status)) return true;
  return false;
}

export function filterPlatformPilotLaunchBlockerProjects(
  projects: readonly PlatformGoLiveProjectRow[],
  now = Date.now(),
): PlatformGoLiveProjectRow[] {
  return projects
    .filter((project) => isPlatformPilotLaunchBlocker(project, now))
    .sort((a, b) => {
      const aBlocked = a.status === "BLOCKED" || a.status === "ROLLBACK_MODE" ? 0 : 1;
      const bBlocked = b.status === "BLOCKED" || b.status === "ROLLBACK_MODE" ? 0 : 1;
      if (aBlocked !== bBlocked) return aBlocked - bBlocked;
      return a.readinessScore - b.readinessScore;
    });
}

export function buildCommercialPilotOpsGoLiveBridgeRows(
  projects: readonly PlatformGoLiveProjectRow[],
  now = Date.now(),
): CommercialPilotOpsGoLiveBridgeRow[] {
  return filterPlatformPilotLaunchBlockerProjects(projects, now)
    .filter((row) => row.workspaceId)
    .map((row) => {
      const workspaceId = row.workspaceId as string;
      const blocker = resolvePlatformPilotLaunchBlockerReason(row, now);
      return {
        ...row,
        label: platformGoLiveProjectLabel(row),
        workspaceGoLiveHref: platformWorkspaceGoLiveSectionHref(workspaceId),
        workspaceProjectHref: platformWorkspaceGoLiveProjectHref(workspaceId, row.id),
        platformGoLiveHref: `${PLATFORM_GO_LIVE_ROUTE}${platformGoLiveProjectAnchor(row.id)}`,
        blockerReason: blocker.reason,
        tone: blocker.tone,
      };
    });
}

export function pickCommercialPilotOpsGoLiveBridgeAttentionItems(input: {
  opsModel: CommercialPilotOpsStatusModel;
  blockerProjects: readonly PlatformGoLiveProjectRow[];
  now?: number;
}): CommercialPilotOpsAttentionItem[] {
  const now = input.now ?? Date.now();
  const blockers = filterPlatformPilotLaunchBlockerProjects(input.blockerProjects, now);
  if (blockers.length === 0) return [];

  const decision = resolveCommercialPilotOpsDecision(input.opsModel.goNoGo);
  if (decision !== "NO-GO" && decision !== "UNKNOWN") return [];

  const blockedCount = blockers.filter((row) => row.status === "BLOCKED" || row.status === "ROLLBACK_MODE").length;

  return [
    {
      id: "blocked-pilot-launches",
      title: `${blockers.length} blocked pilot launch project${blockers.length === 1 ? "" : "s"}`,
      detail:
        blockedCount > 0
          ? `${blockedCount} tenant launch${blockedCount === 1 ? "" : "es"} blocked while GO/NO-GO evidence is incomplete — open workspace go-live to unblock.`
          : "Tenant launches at risk while platform evidence gates fail — review workspace go-live sections.",
      href: commercialPilotBlockedLaunchesHref(),
      priority: decision === "NO-GO" ? 2 : 3,
      tone: "urgent",
    },
  ];
}

export function mergeCommercialPilotOpsAttentionItems(
  opsItems: readonly CommercialPilotOpsAttentionItem[],
  bridgeItems: readonly CommercialPilotOpsAttentionItem[],
): CommercialPilotOpsAttentionItem[] {
  const merged = [...opsItems];
  for (const item of bridgeItems) {
    if (merged.some((existing) => existing.id === item.id)) continue;
    merged.push(item);
  }
  return merged.sort((a, b) => a.priority - b.priority).slice(0, 6);
}

export function resolveCommercialPilotOpsGoNoGoLaunchNextAction(input: {
  decision: ReturnType<typeof resolveCommercialPilotOpsDecision>;
  blockerCount: number;
}): { label: string; href: string; tone: "urgent" | "normal" } | null {
  if (input.blockerCount === 0) return null;
  if (input.decision !== "NO-GO" && input.decision !== "UNKNOWN") return null;

  return {
    label: `Review ${input.blockerCount} blocked launch${input.blockerCount === 1 ? "" : "es"}`,
    href: commercialPilotBlockedLaunchesHref(),
    tone: "urgent",
  };
}

export { COMMERCIAL_PILOT_OPS_STATUS_PLATFORM_ROUTE };
