import { createZoneFormAction } from "@/actions/delivery-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function ZonesPage() {
  const { userId } = await getTenantActor();
  const zones = await prisma.deliveryZone.findMany({
    where: { userId },
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: { _count: { select: { routes: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Delivery zones</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Group postal codes and radius rules. Zones power route grouping and feed storefront fulfillment fees and minimums.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Add zone</CardTitle>
          <CardDescription>Postal codes can be comma- or whitespace-separated and are stored uppercased.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createZoneFormAction} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Midtown" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="radiusKm">Radius (km)</Label>
              <Input id="radiusKm" name="radiusKm" type="number" min="0" step="0.1" placeholder="10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Delivery fee</Label>
              <Input id="deliveryFee" name="deliveryFee" type="number" min="0" step="0.01" placeholder="5.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumOrderAmount">Minimum order</Label>
              <Input
                id="minimumOrderAmount"
                name="minimumOrderAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="25.00"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="postalCodes">Postal codes</Label>
              <Textarea id="postalCodes" name="postalCodes" rows={3} placeholder="M5V 1A1, M5V 1B2, M5V 1C3" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} placeholder="What this zone covers" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Add zone</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {zones.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">No zones yet</CardTitle>
            <CardDescription>Add a zone to group deliveries and unlock fee/minimum rules.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-border/80 shadow-sm">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Radius</th>
                  <th className="px-4 py-3 font-medium">Fee</th>
                  <th className="px-4 py-3 font-medium">Minimum</th>
                  <th className="px-4 py-3 font-medium">Postal codes</th>
                  <th className="px-4 py-3 font-medium">Routes</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((z) => {
                  const postal = Array.isArray(z.postalCodesJson) ? (z.postalCodesJson as string[]) : [];
                  return (
                    <tr key={z.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3 font-medium">{z.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{z.radiusKm?.toString() ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{z.deliveryFee?.toString() ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{z.minimumOrderAmount?.toString() ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{postal.length} codes</td>
                      <td className="px-4 py-3 text-muted-foreground">{z._count.routes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
