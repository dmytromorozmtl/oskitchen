import { Prisma } from "@prisma/client";
import { endOfWeek, startOfWeek, subDays } from "date-fns";

import { PARTNER_IMPLEMENTATION_STAGE_LABEL } from "@/lib/partner/partner-status";
import { getAccessiblePartnerAccountIds } from "@/lib/partner/partner-permissions";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

import { listPartnerClientsForAccounts } from "@/services/partner/partner-client-service";
import { IMPLEMENTATION_PIPELINE_ORDER } from "@/services/partner/partner-implementation-service";
import { aggregatePartnerRevenueByType } from "@/services/partner/partner-revenue-service";
import { listOpenPartnerTickets } from "@/services/partner/partner-support-service";

export type PartnerClientRowSerialized = {
  id: string;
  partnerAccountId: string;
  businessName: string;
  clientEmail: string;
  clientName: string;
  status: string;
  implementationStage: string;
  implementationStageLabel: string;
  onboardingStatusLabel: string | null;
  workspaceActive: boolean | null;
  launchReadinessPct: number | null;
  assignedManagerName: string | null;
  assignedManagerEmail: string | null;
  internalNotes: string | null;
  partnerTags: unknown;
  workspaceName: string | null;
  healthScore: number | null;
  mrrCents: number | null;
  expansionPotential: number | null;
  supportTier: string;
  launchDate: string | null;
  lastActivityAt: string | null;
  integrationSummary: string | null;
};

export type PartnerCommandCenterSerialized = {
  migrationReady: boolean;
  organizations: {
    id: string;
    name: string;
    slug: string;
    orgType: string;
    tier: string;
    status: string;
    clientCount: number;
    whiteLabelEnabled: boolean;
  }[];
  kpis: {
    activeClients: number;
    onboardingProjects: number;
    goLiveThisWeek: number;
    atRiskWorkspaces: number;
    mrrManagedCents: number;
    implementationSuccessPct: number;
    supportLoad: number;
    expansionOpportunities: number;
    churnRiskCount: number;
    partnerRevenue90dCents: number;
    avgHealth: number;
    trainingCompletionPct: number;
  };
  clients: PartnerClientRowSerialized[];
  implementationDistribution: { stage: string; count: number }[];
  revenueByType: { type: string; amountCents: number; count: number }[];
};

function emptySnapshot(): PartnerCommandCenterSerialized {
  return {
    migrationReady: false,
    organizations: [],
    kpis: {
      activeClients: 0,
      onboardingProjects: 0,
      goLiveThisWeek: 0,
      atRiskWorkspaces: 0,
      mrrManagedCents: 0,
      implementationSuccessPct: 0,
      supportLoad: 0,
      expansionOpportunities: 0,
      churnRiskCount: 0,
      partnerRevenue90dCents: 0,
      avgHealth: 0,
      trainingCompletionPct: 0,
    },
    clients: [],
    implementationDistribution: IMPLEMENTATION_PIPELINE_ORDER.map((stage) => ({ stage, count: 0 })),
    revenueByType: [],
  };
}

function isMigrationMissingError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2021" || e.code === "P2022") return true;
    return e.message.includes("does not exist") || e.message.includes("column");
  }
  return false;
}

