import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  integrationConnectionListWhereForOwner,
  menuListWhereForOwnerAnd,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export default async function ImplementationHandoffPage() {
  const { userId: ownerId } = await requireTenantActor();
  const [project, settings, connections, menu, staff, tasks] = await Promise.all([
    prisma.implementationProject.findFirst({ where: { userId: ownerId }, orderBy: { createdAt: "desc" } }),
    prisma.kitchenSettings.findUnique({ where: { userId: ownerId } }),
    prisma.integrationConnection.findMany({
      where: await integrationConnectionListWhereForOwner(ownerId),
      orderBy: { provider: "asc" },
    }),
    prisma.menu.findFirst({
      where: await menuListWhereForOwnerAnd(ownerId, { active: true, catalogOnly: false }),
      orderBy: { createdAt: "desc" },
    }),
    prisma.staffMember.count({ where: { userId: ownerId, active: true } }),
    prisma.implementationTask.findMany({ where: { project: { userId: ownerId }, status: { not: "DONE" } }, take: 10 }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Customer success handoff</h1>
          <p className="mt-2 text-muted-foreground">Summary for the first week after implementation.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/implementation/reports">Implementation reports</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Business setup</CardTitle>
            <CardDescription>{project?.businessName ?? settings?.businessName ?? "Workspace"}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Active menu: {menu?.title ?? "Not selected"} · Staff trained/configured: {staff}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Connected channels</CardTitle>
            <CardDescription>{connections.length} connection records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            {connections.map((connection) => (
              <p key={connection.id}>{connection.provider} · {connection.status}</p>
            ))}
            {connections.length === 0 ? <p>No channels connected yet.</p> : null}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Open issues and next 7 days</CardTitle>
          <CardDescription>Customer success should review these before closing implementation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {tasks.map((task) => (
            <p key={task.id}>{task.title} · {task.status}</p>
          ))}
          {tasks.length === 0 ? <p>No open implementation tasks. Schedule 7-day follow-up.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
