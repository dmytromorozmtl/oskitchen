import type { PlaybookRunStepStatus, PlaybookStatus } from "@prisma/client";

export const PLAYBOOK_RUN_STATUSES: PlaybookStatus[] = [
  "TEMPLATE",
  "READY",
  "RUNNING",
  "BLOCKED",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
];

export const PLAYBOOK_STEP_STATUSES: PlaybookRunStepStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "SKIPPED",
];

export const STEP_STATUS_LABEL: Record<PlaybookRunStepStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  BLOCKED: "Blocked",
  COMPLETED: "Completed",
  SKIPPED: "Skipped",
};

export const RUN_STATUS_LABEL: Record<PlaybookStatus, string> = {
  TEMPLATE: "Template",
  READY: "Ready",
  RUNNING: "Running",
  BLOCKED: "Blocked",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  ARCHIVED: "Archived",
};

export function isActiveRunStatus(s: PlaybookStatus): boolean {
  return s === "RUNNING" || s === "BLOCKED";
}

export function isTerminalRunStatus(s: PlaybookStatus): boolean {
  return s === "COMPLETED" || s === "CANCELLED" || s === "ARCHIVED";
}

export function isTerminalStepStatus(s: PlaybookRunStepStatus): boolean {
  return s === "COMPLETED" || s === "SKIPPED";
}
