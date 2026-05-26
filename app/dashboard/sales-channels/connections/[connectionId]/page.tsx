import Link from "next/link";
import { notFound } from "next/navigation";

import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { integrationConnectionByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { listActivityForEntity } from "@/services/activity/activity-service";

export default async function IntegrationConnectionDetailPage({
  params,
}: {
  params: Promise<{ connectionId: string }>;
}) {
  const { connectionId } = await params;
  const { userId } = await getTenantActor();

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByIdWhereForOwner(userId, connectionId),
    select: {
      id: true,
      name: true,
      provider: true,
      status: true,
      shopDomain: true,
      baseUrl: true,
      lastSyncAt: true,
      lastError: true,
      externalStoreId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!conn) notFound();

  const activity = await listActivityForEntity(userId, conn.id, 25);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{conn.name}</h1>
          <p className="mt-2 text-muted-foreground">
            {conn.provider.replace(/_/g, " ")} · Credentials are never shown here.
          </p>
          <Badge className="mt-2" variant="secondary">
            {conn.status}
          </Badge>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/sales-channels">All channels</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection facts</CardTitle>
          <CardDescription>Safe, non-secret metadata only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {conn.shopDomain ? (
            <p>
              <span className="text-muted-foreground">Shop / domain:</span> {conn.shopDomain}
            </p>
          ) : null}
          {conn.baseUrl ? (
            <p>
              <span className="text-muted-foreground">Base URL:</span> {conn.baseUrl}
            </p>
          ) : null}
          {conn.externalStoreId ? (
            <p>
              <span className="text-muted-foreground">External store id:</span> {conn.externalStoreId}
            </p>
          ) : null}
          <p>
            <span className="text-muted-foreground">Last sync:</span>{" "}
            {conn.lastSyncAt ? conn.lastSyncAt.toISOString() : "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Updated:</span> {conn.updatedAt.toISOString()}
          </p>
          {conn.lastError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-destructive">
              {conn.lastError}
            </p>
          ) : (
            <p className="text-muted-foreground">No last error recorded.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="secondary" className="rounded-full">
          <Link href="/dashboard/sales-channels/health">Health</Link>
        </Button>
        <Button asChild variant="secondary" className="rounded-full">
          <Link href="/dashboard/sales-channels/webhooks">Webhooks</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/sales-channels/connected">Connected accounts</Link>
        </Button>
      </div>

      <ActivityTimeline items={activity} />
    </div>
  );
}
