import Link from "next/link";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";

export default async function PosOverviewPage() {
  const actor = await requireWorkspacePermissionActor();
  const { userId } = actor;
  if (!hasPermission(actor.granted, "pos.access")) {
    return <PermissionDeniedSurfaceCard surfaceId="pos_hub" />;
  }
  const [registers, tx7] = await Promise.all([
    prisma.pOSRegister.count({ where: { userId } }),
    prisma.pOSTransaction.count({
      where: { userId, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">POS Terminal</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Front-of-house sales that create real KitchenOS orders with <code className="text-xs">creationSource = POS</code>,
          production routing, inventory impact events, and audit trails.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Registers</CardTitle>
            <CardDescription>Configured lanes</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">{registers}</CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>POS sales (7d)</CardTitle>
            <CardDescription>Completed POS transactions</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">{tx7}</CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Shortcuts</CardTitle>
            <CardDescription>Jump into daily use</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild className="rounded-full">
              <Link href="/dashboard/pos/terminal">Open terminal</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/pos/tabs">Open tabs</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/pos/handheld">Handheld POS</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/order-hub?tab=pos">Order hub · POS tab</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/inventory/pos-impacts">Inventory impacts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
