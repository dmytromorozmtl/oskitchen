import type { LocationStatus } from "@prisma/client";

const FORWARD: Record<LocationStatus, LocationStatus[]> = {
  SETUP: ["ACTIVE", "PAUSED", "ARCHIVED"],
  ACTIVE: ["PAUSED", "TEMPORARILY_CLOSED", "ARCHIVED"],
  PAUSED: ["ACTIVE", "TEMPORARILY_CLOSED", "ARCHIVED"],
  TEMPORARILY_CLOSED: ["ACTIVE", "PAUSED", "ARCHIVED"],
  ARCHIVED: ["ACTIVE"], // unarchive
};

export function canTransitionLocationStatus(from: LocationStatus, to: LocationStatus): boolean {
  if (from === to) return true;
  return FORWARD[from].includes(to);
}

export const OPERATIONAL_LOCATION_STATUSES: readonly LocationStatus[] = ["ACTIVE", "SETUP", "PAUSED", "TEMPORARILY_CLOSED"];

export function isOperational(status: LocationStatus): boolean {
  return OPERATIONAL_LOCATION_STATUSES.includes(status);
}
