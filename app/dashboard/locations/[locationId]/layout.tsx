import Link from "next/link";
import { notFound } from "next/navigation";

import { LocationTabs } from "@/components/dashboard/locations/location-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  LOCATION_STATUS_BADGE,
  LOCATION_STATUS_LABEL,
  LOCATION_TYPE_LABEL,
} from "@/lib/locations/location-types";
import { prisma } from "@/lib/prisma";

export default async function LocationDetailLayout({
  params,
  children,
}: {
  params: Promise<{ locationId: string }>;
  children: React.ReactNode;
}) {
  const { userId } = await getTenantActor();
  const { locationId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(locationId)) notFound();
  const loc = await prisma.location.findFirst({
    where: { id: locationId, userId },
    select: { id: true, name: true, type: true, status: true, timezone: true },
  });
  if (!loc) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/dashboard/locations" className="text-sm text-muted-foreground hover:underline">
            ← all locations
          </Link>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{loc.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {LOCATION_TYPE_LABEL[loc.type]} · {loc.timezone}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={LOCATION_STATUS_BADGE[loc.status]} className="rounded-full">
            {LOCATION_STATUS_LABEL[loc.status]}
          </Badge>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/dashboard/locations/${loc.id}/reports`}>Reports</Link>
          </Button>
        </div>
      </div>
      <LocationTabs locationId={loc.id} />
      {children}
    </div>
  );
}
