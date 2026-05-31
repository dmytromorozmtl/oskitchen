import type { Prisma } from "@prisma/client";

import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import { parseTeamCommunicationMetadata } from "@/lib/team/team-communication-types";
import { prisma } from "@/lib/prisma";
import { staffEventListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import {
  buildCreateMetadata,
  buildTeamCommunicationFeed,
  eventTypeForKind,
  type TeamCommunicationFeed,
  type TeamEventRow,
} from "@/services/team/team-communication-service";
import type { TeamCommunicationKind } from "@/lib/team/team-communication-types";

const TEAM_EVENT_PREFIX = "team.";

export async function loadTeamCommunicationFeed(
  userId: string,
  options?: {
    viewerStaffMemberId?: string;
    viewerRoleType?: string;
    limit?: number;
  },
): Promise<TeamCommunicationFeed> {
  const eventWhere = await staffEventListWhereForOwner(userId);
  const events = await prisma.staffEvent.findMany({
    where: {
      AND: [
        eventWhere,
        { eventType: { startsWith: TEAM_EVENT_PREFIX } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
    include: {
      staffMember: { select: { id: true, name: true, roleType: true } },
    },
  });

  const rows: TeamEventRow[] = events.map((e) => ({
    id: e.id,
    eventType: e.eventType,
    summary: e.summary,
    metadataJson: e.metadataJson,
    staffMemberId: e.staffMemberId,
    staffName: e.staffMember?.name ?? null,
    createdAt: e.createdAt,
  }));

  return buildTeamCommunicationFeed({
    events: rows,
    viewerStaffMemberId: options?.viewerStaffMemberId,
    viewerRoleType: options?.viewerRoleType,
  });
}

export async function createTeamCommunicationItem(input: {
  userId: string;
  performedById?: string | null;
  authorName?: string;
  kind: TeamCommunicationKind;
  summary?: string;
  body: string;
  priority?: "normal" | "high";
  audience?: "all" | "role" | "individual";
  audienceRoleTypes?: string[];
  targetStaffMemberId?: string;
  dueAt?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const body = input.body.trim();
  if (!body) return { ok: false, error: "Message body is required." };

  const workspaceId = await ensureOwnerWorkspaceId(input.userId);
  const metadata = buildCreateMetadata({
    body,
    priority: input.priority,
    audience: input.audience,
    audienceRoleTypes: input.audienceRoleTypes,
    targetStaffMemberId: input.targetStaffMemberId,
    dueAt: input.dueAt,
    authorName: input.authorName,
  });

  const created = await prisma.staffEvent.create({
    data: {
      userId: input.userId,
      workspaceId,
      staffMemberId: input.targetStaffMemberId,
      eventType: eventTypeForKind(input.kind),
      performedById: input.performedById ?? undefined,
      summary: input.summary ?? body.slice(0, 120),
      metadataJson: metadata as unknown as Prisma.InputJsonValue,
    },
  });

  return { ok: true, id: created.id };
}

export async function markTeamCommunicationRead(input: {
  userId: string;
  eventId: string;
  staffMemberId: string;
}): Promise<void> {
  const eventWhere = await staffEventListWhereForOwner(input.userId);
  const event = await prisma.staffEvent.findFirst({
    where: { AND: [eventWhere, { id: input.eventId }] },
    select: { id: true, metadataJson: true },
  });
  if (!event) return;

  const metadata = parseTeamCommunicationMetadata(event.metadataJson);
  if (!metadata) return;

  const readByStaffIds = [...new Set([...(metadata.readByStaffIds ?? []), input.staffMemberId])];
  await prisma.staffEvent.update({
    where: { id: event.id },
    data: {
      metadataJson: { ...metadata, readByStaffIds } as unknown as Prisma.InputJsonValue,
    },
  });
}
