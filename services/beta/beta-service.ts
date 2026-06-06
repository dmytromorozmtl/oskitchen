import { Prisma } from "@prisma/client";
import { format, startOfWeek, subDays } from "date-fns";

import { BUSINESS_TYPE_LABELS } from "@/lib/business-modes";
import { parseInternalTags } from "@/lib/beta/beta-tags";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

import { buildBetaLifecycleFunnel } from "@/services/beta/beta-conversion-service";
import { ensureSeedCohortsIfEmpty } from "@/services/beta/beta-cohort-service";
import { computeOnboardingReadinessDimensions } from "@/services/beta/beta-onboarding-service";

export type BetaLeadRowSerialized = {
  id: string;
  createdAt: string;
  updatedAt: string;
  programStage: string;
  status: string;
  score: number;
  expansionScore: number | null;
  activationProbability: number | null;
  riskScore: number | null;
  arrPotentialScore: number | null;
  onboardingReadiness: number | null;
  onboardingComplexity: number | null;
  estimatedOnboardingDays: number | null;
  pinned: boolean;
  fullName: string;
  email: string;
  businessName: string;
  businessType: string;
  country: string | null;
  weeklyOrderVolume: string | null;
  currentChannels: unknown;
  locationsCount: number | null;
  biggestPain: string | null;
  referralSource: string | null;
  utmSource: string | null;
  source: string | null;
  betaCohortId: string | null;
  cohortName: string | null;
  founderNotes: string | null;
  internalTags: string[];
  feedbackCount: number;
  invitationCount: number;
  lastActivityAt: string | null;
};

export type BetaOperationsSnapshot = {
  migrationReady: boolean;
  legacyBetaApplicationCount: number;
  kpis: {
    totalApplicants: number;
    approved: number;
    onboardingInProgress: number;
    activated: number;
    convertedPaid: number;
    churned: number;
    topVertical: string;
    topAcquisitionSource: string;
    onboardingCompletionPct: number;
    waitlistGrowthPct: number;
    cohortActivationRatePct: number;
  };
  applicationsWeekly: { week: string; count: number }[];
  industryDistribution: { type: string; label: string; count: number }[];
  acquisitionSources: { source: string; count: number }[];
  onboardingFunnel: { step: string; count: number }[];
  churnByCohort: { cohortName: string; churned: number; members: number }[];
  featureRequestFrequency: { tag: string; count: number }[];
  cohorts: { id: string; name: string; members: number; active: boolean }[];
  leads: BetaLeadRowSerialized[];
};

function emptySnapshot(migrationReady: boolean): BetaOperationsSnapshot {
  return {
    migrationReady,
    legacyBetaApplicationCount: 0,
    kpis: {
      totalApplicants: 0,
      approved: 0,
      onboardingInProgress: 0,
      activated: 0,
      convertedPaid: 0,
      churned: 0,
      topVertical: "—",
      topAcquisitionSource: "—",
      onboardingCompletionPct: 0,
      waitlistGrowthPct: 0,
      cohortActivationRatePct: 0,
    },
    applicationsWeekly: [],
    industryDistribution: [],
    acquisitionSources: [],
    onboardingFunnel: [],
    churnByCohort: [],
    featureRequestFrequency: [],
    cohorts: [],
    leads: [],
  };
}

function isMigrationMissingError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2021" || e.code === "P2022") return true;
    return e.message.includes("does not exist") || e.message.includes("column");
  }
  return false;
}

