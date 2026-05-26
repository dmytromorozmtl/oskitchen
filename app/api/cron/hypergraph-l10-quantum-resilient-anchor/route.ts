import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { isHypergraphL10QuantumResilientAnchorEnabled } from "@/lib/compliance/hypergraph-l10-quantum-resilient-anchor";
import { byzantineAnchorL9FromL8Stack } from "@/lib/compliance/hypergraph-l9-byzantine-anchor";
import { faultTolerantAnchorL8FromL7Stack } from "@/lib/compliance/hypergraph-l8-fault-tolerant-anchor";
import { entanglementAnchorL7FromL6Stack } from "@/lib/compliance/hypergraph-l7-entanglement-anchor";
import { quantumResilientAnchorL10FromL9Stack } from "@/lib/compliance/hypergraph-l10-quantum-resilient-anchor";

export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  if (!isHypergraphL10QuantumResilientAnchorEnabled()) {
    return NextResponse.json({ ok: true, anchored: 0 });
  }

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let anchored = 0;
  for (const sf of storefronts) {
    let json = sf.themeExperimentJson as Prisma.InputJsonValue;
    json = entanglementAnchorL7FromL6Stack(json).json as Prisma.InputJsonValue;
    json = faultTolerantAnchorL8FromL7Stack(json).json as Prisma.InputJsonValue;
    json = byzantineAnchorL9FromL8Stack(json).json as Prisma.InputJsonValue;
    const l10 = quantumResilientAnchorL10FromL9Stack(json);
    if (l10.anchor) {
      await prisma.storefrontSettings.update({
        where: { id: sf.id },
        data: { themeExperimentJson: l10.json as Prisma.InputJsonValue },
      });
      anchored++;
    }
  }

  logger.info("hypergraph_l10_quantum_resilient_anchor_cron", { anchored });
  return NextResponse.json({ ok: true, anchored });
  }, { experimental: true });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
