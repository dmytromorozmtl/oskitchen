import Link from "next/link";

import { GoLiveKpiGrid } from "@/components/dashboard/go-live/kpi-grid";
import { CreateProjectForm } from "@/components/dashboard/go-live/create-project-form";
import { LaunchStatusBadge, RiskBadge } from "@/components/dashboard/go-live/status-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserProfile } from "@/lib/auth";
import { getTenantActor } from "@/lib/scope/cached-tenant";

import { isSuperAdminEmail } from "@/lib/platform-owner";
import { LIVE_CAPABLE_INTEGRATION_PROVIDERS } from "@/lib/channels/channel-registry";
import { summariseImplementationExternalCertification } from "@/lib/implementation/external-integration-certification";
import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import {
  integrationConnectionListWhereForOwner,
  orderListWhereForOwner,
  productListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { LAUNCH_MODE_LABEL } from "@/lib/go-live/launch-stages";
import { getGoLivePageAccess } from "@/lib/go-live/go-live-page-access";
import {
  listProjects,
  workbenchSnapshot,
} from "@/services/go-live/go-live-service";

const LEGACY_CHECKS = [
  ["Business profile", "/dashboard/settings"],
  ["Fulfillment rules", "/dashboard/storefront"],
  ["Menu setup", "/dashboard/menus"],
  ["Products imported", "/dashboard/import-center"],
  ["Customers imported", "/dashboard/import-center"],
  ["External integrations certified", "/dashboard/integrations/health"],
  ["Test order created", "/dashboard/orders/new"],
  ["Production sheet verified", "/dashboard/production"],
  ["Packing labels tested", "/dashboard/packing"],
  ["Staff trained", "/dashboard/training"],
  ["Billing configured", "/dashboard/billing"],
  ["Backup/export reviewed", "/dashboard/import-export"],
  ["Support contact confirmed", "/help"],
] as const;

export default async function GoLivePage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const profile = await requireUserProfile();
  const isSuper = isSuperAdminEmail(profile.email);
  const { canCreate } = await getGoLivePageAccess();
  const [projects, brands, locations, latestSimulation, incidentCount] = await Promise.all([
    listProjects(dataUserId),
    prisma.brand.findMany({
      where: { workspaceId: dataUserId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 50,
    }).catch(() => []),
    prisma.location.findMany({
      where: { userId: dataUserId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 50,
    }).catch(() => []),
    prisma.goLiveSimulation.findFirst({
      where: { project: { userId: dataUserId } },
      orderBy: { startedAt: "desc" },
      select: { result: true, simulationType: true, startedAt: true },
    }),
    prisma.goLiveIncident.count({
      where: { project: { userId: dataUserId }, status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] } },
    }),
  ]);

  if (projects.length === 0) {
    // Preserve the legacy checklist for first-time visitors.
    const settings = await prisma.kitchenSettings.findUnique({ where: { userId: dataUserId } });
    const [productWhere, customerWhere, connectionBaseWhere, orderWhere] = await Promise.all([
      productListWhereForOwner(dataUserId),
      kitchenCustomerListWhereForOwner(dataUserId),
      integrationConnectionListWhereForOwner(dataUserId),
      orderListWhereForOwner(dataUserId),
    ]);
    const [productCount, customerCount, connectionRows, orderCount, staffCount, billing] = await Promise.all([
      prisma.product.count({ where: productWhere }),
      prisma.kitchenCustomer.count({ where: customerWhere }),
      prisma.integrationConnection.findMany({
        where: {
          AND: [
            connectionBaseWhere,
            { provider: { in: Array.from(LIVE_CAPABLE_INTEGRATION_PROVIDERS) } },
          ],
        },
        select: {
          id: true,
          provider: true,
          status: true,
          lastSyncAt: true,
          healthChecks: {
            orderBy: { checkedAt: "desc" },
            take: 1,
            select: { status: true },
          },
        },
      }),
      prisma.order.count({ where: orderWhere }),
      prisma.staffMember.count({ where: { userId: dataUserId, active: true } }),
      prisma.subscription.findUnique({ where: { userId: dataUserId } }),
    ]);
    const processedWebhookCounts =
      connectionRows.length === 0
        ? []
        : await prisma.webhookEvent.groupBy({
            by: ["connectionId"],
            where: {
              connectionId: { in: connectionRows.map((connection) => connection.id) },
              processed: true,
            },
            _count: { _all: true },
          });
    const processedWebhookCountByConnection = new Map(
      processedWebhookCounts.map((row) => [row.connectionId, row._count._all] as const),
    );
    const certification = summariseImplementationExternalCertification({
      plannedIntegrationKeys: [],
      connections: connectionRows.map((connection) => ({
        provider: connection.provider,
        status: connection.status,
        lastSyncAt: connection.lastSyncAt,
        lastHealthStatus: connection.healthChecks[0]?.status ?? null,
        processedWebhookCount:
          processedWebhookCountByConnection.get(connection.id) ?? 0,
      })),
    });

    const completed = new Set<string>();
    if (settings?.businessName) completed.add("Business profile");
    if (settings?.pickupWindows || settings?.deliveryEnabled) completed.add("Fulfillment rules");
    if (productCount > 0) { completed.add("Menu setup"); completed.add("Products imported"); }
    if (customerCount > 0) completed.add("Customers imported");
    if (certification.certificationCheck.status === "PASS") completed.add("External integrations certified");
    if (orderCount > 0) { completed.add("Test order created"); completed.add("Production sheet verified"); }
    if (staffCount > 0) completed.add("Staff trained");
    if (billing?.stripeCustomerId || billing?.status === "TRIALING") completed.add("Billing configured");
    completed.add("Backup/export reviewed");
    const percent = Math.round((completed.size / LEGACY_CHECKS.length) * 100);

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Go-live Command Center</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Operational launch orchestration for restaurants, cafés, catering, bakeries, meal prep, ghost
              kitchens, and multi-location brands. Create a launch project to unlock simulations, blockers,
              approvals, rollback planning, and post-launch monitoring.
            </p>
          </div>
        </div>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">No launch project yet</CardTitle>
            <CardDescription>
              Create a structured implementation and launch workflow to safely bring your KitchenOS operation
              online. We&rsquo;ll seed a stage-aware checklist, default rollback plans, and a readiness snapshot
              from your current workspace data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canCreate ? <CreateProjectForm brands={brands} locations={locations} /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Legacy checklist</CardTitle>
            <CardDescription>
              The historical pre-flight checklist remains available as a read-only summary while you build out
              the full launch project. Current readiness: <strong>{percent}%</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {LEGACY_CHECKS.map(([label, href]) => {
                const done = completed.has(label);
                return (
                  <div key={label} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <Link href={href} className="text-xs text-primary underline-offset-4 hover:underline">
                        Open module
                      </Link>
                    </div>
                    <Badge variant={done ? "default" : "outline"}>{done ? "Ready" : "Open"}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const primary = projects[0];
  const snapshot = await workbenchSnapshot(dataUserId, primary.id, primary.businessType ?? null, primary.status);
  const criticalBlockers = snapshot.validation.blockers.filter((b) => b.severity === "CRITICAL").length;
  const launchEta = primary.launchDate ? primary.launchDate.toISOString().slice(0, 10) : "Not set";
  const externalTargetProviders = snapshot.inputs.externalTargetProviderCount ?? 0;
  const externalCertifiedProviders = snapshot.inputs.externalCertifiedProviderCount ?? 0;
  const externalMissingProviders = snapshot.inputs.externalMissingProviderCount ?? 0;
  const placeholderScopeCount = snapshot.inputs.placeholderIntegrationScopeCount ?? 0;
  const certificationValue =
    externalTargetProviders === 0
      ? "Not required"
      : `${externalCertifiedProviders}/${externalTargetProviders}`;
  const certificationHint =
    externalTargetProviders === 0
      ? "Storefront-only launch scope or no live-capable external providers selected."
      : externalMissingProviders === 0
        ? "Every live-capable external provider in scope has passed health plus sync/webhook evidence."
        : `${externalMissingProviders} provider(s) still missing certification.${placeholderScopeCount > 0 ? ` ${placeholderScopeCount} placeholder integration(s) remain in scope.` : ""}`;
  const certificationTone =
    externalTargetProviders === 0 || externalMissingProviders === 0 ? "success" : "danger";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Go-live Command Center</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Operational launch orchestration for restaurants, cafés, catering, bakeries, meal prep, ghost
            kitchens, and multi-location brands.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/dashboard/go-live/projects/${primary.id}`}>Open launch project</Link>
          </Button>
        </div>
      </div>

      <GoLiveKpiGrid
        tiles={{
          readiness: snapshot.validation.readiness.score,
          criticalBlockers,
          riskLevel: snapshot.validation.riskLevel,
          integrationCertification: certificationValue,
          integrationCertificationHint: certificationHint,
          integrationCertificationTone: certificationTone,
          simulationStatus: latestSimulation?.result ?? "Not run",
          launchEta,
          unresolvedIncidents: incidentCount,
          approvalsPending: Math.max(
            0,
            snapshot.inputs.approvalsRequired - snapshot.inputs.approvalsCount,
          ),
        }}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">
                  {project.brand?.name ?? "Workspace"}
                  {project.location?.name ? ` · ${project.location.name}` : ""}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <LaunchStatusBadge status={project.status} />
                  <RiskBadge level={project.riskLevel} />
                </div>
              </div>
              <CardDescription>
                {project.businessType ? `${project.businessType} · ` : ""}
                {LAUNCH_MODE_LABEL[project.launchMode]}
                {project.launchDate ? ` · Launch ${project.launchDate.toISOString().slice(0, 10)}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center justify-between">
                <span className="text-muted-foreground">Readiness</span>
                <strong>{project.readinessScore}%</strong>
              </div>
              <div className="flex flex-wrap items-center justify-between">
                <span className="text-muted-foreground">Owner</span>
                <span>{project.goLiveOwner?.fullName ?? project.goLiveOwner?.email ?? "—"}</span>
              </div>
              <div className="pt-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/go-live/projects/${project.id}`}>Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add another launch project</CardTitle>
          <CardDescription>Phased rollout? Multi-location? Multi-brand? Spin up another project.</CardDescription>
        </CardHeader>
        <CardContent>
          {canCreate ? <CreateProjectForm brands={brands} locations={locations} /> : null}
        </CardContent>
      </Card>

      {isSuper ? (
        <p className="text-[11px] text-muted-foreground">
          Superadmin session — override controls are visible on individual project pages.
        </p>
      ) : null}
    </div>
  );
}
