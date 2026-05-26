export type PlatformOperationalStatus =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "outage"
  | "maintenance";

export function worstPlatformStatus(
  statuses: readonly PlatformOperationalStatus[],
): PlatformOperationalStatus {
  const rank: Record<PlatformOperationalStatus, number> = {
    operational: 0,
    maintenance: 1,
    degraded: 2,
    partial_outage: 3,
    outage: 4,
  };
  let worst: PlatformOperationalStatus = "operational";
  let r = -1;
  for (const s of statuses) {
    const n = rank[s];
    if (n > r) {
      r = n;
      worst = s;
    }
  }
  return worst;
}
