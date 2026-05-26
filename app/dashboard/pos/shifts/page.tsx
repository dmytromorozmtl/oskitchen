import { posCloseShiftFormAction, posOpenShiftFormAction } from "@/actions/pos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { listPosRegisters } from "@/services/pos/pos-register-service";

export default async function PosShiftsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const [registers, staff, openShifts] = await Promise.all([
    listPosRegisters(dataUserId),
    prisma.staffMember.findMany({
      where: { userId: dataUserId, status: "ACTIVE", archivedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.pOSShift.findMany({
      where: { userId: dataUserId, status: "OPEN" },
      orderBy: { openedAt: "desc" },
      include: { register: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">POS shifts</h1>
        <p className="text-sm text-muted-foreground">Open and close shifts to reconcile expected vs counted cash.</p>
      </div>

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

      <Card className="max-w-lg border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Close shift</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={posCloseShiftFormAction} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="shiftId">Open shift</Label>
              {openShifts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open shifts.</p>
              ) : (
                <select
                  id="shiftId"
                  name="shiftId"
                  required
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
                >
                  {openShifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.register.name} · {s.openedAt.toISOString().slice(0, 16)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffIdClose">Closed by</Label>
              <select
                id="staffIdClose"
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
              <Label htmlFor="closingCash">Closing cash counted</Label>
              <Input id="closingCash" name="closingCash" type="number" step="0.01" required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notesClose">Notes</Label>
              <Input id="notesClose" name="notes" className="rounded-xl" />
            </div>
            <Button type="submit" variant="secondary" className="rounded-full" disabled={openShifts.length === 0}>
              Close shift
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
