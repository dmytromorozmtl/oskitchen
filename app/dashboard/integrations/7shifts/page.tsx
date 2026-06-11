import Link from "next/link";

import { SchedulingSyncPanel } from "@/components/integrations/scheduling-sync-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SevenShiftsPage() {
  const { userId } = await getTenantActor();
  const staff = await prisma.staffMember.findMany({
    where: { userId, status: "ACTIVE" },
    select: { id: true, name: true, email: true, roleType: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">7shifts</h1>
          <LiveBadge title="LIVE — OAuth, schedule import/export, labor cost" />
        </div>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/7shifts/live">Open LIVE dashboard</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Schedule sync</CardTitle>
        </CardHeader>
        <CardContent>
          <SchedulingSyncPanel provider="7shifts" staff={staff} />
        </CardContent>
      </Card>
    </div>
  );
}
