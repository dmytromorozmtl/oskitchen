import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { LOCATION_STATUS_LABEL, LOCATION_TYPE_LABEL } from "@/lib/locations/location-types";
import { prisma } from "@/lib/prisma";

export default async function ActiveLocationsPage() {
  const { userId } = await getTenantActor();
  const locations = await prisma.location.findMany({
    where: { userId, status: "ACTIVE" },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Active locations</h1>
        <p className="mt-2 text-muted-foreground">
          Locations currently serving orders. Use the detail page to manage hours, fulfillment, and reports.
        </p>
      </div>

      {locations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No locations are active yet. Promote a setup location to active from its detail page.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {locations.map((loc) => (
            <Card key={loc.id} className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">
                    <Link href={`/dashboard/locations/${loc.id}`} className="hover:underline">
                      {loc.name}
                    </Link>
                  </CardTitle>
                  <Badge variant="default" className="rounded-full">
                    {LOCATION_STATUS_LABEL[loc.status]}
                  </Badge>
                </div>
                <CardDescription>
                  {LOCATION_TYPE_LABEL[loc.type]} · {loc.timezone}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pt-0">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/locations/${loc.id}`}>Open</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/dashboard/locations/${loc.id}/reports`}>Reports</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
