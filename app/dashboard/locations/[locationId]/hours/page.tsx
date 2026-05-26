import { notFound } from "next/navigation";

import { updateLocationHoursFormAction } from "@/actions/locations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { DAY_KEYS, DAY_LABEL, parseWeeklyHours, type WeeklyHours } from "@/lib/locations/location-hours";
import { getLocationForUser } from "@/services/locations/location-service";

function HoursEditor({
  locationId,
  scope,
  title,
  description,
  initial,
}: {
  locationId: string;
  scope: "business" | "pickup" | "delivery";
  title: string;
  description: string;
  initial: WeeklyHours;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateLocationHoursFormAction} className="space-y-3">
          <input type="hidden" name="locationId" value={locationId} />
          <input type="hidden" name="scope" value={scope} />
          <div className="space-y-2">
            {DAY_KEYS.map((day) => {
              const d = initial[day];
              return (
                <div key={day} className="grid grid-cols-12 items-center gap-2 text-sm">
                  <span className="col-span-2 font-medium">{DAY_LABEL[day]}</span>
                  <Label className="col-span-1 text-xs text-muted-foreground" htmlFor={`${scope}-${day}-open`}>Open</Label>
                  <Input
                    id={`${scope}-${day}-open`}
                    name={`hours.${day}.open`}
                    type="time"
                    defaultValue={d?.open ?? ""}
                    className="col-span-3 h-9"
                  />
                  <Label className="col-span-1 text-xs text-muted-foreground" htmlFor={`${scope}-${day}-close`}>Close</Label>
                  <Input
                    id={`${scope}-${day}-close`}
                    name={`hours.${day}.close`}
                    type="time"
                    defaultValue={d?.close ?? ""}
                    className="col-span-3 h-9"
                  />
                  <label className="col-span-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <input type="checkbox" name={`hours.${day}.closed`} defaultChecked={Boolean(d?.closed)} />
                    Closed
                  </label>
                </div>
              );
            })}
          </div>
          <Button type="submit" size="sm">Save {scope} hours</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default async function LocationHoursPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { userId } = await getTenantActor();
  const { locationId } = await params;
  const loc = await getLocationForUser({ userId }, locationId);
  if (!loc) notFound();

  return (
    <div className="space-y-4">
      <HoursEditor
        locationId={loc.id}
        scope="business"
        title="Business hours"
        description="Used by Order Hub, Today Board, and the Storefront. Times are in this location's timezone."
        initial={parseWeeklyHours(loc.businessHoursJson)}
      />
      <HoursEditor
        locationId={loc.id}
        scope="pickup"
        title="Pickup hours"
        description="Optional override for storefront pickup windows. Leave blank to inherit business hours."
        initial={parseWeeklyHours(loc.pickupHoursJson)}
      />
      <HoursEditor
        locationId={loc.id}
        scope="delivery"
        title="Delivery hours"
        description="Optional override for delivery windows. Leave blank to inherit business hours."
        initial={parseWeeklyHours(loc.deliveryHoursJson)}
      />
    </div>
  );
}
