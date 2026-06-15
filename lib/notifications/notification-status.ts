export const NOTIFICATION_STATUSES = [
  "DRAFT",
  "QUEUED",
  "SENT",
  "DELIVERED",
  "OPENED",
  "CLICKED",
  "SKIPPED",
  "FAILED",
  "RETRYING",
  "CANCELLED",
] as const;
export type NotificationStatusKey = (typeof NOTIFICATION_STATUSES)[number];

export const NOTIFICATION_STATUS_LABEL: Record<NotificationStatusKey, string> = {
  DRAFT: "Draft",
  QUEUED: "Queued",
  SENT: "Sent",
  DELIVERED: "Delivered",
  OPENED: "Opened",
  CLICKED: "Clicked",
  SKIPPED: "Skipped",
  FAILED: "Failed",
  RETRYING: "Retrying",
  CANCELLED: "Cancelled",
};

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

const TONES: Record<NotificationStatusKey, StatusTone> = {
  DRAFT: "neutral",
  QUEUED: "info",
  SENT: "info",
  DELIVERED: "success",
  OPENED: "success",
  CLICKED: "success",
  SKIPPED: "neutral",
  FAILED: "danger",
  RETRYING: "warning",
  CANCELLED: "neutral",
};

export function statusTone(s: NotificationStatusKey): StatusTone {
  return TONES[s];
}

/** Statuses that block a future retry. */
export const TERMINAL_STATUSES: NotificationStatusKey[] = [
  "DELIVERED",
  "OPENED",
  "CLICKED",
  "CANCELLED",
];
