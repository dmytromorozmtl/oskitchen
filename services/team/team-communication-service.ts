import {
  eventTypeToKind,
  parseTeamCommunicationMetadata,
  TEAM_EVENT_TYPES,
  type TeamCommunicationFeed,
  type TeamCommunicationItem,
  type TeamCommunicationKind,
  type TeamCommunicationMetadata,
} from "@/lib/team/team-communication-types";

export type TeamEventRow = {
  id: string;
  eventType: string;
  summary: string | null;
  metadataJson: unknown;
  staffMemberId: string | null;
  staffName: string | null;
  createdAt: Date;
};

export type StaffAudienceRow = {
  id: string;
  roleType: string;
};

const DUE_SOON_MS = 24 * 60 * 60 * 1000;

function isVisibleToStaff(
  metadata: TeamCommunicationMetadata,
  eventStaffMemberId: string | null,
  viewerStaffMemberId?: string,
  viewerRoleType?: string,
): boolean {
  if (!viewerStaffMemberId) return true;
  if (metadata.audience === "all") return true;
  if (metadata.audience === "individual") {
    return (
      metadata.targetStaffMemberId === viewerStaffMemberId ||
      eventStaffMemberId === viewerStaffMemberId
    );
  }
  if (metadata.audience === "role" && viewerRoleType) {
    return (metadata.audienceRoleTypes ?? []).includes(viewerRoleType);
  }
  return true;
}

export function buildTeamCommunicationFeed(params: {
  events: TeamEventRow[];
  viewerStaffMemberId?: string;
  viewerRoleType?: string;
  now?: Date;
}): TeamCommunicationFeed {
  const now = params.now ?? new Date();
  const items: TeamCommunicationItem[] = [];

  for (const event of params.events) {
    const kind = eventTypeToKind(event.eventType);
    if (!kind) continue;
    const metadata = parseTeamCommunicationMetadata(event.metadataJson);
    if (!metadata) continue;
    if (
      !isVisibleToStaff(metadata, event.staffMemberId, params.viewerStaffMemberId, params.viewerRoleType)
    ) {
      continue;
    }

    const dueAt = metadata.dueAt ? new Date(metadata.dueAt) : null;
    const isOverdue = kind === "reminder" && dueAt != null && dueAt.getTime() < now.getTime();
    const isDueSoon =
      kind === "reminder" &&
      dueAt != null &&
      !isOverdue &&
      dueAt.getTime() - now.getTime() <= DUE_SOON_MS;

    items.push({
      id: event.id,
      kind,
      summary: event.summary,
      metadata,
      staffMemberId: event.staffMemberId,
      staffName: event.staffName,
      createdAtIso: event.createdAt.toISOString(),
      isOverdue,
      isDueSoon,
    });
  }

  items.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));

  const unreadCount =
    params.viewerStaffMemberId != null
      ? items.filter(
          (item) =>
            !(item.metadata.readByStaffIds ?? []).includes(params.viewerStaffMemberId!),
        ).length
      : 0;

  const overdueReminders = items.filter((item) => item.kind === "reminder" && item.isOverdue).length;

  return {
    items,
    unreadCount,
    overdueReminders,
    notes: [
      "In-app team feed — email/SMS delivery uses your notification settings when configured.",
      "Reminders surface on the staff command center until marked read.",
    ],
  };
}

export function buildTeamCommunicationSummary(feed: TeamCommunicationFeed): {
  announcements: number;
  reminders: number;
  messages: number;
} {
  return {
    announcements: feed.items.filter((i) => i.kind === "announcement").length,
    reminders: feed.items.filter((i) => i.kind === "reminder").length,
    messages: feed.items.filter((i) => i.kind === "message").length,
  };
}

export function eventTypeForKind(kind: TeamCommunicationKind): string {
  return TEAM_EVENT_TYPES[kind];
}

export function buildCreateMetadata(input: {
  body: string;
  priority?: "normal" | "high";
  audience?: "all" | "role" | "individual";
  audienceRoleTypes?: string[];
  targetStaffMemberId?: string;
  dueAt?: string;
  authorName?: string;
}): TeamCommunicationMetadata {
  return {
    body: input.body.trim(),
    priority: input.priority ?? "normal",
    audience: input.audience ?? "all",
    audienceRoleTypes: input.audienceRoleTypes,
    targetStaffMemberId: input.targetStaffMemberId,
    dueAt: input.dueAt,
    authorName: input.authorName,
    readByStaffIds: [],
  };
}
