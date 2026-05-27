import Link from "next/link";

import {
  updateStorefrontFulfillmentSettingsFormAction,
  updateStorefrontMarketingSettingsFormAction,
} from "@/actions/storefront-pillar-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DeliveryZonesEditor } from "@/components/dashboard/storefront/delivery-zones-editor";
import { BlackoutDatesPanel } from "@/components/storefront/fulfillment/blackout-dates-panel";
import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { prisma } from "@/lib/prisma";

function isoDate(d: Date | null): string {
  if (!d) return "";
  const x = new Date(d);
  return x.toISOString().slice(0, 10);
}

export default async function StorefrontFulfillmentPage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.settings");
  if (!pageAccess.ok) return pageAccess.deny;

  const settings = await prisma.storefrontSettings.findUnique({
    where: { id: pageAccess.access.storefront.id },
    include: {
      blackoutDates: { orderBy: { startDate: "asc" } },
    },
  });

  if (!settings) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">Fulfillment</h1>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Not set up yet</CardTitle>
            <CardDescription>Save the storefront overview first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/storefront">Open overview</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const zonesStr =
    settings.deliveryZonesJson != null ? JSON.stringify(settings.deliveryZonesJson, null, 2) : "";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Fulfillment</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pickup and delivery toggles, guest-facing instructions, delivery economics, and geo zones. These values feed
          checkout validation and customer emails.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Channels</CardTitle>
          <CardDescription>Turn off a channel to hide it from checkout instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateStorefrontFulfillmentSettingsFormAction} className="space-y-6">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="pickupEnabled" value="on" defaultChecked={settings.pickupEnabled} className="h-4 w-4 rounded border-input" />
                Pickup enabled
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="deliveryEnabled" value="on" defaultChecked={settings.deliveryEnabled} className="h-4 w-4 rounded border-input" />
                Delivery enabled
              </label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupInstructions">Pickup instructions (guest-facing)</Label>
              <Textarea id="pickupInstructions" name="pickupInstructions" rows={4} defaultValue={settings.pickupInstructions ?? ""} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryInstructions">Delivery instructions (guest-facing)</Label>
              <Textarea id="deliveryInstructions" name="deliveryInstructions" rows={4} defaultValue={settings.deliveryInstructions ?? ""} className="rounded-xl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="storefrontDeliveryFee">Delivery fee ({settings.currency})</Label>
                <Input
                  id="storefrontDeliveryFee"
                  name="storefrontDeliveryFee"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={settings.storefrontDeliveryFee != null ? settings.storefrontDeliveryFee.toString() : ""}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freeDeliveryThreshold">Free delivery from ({settings.currency})</Label>
                <Input
                  id="freeDeliveryThreshold"
                  name="freeDeliveryThreshold"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={settings.freeDeliveryThreshold != null ? settings.freeDeliveryThreshold.toString() : ""}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="deliveryRadiusKm">Delivery radius (km, optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Radius is stored for reference only — KitchenOS does not geocode guest addresses yet, so radius is not
                  enforced server-side. Use delivery zones with postal codes or regions for automated checks.
                </p>
                <Input
                  id="deliveryRadiusKm"
                  name="deliveryRadiusKm"
                  type="number"
                  min="0"
                  defaultValue={settings.deliveryRadiusKm != null ? String(settings.deliveryRadiusKm) : ""}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Delivery zones</Label>
                <p className="text-xs text-muted-foreground">
                  Visual editor for postal codes and regions. Checkout matches the guest address — no GPS radius checks.
                </p>
                <DeliveryZonesEditor name="deliveryZonesJson" defaultValue={zonesStr} />
              </div>
            </div>
            <Button type="submit" className="rounded-full">
              Save fulfillment
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Blackout calendar</CardTitle>
          <CardDescription>Per-day closures enforced at checkout (server-side).</CardDescription>
        </CardHeader>
        <CardContent>
          <BlackoutDatesPanel
            rows={settings.blackoutDates.map((b) => ({
              id: b.id,
              startDate: isoDate(b.startDate),
              endDate: isoDate(b.endDate),
              message: b.message,
            }))}
          />
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Site-wide banner &amp; closure</CardTitle>
          <CardDescription>Announcements show on the public storefront header. Closure blocks new checkouts in-window.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateStorefrontMarketingSettingsFormAction} className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="announcementEnabled" value="on" defaultChecked={settings.announcementEnabled} className="h-4 w-4 rounded border-input" />
              Show announcement bar
            </label>
            <div className="space-y-2">
              <Label htmlFor="announcementText">Announcement text</Label>
              <Textarea id="announcementText" name="announcementText" rows={2} defaultValue={settings.announcementText ?? ""} className="rounded-xl" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="closureEnabled" value="on" defaultChecked={settings.closureEnabled} className="h-4 w-4 rounded border-input" />
              Closure window (pause new orders)
            </label>
            <div className="space-y-2">
              <Label htmlFor="closureMessage">Closure message</Label>
              <Textarea id="closureMessage" name="closureMessage" rows={2} defaultValue={settings.closureMessage ?? ""} className="rounded-xl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="closureStartDate">Start date</Label>
                <Input id="closureStartDate" name="closureStartDate" type="date" defaultValue={isoDate(settings.closureStartDate)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closureEndDate">End date</Label>
                <Input id="closureEndDate" name="closureEndDate" type="date" defaultValue={isoDate(settings.closureEndDate)} className="rounded-xl" />
              </div>
            </div>
            <Button type="submit" className="rounded-full">
              Save banner &amp; closure
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
