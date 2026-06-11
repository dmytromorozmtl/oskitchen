import { notFound } from "next/navigation";

import { updateLocationFulfillmentFormAction } from "@/actions/locations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { parseFulfillmentSettings } from "@/lib/locations/location-fulfillment";
import { getLocationForUser } from "@/services/locations/location-service";

export default async function LocationFulfillmentPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { userId } = await getTenantActor();
  const { locationId } = await params;
  const loc = await getLocationForUser({ userId }, locationId);
  if (!loc) notFound();
  const f = parseFulfillmentSettings(loc.fulfillmentSettingsJson);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Fulfillment</CardTitle>
        <CardDescription>
          Pickup &amp; delivery defaults for this location. Storefront overrides apply on top — leave blank to inherit
          workspace defaults.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateLocationFulfillmentFormAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="locationId" value={loc.id} />

          <fieldset className="space-y-2 md:col-span-2 rounded-md border border-border/70 p-3">
            <legend className="px-2 text-sm font-medium">Pickup</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="pickupEnabled" defaultChecked={f.pickupEnabled} />
              Pickup enabled
            </label>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="pickupLeadMinutes" className="text-xs">Lead time (minutes)</Label>
                <Input id="pickupLeadMinutes" name="pickupLeadMinutes" type="number" min={0} max={2880} defaultValue={f.pickupLeadMinutes ?? ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pickupCutoffMinutes" className="text-xs">Cutoff before close (minutes)</Label>
                <Input id="pickupCutoffMinutes" name="pickupCutoffMinutes" type="number" min={0} max={2880} defaultValue={f.pickupCutoffMinutes ?? ""} />
              </div>
            </div>
            <Label htmlFor="pickupInstructions" className="text-xs">Pickup instructions</Label>
            <Textarea id="pickupInstructions" name="pickupInstructions" rows={2} maxLength={2000} defaultValue={f.pickupInstructions ?? ""} />
          </fieldset>

          <fieldset className="space-y-2 md:col-span-2 rounded-md border border-border/70 p-3">
            <legend className="px-2 text-sm font-medium">Delivery</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="deliveryEnabled" defaultChecked={f.deliveryEnabled} />
              Delivery enabled
            </label>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="deliveryLeadMinutes" className="text-xs">Lead time (minutes)</Label>
                <Input id="deliveryLeadMinutes" name="deliveryLeadMinutes" type="number" min={0} max={2880} defaultValue={f.deliveryLeadMinutes ?? ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="deliveryCutoffMinutes" className="text-xs">Cutoff before close (minutes)</Label>
                <Input id="deliveryCutoffMinutes" name="deliveryCutoffMinutes" type="number" min={0} max={2880} defaultValue={f.deliveryCutoffMinutes ?? ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="deliveryFeeCents" className="text-xs">Delivery fee (cents)</Label>
                <Input id="deliveryFeeCents" name="deliveryFeeCents" type="number" min={0} defaultValue={f.deliveryFeeCents ?? ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="minOrderAmountCents" className="text-xs">Min order (cents)</Label>
                <Input id="minOrderAmountCents" name="minOrderAmountCents" type="number" min={0} defaultValue={f.minOrderAmountCents ?? ""} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="maxOrdersPerWindow" className="text-xs">Max orders per window</Label>
                <Input id="maxOrdersPerWindow" name="maxOrdersPerWindow" type="number" min={0} defaultValue={f.maxOrdersPerWindow ?? ""} />
              </div>
            </div>
            <Label htmlFor="deliveryInstructions" className="text-xs">Delivery instructions</Label>
            <Textarea id="deliveryInstructions" name="deliveryInstructions" rows={2} maxLength={2000} defaultValue={f.deliveryInstructions ?? ""} />
          </fieldset>

          <div className="md:col-span-2">
            <Button type="submit" className="rounded-full">Save fulfillment</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
