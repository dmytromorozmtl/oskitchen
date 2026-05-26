import type { PackingTaskStatus } from "@prisma/client";

export const PACKING_TASK_STATUS_LABEL: Record<PackingTaskStatus, string> = {
  QUEUED: "Queued",
  IN_PROGRESS: "In progress",
  PACKED: "Packed",
  VERIFIED: "Verified",
  HANDED_OFF: "Handed off",
  CANCELLED: "Cancelled",
};
