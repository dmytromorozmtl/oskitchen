import { createDriverFormAction } from "@/actions/delivery-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function DriversPage() {
  const { userId } = await getTenantActor();
  const drivers = await prisma.driverProfile.findMany({
    where: { userId },
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: {
      routes: {
        select: { id: true, routeDate: true, status: true },
        orderBy: { routeDate: "desc" },
        take: 5,
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Drivers</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Manage drivers, vehicles, and contact info. Drivers can be assigned to routes from the planner or detail page.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Add driver</CardTitle>
          <CardDescription>Driver profiles are local KitchenOS records — no third-party identity required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createDriverFormAction} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Alex Driver" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="+1 555 555 5555" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="alex@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              <Input id="vehicle" name="vehicle" placeholder="Van #2" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} placeholder="Coverage area, schedule, certifications…" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Add driver</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {drivers.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">No drivers yet</CardTitle>
            <CardDescription>Add a driver above to track contact, vehicle, and route history.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-border/80 shadow-sm">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Recent routes</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{d.phone || "—"}</div>
                      <div className="text-xs">{d.email || ""}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.vehicle || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.active ? "Active" : "Inactive"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {d.routes.length === 0
                        ? "—"
                        : d.routes
                            .map((r) => `${r.routeDate.toISOString().slice(0, 10)} (${r.status})`)
                            .join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
