import { listLocationsForUser } from "@/services/location/location-service";

export { listLocationsForUser, getLocationForUser } from "@/services/location/location-service";

/** Operational helper — counts active locations for gating multi-location UX. */
export async function countLocationsForUser(userId: string): Promise<number> {
  const rows = await listLocationsForUser(userId);
  return rows.filter((l) => l.active !== false).length;
}
