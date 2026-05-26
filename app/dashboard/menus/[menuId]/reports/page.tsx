import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { menuByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export default async function MenuReportsPage({ params }: { params: Promise<{ menuId: string }> }) {
  const { menuId } = await params;
  const { sessionUser, dataUserId } = await getTenantActor();

  const menu = await prisma.menu.findFirst({
    where: await menuByIdWhereForOwner(dataUserId, menuId),
    select: { title: true },
  });
  if (!menu) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Link href="/dashboard/menus" className="hover:text-foreground">
          Menus
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/dashboard/menus/${menuId}`} className="hover:text-foreground">
          {menu.title}
        </Link>
        <span className="mx-2">/</span>
        Reports
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Menu reports</h1>
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Coming soon</CardTitle>
          <CardDescription>
            Per-menu revenue, attach rate, sell-outs, and quote conversions will connect to Order Hub
            and analytics without blocking the Menu Center launch.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <Link href="/dashboard/analytics" className="text-primary underline-offset-2 hover:underline">
            Open workspace analytics
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