export async function getBetaOperationsSnapshot(): Promise<BetaOperationsSnapshot> {
  try {
    await ensureSeedCohortsIfEmpty();
  } catch (e) {
    if (isMigrationMissingError(e)) {
      logger.warn("Beta cohorts unavailable (migration pending) — skipping seed.");
    } else throw e;
  }

  try {
    const legacyBetaApplicationCount = await prisma.betaApplication.count();

    const [
      totalApplicants,
      approved,
      onboardingInProgress,
      activated,
      convertedPaid,
      churned,
      stageGroups,
      typeGroups,
      cohortRows,
      recentLeads,
    ] = await Promise.all([
      prisma.betaLead.count(),
      prisma.betaLead.count({ where: { programStage: { in: ["APPROVED", "INVITED"] } } }),
      prisma.betaLead.count({ where: { programStage: "ONBOARDING" } }),
      prisma.betaLead.count({
        where: { programStage: { in: ["ACTIVATED", "POWER_USER"] } },
      }),
      prisma.betaLead.count({ where: { programStage: "CONVERTED" } }),
      prisma.betaLead.count({ where: { programStage: "CHURNED" } }),
      prisma.betaLead.groupBy({ by: ["programStage"], _count: { _all: true } }),
      prisma.betaLead.groupBy({ by: ["businessType"], _count: { _all: true } }),
      prisma.betaCohort.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: { select: { members: true } },
        },
      }),
      prisma.betaLead.findMany({
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        take: 120,
        include: {
          cohort: { select: { name: true } },
          _count: { select: { feedback: true, invitations: true } },
        },
      }),
    ]);

    const stageMap = new Map(
      stageGroups.map((g) => [g.programStage, g._count._all]),
    ) as Map<import("@prisma/client").BetaProgramStage, number>;

    const topType = [...typeGroups].sort((a, b) => b._count._all - a._count._all)[0];
    const topVertical = topType
      ? BUSINESS_TYPE_LABELS[topType.businessType] ?? topType.businessType
      : "—";

    const utmGroups = await prisma.betaLead.groupBy({
      by: ["utmSource"],
      _count: { _all: true },
    });
    const srcGroups = await prisma.betaLead.groupBy({
      by: ["source"],
      _count: { _all: true },
    });
    const acquisitionMap = new Map<string, number>();
    for (const u of utmGroups) {
      const k = (u.utmSource ?? "").trim() || "direct / unset";
      acquisitionMap.set(k, (acquisitionMap.get(k) ?? 0) + u._count._all);
    }
    for (const s of srcGroups) {
      const k = (s.source ?? "").trim() || "unknown source";
      acquisitionMap.set(k, (acquisitionMap.get(k) ?? 0) + s._count._all);
    }
    const topAcquisitionSource =
      [...acquisitionMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    const startedOnboarding =
      (stageMap.get("ONBOARDING") ?? 0) +
      (stageMap.get("ACTIVATED") ?? 0) +
      (stageMap.get("POWER_USER") ?? 0) +
      (stageMap.get("CONVERTED") ?? 0) +
      (stageMap.get("CHURNED") ?? 0);
    const onboardingCompletionPct =
      startedOnboarding > 0
        ? Math.round(
            (((stageMap.get("ACTIVATED") ?? 0) +
              (stageMap.get("POWER_USER") ?? 0) +
              (stageMap.get("CONVERTED") ?? 0)) /
              startedOnboarding) *
              100,
          )
        : 0;

    const now = new Date();
    const d30 = subDays(now, 30);
    const d60 = subDays(now, 60);
    const [cRecent, cPrior] = await Promise.all([
      prisma.betaLead.count({ where: { createdAt: { gte: d30 } } }),
      prisma.betaLead.count({
        where: { createdAt: { gte: d60, lt: d30 } },
      }),
    ]);
    const waitlistGrowthPct =
      cPrior > 0 ? Math.round(((cRecent - cPrior) / cPrior) * 1000) / 10 : cRecent > 0 ? 100 : 0;

    const activatedMembers = await prisma.betaLead.count({
      where: {
        betaCohortId: { not: null },
        programStage: { in: ["ACTIVATED", "POWER_USER", "CONVERTED"] },
      },
    });
    const cohortMembers = await prisma.betaLead.count({
      where: { betaCohortId: { not: null } },
    });
    const cohortActivationRatePct =
      cohortMembers > 0 ? Math.round((activatedMembers / cohortMembers) * 1000) / 10 : 0;

    const since = subDays(now, 56);
    const forWeeks = await prisma.betaLead.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });
    const weekMap = new Map<string, number>();
    for (const r of forWeeks) {
      const wk = format(startOfWeek(r.createdAt, { weekStartsOn: 1 }), "MMM d");
      weekMap.set(wk, (weekMap.get(wk) ?? 0) + 1);
    }
    const applicationsWeekly = [...weekMap.entries()].map(([week, count]) => ({
      week,
      count,
    }));

    const industryDistribution = typeGroups
      .map((g) => ({
        type: g.businessType,
        label: BUSINESS_TYPE_LABELS[g.businessType] ?? g.businessType,
        count: g._count._all,
      }))
      .sort((a, b) => b.count - a.count);

    const acquisitionSources = [...acquisitionMap.entries()]
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const onboardingFunnel = buildBetaLifecycleFunnel(stageMap);

    const churnRows = await prisma.betaLead.groupBy({
      by: ["betaCohortId"],
      where: { programStage: "CHURNED", betaCohortId: { not: null } },
      _count: { _all: true },
    });
    const cohortIds = churnRows
      .map((row) => row.betaCohortId)
      .filter((id): id is string => id != null);
    const [cohortRowsById, memberCountsByCohort] = await Promise.all([
      cohortIds.length > 0
        ? prisma.betaCohort.findMany({
            where: { id: { in: cohortIds } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
      cohortIds.length > 0
        ? prisma.betaLead.groupBy({
            by: ["betaCohortId"],
            where: { betaCohortId: { in: cohortIds } },
            _count: { _all: true },
          })
        : Promise.resolve([]),
    ]);
    const cohortNameById = new Map(cohortRowsById.map((cohort) => [cohort.id, cohort.name]));
    const membersByCohortId = new Map(
      memberCountsByCohort.map((row) => [row.betaCohortId, row._count._all]),
    );
    const churnByCohort = churnRows.map((row) => ({
      cohortName: cohortNameById.get(row.betaCohortId!) ?? "Cohort",
      churned: row._count._all,
      members: membersByCohortId.get(row.betaCohortId!) ?? 0,
    }));

    const feats = await prisma.betaLead.findMany({
      select: { interestedFeatures: true },
      take: 500,
      orderBy: { createdAt: "desc" },
    });
    const tagCount = new Map<string, number>();
    for (const f of feats) {
      const arr = Array.isArray(f.interestedFeatures)
        ? (f.interestedFeatures as string[])
        : [];
      for (const raw of arr) {
        const t = String(raw).trim().toLowerCase();
        if (!t || t.length > 48) continue;
        tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
      }
    }
    const featureRequestFrequency = [...tagCount.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    const cohorts = cohortRows.map((c) => ({
      id: c.id,
      name: c.name,
      members: c._count.members,
      active: c.active,
    }));

    const leads: BetaLeadRowSerialized[] = recentLeads.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      programStage: r.programStage,
      status: r.status,
      score: r.score,
      expansionScore: r.expansionScore,
      activationProbability: r.activationProbability,
      riskScore: r.riskScore,
      arrPotentialScore: r.arrPotentialScore,
      onboardingReadiness: r.onboardingReadiness,
      onboardingComplexity: r.onboardingComplexity,
      estimatedOnboardingDays: r.estimatedOnboardingDays,
      pinned: r.pinned,
      fullName: r.fullName,
      email: r.email,
      businessName: r.businessName,
      businessType: r.businessType,
      country: r.country,
      weeklyOrderVolume: r.weeklyOrderVolume,
      currentChannels: r.currentChannels,
      locationsCount: r.locationsCount,
      biggestPain: r.biggestPain,
      referralSource: r.referralSource,
      utmSource: r.utmSource,
      source: r.source,
      betaCohortId: r.betaCohortId,
      cohortName: r.cohort?.name ?? null,
      founderNotes: r.founderNotes,
      internalTags: parseInternalTags(r.internalTags),
      feedbackCount: r._count.feedback,
      invitationCount: r._count.invitations,
      lastActivityAt: r.lastActivityAt?.toISOString() ?? null,
    }));

    return {
      migrationReady: true,
      legacyBetaApplicationCount,
      kpis: {
        totalApplicants,
        approved,
        onboardingInProgress,
        activated,
        convertedPaid,
        churned,
        topVertical,
        topAcquisitionSource,
        onboardingCompletionPct,
        waitlistGrowthPct,
        cohortActivationRatePct,
      },
      applicationsWeekly,
      industryDistribution,
      acquisitionSources,
      onboardingFunnel,
      churnByCohort,
      featureRequestFrequency,
      cohorts,
      leads,
    };
  } catch (e) {
    if (isMigrationMissingError(e)) {
      logger.warn("Beta operations snapshot degraded — Prisma schema ahead of database.", e);
      return emptySnapshot(false);
    }
    throw e;
  }
}

