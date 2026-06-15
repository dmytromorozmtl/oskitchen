import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { parseExperimentDaysParam } from "@/lib/storefront/parse-experiment-days";
import { prisma } from "@/lib/prisma";
import { buildExperimentSeriesCsv } from "@/lib/storefront/experiment-csv-export";
import { getThemeExperimentDailySeries } from "@/services/storefront/theme-experiment-analytics-service";

export async function GET(request: Request) {
  const user = await requireSessionUser();
  const sf = await prisma.storefrontSettings.findFirst({ where: { userId: user.id  }, orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    select: { id: true, storeSlug: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "No storefront." }, { status: 404 });
  }

  const url = new URL(request.url);
  const days = parseExperimentDaysParam(url.searchParams.get("days") ?? undefined);
  const rows = await getThemeExperimentDailySeries(sf.id, days);

  const body = buildExperimentSeriesCsv(rows);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="experiment-series-${sf.storeSlug}-${days}d.csv"`,
    },
  });
}
