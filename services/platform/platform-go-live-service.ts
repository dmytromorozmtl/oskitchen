import { prisma } from "@/lib/prisma";
import {
  buildPlatformGoLiveCommandCenterModel,
  type PlatformGoLiveCommandCenterModel,
  type PlatformGoLiveProjectRow,
} from "@/lib/go-live/platform-go-live-focus-era18";

const OPEN_INCIDENT_STATUSES = ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] as const;

export async function loadPlatformGoLiveCommandCenterModel(): Promise<PlatformGoLiveCommandCenterModel> {
  const [projects, openIncidents] = await Promise.all([
    prisma.goLiveProject.findMany({
      orderBy: [{ launchDate: "asc" }, { readinessScore: "asc" }, { updatedAt: "desc" }],
      take: 50,
      include: {
        userProfile: { select: { email: true } },
        workspace: { select: { id: true, name: true } },
        brand: { select: { name: true } },
        location: { select: { name: true } },
      },
    }),
    prisma.goLiveIncident.groupBy({
      by: ["projectId"],
      where: { status: { in: [...OPEN_INCIDENT_STATUSES] } },
      _count: { _all: true },
    }),
  ]);

  const openIncidentCountByProject = new Map(
    openIncidents.map((row) => [row.projectId, row._count._all] as const),
  );

  const rows: PlatformGoLiveProjectRow[] = projects.map((project) => ({
    id: project.id,
    userId: project.userId,
    workspaceId: project.workspaceId,
    workspaceName: project.workspace?.name ?? null,
    ownerEmail: project.userProfile.email,
    brandName: project.brand?.name ?? null,
    locationName: project.location?.name ?? null,
    status: project.status,
    riskLevel: project.riskLevel,
    readinessScore: project.readinessScore,
    launchDate: project.launchDate,
    openIncidentCount: openIncidentCountByProject.get(project.id) ?? 0,
  }));

  return buildPlatformGoLiveCommandCenterModel({ projects: rows });
}

export async function loadPlatformWorkspaceGoLiveProjects(
  workspaceId: string,
): Promise<PlatformGoLiveProjectRow[]> {
  const [projects, openIncidents] = await Promise.all([
    prisma.goLiveProject.findMany({
      where: { workspaceId },
      orderBy: [{ launchDate: "asc" }, { readinessScore: "asc" }, { updatedAt: "desc" }],
      take: 20,
      include: {
        userProfile: { select: { email: true } },
        workspace: { select: { id: true, name: true } },
        brand: { select: { name: true } },
        location: { select: { name: true } },
      },
    }),
    prisma.goLiveIncident.groupBy({
      by: ["projectId"],
      where: {
        status: { in: [...OPEN_INCIDENT_STATUSES] },
        project: { workspaceId },
      },
      _count: { _all: true },
    }),
  ]);

  const openIncidentCountByProject = new Map(
    openIncidents.map((row) => [row.projectId, row._count._all] as const),
  );

  return projects.map((project) => ({
    id: project.id,
    userId: project.userId,
    workspaceId: project.workspaceId,
    workspaceName: project.workspace?.name ?? null,
    ownerEmail: project.userProfile.email,
    brandName: project.brand?.name ?? null,
    locationName: project.location?.name ?? null,
    status: project.status,
    riskLevel: project.riskLevel,
    readinessScore: project.readinessScore,
    launchDate: project.launchDate,
    openIncidentCount: openIncidentCountByProject.get(project.id) ?? 0,
  }));
}