export async function getBetaLeadDetailSerialized(id: string) {
  const lead = await prisma.betaLead.findUnique({
    where: { id },
    include: {
      cohort: true,
      feedback: { orderBy: { createdAt: "desc" }, take: 40 },
      invitations: { orderBy: { createdAt: "desc" }, take: 20 },
      timelineNotes: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });
  if (!lead) return null;

  const readiness = computeOnboardingReadinessDimensions(lead);

  return {
    lead: {
      ...lead,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
      lastActivityAt: lead.lastActivityAt?.toISOString() ?? null,
      approvedAt: lead.approvedAt?.toISOString() ?? null,
      rejectedAt: lead.rejectedAt?.toISOString() ?? null,
      invitedAt: lead.invitedAt?.toISOString() ?? null,
      onboardedAt: lead.onboardedAt?.toISOString() ?? null,
      convertedToCustomerAt: lead.convertedToCustomerAt?.toISOString() ?? null,
      churnedAt: lead.churnedAt?.toISOString() ?? null,
      internalTags: parseInternalTags(lead.internalTags),
    },
    readiness,
    feedback: lead.feedback.map((f) => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
    })),
    invitations: lead.invitations.map((i) => ({
      ...i,
      sentAt: i.sentAt?.toISOString() ?? null,
      acceptedAt: i.acceptedAt?.toISOString() ?? null,
      expiredAt: i.expiredAt?.toISOString() ?? null,
      createdAt: i.createdAt.toISOString(),
    })),
    timelineNotes: lead.timelineNotes.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    })),
  };
}
