import type {
  SupportCommentAuthorType,
  SupportCommentVisibility,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketSeverity,
  SupportTicketSource,
  SupportTicketStatus,
} from "@prisma/client";

export type SupportTicketFilters = {
  status?: SupportTicketStatus | SupportTicketStatus[];
  category?: SupportTicketCategory | SupportTicketCategory[];
  priority?: SupportTicketPriority | SupportTicketPriority[];
  workspaceId?: string;
  assignedToId?: string | "unassigned" | "me";
  q?: string;
  overdueSla?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
};

export type SupportCenterTab =
  | "my"
  | "new"
  | "inbox"
  | "assigned"
  | "critical"
  | "integrations"
  | "billing"
  | "onboarding"
  | "bugs"
  | "kb"
  | "reports";

export type {
  SupportCommentAuthorType,
  SupportCommentVisibility,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketSeverity,
  SupportTicketSource,
  SupportTicketStatus,
};
