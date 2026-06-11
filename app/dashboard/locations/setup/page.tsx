import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { LOCATION_STATUS_LABEL, LOCATION_TYPE_LABEL } from "@/lib/locations/location-types";
import { prisma } from "@/lib/prisma";

export default async function SetupLocationsPage() {
  const { userId } = await getTenantActor();
  const locations = await prisma.location.findMany({
    where: { userId, status: { in: ["SETUP", "PAUSED", "TEMPORARILY_CLOSED"] } },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Setup / Draft</h1>
        <p className="mt-2 text-muted-foreground">
          Locations that need hours, fulfillment settings, or an address before they can serve orders.
        </p>
      </div>

      {locations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            All locations are active. Add a new one from the overview if you need to onboard another kitchen.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {locations.map((loc) => {
            const checklist = setupChecklist(loc);
            return (
              <Card key={loc.id} className="border-border/80 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      <Link href={`/dashboard/locations/${loc.id}`} className="hover:underline">
                        {loc.name}
                      </Link>
                    </CardTitle>
                    <Badge variant="secondary" className="rounded-full">
                      {LOCATION_STATUS_LABEL[loc.status]}
                    </Badge>
                  </div>
                  <CardDescription>
                    {LOCATION_TYPE_LABEL[loc.type]} · {loc.timezone}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <ul className="space-y-1 text-xs">
                    {checklist.map((step) => (
                      <li key={step.label} className={step.ok ? "text-muted-foreground line-through" : "text-foreground"}>
                        {step.ok ? "✓" : "•"} {step.label}
                      </li>
                    ))}
                  </ul>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/locations/${loc.id}`}>Continue setup</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

type LocSlim = {
  addressJson: unknown;
  businessHoursJson: unknown;
  fulfillmentSettingsJson: unknown;
};
function setupChecklist(loc: LocSlim): { label: string; ok: boolean }[] {
  return [
    { label: "Address set", ok: Boolean(loc.addressJson) },
    { label: "Business hours configured", ok: Boolean(loc.businessHoursJson) },
    { label: "Fulfillment settings configured", ok: Boolean(loc.fulfillmentSettingsJson) },
  ];
}
