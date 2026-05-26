import type { StaffShiftStatus, StaffStatus, StaffCertificationStatus } from "@prisma/client";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export const STAFF_STATUS_TONE: Record<StaffStatus, Tone> = {
  ACTIVE: "success",
  INVITED: "info",
  TRAINING: "info",
  PAUSED: "warning",
  INACTIVE: "neutral",
  ARCHIVED: "neutral",
};

export const SHIFT_STATUS_LABEL: Record<StaffShiftStatus, string> = {
  SCHEDULED: "Scheduled",
  CHECKED_IN: "Checked in",
  COMPLETED: "Completed",
  NO_SHOW: "No-show",
  CANCELLED: "Cancelled",
};

export const SHIFT_STATUS_TONE: Record<StaffShiftStatus, Tone> = {
  SCHEDULED: "info",
  CHECKED_IN: "success",
  COMPLETED: "success",
  NO_SHOW: "danger",
  CANCELLED: "neutral",
};

export const CERT_STATUS_LABEL: Record<StaffCertificationStatus, string> = {
  PENDING: "Pending",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
};

export const CERT_STATUS_TONE: Record<StaffCertificationStatus, Tone> = {
  PENDING: "info",
  ACTIVE: "success",
  EXPIRED: "danger",
  REVOKED: "danger",
};

export function isStaffActiveStatus(status: StaffStatus): boolean {
  return status === "ACTIVE" || status === "TRAINING";
}

export function isStaffArchived(status: StaffStatus): boolean {
  return status === "ARCHIVED" || status === "INACTIVE";
}

export function shiftIsToday(shiftDate: Date, today: Date = new Date()): boolean {
  return (
    shiftDate.getUTCFullYear() === today.getUTCFullYear() &&
    shiftDate.getUTCMonth() === today.getUTCMonth() &&
    shiftDate.getUTCDate() === today.getUTCDate()
  );
}
