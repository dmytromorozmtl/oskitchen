import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { canUseFeature } from "@/lib/plans/feature-registry";
import { prisma } from "@/lib/prisma";

export default async function PosReportsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const gate = await canUseFeature(dataUserId, "pos_reports");
  if (!gate.allowed) {
    return (
      <Card className="max-w-lg border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>POS reports</CardTitle>
          <CardDescription>Upgrade to Team for register-level reporting slices.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const since = new Date(Date.now() - 30 * 86400000);
  const rows = await prisma.pOSTransaction.findMany({
    where: { userId: dataUserId, createdAt: { gte: since }, status: "COMPLETED" },
    select: { total: true, paymentMode: true },
  });
  const revenue = rows.reduce((s, r) => s + Number(r.total), 0);
  const byMode = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.paymentMode] = (acc[r.paymentMode] ?? 0) + Number(r.total);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">POS reports</h1>
        <p className="text-sm text-muted-foreground">Last 30 days · POS transactions only.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>POS revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">${revenue.toFixed(2)}</CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">{rows.length}</CardContent>
        </Card>
      </div>
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>By payment mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {Object.entries(byMode).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <span>{k}</span>
              <span className="font-medium tabular-nums">${v.toFixed(2)}</span>
            </div>
          ))}
          {rows.length === 0 ? <p className="text-muted-foreground">No POS data in this window.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
