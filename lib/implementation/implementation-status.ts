import type {
  ImplementationChecklistPriority,
  ImplementationChecklistStatus,
  ImplementationPhaseStatus,
  ImplementationStatus,
} from "@prisma/client";

export const IMPLEMENTATION_STATUSES: ImplementationStatus[] = [
  "DISCOVERY",
  "SETUP",
  "MIGRATION",
  "TRAINING",
  "TESTING",
  "READY_FOR_GO_LIVE",
  "LIVE",
  "POST_LAUNCH",
  "BLOCKED",
  "CANCELLED",
];

export const IMPLEMENTATION_STATUS_LABEL: Record<ImplementationStatus, string> = {
  NOT_STARTED: "Not started",
  DISCOVERY: "Discovery",
  DATA_IMPORT: "Data import",
  CONFIGURATION: "Configuration",
  STAFF_TRAINING: "Staff training",
  TEST_RUN: "Test run",
  GO_LIVE: "Go-live",
  COMPLETED: "Completed",
  BLOCKED: "Blocked",
  SETUP: "Setup",
  MIGRATION: "Migration",
  TRAINING: "Training",
  TESTING: "Testing",
  READY_FOR_GO_LIVE: "Ready for go-live",
  LIVE: "Live",
  POST_LAUNCH: "Post-launch",
  CANCELLED: "Cancelled",
};

export const CHECKLIST_STATUS_LABEL: Record<ImplementationChecklistStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In progress",
  BLOCKED: "Blocked",
  DONE: "Done",
  SKIPPED: "Skipped",
};

export const CHECKLIST_PRIORITY_LABEL: Record<ImplementationChecklistPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const PHASE_STATUS_LABEL: Record<ImplementationPhaseStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  BLOCKED: "Blocked",
  COMPLETED: "Completed",
  SKIPPED: "Skipped",
};

const ACTIVE_STATUSES: ImplementationStatus[] = [
  "DISCOVERY",
  "DATA_IMPORT",
  "CONFIGURATION",
  "STAFF_TRAINING",
  "TEST_RUN",
  "SETUP",
  "MIGRATION",
  "TRAINING",
  "TESTING",
  "READY_FOR_GO_LIVE",
];

const TERMINAL_STATUSES: ImplementationStatus[] = ["COMPLETED", "LIVE", "POST_LAUNCH", "CANCELLED"];

export function isActiveStatus(status: ImplementationStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export function isTerminalStatus(status: ImplementationStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function isBlockedStatus(status: ImplementationStatus): boolean {
  return status === "BLOCKED";
}

export function isChecklistTerminal(status: ImplementationChecklistStatus): boolean {
  return status === "DONE" || status === "SKIPPED";
}
