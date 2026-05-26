import { differenceInDays } from "date-fns";

import { prisma } from "@/lib/prisma";
import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import { supportTicketListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type ChurnRiskRow = {
  customerId: string;
  email: string;
  displayName: string | null;
  churnScore: number;
  daysSinceLastOrder: number | null;
  orderFrequencyDecline: boolean;
  supportTickets: number;
};

export async function listChurnRiskCustomers(userId: string, limit = 100): Promise<ChurnRiskRow[]> {
  const customerWhere = await kitchenCustomerListWhereForOwner(userId);
  const customers = await prisma.kitchenCustomer.findMany({
    where: { AND: [customerWhere, { status: "ACTIVE" }] },
    select: {
      id: true,
      email: true,
      displayName: true,
      name: true,
      lastOrderAt: true,
      totalOrders: true,
      atRiskScore: true,
    },
    orderBy: { lastOrderAt: "asc" },
    take: limit * 2,
  });

  const rows: ChurnRiskRow[] = [];
  const now = new Date();

  for (const c of customers) {
    const daysSince = c.lastOrderAt ? differenceInDays(now, c.lastOrderAt) : 999;
    const ticketScope = await supportTicketListWhereForOwner(userId);
    const tickets = await prisma.supportTicket.count({
      where: {
        AND: [ticketScope, { email: c.email, status: { in: ["NEW", "OPEN", "IN_PROGRESS"] } }],
      },
    });

    let score = c.atRiskScore ?? 0;
    if (daysSince > 60) score += 35;
    else if (daysSince > 30) score += 20;
    if (c.totalOrders <= 1) score += 15;
    if (tickets > 0) score += Math.min(25, tickets * 8);
    score = Math.min(100, score);

    rows.push({
      customerId: c.id,
      email: c.email,
      displayName: c.displayName ?? c.name,
      churnScore: score,
      daysSinceLastOrder: c.lastOrderAt ? daysSince : null,
      orderFrequencyDecline: daysSince > 45 && c.totalOrders > 2,
      supportTickets: tickets,
    });
  }

  return rows.sort((a, b) => b.churnScore - a.churnScore).slice(0, limit);
}
