import { prisma } from "@/lib/prisma";

export async function getFounderKpis() {
  const [
    totalSignups,
    betaLeads,
    demoRequests,
    activatedAccounts,
    trialUsers,
    paidUsers,
    feedbackCount,
    supportTickets,
    partnerLeads,
    salesInquiries,
    activeWorkspaces,
    ordersProcessed,
  ] = await Promise.all([
    prisma.userProfile.count(),
    prisma.betaLead.count().catch(() => 0),
    prisma.demoRequest.count().catch(() => 0),
    prisma.activationState.count({ where: { activatedAt: { not: null } } }).catch(() => 0),
    prisma.trialState.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    prisma.subscription.count({ where: { status: "ACTIVE", stripeSubscriptionId: { not: null } } }).catch(() => 0),
    prisma.appFeedback.count().catch(() => 0),
    prisma.supportTicket.count().catch(() => 0),
    prisma.partnerLead.count().catch(() => 0),
    prisma.salesInquiry.count().catch(() => 0),
    prisma.workspace.count().catch(() => 0),
    prisma.order.count().catch(() => 0),
  ]);

  return {
    totalSignups,
    betaLeads,
    demoRequests,
    activatedAccounts,
    trialUsers,
    paidUsers,
    mrrPlaceholder: paidUsers === 0 ? "No live Stripe MRR yet" : "Calculate from Stripe webhooks",
    churnPlaceholder: "Track after paid cohorts cancel",
    feedbackCount,
    supportTickets,
    partnerLeads,
    salesInquiries,
    activeWorkspaces,
    ordersProcessed,
  };
}
