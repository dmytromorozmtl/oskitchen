import { NextResponse } from "next/server";

import { requireGrowthApiAccess } from "@/lib/growth/require-growth-api-access";
import { prisma } from "@/lib/prisma";

function csvEscape(cell: string | number | null | undefined): string {
  const s = cell == null ? "" : String(cell);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const denied = await requireGrowthApiAccess("growth.view");
  if (denied) return denied;

  const leads = await prisma.betaLead.findMany({
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const headers = [
    "createdAt",
    "fullName",
    "email",
    "businessName",
    "businessType",
    "status",
    "score",
    "weeklyOrderVolume",
    "country",
    "source",
  ];

  const lines = [
    headers.map(csvEscape).join(","),
    ...leads.map((r) =>
      [
        r.createdAt.toISOString(),
        r.fullName,
        r.email,
        r.businessName,
        r.businessType,
        r.status,
        r.score,
        r.weeklyOrderVolume,
        r.country,
        r.source,
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kitchenos-beta-leads.csv"',
    },
  });
}
