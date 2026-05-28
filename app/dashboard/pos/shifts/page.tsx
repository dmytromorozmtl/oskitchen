import { posCloseShiftFormAction, posOpenShiftFormAction } from "@/actions/pos";
import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { PosShiftCloseForm } from "@/components/dashboard/pos-shift-close-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";
import { listPosRegisters } from "@/services/pos/pos-register-service";
import { listOpenShiftCloseoutPreviews } from "@/services/pos/pos-shift-service";

export default async function PosShiftsPage() {
  const actor = await requireWorkspacePermissionActor();
  const canOpenShift = hasPermission(actor.granted, "pos.shift.open");
  const canCloseShift = hasPermission(actor.granted, "pos.shift.close");
  if (!canOpenShift && !canCloseShift) {
    return (
      <PosAccessCard
        title="POS shifts"
        description="You do not have permission to open or close POS shifts."
        primaryHref="/dashboard/pos"
        primaryLabel="Back to POS"
      />
    );
  }

  const [registers, staff, closeoutPreviews] = await Promise.all([
    listPosRegisters(actor.userId),
    prisma.staffMember.findMany({
      where: { userId: actor.userId, status: "ACTIVE", archivedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    canCloseShift ? listOpenShiftCloseoutPreviews(actor.userId) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">POS shifts</h1>
        <p className="text-sm text-muted-foreground">
          Open and close shifts — expected drawer cash and variance preview before close.
        </p>
      </div>

      {canOpenShift ? (
        <Card className="max-w-lg border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Open shift</CardTitle>
            <CardDescription>Requires Team plan entitlement for `pos_shifts`.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={posOpenShiftFormAction} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="registerId">Register</Label>
                <select
                  id="registerId"
                  name="registerId"
                  required
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
                >
                  {registers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffId">Opened by</Label>
                <select
                  id="staffId"
                  name="staffId"
                  required
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openingCash">Opening cash</Label>
                <Input id="openingCash" name="openingCash" type="number" step="0.01" defaultValue="0" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" className="rounded-xl" />
              </div>
              <Button type="submit" className="rounded-full">
                Open shift
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {canCloseShift ? (
        <Card className="max-w-lg border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Close shift</CardTitle>
            <CardDescription>
              Count the drawer, review expected cash, then close. Card sales are excluded from expected cash.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PosShiftCloseForm
              staff={staff}
              previews={closeoutPreviews}
              formAction={posCloseShiftFormAction}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