export async function getPartnerCommandCenterSnapshot(params: {
  userId: string;
  email: string | null | undefined;
}): Promise<PartnerCommandCenterSerialized> {
  try {
    const accountIds = await getAccessiblePartnerAccountIds(params.userId, params.email);
    const accounts =
      accountIds.length === 0
        ? []
        : await prisma.partnerAccount.findMany({
            where: { id: { in: accountIds } },
            include: { _count: { select: { clients: true } } },
            orderBy: { name: "asc" },
          });
    const orgsFiltered = accounts;

    const clients = accountIds.length ? await listPartnerClientsForAccounts(accountIds, 300) : [];

    const now = new Date();
    const wkStart = startOfWeek(now, { weekStartsOn: 1 });
    const wkEnd = endOfWeek(now, { weekStartsOn: 1 });
    const d90 = subDays(now, 90);

    const activeClients = clients.filter((c) => c.status === "LIVE" || c.status === "IMPLEMENTING").length;
    const onboardingProjects = clients.filter((c) => c.status === "IMPLEMENTING").length;
    const goLiveThisWeek = clients.filter((c) => {
      if (!c.launchDate) return false;
      return c.launchDate >= wkStart && c.launchDate <= wkEnd;
    }).length;

    const atRiskWorkspaces = clients.filter((c) => {
      const h = c.healthScore;
      if (h != null && h < 45) return true;
      if (c.status === "IMPLEMENTING" && c.updatedAt < subDays(now, 45)) return true;
      return false;
    }).length;

    const mrrManaged = clients.reduce((a, c) => a + (c.mrrCents ?? 0), 0);

    const postLiveStages = new Set(["GO_LIVE", "STABILIZATION", "EXPANSION"]);
    const implementationSuccessPct =
      clients.length > 0
        ? Math.round(
            (clients.filter((c) => postLiveStages.has(c.implementationStage)).length / clients.length) * 100,
          )
        : 0;

    const tickets = accountIds.length ? await listOpenPartnerTickets(accountIds, 200) : [];
    const supportLoad = tickets.length;

    const expansionOpportunities = clients.filter(
      (c) => (c.expansionPotential ?? 0) >= 70 || c.implementationStage === "EXPANSION",
    ).length;

    const churnRiskCount = clients.filter(
      (c) => c.status === "PAUSED" || (c.healthScore != null && c.healthScore < 35),
    ).length;

    let partnerRevenue90dCents = 0;
    if (accountIds.length > 0) {
      const rev90 = await prisma.partnerRevenue.aggregate({
        where: {
          partnerAccountId: { in: accountIds },
          createdAt: { gte: d90 },
        },
        _sum: { amountCents: true },
      });
      partnerRevenue90dCents = rev90._sum.amountCents ?? 0;
    }

    const healthVals = clients.map((c) => c.healthScore).filter((h): h is number => h != null);
    const avgHealth =
      healthVals.length > 0 ? Math.round(healthVals.reduce((a, b) => a + b, 0) / healthVals.length) : 0;

    const trainingCompletionPct =
      clients.length > 0
        ? Math.round(
            clients.reduce(
              (acc, c) =>
                acc + (c.status === "LIVE" ? 90 : c.status === "IMPLEMENTING" ? 65 : c.status === "PROSPECT" ? 35 : 50),
              0,
            ) / clients.length,
          )
        : 0;

    const stageGroups =
      accountIds.length > 0
        ? await prisma.partnerClient.groupBy({
            by: ["implementationStage"],
            where: { partnerAccountId: { in: accountIds } },
            _count: { _all: true },
          })
        : [];
    const distMap = new Map(stageGroups.map((g) => [g.implementationStage, g._count._all]));
    const implementationDistribution = IMPLEMENTATION_PIPELINE_ORDER.map((stage) => ({
      stage,
      count: distMap.get(stage) ?? 0,
    }));

    const revenueByType =
      accountIds.length > 0 ? await aggregatePartnerRevenueByType(accountIds) : [];

    const serializedClients: PartnerClientRowSerialized[] = clients.map((c) => ({
      id: c.id,
      partnerAccountId: c.partnerAccountId,
      businessName: c.businessName,
      clientEmail: c.clientUser.email,
      clientName: c.clientUser.fullName,
      status: c.status,
      implementationStage: c.implementationStage,
      implementationStageLabel:
        PARTNER_IMPLEMENTATION_STAGE_LABEL[c.implementationStage] ?? c.implementationStage,
      onboardingStatusLabel: c.onboardingStatusLabel,
      workspaceActive: c.workspace?.active ?? null,
      launchReadinessPct: c.launchReadinessPct,
      assignedManagerName: c.assignedManager?.fullName ?? null,
      assignedManagerEmail: c.assignedManager?.email ?? null,
      internalNotes: c.internalNotes,
      partnerTags: c.partnerTags,
      workspaceName: c.workspace?.name ?? null,
      healthScore: c.healthScore,
      mrrCents: c.mrrCents,
      expansionPotential: c.expansionPotential,
      supportTier: c.supportTier,
      launchDate: c.launchDate?.toISOString() ?? null,
      lastActivityAt: c.lastActivityAt?.toISOString() ?? null,
      integrationSummary: c.integrationStatusSummary,
    }));

    return {
      migrationReady: true,
      organizations: orgsFiltered.map((a) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        orgType: a.orgType,
        tier: a.tier,
        status: a.status,
        clientCount: a._count.clients,
        whiteLabelEnabled: a.whiteLabelEnabled,
      })),
      kpis: {
        activeClients,
        onboardingProjects,
        goLiveThisWeek,
        atRiskWorkspaces,
        mrrManagedCents: mrrManaged,
        implementationSuccessPct,
        supportLoad,
        expansionOpportunities,
        churnRiskCount,
        partnerRevenue90dCents,
        avgHealth,
        trainingCompletionPct,
      },
      clients: serializedClients,
      implementationDistribution,
      revenueByType,
    };
  } catch (e) {
    if (isMigrationMissingError(e)) {
      logger.warn("Partner command center degraded — run prisma migrate deploy.", e);
      return emptySnapshot();
    }
    throw e;
  }
}
