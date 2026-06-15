import type {
  ImportPreviewRowAction,
  ImportPreviewRowStatus,
  ImportStatus,
} from "@prisma/client";

export const IMPORT_STATUS_LABEL: Record<ImportStatus, string> = {
  UPLOADED: "Uploaded",
  MAPPING: "Mapping required",
  VALIDATED: "Ready to commit",
  IMPORTED: "Imported",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export const IMPORT_STATUS_TONE: Record<ImportStatus, "neutral" | "info" | "success" | "warning" | "danger"> = {
  UPLOADED: "info",
  MAPPING: "warning",
  VALIDATED: "info",
  IMPORTED: "success",
  FAILED: "danger",
  CANCELLED: "neutral",
};

export const PREVIEW_ROW_STATUS_LABEL: Record<ImportPreviewRowStatus, string> = {
  VALID: "Valid",
  WARNING: "Warning",
  ERROR: "Error",
  DUPLICATE: "Duplicate",
  SKIPPED: "Skipped",
};

export const PREVIEW_ROW_ACTION_LABEL: Record<ImportPreviewRowAction, string> = {
  CREATE: "Create",
  UPDATE: "Update",
  SKIP: "Skip",
  REJECT: "Reject",
};

const TERMINAL_STATUSES: ImportStatus[] = ["IMPORTED", "FAILED", "CANCELLED"];

export function isPendingValidation(status: ImportStatus): boolean {
  return status === "UPLOADED" || status === "MAPPING";
}

export function isReadyToCommit(status: ImportStatus): boolean {
  return status === "VALIDATED";
}

export function isTerminal(status: ImportStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}
