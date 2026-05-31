import type { Prisma } from "@prisma/client";

import { summariseChecks } from "@/lib/implementation/go-live-readiness";
import { summariseImplementationExternalCertification } from "@/lib/implementation/external-integration-certification";
import type {
  ReadinessCheckResult,
  ReadinessSnapshot,
} from "@/lib/implementation/implementation-types";
import {
  integrationConnectionListWhereForOwner,
  locationListWhereForOwner,
  menuListWhereForOwnerAnd,
  productListWhereForOwnerAnd,
  resolveOwnerScopedWhere,
  staffMemberListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { importJobListWhereForOwner } from "@/lib/scope/workspace-import-export-scope";
import { providerCountsTowardLiveReadiness } from "@/lib/channels/channel-registry";
import { prisma } from "@/lib/prisma";

import { recordEvent } from "@/services/implementation/implementation-service";

async function checkWorkspaceSetup(userId: string): Promise<ReadinessCheckResult[]> {
  const settings = await prisma.kitchenSettings.findUnique({ where: { userId } });
  const hasName = !!(settings?.businessName && settings.businessName.trim().length > 0);
  const hasBusinessType = !!settings?.businessType;

  return [
    {
      category: "workspace_setup",
      title: "Business name set",
      required: true,
      status: hasName ? "PASS" : "FAIL",
      explanation: hasName
        ? "Workspace business name is configured."
        : "Set a business name in Settings before going live.",
      actionRoute: "/dashboard/settings",
    },
    {
      category: "business_mode",
      title: "Business mode selected",
      required: true,
      status: hasBusinessType ? "PASS" : "FAIL",
      explanation: hasBusinessType
        ? `Business mode: ${settings?.businessType}.`
        : "Select a business mode in Settings.",
      actionRoute: "/dashboard/settings",
    },
  ];
}

async function checkBrandsLocations(userId: string): Promise<ReadinessCheckResult[]> {
  const locationScope = await locationListWhereForOwner(userId);
  const [locations, workspace] = await Promise.all([
    prisma.location.count({ where: { AND: [locationScope, { status: "ACTIVE" }] } }),
    prisma.workspace.findFirst({
      where: { ownerUserId: userId },
      select: { id: true },
    }),
  ]);
  const brandsCount = workspace
    ? await prisma.brand.count({ where: { workspaceId: workspace.id, lifecycleStatus: "ACTIVE" } })
    : 0;

  return [
    {
      category: "locations",
      title: "At least one active location",
      required: true,
      status: locations > 0 ? "PASS" : "FAIL",
      explanation: locations > 0
        ? `${locations} active location${locations === 1 ? "" : "s"}.`
        : "Add at least one location.",
      actionRoute: "/dashboard/locations",
      resultJson: { count: locations },
    },
    {
      category: "brands",
      title: "At least one active brand",
      required: false,
      status: brandsCount > 0 ? "PASS" : "WARN",
      explanation: brandsCount > 0
        ? `${brandsCount} active brand${brandsCount === 1 ? "" : "s"}.`
        : "No brands configured — needed only if running multiple concepts.",
      actionRoute: "/dashboard/brands",
      resultJson: { count: brandsCount },
    },
  ];
}

async function checkMenusItems(userId: string): Promise<ReadinessCheckResult[]> {
  const [menuWhere, productWhere] = await Promise.all([
    menuListWhereForOwnerAnd(userId, { active: true }),
    productListWhereForOwnerAnd(userId, { active: true }),
  ]);
  const [menus, productCount] = await Promise.all([
    prisma.menu.count({ where: menuWhere }),
    prisma.product.count({ where: productWhere }),
  ]);

  return [
    {
      category: "menus_items",
      title: "At least one active menu",
      required: true,
      status: menus > 0 ? "PASS" : "FAIL",
      explanation: menus > 0
        ? `${menus} active menu${menus === 1 ? "" : "s"}.`
        : "Publish at least one active menu.",
      actionRoute: "/dashboard/menus",
      resultJson: { count: menus },
    },
    {
      category: "menus_items",
      title: "Menu has products",
      required: true,
      status: productCount > 0 ? "PASS" : "FAIL",
      explanation: productCount > 0
        ? `${productCount} active product${productCount === 1 ? "" : "s"}.`
        : "Add at least one active product to a menu.",
      actionRoute: "/dashboard/menus",
      resultJson: { count: productCount },
    },
  ];
}

async function checkStaff(userId: string): Promise<ReadinessCheckResult[]> {
  const staffScope = await staffMemberListWhereForOwner(userId);
  const staff = await prisma.staffMember.count({ where: { AND: [staffScope, { active: true }] } });
  return [
    {
      category: "staff",
      title: "At least one active staff member",
      required: true,
      status: staff > 0 ? "PASS" : "FAIL",
      explanation: staff > 0
        ? `${staff} active staff member${staff === 1 ? "" : "s"}.`
        : "Add at least one active staff member.",
      actionRoute: "/dashboard/staff",
      resultJson: { count: staff },
    },
  ];
}

async function loadPlannedIntegrationKeys(projectId: string): Promise<string[]> {
  const createdEvent = await prisma.implementationEvent.findFirst({
    where: { projectId, eventType: "project_created" },
    orderBy: { createdAt: "asc" },
    select: { metadataJson: true },
  });

  const metadata = createdEvent?.metadataJson;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return [];

  const integrations = (metadata as { integrations?: unknown }).integrations;
  if (!Array.isArray(integrations)) return [];

  return integrations.filter((value): value is string => typeof value === "string");
}

async function checkIntegrations(userId: string, projectId: string): Promise<ReadinessCheckResult[]> {
  const integrationScope = await integrationConnectionListWhereForOwner(userId);
  const [plannedIntegrationKeys, connections] = await Promise.all([
    loadPlannedIntegrationKeys(projectId),
    prisma.integrationConnection.findMany({
      where: integrationScope,
      select: {
        id: true,
        provider: true,
        name: true,
        status: true,
        lastSyncAt: true,
        healthChecks: {
          orderBy: { checkedAt: "desc" },
          take: 1,
          select: { status: true },
        },
      },
    }),
  ]);

  const liveCapableConnections = connections.filter((connection) =>
    providerCountsTowardLiveReadiness(connection.provider),
  );

  const processedWebhookCounts =
    liveCapableConnections.length === 0
      ? []
      : await prisma.webhookEvent.groupBy({
          by: ["connectionId"],
          where: {
            connectionId: { in: liveCapableConnections.map((connection) => connection.id) },
            processed: true,
          },
          _count: { _all: true },
        });

  const processedWebhookCountByConnection = new Map(
    processedWebhookCounts.map((row) => [row.connectionId, row._count._all] as const),
  );

  const certification = summariseImplementationExternalCertification({
    plannedIntegrationKeys,
    connections: liveCapableConnections.map((connection) => ({
      provider: connection.provider,
      status: connection.status,
      lastSyncAt: connection.lastSyncAt,
      lastHealthStatus: connection.healthChecks[0]?.status ?? null,
      processedWebhookCount:
        processedWebhookCountByConnection.get(connection.id) ?? 0,
    })),
  });

  if (liveCapableConnections.length === 0) {
    return [
      certification.certificationCheck,
      ...(certification.placeholderCheck ? [certification.placeholderCheck] : []),
      {
        category: "sales_channels",
        title: "Integrations healthy",
        required: false,
        status: "WARN",
        explanation:
          "No live-capable sales-channel integrations configured. Optional if OS Kitchen Storefront is the only launch channel.",
        actionRoute: "/dashboard/integrations",
        resultJson: { count: 0, liveCapableOnly: true },
      },
    ];
  }

  const errored = liveCapableConnections.filter((c) => c.status === "ERROR");
  const needsAuth = liveCapableConnections.filter((c) => c.status === "NEEDS_AUTH");
  const connected = liveCapableConnections.filter((c) => c.status === "CONNECTED");

  const status = errored.length > 0 ? "FAIL" : needsAuth.length > 0 ? "WARN" : "PASS";
  return [
    certification.certificationCheck,
    ...(certification.placeholderCheck ? [certification.placeholderCheck] : []),
    {
      category: "sales_channels",
      title: "Integrations healthy",
      required: false,
      status,
      explanation: `${connected.length} live-capable connected, ${needsAuth.length} need auth, ${errored.length} in error.`,
      actionRoute: "/dashboard/integrations",
      resultJson: {
        total: liveCapableConnections.length,
        connected: connected.length,
        needsAuth: needsAuth.length,
        errored: errored.length,
        liveCapableOnly: true,
      },
    },
  ];
}

async function checkImports(userId: string): Promise<ReadinessCheckResult[]> {
  const importScope = await importJobListWhereForOwner(userId);
  const failing = await prisma.importJob.count({
    where: { AND: [importScope, { status: "FAILED" }] },
  });
  return [
    {
      category: "imports",
      title: "No failing imports",
      required: false,
      status: failing > 0 ? "WARN" : "PASS",
      explanation: failing > 0
        ? `${failing} import job(s) marked FAILED — review the Import Center.`
        : "No failing imports.",
      actionRoute: "/dashboard/import-center",
      resultJson: { failing },
    },
  ];
}

async function checkReports(userId: string): Promise<ReadinessCheckResult[]> {
  const reportScope = await resolveOwnerScopedWhere(userId);
  const reports = await prisma.savedReport.count({ where: reportScope });
  return [
    {
      category: "reports",
      title: "Saved report packs available",
      required: false,
      status: reports > 0 ? "PASS" : "WARN",
      explanation: reports > 0
        ? `${reports} saved report${reports === 1 ? "" : "s"}.`
        : "No saved report packs yet — recommended for ops review.",
      actionRoute: "/dashboard/reports",
      resultJson: { count: reports },
    },
  ];
}

async function checkRequiredChecklist(projectId: string, userId: string): Promise<ReadinessCheckResult[]> {
  const items = await prisma.implementationChecklistItem.findMany({
    where: { projectId, project: { userId }, requiredForGoLive: true },
    select: { id: true, title: true, status: true },
  });
  const failing = items.filter((i) => i.status !== "DONE" && i.status !== "SKIPPED");
  return [
    {
      category: "billing_settings",
      title: "Required checklist items completed",
      required: true,
      status: failing.length === 0 ? "PASS" : "FAIL",
      explanation:
        failing.length === 0
          ? `All ${items.length} required checklist items are complete.`
          : `${failing.length} required item(s) still open: ${failing
              .slice(0, 3)
              .map((i) => i.title)
              .join("; ")}${failing.length > 3 ? "…" : ""}`,
      actionRoute: "/dashboard/implementation",
      resultJson: { total: items.length, failing: failing.length },
    },
  ];
}

export async function runReadinessChecks(params: {
  userId: string;
  projectId: string;
  performedBy?: string | null;
}): Promise<ReadinessSnapshot> {
  const project = await prisma.implementationProject.findFirst({
    where: { id: params.projectId, userId: params.userId },
  });
  if (!project) throw new Error("Project not found");

  const groups = await Promise.all([
    checkWorkspaceSetup(params.userId),
    checkBrandsLocations(params.userId),
    checkMenusItems(params.userId),
    checkStaff(params.userId),
    checkIntegrations(params.userId, project.id),
    checkImports(params.userId),
    checkReports(params.userId),
    checkRequiredChecklist(project.id, params.userId),
  ]);
  const checks = groups.flat();
  const snapshot = summariseChecks(checks);

  await prisma.$transaction(async (tx) => {
    for (const check of checks) {
      await tx.goLiveReadinessCheck.upsert({
        where: {
          projectId_category_title: {
            projectId: project.id,
            category: check.category,
            title: check.title,
          },
        },
        update: {
          status: check.status,
          required: check.required,
          actionRoute: check.actionRoute ?? null,
          explanation: check.explanation,
          resultJson: (check.resultJson ?? undefined) as Prisma.InputJsonValue | undefined,
          checkedAt: new Date(),
        },
        create: {
          projectId: project.id,
          category: check.category,
          title: check.title,
          status: check.status,
          required: check.required,
          actionRoute: check.actionRoute ?? null,
          explanation: check.explanation,
          resultJson: (check.resultJson ?? undefined) as Prisma.InputJsonValue | undefined,
          checkedAt: new Date(),
        },
      });
    }

    await tx.implementationProject.update({
      where: { id: project.id },
      data: {
        readinessScore: snapshot.score,
        readinessSnapshotJson: snapshot as unknown as object,
      },
    });
  });

  await recordEvent({
    projectId: project.id,
    eventType: "readiness_run",
    performedBy: params.performedBy ?? null,
    summary: `Readiness ${snapshot.score} (${snapshot.band})`,
    metadata: {
      score: snapshot.score,
      band: snapshot.band,
      blockers: snapshot.blockers,
    },
  });

  return snapshot;
}

export async function getLatestReadiness(params: {
  userId: string;
  projectId: string;
}): Promise<ReadinessSnapshot | null> {
  const project = await prisma.implementationProject.findFirst({
    where: { id: params.projectId, userId: params.userId },
    select: { readinessSnapshotJson: true },
  });
  if (!project) return null;
  if (!project.readinessSnapshotJson) return null;
  return project.readinessSnapshotJson as unknown as ReadinessSnapshot;
}
