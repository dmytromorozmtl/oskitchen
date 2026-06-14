import type { IncidentSeverity, IncidentStatus } from "@/lib/developer/incident-severity";
import { prisma } from "@/lib/prisma";

export type PlatformIncidentRow = {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedSystems: string[];
  visibility: "internal" | "public";
  createdAt: Date;
  actorEmail: string | null;
  mitigation?: string;
};

function parseIncidentMetadata(
  meta: unknown,
): Omit<PlatformIncidentRow, "id" | "createdAt" | "actorEmail"> | null {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const m = meta as Record<string, unknown>;
  const title = typeof m.title === "string" ? m.title : null;
  if (!title) return null;
  return {
    title,
    severity: (m.severity as IncidentSeverity) ?? "medium",
    status: (m.status as IncidentStatus) ?? "investigating",
    affectedSystems: Array.isArray(m.affectedSystems)
      ? m.affectedSystems.filter((x): x is string => typeof x === "string")
      : [],
    visibility: m.visibility === "public" ? "public" : "internal",
    mitigation: typeof m.mitigation === "string" ? m.mitigation : undefined,
  };
}

export async function listPlatformIncidents(userId: string, platformSuper: boolean) {
  const rows = await prisma.auditLog.findMany({
    where: {
      action: { startsWith: "platform.incident" },
      ...(platformSuper ? {} : { userId }),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      metadataJson: true,
      createdAt: true,
      actorEmail: true,
    },
  });

  const out: PlatformIncidentRow[] = [];
  for (const r of rows) {
    const parsed = parseIncidentMetadata(r.metadataJson);
    if (!parsed) continue;
    out.push({
      id: r.id,
      createdAt: r.createdAt,
      actorEmail: r.actorEmail,
      ...parsed,
    });
  }
  return out;
}

export function countOpenIncidents(incidents: PlatformIncidentRow[]): number {
  return incidents.filter((i) => i.status !== "resolved").length;
}
