import { notFound } from "next/navigation";

import {
  archiveLocationFormAction,
  updateLocationProfileFormAction,
} from "@/actions/locations";
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
} from "@/lib/locations/location-types";
import { brandListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { getLocationForUser } from "@/services/locations/location-service";

type AddressShape = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

function parseAddress(json: unknown): AddressShape {
  if (!json || typeof json !== "object") return {};
  const r = json as Record<string, unknown>;
  return {
    line1: typeof r.line1 === "string" ? r.line1 : null,
    line2: typeof r.line2 === "string" ? r.line2 : null,
    city: typeof r.city === "string" ? r.city : null,
    region: typeof r.region === "string" ? r.region : null,
    postalCode: typeof r.postalCode === "string" ? r.postalCode : null,
    country: typeof r.country === "string" ? r.country : null,
  };
}

export default async function LocationProfilePage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { userId } = await getTenantActor();
  const { locationId } = await params;
  const loc = await getLocationForUser({ userId }, locationId);
  if (!loc) notFound();
  const addr = parseAddress(loc.addressJson);

  const brandWhere = await brandListWhereForOwner(userId);
  const brands = await prisma.brand.findMany({
    where: brandWhere,
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Name, contact, type, status, and address.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateLocationProfileFormAction} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="locationId" value={loc.id} />
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={loc.name} required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue={loc.type}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {LOCATION_TYPE_VALUES.map((t) => (
                  <option key={t} value={t}>{LOCATION_TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={loc.status}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {LOCATION_STATUS_VALUES.map((s) => (
                  <option key={s} value={s}>{LOCATION_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" name="timezone" defaultValue={loc.timezone} maxLength={64} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="managerName">Manager</Label>
              <Input id="managerName" name="managerName" defaultValue={loc.managerName ?? ""} maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={loc.phone ?? ""} maxLength={64} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={loc.email ?? ""} maxLength={255} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="defaultBrandId">Default brand</Label>
              <select
                id="defaultBrandId"
                name="defaultBrandId"
                defaultValue={loc.defaultBrandId ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">No default brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <fieldset className="space-y-2 md:col-span-2">
              <legend className="text-sm font-medium">Address</legend>
              <Input name="line1" defaultValue={addr.line1 ?? ""} placeholder="Street line 1" maxLength={255} />
              <Input name="line2" defaultValue={addr.line2 ?? ""} placeholder="Street line 2" maxLength={255} />
              <div className="grid gap-2 md:grid-cols-3">
                <Input name="city" defaultValue={addr.city ?? ""} placeholder="City" maxLength={120} />
                <Input name="region" defaultValue={addr.region ?? ""} placeholder="State / region" maxLength={120} />
                <Input name="postalCode" defaultValue={addr.postalCode ?? ""} placeholder="Postal code" maxLength={40} />
              </div>
              <Input name="country" defaultValue={addr.country ?? ""} placeholder="Country" maxLength={120} />
            </fieldset>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" defaultValue={loc.notes ?? ""} rows={3} maxLength={4000} />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" className="rounded-full">Save profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base">Danger zone</CardTitle>
          <CardDescription>Archiving keeps history but stops the location from accepting new orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={archiveLocationFormAction}>
            <input type="hidden" name="locationId" value={loc.id} />
            <Button type="submit" variant="destructive">
              Archive location
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
