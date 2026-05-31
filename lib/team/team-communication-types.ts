export const TEAM_EVENT_TYPES = {
  announcement: "team.announcement",
  reminder: "team.reminder",
  message: "team.message",
} as const;

export type TeamCommunicationKind = keyof typeof TEAM_EVENT_TYPES;

export type TeamCommunicationPriority = "normal" | "high";

export type TeamCommunicationAudience = "all" | "role" | "individual";

export type TeamCommunicationMetadata = {
  body: string;
  priority: TeamCommunicationPriority;
  audience: TeamCommunicationAudience;
  audienceRoleTypes?: string[];
  targetStaffMemberId?: string;
  dueAt?: string;
  authorName?: string;
  readByStaffIds?: string[];
};

export type TeamCommunicationItem = {
  id: string;
  kind: TeamCommunicationKind;
  summary: string | null;
  metadata: TeamCommunicationMetadata;
  staffMemberId: string | null;
  staffName: string | null;
  createdAtIso: string;
  isOverdue: boolean;
  isDueSoon: boolean;
};

export type TeamCommunicationFeed = {
  items: TeamCommunicationItem[];
  unreadCount: number;
  overdueReminders: number;
  notes: string[];
};

export function parseTeamCommunicationMetadata(raw: unknown): TeamCommunicationMetadata | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const body = typeof o.body === "string" ? o.body.trim() : "";
  if (!body) return null;

  const priority = o.priority === "high" ? "high" : "normal";
  const audience =
    o.audience === "role" || o.audience === "individual" ? o.audience : "all";

  return {
    body,
    priority,
    audience,
    audienceRoleTypes: Array.isArray(o.audienceRoleTypes)
      ? o.audienceRoleTypes.filter((r): r is string => typeof r === "string")
      : undefined,
    targetStaffMemberId:
      typeof o.targetStaffMemberId === "string" ? o.targetStaffMemberId : undefined,
    dueAt: typeof o.dueAt === "string" ? o.dueAt : undefined,
    authorName: typeof o.authorName === "string" ? o.authorName : undefined,
    readByStaffIds: Array.isArray(o.readByStaffIds)
      ? o.readByStaffIds.filter((id): id is string => typeof id === "string")
      : [],
  };
}

export function eventTypeToKind(eventType: string): TeamCommunicationKind | null {
  if (eventType === TEAM_EVENT_TYPES.announcement) return "announcement";
  if (eventType === TEAM_EVENT_TYPES.reminder) return "reminder";
  if (eventType === TEAM_EVENT_TYPES.message) return "message";
  return null;
}
