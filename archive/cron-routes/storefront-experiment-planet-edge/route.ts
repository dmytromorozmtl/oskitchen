import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { appendCrdtSyncBusMessage, isPlanetScaleEdgeEnabled } from "@/lib/storefront/theme-experiment-edge-planet";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  if (!isPlanetScaleEdgeEnabled()) {
    return NextResponse.json({ ok: true, skipped: true, reason: "planet_edge_disabled" });
  }

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 50,
  });

  let synced = 0;
  for (const sf of storefronts) {
    const region = process.env.VERCEL_REGION ?? "iad1";
    const merged = appendCrdtSyncBusMessage(sf.themeExperimentJson, {
      at: new Date().toISOString(),
      region,
      storeSlug: sf.storeSlug,
      version: Date.now(),
      op: "upsert",
    });
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
    synced++;
  }

  logger.info("planet_edge_crdt_sync", { synced });
  return NextResponse.json({ ok: true, synced });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
