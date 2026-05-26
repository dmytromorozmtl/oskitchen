import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

function csvEscape(cell: string | number | null | undefined): string {
  const s = cell == null ? "" : String(cell);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (profile?.role !== UserRole.OWNER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
