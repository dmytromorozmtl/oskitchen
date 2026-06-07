import Link from "next/link";

import { FloorPlanEditor } from "@/components/restaurant/floor-plan-editor";
import { Button } from "@/components/ui/button";
import { multiLocationMapViewHref } from "@/lib/enterprise/multi-location-map-view-policy";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getLocationForUser } from "@/services/locations/location-service";
import { getTablesForWorkspace } from "@/services/restaurant/table-service";

export const dynamic = "force-dynamic";

export default async function FloorPlansPage({
  searchParams,
}: {
  searchParams?: Promise<{ locationId?: string }>;
}) {
  const { userId, workspaceId, dataUserId } = await getTenantActor();
  const sp = (await searchParams) ?? {};
  const locationId = sp.locationId?.trim() || null;

  const [tables, locationRecord] = await Promise.all([
    getTablesForWorkspace(userId),
    locationId ? getLocationForUser({ userId: dataUserId }, locationId) : Promise.resolve(null),
  ]);
  const location = locationRecord ? { id: locationRecord.id, name: locationRecord.name } : null;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Visual floor plan editor</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Oracle MICROS parity layout canvas — drag-and-drop tables, section zones, shape controls,
          and realtime status via Supabase when configured. BETA — not certified live occupancy for
          every venue.
        </p>
      </div>
      {location ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 py-3"
          data-testid="floor-plan-location-context"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Floor plan editor
            </p>
            <p className="font-medium">{location.name}</p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={multiLocationMapViewHref(location.id)}>Back to network map</Link>
          </Button>
        </div>
      ) : null}
      <FloorPlanEditor tables={tables} userId={userId} workspaceId={workspaceId} />
    </div>
  );
}
