import {
  isPlatformGoLiveProjectActive,
  platformGoLiveProjectLabel,
  type PlatformGoLiveProjectRow,
} from "@/lib/go-live/platform-go-live-focus-era18";
import {
  platformWorkspaceGoLiveProjectHref,
  platformWorkspaceGoLiveSectionHref,
} from "@/lib/go-live/platform-support-session-banner-go-live-era18-policy";

export type PlatformSupportSessionBannerGoLiveLink = {
  href: string;
  label: string;
  tone: "urgent" | "normal";
};

export type PlatformSupportSessionBannerGoLiveModel = {
  sectionLink: PlatformSupportSessionBannerGoLiveLink;
  urgentProjectLink: PlatformSupportSessionBannerGoLiveLink | null;
  activeProjectCount: number;
};

const MS_PER_DAY = 86_400_000;

function daysUntilLaunch(launchDate: Date | null, now = Date.now()): number | null {
  if (!launchDate) return null;
  return Math.ceil((launchDate.getTime() - now) / MS_PER_DAY);
}

function projectUrgencyScore(row: PlatformGoLiveProjectRow, now = Date.now()): number | null {
  if (!isPlatformGoLiveProjectActive(row.status)) return null;

  const days = daysUntilLaunch(row.launchDate, now);
  if (days !== null && days < 0) return 1;
  if (row.status === "BLOCKED") return 2;
  if (row.openIncidentCount > 0) return 3;
  if (days !== null && days <= 7 && row.readinessScore < 70) return 4;
  if (
    (row.riskLevel === "HIGH" || row.riskLevel === "CRITICAL") &&
    days !== null &&
    days <= 14
  ) {
    return 5;
  }

  return null;
}

export function pickPlatformWorkspaceGoLiveUrgentProject(
  projects: readonly PlatformGoLiveProjectRow[],
  now = Date.now(),
): PlatformGoLiveProjectRow | null {
  let best: PlatformGoLiveProjectRow | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const project of projects) {
    const score = projectUrgencyScore(project, now);
    if (score === null) continue;
    if (score < bestScore) {
      best = project;
      bestScore = score;
    }
  }

  return best;
}

export function buildPlatformSupportSessionBannerGoLiveModel(input: {
  workspaceId: string;
  projects: readonly PlatformGoLiveProjectRow[];
  now?: number;
}): PlatformSupportSessionBannerGoLiveModel {
  const now = input.now ?? Date.now();
  const activeProjectCount = input.projects.filter((project) =>
    isPlatformGoLiveProjectActive(project.status),
  ).length;
  const urgentProject = pickPlatformWorkspaceGoLiveUrgentProject(input.projects, now);

  const sectionLink: PlatformSupportSessionBannerGoLiveLink = {
    href: platformWorkspaceGoLiveSectionHref(input.workspaceId),
    label:
      activeProjectCount > 0
        ? `Go-live (${activeProjectCount} active)`
        : "Go-live projects",
    tone: urgentProject ? "urgent" : "normal",
  };

  const urgentProjectLink = urgentProject
    ? {
        href: platformWorkspaceGoLiveProjectHref(input.workspaceId, urgentProject.id),
        label: `${platformGoLiveProjectLabel(urgentProject)} — review`,
        tone: "urgent" as const,
      }
    : null;

  return {
    sectionLink,
    urgentProjectLink,
    activeProjectCount,
  };
}
