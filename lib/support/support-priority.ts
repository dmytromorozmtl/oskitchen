import type { SupportTicketPriority } from "@prisma/client";

export const SUPPORT_PRIORITY_LABEL: Record<SupportTicketPriority, string> = {
  LOW: "Low",
  MEDIUM: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
  CRITICAL: "Critical",
};

export function priorityRank(p: SupportTicketPriority): number {
  switch (p) {
    case "CRITICAL":
      return 4;
    case "URGENT":
      return 3;
    case "HIGH":
      return 2;
    case "MEDIUM":
      return 1;
    default:
      return 0;
  }
}
