import type {
  BusinessType,
  GoLiveApprovalType,
  GoLiveBlockerSeverity,
  GoLiveChecklistStatus,
  GoLiveIncidentCategory,
  GoLiveIncidentSeverity,
  GoLiveIncidentStatus,
  GoLiveLaunchMode,
  GoLiveLaunchStage,
  GoLiveLaunchStatus,
  GoLiveProject,
  GoLiveSimulationType,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { LIVE_CAPABLE_INTEGRATION_PROVIDERS } from "@/lib/channels/channel-registry";
import { summariseImplementationExternalCertification } from "@/lib/implementation/external-integration-certification";
import { getWorkspaceSsoAdminView } from "@/lib/enterprise/workspace-sso-admin-service";
import { listChannelPilotLiveProofSlices } from "@/services/developer/integration-health-service";
import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import { printedLabelListWhereForOwner } from "@/lib/scope/workspace-printed-label-scope";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import { productMappingListWhereForOwner } from "@/lib/scope/workspace-product-mapping-scope";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  deliveryRouteListWhereForOwner,
  goLiveProjectByIdWhereForOwner,
  goLiveProjectListWhereForOwner,
  integrationConnectionListWhereForOwner,
  menuListWhereForOwner,
  packingTaskListWhereForOwner,
  packingVerificationSessionListWhereForOwner,
  productionBatchListWhereForOwner,
  productListWhereForOwner,
  staffMemberListWhereForOwner,
  storefrontDomainListWhereForOwner,
  storefrontSettingsListWhereForOwner,
  usageEventListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { templatesFor } from "@/lib/go-live/checklist-templates";
import { buildGoLiveAuditSnapshot } from "@/lib/go-live/audit-snapshot";
import { detectBlockers } from "@/lib/go-live/blocker-engine";
import { calculateReadiness, type ReadinessInputs } from "@/lib/go-live/readiness-engine";
import { riskFromInputs } from "@/lib/go-live/launch-score";
import { rollbackPlansForLaunchMode } from "@/lib/go-live/rollback-engine";
import { runSimulation } from "@/lib/go-live/simulation-engine";
import { validateLaunch } from "@/lib/go-live/launch-validator";

const REQUIRED_APPROVALS: GoLiveApprovalType[] = [
  "OPERATIONS",
  "KITCHEN",
  "FINANCE",
  "INTEGRATIONS",
  "OWNERSHIP",
];

async function recordEvent(input: {
  projectId: string;
  eventType: string;
  performedById?: string | null;
  summary?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await prisma.goLiveProjectEvent.create({
    data: {
      projectId: input.projectId,
      eventType: input.eventType,
      performedById: input.performedById ?? undefined,
      summary: input.summary ?? undefined,
      metadataJson: input.metadata
        ? (input.metadata as unknown as Prisma.InputJsonValue)
        : undefined,
    },
  });
}

export async function loadReadinessInputs(
  userId: string,
  projectId: string | null,
): Promise<ReadinessInputs> {
  const [
    orderScope,
    menuScope,
    productScope,
    integrationScope,
    mappingScope,
    productionBatchScope,
    packingTaskScope,
    packingVerificationScope,
    deliveryRouteScope,
    staffScope,
    storefrontDomainScope,
    storefrontScope,
    usageEventScope,
    customerScope,
    printedLabelScope,
    projectMetaWhere,
  ] = await Promise.all([
    orderListWhereForOwner(userId),
    menuListWhereForOwner(userId),
    productListWhereForOwner(userId),
    integrationConnectionListWhereForOwner(userId),
    productMappingListWhereForOwner(userId),
    productionBatchListWhereForOwner(userId),
    packingTaskListWhereForOwner(userId),
    packingVerificationSessionListWhereForOwner(userId),
    deliveryRouteListWhereForOwner(userId),
    staffMemberListWhereForOwner(userId),
    storefrontDomainListWhereForOwner(userId),
    storefrontSettingsListWhereForOwner(userId),
    usageEventListWhereForOwner(userId),
    kitchenCustomerListWhereForOwner(userId),
    printedLabelListWhereForOwner(userId),
    projectId ? goLiveProjectByIdWhereForOwner(userId, projectId) : Promise.resolve(null),
  ]);
  const [
    settings,
    menu,
    products,
    customers,
    mappings,
    unmapped,
    connectionRows,
    orders,
    productionBatches,
    packingTasks,
    packingVerifications,
    labelsPrinted,
    deliveryRoutes,
    staff,
    billing,
    backups,
    storefrontDomain,
    storefrontPublish,
    usageEventCount,
    approvalsCount,
    projectMeta,
  ] = await Promise.all([
    prisma.kitchenSettings.findUnique({ where: { userId } }),
    prisma.menu.findFirst({ where: menuScope }),
    prisma.product.count({ where: productScope }),
    prisma.kitchenCustomer.count({ where: customerScope }),
    prisma.productMapping.count({
      where: { AND: [mappingScope, { status: { in: ["APPROVED", "CONFIRMED"] } }] },
    }),
    prisma.productMapping.count({
      where: { AND: [mappingScope, { status: { in: ["UNMAPPED", "NEEDS_REVIEW", "CONFLICT"] } }] },
    }),
    prisma.integrationConnection.findMany({
      where: {
        AND: [
          integrationScope,
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
    prisma.order.count({ where: orderScope }),
    prisma.productionBatch.count({ where: productionBatchScope }),
    prisma.packingTask.count({ where: packingTaskScope }),
    prisma.packingVerificationSession.count({ where: packingVerificationScope }),
    prisma.printedLabel.count({ where: printedLabelScope }),
    prisma.deliveryRoute.count({ where: deliveryRouteScope }),
    prisma.staffMember.count({ where: { AND: [staffScope, { active: true }] } }),
    prisma.subscription.findUnique({ where: { userId } }),
    Promise.resolve(0),
    prisma.storefrontDomain.count({ where: storefrontDomainScope }),
    prisma.storefrontMenuPublish.count({ where: { storefront: storefrontScope } }),
    prisma.usageEvent.count({ where: usageEventScope }),
    projectId
      ? prisma.goLiveApproval.count({ where: { projectId } })
      : Promise.resolve(0),
    projectMetaWhere
      ? prisma.goLiveProject.findFirst({
          where: projectMetaWhere,
          select: { metadataJson: true },
        })
      : Promise.resolve(null),
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

  const projectMetadata = projectMeta?.metadataJson;
  const plannedIntegrationKeys =
    projectMetadata &&
    typeof projectMetadata === "object" &&
    !Array.isArray(projectMetadata) &&
    Array.isArray((projectMetadata as { integrations?: unknown }).integrations)
      ? (projectMetadata as { integrations: unknown[] }).integrations.filter(
          (value): value is string => typeof value === "string",
        )
      : [];

  const certification = summariseImplementationExternalCertification({
    plannedIntegrationKeys,
    connections: connectionRows.map((connection) => ({
      provider: connection.provider,
      status: connection.status,
      lastSyncAt: connection.lastSyncAt,
      lastHealthStatus: connection.healthChecks[0]?.status ?? null,
      processedWebhookCount:
        processedWebhookCountByConnection.get(connection.id) ?? 0,
    })),
  });

  const connections = connectionRows.filter((connection) => connection.status === "CONNECTED").length;
  const brokenConnections = connectionRows.filter(
    (connection) => connection.status === "ERROR" || connection.status === "NEEDS_AUTH",
  ).length;

  const hasBusinessProfile = Boolean(settings?.businessName);
  const hasFulfillmentRules = Boolean(settings?.pickupWindows || settings?.deliveryEnabled);
  const hasBilling = Boolean(billing?.stripeCustomerId || billing?.status === "TRIALING");
  const hasBackup = backups > 0;
  const hasAnalytics = usageEventCount > 0;
  const webhooksHealthy = brokenConnections === 0;
  const storefrontPublished = storefrontDomain > 0 || storefrontPublish > 0;
  const [trainingSnap, staffSnap, billingSnap, workspaceId] = await Promise.all([
    import("@/services/training/training-service").then((m) => m.trainingReadinessSnapshot(userId)),
    import("@/services/staff/staff-readiness-service").then((m) => m.loadStaffReadinessSnapshot(userId)),
    import("@/services/billing/billing-readiness-service").then((m) => m.loadBillingReadinessSnapshot(userId)),
    resolveOwnerWorkspaceId(userId),
  ]);
  const trainingCompletions = trainingSnap.completedAssignments;

  const [ssoView, channelPilotLiveProofSlices] = await Promise.all([
    workspaceId
      ? getWorkspaceSsoAdminView({ workspaceId, ownerUserId: userId })
      : Promise.resolve(null),
    listChannelPilotLiveProofSlices(userId),
  ]);

  return {
    hasBusinessProfile,
    hasFulfillmentRules,
    hasMenu: Boolean(menu),
    productCount: products,
    mappedProductCount: mappings,
    unmappedProductCount: unmapped,
    customerCount: customers,
    connectionsConnected: connections,
    connectionsBroken: brokenConnections,
    testOrderCount: orders,
    productionRuns: productionBatches,
    packingTaskCount: packingTasks,
    packingValidatedCount: packingVerifications,
    labelsPrinted,
    deliveryRoutes,
    staffActive: staff,
    trainingCompletions,
    hasBilling,
    hasBackup,
    hasSupportContact: hasBusinessProfile,
    hasAnalytics,
    storefrontPublished,
    webhooksHealthy,
    approvalsCount,
    approvalsRequired: REQUIRED_APPROVALS.length,
    externalCertificationRequired: certification.certificationCheck.required,
    externalTargetProviderCount: certification.targetProviders.length,
    externalCertifiedProviderCount: certification.certifiedProviders.length,
    externalMissingProviderCount: certification.missingProviders.length,
    externalMissingProviderLabels: certification.missingProviderLabels,
    placeholderIntegrationScopeCount: certification.placeholderLabels.length,
    placeholderIntegrationScopeLabels: certification.placeholderLabels,
    trainingProgramsActive: trainingSnap.activePrograms,
    trainingAssignmentsTotal: trainingSnap.totalAssignments,
    trainingAssignmentsCompleted: trainingSnap.completedAssignments,
    certificationsActive: trainingSnap.activeCertifications,
    certificationsExpiringSoon: trainingSnap.expiringCertifications,
    staffHasOwner: staffSnap.hasOwner,
    staffHasManager: staffSnap.hasManager,
    staffKitchen: staffSnap.kitchenStaff,
    staffPackers: staffSnap.packingStaff,
    staffDrivers: staffSnap.drivers,
    staffShiftsToday: staffSnap.shiftsToday,
    billingStripeConfigured: billingSnap.stripeConfigured,
    billingPlanActive: billingSnap.planActive,
    billingHasCustomer: billingSnap.hasCustomer,
    billingMode: billingSnap.mode,
    billingTrialDaysRemaining: billingSnap.trialDaysRemaining,
    ssoOidcEntitlementEnabled: ssoView?.ssoEntitlementEnabled ?? false,
    ssoPilotConfigured: ssoView?.configured ?? false,
    ssoPilotActive: ssoView?.active ?? false,
    channelPilotLiveProofSlices,
  };
}

export async function listProjects(userId: string) {
  return prisma.goLiveProject.findMany({
    where: await goLiveProjectListWhereForOwner(userId),
    orderBy: [{ updatedAt: "desc" }],
    include: {
      brand: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
      goLiveOwner: { select: { id: true, fullName: true, email: true } },
    },
  });
}

export type ProjectDetailRow = NonNullable<Awaited<ReturnType<typeof getProject>>>;

export async function getProject(userId: string, projectId: string) {
  return prisma.goLiveProject.findFirst({
    where: await goLiveProjectByIdWhereForOwner(userId, projectId),
    include: {
      brand: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
      goLiveOwner: { select: { id: true, fullName: true, email: true } },
      checklistItems: { orderBy: [{ stage: "asc" }, { createdAt: "asc" }] },
      simulations: { orderBy: { startedAt: "desc" }, take: 25 },
      approvals: { include: { approvedBy: { select: { id: true, fullName: true, email: true } } } },
      incidents: { orderBy: { createdAt: "desc" }, take: 50 },
      rollbackPlans: { orderBy: { createdAt: "asc" } },
      events: { orderBy: { createdAt: "desc" }, take: 50, include: { performedBy: { select: { fullName: true, email: true } } } },
    },
  });
}

export type CreateProjectInput = {
  userId: string;
  performedById?: string | null;
  brandId?: string | null;
  locationId?: string | null;
  businessType?: BusinessType | null;
  launchDate?: Date | null;
  launchMode?: GoLiveLaunchMode;
  goLiveOwnerId?: string | null;
  notes?: string | null;
  integrations?: string[];
};

export async function createProject(input: CreateProjectInput): Promise<GoLiveProject> {
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  const project = await prisma.goLiveProject.create({
    data: {
      userId: input.userId,
      workspaceId,
      brandId: input.brandId ?? undefined,
      locationId: input.locationId ?? undefined,
      businessType: input.businessType ?? undefined,
      launchDate: input.launchDate ?? undefined,
      launchMode: input.launchMode ?? "SOFT",
      goLiveOwnerId: input.goLiveOwnerId ?? undefined,
      notes: input.notes ?? undefined,
      metadataJson:
        input.integrations && input.integrations.length > 0
          ? ({ integrations: input.integrations } as unknown as Prisma.InputJsonValue)
          : undefined,
      status: "IN_PROGRESS",
      currentStage: "DISCOVERY",
    },
  });

  const templates = templatesFor(input.businessType ?? null);
  if (templates.length > 0) {
    await prisma.goLiveChecklistItem.createMany({
      data: templates.map((t) => ({
        projectId: project.id,
        stage: t.stage,
        category: t.category,
        key: t.key,
        title: t.title,
        description: t.description,
        actionRoute: t.actionRoute,
        required: t.required,
        autoValidated: t.autoValidated,
        weight: t.weight,
        blockerSeverity: t.blockerSeverity ?? null,
      })),
    });
  }

  const defaults = rollbackPlansForLaunchMode(project.launchMode);
  if (defaults.length > 0) {
    await prisma.goLiveRollbackPlan.createMany({
      data: defaults.map((plan) => ({
        projectId: project.id,
        title: plan.title,
        triggerCondition: plan.triggerCondition,
        rollbackStepsJson: plan.steps as unknown as Prisma.InputJsonValue,
      })),
    });
  }

  await recordEvent({
    projectId: project.id,
    eventType: "PROJECT_CREATED",
    performedById: input.performedById ?? null,
    summary: "Go-live project created",
    metadata: {
      integrations: input.integrations ?? [],
    },
  });

  return project;
}

export async function refreshAutoValidation(
  userId: string,
  projectId: string,
): Promise<void> {
  const projectWhere = await goLiveProjectByIdWhereForOwner(userId, projectId);
  const [project, inputs, checklist] = await Promise.all([
    prisma.goLiveProject.findFirst({
      where: projectWhere,
      select: { id: true, businessType: true, launchMode: true, status: true },
    }),
    loadReadinessInputs(userId, projectId),
    prisma.goLiveChecklistItem.findMany({
      where: { projectId, autoValidated: true },
    }),
  ]);
  if (!project) return;

  const SIGNAL: Record<string, boolean> = {
    business_profile: inputs.hasBusinessProfile,
    fulfillment_rules: inputs.hasFulfillmentRules,
    menu_setup: inputs.hasMenu,
    products_present: inputs.productCount > 0,
    product_mapping: inputs.unmappedProductCount === 0,
    customers_imported: inputs.customerCount > 0,
    channels_connected: inputs.connectionsConnected > 0,
    webhooks_healthy: inputs.webhooksHealthy,
    test_order: inputs.testOrderCount > 0,
    production_runs: inputs.productionRuns > 0,
    packing_validated: inputs.packingValidatedCount > 0,
    labels_printed: inputs.labelsPrinted > 0,
    delivery_routes: inputs.deliveryRoutes > 0,
    staff_active: inputs.staffActive > 0,
    staff_trained: inputs.trainingCompletions > 0,
    billing_configured: inputs.hasBilling,
    analytics_firing: inputs.hasAnalytics,
    storefront_published: inputs.storefrontPublished,
  };

  await Promise.all(
    checklist.flatMap((item) => {
      const satisfied = SIGNAL[item.key];
      if (satisfied === undefined) return [];
      const target: GoLiveChecklistStatus = satisfied
        ? "DONE"
        : item.required
          ? "BLOCKED"
          : "TODO";
      if (item.status === target) return [];
      return [
        prisma.goLiveChecklistItem.update({
          where: { id: item.id },
          data: { status: target, validatedAt: satisfied ? new Date() : null },
        }),
      ];
    }),
  );

  const report = validateLaunch(inputs, project.businessType ?? null, project.status);
  await prisma.$transaction(async (tx) => {
    await tx.goLiveProject.update({
      where: { id: projectId },
      data: {
        readinessScore: report.readiness.score,
        riskLevel: report.riskLevel,
        status: report.recommendedStatus,
      },
    });
    await tx.goLiveProjectEvent.create({
      data: {
        projectId,
        eventType: "AUTO_VALIDATION",
        summary: `Readiness ${report.readiness.score}% / risk ${report.riskLevel}`,
        metadataJson: {
          blockerCount: report.blockers.length,
          criticalBlockers: report.blockers.filter((b) => b.severity === "CRITICAL").length,
        } as Prisma.InputJsonValue,
      },
    });
  });
}

export type ChecklistUpdateInput = {
  userId: string;
  performedById?: string | null;
  projectId: string;
  itemId: string;
  status?: GoLiveChecklistStatus;
  assignedToId?: string | null;
  dueAt?: Date | null;
  blockerSeverity?: GoLiveBlockerSeverity | null;
};

export async function updateChecklistItem(input: ChecklistUpdateInput) {
  const projectScope = await goLiveProjectListWhereForOwner(input.userId);
  const item = await prisma.goLiveChecklistItem.findFirst({
    where: {
      id: input.itemId,
      projectId: input.projectId,
      project: projectScope,
    },
  });
  if (!item) return { ok: false as const, error: "Checklist item not found" };

  const data: Prisma.GoLiveChecklistItemUpdateInput = {};
  if (input.status !== undefined) {
    data.status = input.status;
    if (input.status === "DONE") {
      data.validatedAt = new Date();
      data.validatedBy = input.performedById ? { connect: { id: input.performedById } } : undefined;
    }
  }
  if (input.assignedToId !== undefined) {
    data.assignedTo = input.assignedToId
      ? { connect: { id: input.assignedToId } }
      : { disconnect: true };
  }
  if (input.dueAt !== undefined) data.dueAt = input.dueAt;
  if (input.blockerSeverity !== undefined) data.blockerSeverity = input.blockerSeverity;

  await prisma.$transaction(async (tx) => {
    await tx.goLiveChecklistItem.update({ where: { id: item.id }, data });
    await tx.goLiveProjectEvent.create({
      data: {
        projectId: input.projectId,
        eventType: "CHECKLIST_UPDATED",
        performedById: input.performedById ?? undefined,
        summary: `${item.title} → ${input.status ?? item.status}`,
      },
    });
  });
  return { ok: true as const };
}

export type RunSimulationInput = {
  userId: string;
  projectId: string;
  performedById?: string | null;
  simulationType: GoLiveSimulationType;
};

export async function runSimulationForProject(input: RunSimulationInput) {
  const projectWherePromise = goLiveProjectByIdWhereForOwner(input.userId, input.projectId);
  const [projectWhere, inputs] = await Promise.all([
    projectWherePromise,
    loadReadinessInputs(input.userId, input.projectId),
  ]);
  const project = await prisma.goLiveProject.findFirst({
    where: projectWhere,
    select: { id: true, businessType: true },
  });
  if (!project) return { ok: false as const, error: "Project not found" };
  const start = Date.now();
  const report = runSimulation(input.simulationType, inputs, project.businessType ?? null);
  const durationMs = Date.now() - start;
  const row = await prisma.$transaction(async (tx) => {
    const simulation = await tx.goLiveSimulation.create({
      data: {
        projectId: input.projectId,
        simulationType: input.simulationType,
        result: report.result,
        startedAt: new Date(start),
        completedAt: new Date(),
        durationMs,
        outputJson: report as unknown as Prisma.InputJsonValue,
        triggeredById: input.performedById ?? undefined,
      },
    });
    await tx.goLiveProjectEvent.create({
      data: {
        projectId: input.projectId,
        eventType: "SIMULATION_RAN",
        performedById: input.performedById ?? undefined,
        summary: `${input.simulationType} → ${report.result}`,
        metadataJson: { simulationId: simulation.id, findings: report.findings.length } as Prisma.InputJsonValue,
      },
    });
    return simulation;
  });
  return { ok: true as const, simulation: row, report };
}

export type ApprovalInput = {
  userId: string;
  projectId: string;
  performedById: string;
  approvalType: GoLiveApprovalType;
  notes?: string | null;
};

export async function recordApproval(input: ApprovalInput) {
  const exists = await prisma.goLiveProject.findFirst({
    where: await goLiveProjectByIdWhereForOwner(input.userId, input.projectId),
    select: { id: true, businessType: true, status: true },
  });
  if (!exists) return { ok: false as const, error: "Project not found" };
  await prisma.goLiveApproval.upsert({
    where: { projectId_approvalType: { projectId: input.projectId, approvalType: input.approvalType } },
    update: {
      approvedById: input.performedById,
      approvedAt: new Date(),
      notes: input.notes ?? null,
    },
    create: {
      projectId: input.projectId,
      approvalType: input.approvalType,
      approvedById: input.performedById,
      notes: input.notes ?? null,
    },
  });
  const inputs = await loadReadinessInputs(input.userId, input.projectId);
  const report = validateLaunch(inputs, exists.businessType ?? null, exists.status);
  await recordEvent({
    projectId: input.projectId,
    eventType: "APPROVAL_RECORDED",
    performedById: input.performedById,
    summary: `${input.approvalType} approval recorded`,
    metadata: {
      approvalType: input.approvalType,
      auditSnapshot: buildGoLiveAuditSnapshot(inputs, report),
    },
  });
  await refreshAutoValidation(input.userId, input.projectId);
  return { ok: true as const };
}

export type IncidentInput = {
  userId: string;
  projectId: string;
  performedById?: string | null;
  severity: GoLiveIncidentSeverity;
  category: GoLiveIncidentCategory;
  title: string;
  description: string;
};

export async function createIncident(input: IncidentInput) {
  const exists = await prisma.goLiveProject.findFirst({
    where: await goLiveProjectByIdWhereForOwner(input.userId, input.projectId),
    select: { id: true },
  });
  if (!exists) return { ok: false as const, error: "Project not found" };
  const incident = await prisma.$transaction(async (tx) => {
    const row = await tx.goLiveIncident.create({
      data: {
        projectId: input.projectId,
        severity: input.severity,
        category: input.category,
        title: input.title,
        description: input.description,
        reportedById: input.performedById ?? undefined,
      },
    });
    await tx.goLiveProjectEvent.create({
      data: {
        projectId: input.projectId,
        eventType: "INCIDENT_OPENED",
        performedById: input.performedById ?? undefined,
        summary: `[${row.severity}] ${row.title}`,
        metadataJson: { incidentId: row.id, category: row.category } as Prisma.InputJsonValue,
      },
    });
    return row;
  });
  return { ok: true as const, incident };
}

export type IncidentUpdateInput = {
  userId: string;
  performedById?: string | null;
  projectId: string;
  incidentId: string;
  status?: GoLiveIncidentStatus;
  resolution?: string | null;
  assignedToId?: string | null;
};

export async function updateIncident(input: IncidentUpdateInput) {
  const projectScope = await goLiveProjectListWhereForOwner(input.userId);
  const existing = await prisma.goLiveIncident.findFirst({
    where: {
      id: input.incidentId,
      projectId: input.projectId,
      project: projectScope,
    },
  });
  if (!existing) return { ok: false as const, error: "Incident not found" };
  await prisma.$transaction(async (tx) => {
    await tx.goLiveIncident.update({
      where: { id: existing.id },
      data: {
        status: input.status ?? undefined,
        resolution: input.resolution ?? undefined,
        assignedToId: input.assignedToId === undefined ? undefined : input.assignedToId,
        acknowledgedAt:
          input.status === "ACKNOWLEDGED" || input.status === "IN_PROGRESS"
            ? existing.acknowledgedAt ?? new Date()
            : existing.acknowledgedAt,
        resolvedAt:
          input.status === "RESOLVED" || input.status === "CLOSED"
            ? existing.resolvedAt ?? new Date()
            : existing.resolvedAt,
      },
    });
    await tx.goLiveProjectEvent.create({
      data: {
        projectId: input.projectId,
        eventType: "INCIDENT_UPDATED",
        performedById: input.performedById ?? undefined,
        summary: `${existing.title} → ${input.status ?? existing.status}`,
      },
    });
  });
  return { ok: true as const };
}

export type RollbackPlanInput = {
  userId: string;
  projectId: string;
  performedById?: string | null;
  title: string;
  triggerCondition: string;
  steps: { order: number; title: string; description: string; module: string }[];
  ownerId?: string | null;
};

export async function createRollbackPlan(input: RollbackPlanInput) {
  const exists = await prisma.goLiveProject.findFirst({
    where: await goLiveProjectByIdWhereForOwner(input.userId, input.projectId),
    select: { id: true },
  });
  if (!exists) return { ok: false as const, error: "Project not found" };
  const plan = await prisma.$transaction(async (tx) => {
    const row = await tx.goLiveRollbackPlan.create({
      data: {
        projectId: input.projectId,
        title: input.title,
        triggerCondition: input.triggerCondition,
        rollbackStepsJson: input.steps as unknown as Prisma.InputJsonValue,
        ownerId: input.ownerId ?? undefined,
      },
    });
    await tx.goLiveProjectEvent.create({
      data: {
        projectId: input.projectId,
        eventType: "ROLLBACK_PLAN_CREATED",
        performedById: input.performedById ?? undefined,
        summary: input.title,
      },
    });
    return row;
  });
  return { ok: true as const, plan };
}

export type StatusTransitionInput = {
  userId: string;
  projectId: string;
  performedById?: string | null;
  target: GoLiveLaunchStatus;
  override?: boolean;
};

export async function transitionStatus(input: StatusTransitionInput) {
  const project = await prisma.goLiveProject.findFirst({
    where: await goLiveProjectByIdWhereForOwner(input.userId, input.projectId),
    select: { id: true, businessType: true, status: true },
  });
  if (!project) return { ok: false as const, error: "Project not found" };

  const inputs = await loadReadinessInputs(input.userId, input.projectId);
  const report = validateLaunch(inputs, project.businessType ?? null, project.status);

  if (
    (input.target === "APPROVED" || input.target === "LIVE") &&
    !input.override &&
    (!report.canApprove || report.blockers.some((b) => b.severity === "CRITICAL"))
  ) {
    return {
      ok: false as const,
      error:
        report.reasons.length > 0
          ? report.reasons.join(" ")
          : "Critical blockers or missing approvals prevent this transition.",
      report,
    };
  }

  const data: Prisma.GoLiveProjectUpdateInput = {
    status: input.target,
    readinessScore: report.readiness.score,
    riskLevel: report.riskLevel,
  };
  if (input.target === "LIVE" && !project.status.includes("LIVE")) {
    data.liveAt = new Date();
    data.monitoringUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    data.currentStage = "POST_LAUNCH_MONITORING";
  }
  if (input.target === "ROLLBACK_MODE") {
    data.lockedAt = new Date();
  }

  await prisma.$transaction(async (tx) => {
    await tx.goLiveProject.update({ where: { id: input.projectId }, data });
    await tx.goLiveProjectEvent.create({
      data: {
        projectId: input.projectId,
        eventType: "STATUS_TRANSITION",
        performedById: input.performedById ?? undefined,
        summary: `${project.status} → ${input.target}`,
        metadataJson: {
          fromStatus: project.status,
          toStatus: input.target,
          override: input.override === true,
          auditSnapshot: buildGoLiveAuditSnapshot(inputs, report),
        } as Prisma.InputJsonValue,
      },
    });
  });

  return { ok: true as const, report };
}

export type WorkbenchSnapshot = {
  inputs: ReadinessInputs;
  validation: ReturnType<typeof validateLaunch>;
};

export async function workbenchSnapshot(
  userId: string,
  projectId: string | null,
  businessType: BusinessType | null,
  currentStatus: GoLiveLaunchStatus = "NOT_STARTED",
): Promise<WorkbenchSnapshot> {
  const inputs = await loadReadinessInputs(userId, projectId);
  const validation = validateLaunch(inputs, businessType ?? null, currentStatus);
  return { inputs, validation };
}

export { detectBlockers, calculateReadiness, riskFromInputs, REQUIRED_APPROVALS };
