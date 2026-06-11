import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectSubnav } from "@/components/dashboard/implementation/project-subnav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { IMPLEMENTATION_INTEGRATIONS } from "@/lib/implementation/implementation-types";
import { prisma } from "@/lib/prisma";
import { getProject } from "@/services/implementation/implementation-service";

const STATUS_LABEL: Record<string, string> = {
  CONNECTED: "Connected",
  NEEDS_AUTH: "Credentials needed",
  DISABLED: "Disabled",
  ERROR: "Error",
  NOT_STARTED: "Not started",
  PLACEHOLDER: "Placeholder",
};

export default async function IntegrationsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await requireTenantActor();
  const { projectId } = await params;
  const project = await getProject(userId, projectId);
  if (!project) notFound();

  const connections = await prisma.integrationConnection.findMany({
    where: { userId },
    select: { id: true, name: true, provider: true, status: true, lastSyncAt: true, lastError: true },
  });
  const byProvider = new Map(connections.map((c) => [c.provider, c]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
      <ProjectSubnav projectId={projectId} />

      <Card>
        <CardHeader>
          <CardTitle>Tracked integrations</CardTitle>
          <CardDescription>
            Status is read directly from your real Integration Connections. Placeholders are surfaced honestly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {IMPLEMENTATION_INTEGRATIONS.map((integration) => {
              const conn = integration.provider ? byProvider.get(integration.provider as never) : null;
              const status = conn?.status ?? (integration.placeholder ? "PLACEHOLDER" : "NOT_STARTED");
              const badgeClass =
                status === "CONNECTED"
                  ? "border bg-emerald-100 text-emerald-900 border-emerald-200"
                  : status === "ERROR"
                  ? "border bg-rose-100 text-rose-900 border-rose-200"
                  : status === "NEEDS_AUTH"
                  ? "border bg-amber-100 text-amber-900 border-amber-200"
                  : "";
              return (
                <div
                  key={integration.key}
                  className="rounded-md border bg-card p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{integration.label}</div>
                      <p className="text-xs text-muted-foreground">
                        {conn?.lastSyncAt
                          ? `Last sync ${conn.lastSyncAt.toLocaleString()}`
                          : integration.placeholder
                          ? "Placeholder — not yet wired"
                          : integration.key === "email"
                          ? "Uses Notifications + Resend (no channel connection row)."
                          : "Not started"}
                      </p>
                      {conn?.lastError ? (
                        <p className="text-xs text-rose-600">{conn.lastError}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={badgeClass}>{STATUS_LABEL[status] ?? status.replaceAll("_", " ")}</Badge>
                      <Button asChild size="sm" variant="outline">
                        <Link href={integration.setupRoute}>Open</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
