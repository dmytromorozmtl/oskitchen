import { platformGoLiveTenantProjectHref } from "@/lib/go-live/platform-go-live-support-deep-link-era18-policy";
import {
  isPlatformGoLiveProjectActive,
  platformGoLiveProjectLabel,
  type PlatformGoLiveProjectRow,
} from "@/lib/go-live/platform-go-live-focus-era18";

export type PlatformWorkspaceGoLiveContext = {
  workspaceId: string;
  activeSupportWorkspaceId: string | null;
  canImpersonate: boolean;
  canStartSupportSession: boolean;
};

export type PlatformWorkspaceGoLivePrimaryAction =
  | {
      kind: "impersonate_tenant_go_live";
      label: string;
      redirectTo: string;
      targetUserId: string;
      reason: string;
      tone: "urgent" | "normal";
    }
  | {
      kind: "start_support_session";
      label: string;
      redirectTo: string;
      tone: "normal";
    }
  | {
      kind: "await_support_session";
      label: string;
      detail: string;
      tone: "normal";
    }
  | {
      kind: "read_only";
      label: string;
      detail: string;
      tone: "normal";
    };

const MS_PER_DAY = 86_400_000;

function daysUntilLaunch(launchDate: Date | null, now = Date.now()): number | null {
  if (!launchDate) return null;
  return Math.ceil((launchDate.getTime() - now) / MS_PER_DAY);
}

function projectTone(row: PlatformGoLiveProjectRow, now = Date.now()): "urgent" | "normal" {
  const days = daysUntilLaunch(row.launchDate, now);
  const urgent =
    row.status === "BLOCKED" ||
    row.openIncidentCount > 0 ||
    (days !== null && days < 0 && isPlatformGoLiveProjectActive(row.status)) ||
    (days !== null && days <= 7 && row.readinessScore < 70);
  return urgent ? "urgent" : "normal";
}

export function resolvePlatformWorkspaceGoLivePrimaryAction(
  row: PlatformGoLiveProjectRow,
  context: PlatformWorkspaceGoLiveContext,
  now = Date.now(),
): PlatformWorkspaceGoLivePrimaryAction {
  const tone = projectTone(row, now);
  const sessionActive = context.activeSupportWorkspaceId === context.workspaceId;
  const redirectTo = platformGoLiveTenantProjectHref(row.id);
  const workspaceRedirect = `/platform/workspaces/${context.workspaceId}#go-live-project-${row.id}`;

  if (context.canImpersonate && sessionActive) {
    return {
      kind: "impersonate_tenant_go_live",
      label: "Review tenant go-live",
      redirectTo,
      targetUserId: row.userId,
      reason: `platform_workspace_go_live:${row.id}`,
      tone,
    };
  }

  if (context.canImpersonate && !sessionActive && context.canStartSupportSession) {
    return {
      kind: "start_support_session",
      label: "Start support session to review",
      redirectTo: workspaceRedirect,
      tone: "normal",
    };
  }

  if (context.canImpersonate && !sessionActive) {
    return {
      kind: "await_support_session",
      label: "Support session required",
      detail: "Start a read-only support session on this workspace before opening tenant go-live.",
      tone: "normal",
    };
  }

  return {
    kind: "read_only",
    label: "Platform view only",
    detail: "Super-admin impersonation is required to open tenant go-live validation.",
    tone: "normal",
  };
}

export function summarizePlatformWorkspaceGoLiveProjects(
  projects: readonly PlatformGoLiveProjectRow[],
): {
  activeCount: number;
  blockedCount: number;
  lowestReadiness: number | null;
} {
  let activeCount = 0;
  let blockedCount = 0;
  let lowestReadiness: number | null = null;

  for (const project of projects) {
    if (isPlatformGoLiveProjectActive(project.status)) {
      activeCount += 1;
      if (lowestReadiness === null || project.readinessScore < lowestReadiness) {
        lowestReadiness = project.readinessScore;
      }
    }
    if (project.status === "BLOCKED") blockedCount += 1;
  }

  return { activeCount, blockedCount, lowestReadiness };
}

export { platformGoLiveProjectLabel };
