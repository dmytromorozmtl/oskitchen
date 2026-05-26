import Link from "next/link";

import { createFullLocationFormAction } from "@/actions/locations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  LOCATION_STATUS_LABEL,
  LOCATION_STATUS_VALUES,
  LOCATION_TYPE_LABEL,
  LOCATION_TYPE_VALUES,
  defaultLocationTypeForBusiness,
} from "@/lib/locations/location-types";
import { prisma } from "@/lib/prisma";

export default async function NewLocationPage() {
  const { userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    include: { kitchenSettings: { select: { businessType: true } } },
  });
  const business = profile?.kitchenSettings?.businessType ?? null;
  const defaultType = defaultLocationTypeForBusiness(business);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">New location</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Full setup form — basics, contact, address. Hours and fulfillment can be configured immediately after,
            from the detail page.
          </p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/dashboard/locations">Cancel</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
          <CardDescription>Required: name. Defaults pick up your workspace business type.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createFullLocationFormAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required maxLength={255} placeholder="SoMa kitchen" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" maxLength={120} placeholder="soma-kitchen (auto if blank)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" name="timezone" defaultValue="America/Los_Angeles" maxLength={64} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue={defaultType}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {LOCATION_TYPE_VALUES.map((t) => (
                  <option key={t} value={t}>{LOCATION_TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Initial status</Label>
              <select
                id="status"
                name="status"
                defaultValue="SETUP"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {LOCATION_STATUS_VALUES.filter((s) => s !== "ARCHIVED").map((s) => (
                  <option key={s} value={s}>{LOCATION_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" maxLength={64} placeholder="+1 415 555 0100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" maxLength={255} placeholder="ops@example.com" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="managerName">Manager</Label>
              <Input id="managerName" name="managerName" maxLength={255} />
            </div>

            <fieldset className="space-y-2 md:col-span-2">
              <legend className="text-sm font-medium">Address</legend>
              <Input name="line1" placeholder="Street line 1" maxLength={255} />
              <Input name="line2" placeholder="Street line 2 (optional)" maxLength={255} />
              <div className="grid gap-2 md:grid-cols-3">
                <Input name="city" placeholder="City" maxLength={120} />
                <Input name="region" placeholder="State / region" maxLength={120} />
                <Input name="postalCode" placeholder="Postal code" maxLength={40} />
              </div>
              <Input name="country" placeholder="Country" maxLength={120} />
            </fieldset>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} maxLength={4000} placeholder="Internal notes about this location" />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" className="rounded-full">Create location</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
