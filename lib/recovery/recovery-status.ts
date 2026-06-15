import type { ErrorRecoveryItemStatus } from "@prisma/client";

export type ErrorRecoveryStatusKey = ErrorRecoveryItemStatus;

export const ERROR_RECOVERY_STATUS_LABELS: Record<ErrorRecoveryItemStatus, string> = {
  OPEN: "Open",
  ACKNOWLEDGED: "Acknowledged",
  RESOLVED: "Resolved",
  IGNORED: "Ignored",
};
