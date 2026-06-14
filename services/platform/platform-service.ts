import { IntegrationStatus, SupportTicketPriority, SupportTicketStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const CRITICAL_TICKET: SupportTicketPriority[] = ["CRITICAL"];
export const PLATFORM_OPEN_TICKET_STATUSES: SupportTicketStatus[] = [
  "NEW",
  "OPEN",
  "TRIAGED",
  "WAITING_ON_SUPPORT",
  "WAITING_ON_CUSTOMER",
  "IN_PROGRESS",
  "ESCALATED",
  "WAITING",
];

export async function getPlatformDashboardSnapshot() {
  const [
    users,
    workspaces,
    activeWorkspaces,
    organizations,
    trials,
    paid,
    tickets,
    openTickets,
    criticalTickets,
    integrations,
    integrationErrors,
    webhookPending,
    orders,
    automationFailures,
    activeIncidents,
    criticalProductionIncidents,
    recentPlatformAudit,
  ] = await Promise.all([
    prisma.userProfile.count(),
    prisma.workspace.count().catch(() => 0),
    prisma.workspace.count({ where: { active: true } }).catch(() => 0),
    prisma.organization.count().catch(() => 0),
    prisma.trialState.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    prisma.subscription.count({ where: { status: "ACTIVE", stripeSubscriptionId: { not: null } } }).catch(() => 0),
    prisma.supportTicket.count().catch(() => 0),
    prisma.supportTicket.count({ where: { status: { in: PLATFORM_OPEN_TICKET_STATUSES } } }).catch(() => 0),
    prisma.supportTicket
      .count({
        where: {
          status: { in: PLATFORM_OPEN_TICKET_STATUSES },
          priority: { in: CRITICAL_TICKET },
        },
      })
      .catch(() => 0),
    prisma.integrationConnection.count().catch(() => 0),
    prisma.integrationConnection.count({ where: { status: IntegrationStatus.ERROR } }).catch(() => 0),
    prisma.webhookEvent.count({ where: { processed: false } }).catch(() => 0),
    prisma.order.count().catch(() => 0),
    prisma.automationExecution.count({ where: { status: "FAILED" } }).catch(() => 0),
    prisma.productionIncident
      .count({ where: { workflowStatus: { not: "RESOLVED" } } })
      .catch(() => 0),
    prisma.productionIncident
      .count({
        where: {
          workflowStatus: { not: "RESOLVED" },
          severity: "critical",
        },
      })
      .catch(() => 0),
    prisma.auditLog
      .findMany({
        where: {
          OR: [{ category: "PLATFORM" }, { action: { startsWith: "platform." } }],
        },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          action: true,
          createdAt: true,
          entityType: true,
          entityLabel: true,
          workspaceId: true,
        },
      })
      .catch(() => []),
  ]);

  return {
    users,
    workspaces,
    activeWorkspaces,
    organizations,
    trials,
    paid,
    tickets,
    openTickets,
    criticalTickets,
    integrations,
    integrationErrors,
    webhookPending,
    orders,
    automationFailures,
    criticalProductionIncidents,
    mrrCents: null as number | null,
    arrCents: null as number | null,
    churnRiskAccounts: null as number | null,
    betaApplications: null as number | null,
    onboardingProjects: null as number | null,
    goLivesThisWeek: null as number | null,
    activeIncidents,
    recentPlatformAudit,
  };
}
