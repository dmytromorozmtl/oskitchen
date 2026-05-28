import type { GoLiveLaunchStatus, GoLiveRiskLevel } from "@prisma/client";

import {
  PLATFORM_GO_LIVE_PROJECTS_ANCHOR,
  PLATFORM_GO_LIVE_ROUTE,
  platformGoLiveProjectAnchor,
} from "@/lib/go-live/platform-go-live-focus-era18-policy";

export type PlatformGoLiveProjectRow = {
  id: string;
  userId: string;
  workspaceId: string | null;
  workspaceName: string | null;
  ownerEmail: string;
  brandName: string | null;
  locationName: string | null;
  status: GoLiveLaunchStatus;
  riskLevel: GoLiveRiskLevel;
  readinessScore: number;
  launchDate: Date | null;
  openIncidentCount: number;
};

export type PlatformGoLiveKpiSnapshot = {
  activeLaunchProjects: number;
  launchingWithin14Days: number;
  highRiskProjects: number;
  openIncidents: number;
};

export type PlatformGoLiveCommandCenterModel = {
  projects: readonly PlatformGoLiveProjectRow[];
  kpis: PlatformGoLiveKpiSnapshot;
};

export type PlatformGoLiveAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type PlatformGoLiveRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

const TERMINAL_STATUSES = new Set<GoLiveLaunchStatus>([
  "LIVE",
  "POST_LAUNCH_MONITORING",
  "COMPLETED",
]);

const MS_PER_DAY = 86_400_000;

function daysUntilLaunch(launchDate: Date | null, now = Date.now()): number | null {
  if (!launchDate) return null;
  return Math.ceil((launchDate.getTime() - now) / MS_PER_DAY);
}

export function isPlatformGoLiveProjectActive(status: GoLiveLaunchStatus): boolean {
  return !TERMINAL_STATUSES.has(status);
}

export function buildPlatformGoLiveKpiSnapshot(
  projects: readonly PlatformGoLiveProjectRow[],
  now = Date.now(),
): PlatformGoLiveKpiSnapshot {
  let launchingWithin14Days = 0;
  let highRiskProjects = 0;
  let openIncidents = 0;

  for (const project of projects) {
    if (!isPlatformGoLiveProjectActive(project.status)) continue;

    const days = daysUntilLaunch(project.launchDate, now);
    if (days !== null && days >= 0 && days <= 14) {
      launchingWithin14Days += 1;
    }

    if (project.riskLevel === "HIGH" || project.riskLevel === "CRITICAL") {
      highRiskProjects += 1;
    }

    openIncidents += project.openIncidentCount;
  }

  return {
    activeLaunchProjects: projects.filter((project) => isPlatformGoLiveProjectActive(project.status)).length,
    launchingWithin14Days,
    highRiskProjects,
    openIncidents,
  };
}

export function platformGoLiveWorkspaceHref(row: PlatformGoLiveProjectRow): string {
  if (row.workspaceId) {
    return `/platform/workspaces/${row.workspaceId}`;
  }
  return `/platform/preview/${row.userId}`;
}

export function platformGoLiveProjectLabel(row: PlatformGoLiveProjectRow): string {
  const parts = [row.brandName, row.locationName, row.workspaceName].filter(Boolean);
  return parts[0] ?? row.ownerEmail;
}

export function resolvePlatformGoLiveRowNextAction(
  row: PlatformGoLiveProjectRow,
  now = Date.now(),
): PlatformGoLiveRowNextAction {
  const days = daysUntilLaunch(row.launchDate, now);
  const urgent =
    row.status === "BLOCKED" ||
    row.openIncidentCount > 0 ||
    (days !== null && days < 0 && isPlatformGoLiveProjectActive(row.status)) ||
    (days !== null && days <= 7 && row.readinessScore < 70);

  return {
    label: row.workspaceId ? "Open workspace" : "Preview tenant",
    href: platformGoLiveWorkspaceHref(row),
    tone: urgent ? "urgent" : "normal",
  };
}

export function summarizePlatformGoLiveFocus(
  items: readonly PlatformGoLiveAttentionItem[],
): { totalSignals: number; hasUrgent: boolean } {
  return {
    totalSignals: items.length,
    hasUrgent: items.some((item) => item.tone === "urgent"),
  };
}

/** Cross-tenant launches — overdue ETA, blocked, low readiness, and open incidents first. */
export function pickPlatformGoLiveAttentionItems(
  projects: readonly PlatformGoLiveProjectRow[],
  now = Date.now(),
): PlatformGoLiveAttentionItem[] {
  const items: PlatformGoLiveAttentionItem[] = [];

  for (const project of projects) {
    if (!isPlatformGoLiveProjectActive(project.status)) continue;

    const label = platformGoLiveProjectLabel(project);
    const href = `${PLATFORM_GO_LIVE_ROUTE}${platformGoLiveProjectAnchor(project.id)}`;
    const days = daysUntilLaunch(project.launchDate, now);

    if (days !== null && days < 0) {
      items.push({
        id: `overdue-${project.id}`,
        title: `${label} — launch date passed`,
        detail: `Status ${project.status.replaceAll("_", " ")} · ${project.readinessScore}% readiness — escalate with tenant.`,
        href,
        priority: 1,
        tone: "urgent",
      });
      continue;
    }

    if (project.status === "BLOCKED") {
      items.push({
        id: `blocked-${project.id}`,
        title: `${label} — launch blocked`,
        detail: `${project.readinessScore}% readiness · review tenant go-live validation.`,
        href,
        priority: 2,
        tone: "urgent",
      });
      continue;
    }

    if (project.openIncidentCount > 0) {
      items.push({
        id: `incidents-${project.id}`,
        title: `${label} — ${project.openIncidentCount} open incident${project.openIncidentCount === 1 ? "" : "s"}`,
        detail: "Post-launch or pre-launch incident requires platform ops attention.",
        href,
        priority: 3,
        tone: "urgent",
      });
    }

    if (days !== null && days <= 7 && project.readinessScore < 70) {
      items.push({
        id: `readiness-${project.id}`,
        title: `${label} — ${days} day${days === 1 ? "" : "s"} to launch`,
        detail: `Only ${project.readinessScore}% readiness — pilot cutover at risk.`,
        href,
        priority: 4,
        tone: "urgent",
      });
    } else if (
      (project.riskLevel === "HIGH" || project.riskLevel === "CRITICAL") &&
      days !== null &&
      days <= 14
    ) {
      items.push({
        id: `risk-${project.id}`,
        title: `${label} — ${project.riskLevel.toLowerCase()} risk`,
        detail: `Launch in ${days} day${days === 1 ? "" : "s"} · ${project.readinessScore}% readiness.`,
        href,
        priority: 5,
        tone: "urgent",
      });
    }
  }

  if (items.length === 0 && projects.some((project) => isPlatformGoLiveProjectActive(project.status))) {
    items.push({
      id: "review-launch-queue",
      title: "Review active launch queue",
      detail: "No urgent cross-tenant signals — scan projects below before the next pilot window.",
      href: `${PLATFORM_GO_LIVE_ROUTE}${PLATFORM_GO_LIVE_PROJECTS_ANCHOR}`,
      priority: 10,
      tone: "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

export function buildPlatformGoLiveCommandCenterModel(input: {
  projects: readonly PlatformGoLiveProjectRow[];
}): PlatformGoLiveCommandCenterModel {
  return {
    projects: input.projects,
    kpis: buildPlatformGoLiveKpiSnapshot(input.projects),
  };
}
