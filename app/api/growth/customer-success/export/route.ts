import { NextResponse } from "next/server";

import { requireGrowthApiAccess } from "@/lib/growth/require-growth-api-access";
import { prisma } from "@/lib/prisma";

function csvEscape(cell: string | number | null | undefined): string {
  const s = cell == null ? "" : String(cell);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const denied = await requireGrowthApiAccess("growth.manage");
  if (denied) return denied;

  const rows = await prisma.userProfile.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      subscription: true,
      trialState: true,
      activationState: true,
      _count: { select: { orders: true } },
    },
  });

  const headers = [
    "email",
    "fullName",
    "plan",
    "subscriptionStatus",
    "trialStatus",
    "onboardingCompleted",
    "ordersTotal",
    "createdAt",
  ];
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map((r) =>
      [
        r.email,
        r.fullName,
        r.subscription?.plan ?? "",
        r.subscription?.status ?? "",
        r.trialState?.status ?? "",
        r.onboardingCompleted ? "yes" : "no",
        r._count.orders,
        r.createdAt.toISOString(),
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="customer-success.csv"',
    },
  });
}
