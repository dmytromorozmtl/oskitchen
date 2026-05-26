import type { ProductionCronSlug } from "@/services/cron/production-manifest";

export function buildCriticalCronIncidentSourceKey(
  slug: ProductionCronSlug,
  incidentMarker: string | null,
): string {
  return `critical-cron:${slug}:${incidentMarker ?? "active"}`;
}
