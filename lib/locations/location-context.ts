/**
 * Cookie-backed "selected location" context. Read on the server, written by
 * a tiny server action wired to the LocationSwitcher dropdown.
 *
 * Values:
 *   - <uuid>  → location id selected
 *   - "all"   → All locations
 *   - missing → All locations (default)
 */
import { cookies } from "next/headers";

export const LOCATION_COOKIE = "kos.loc";
export const LOCATION_ALL = "all" as const;

export type LocationContextValue = { mode: "all" } | { mode: "single"; locationId: string };

function isUuid(v: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(v);
}

export async function readLocationContext(): Promise<LocationContextValue> {
  const store = await cookies();
  const raw = store.get(LOCATION_COOKIE)?.value?.trim() ?? "";
  if (!raw || raw === LOCATION_ALL) return { mode: "all" };
  if (!isUuid(raw)) return { mode: "all" };
  return { mode: "single", locationId: raw };
}

/**
 * Build a Prisma filter fragment for the selected location. Empty object when
 * "all locations" so it composes with `where: { ... }` cleanly.
 */
export async function locationContextFilter<K extends string = "locationId">(
  field: K = "locationId" as K,
): Promise<Partial<Record<K, string | null>>> {
  const ctx = await readLocationContext();
  if (ctx.mode === "all") return {};
  return { [field]: ctx.locationId } as Partial<Record<K, string | null>>;
}
