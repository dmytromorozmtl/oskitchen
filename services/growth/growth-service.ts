import { pct } from "@/lib/growth/growth-analytics";
import { prisma } from "@/lib/prisma";
import { contentLibraryStats } from "@/services/growth/content-service";
import { sampleAtRiskAccounts } from "@/services/growth/churn-service";
import { countDemosByStatus } from "@/services/growth/demo-service";
import { sampleExpansionAccounts } from "@/services/growth/expansion-service";
import { countLeadsByStatus } from "@/services/growth/lead-service";
import { onboardingCallStats } from "@/services/growth/onboarding-service";
import { listOutreachCampaigns, seedStarterCampaignIfEmpty } from "@/services/growth/outreach-service";
import { referralSummary } from "@/services/growth/referral-service";
import { topUsageEvents, usageEventsLastDays } from "@/services/growth/telemetry-service";
import { countDistinctUsersLastDays } from "@/services/growth/usage-service";
import { latestHealthDistribution } from "@/services/growth/customer-success-service";

export type GrowthCommandCenterSnapshot = {
  kpis: {
    workspaceProfiles: number;
    activeSubscriptions: number;
    trialingSubscriptions: number;
    paidRevenue30dUsd: number;
    activationRatePct: number;
    demoWinRatePct: number;
    usageEvents24h: number;
    wau: number;
    betaLeads: number;
    demosNew: number;
    referralAttributed: number;
    npsPlaceholder: number | null;
  };
  leadFunnel: { status: string; count: number }[];
  demoFunnel: { status: string; count: number }[];
  signupsWeekly: { week: string; count: number }[];
  activationFunnel: { step: string; count: number; pct: number }[];
  usageTop: { eventName: string; count: number }[];
  healthMix: { status: string; count: number }[];
  atRisk: Awaited<ReturnType<typeof sampleAtRiskAccounts>>;
  expansion: Awaited<ReturnType<typeof sampleExpansionAccounts>>;
  outreachCampaigns: Awaited<ReturnType<typeof listOutreachCampaigns>>;
  content: Awaited<ReturnType<typeof contentLibraryStats>>;
  onboarding: Awaited<ReturnType<typeof onboardingCallStats>>;
};

function isoWeekKey(d: Date): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export async function getGrowthCommandCenterSnapshot(): Promise<GrowthCommandCenterSnapshot> {
  await seedStarterCampaignIfEmpty();

  const since30 = new Date(Date.now() - 30 * 86400000);
  const since24h = new Date(Date.now() - 86400000);

  const [
    workspaceProfiles,
    activeSubscriptions,
    trialingSubscriptions,
    paidAgg,
    activationTotal,
    activationDone,
    betaLeads,
    demosNew,
    demosAll,
    demosWon,
    usageEvents24h,
    wau,
    leadGroups,
    demoGroups,
    profilesRecent,
    usageTop,
    healthMix,
    atRisk,
    expansion,
    outreachCampaigns,
    content,
    onboarding,
    referral,
  ] = await Promise.all([
    prisma.userProfile.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "TRIALING" } }),
    prisma.invoiceRecord.aggregate({
      where: { paidAt: { gte: since30 }, status: "PAID" },
      _sum: { amountPaidCents: true },
    }),
    prisma.activationState.count(),
    prisma.activationState.count({ where: { onboardingCompleted: true } }),
    prisma.betaLead.count(),
    prisma.demoRequest.count({ where: { status: "NEW" } }),
    prisma.demoRequest.count(),
    prisma.demoRequest.count({ where: { status: "WON" } }),
    prisma.usageEvent.count({ where: { createdAt: { gte: since24h } } }),
    countDistinctUsersLastDays(7),
    countLeadsByStatus(),
    countDemosByStatus(),
    prisma.userProfile.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 56 * 86400000) } },
      select: { createdAt: true },
      take: 5000,
    }),
    topUsageEvents(12),
    latestHealthDistribution(),
    sampleAtRiskAccounts(10),
    sampleExpansionAccounts(8),
    listOutreachCampaigns(8),
    contentLibraryStats(),
    onboardingCallStats(),
    referralSummary(),
  ]);

  const paidRevenue30dUsd = Math.round((paidAgg._sum.amountPaidCents ?? 0) / 100);
  const activationRatePct = pct(activationDone, Math.max(1, activationTotal));
  const demoWinRatePct = pct(demosWon, Math.max(1, demosAll));

  const weekBuckets = new Map<string, number>();
  for (const p of profilesRecent) {
    const k = isoWeekKey(p.createdAt);
    weekBuckets.set(k, (weekBuckets.get(k) ?? 0) + 1);
  }
  const signupsWeekly = Array.from(weekBuckets.entries())
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-10);

  const firstMenu = await prisma.activationState.count({ where: { firstMenuCreated: true } });
  const firstOrder = await prisma.activationState.count({ where: { firstOrderCreated: true } });
  const firstProd = await prisma.activationState.count({ where: { firstProductionCompleted: true } });
  const billing = await prisma.activationState.count({ where: { billingStarted: true } });
  const base = Math.max(1, activationTotal);
  const activationFunnel = [
    { step: "Onboarding done", count: activationDone, pct: pct(activationDone, base) },
    { step: "First menu", count: firstMenu, pct: pct(firstMenu, base) },
    { step: "First order", count: firstOrder, pct: pct(firstOrder, base) },
    { step: "First production", count: firstProd, pct: pct(firstProd, base) },
    { step: "Billing started", count: billing, pct: pct(billing, base) },
  ];

  return {
    kpis: {
      workspaceProfiles,
      activeSubscriptions,
      trialingSubscriptions,
      paidRevenue30dUsd,
      activationRatePct,
      demoWinRatePct,
      usageEvents24h,
      wau,
      betaLeads,
      demosNew,
      referralAttributed: referral.attributedSignups,
      npsPlaceholder: null,
    },
    leadFunnel: leadGroups.map((g) => ({ status: g.status, count: g._count.status })),
    demoFunnel: demoGroups.map((g) => ({ status: g.status, count: g._count.status })),
    signupsWeekly,
    activationFunnel,
    usageTop: usageTop.map((u) => ({ eventName: u.eventName, count: u._count.eventName })),
    healthMix,
    atRisk,
    expansion,
    outreachCampaigns,
    content,
    onboarding,
  };
}

/** Lightweight PLG pulse for sidebars / headers (founder-only callers). */
export async function getGrowthPulseCounts() {
  const [leads, demos, usage7d] = await Promise.all([
    prisma.betaLead.count(),
    prisma.demoRequest.count({ where: { status: "NEW" } }),
    usageEventsLastDays(7),
  ]);
  return { leads, demosNew: demos, usageEvents7d: usage7d };
}
