import { posCreateRegisterFormAction } from "@/actions/pos";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";
import { listPosRegisters } from "@/services/pos/pos-register-service";

export default async function PosRegistersPage() {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, "pos.register.manage")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_hub" />;
  }

  const [rows, locations] = await Promise.all([
    listPosRegisters(actor.userId),
    prisma.location.findMany({
      where: { userId: actor.userId, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  const locationNameById = new Map(locations.map((l) => [l.id, l.name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">POS registers</h1>
        <p className="text-sm text-muted-foreground">Registers anchor shifts, carts, and printed receipt metadata.</p>
      </div>
      <Card className="max-w-lg border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Add register</CardTitle>
          <CardDescription>Creates a lane you can select inside the terminal.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={posCreateRegisterFormAction} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Front counter" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationId">Location</Label>
              <select
                id="locationId"
                name="locationId"
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
                defaultValue=""
              >
                <option value="">Unassigned</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="rounded-full">
              Save register
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Active registers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {rows.length === 0 ? <p className="text-muted-foreground">No registers yet.</p> : null}
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap justify-between gap-2 rounded-xl border border-border/70 px-3 py-2">
              <span className="font-medium">{r.name}</span>
              <span className="text-muted-foreground">
                {r.locationId ? (locationNameById.get(r.locationId) ?? "Unknown location") : "No location"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
