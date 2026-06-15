import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import { runCausalDiscoveryClosedLoop } from "@/lib/storefront/theme-experiment-causal-discovery-agent";
import { prisma } from "@/lib/prisma";

const cellSchema = z.object({
  workspaceId: z.string().min(1).max(120),
  storeSlug: z.string().min(1).max(120),
  region: z.string().min(1).max(32),
  segment: z.string().min(1).max(64),
  spilloverPp: z.number(),
  treatmentArmId: z.string().min(1).max(64),
});

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  cells: z.array(cellSchema).min(1),
});

/**
 * BQ experiment outcomes → closed-loop causal discovery (DAG → interference → holdout WS).
 * Auth: Bearer BIGQUERY_CAUSAL_DISCOVERY_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.BIGQUERY_CAUSAL_DISCOVERY_WEBHOOK_SECRET,
  });
  if (authError) {
    return authError;
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const sf = await prisma.storefrontSettings.findFirst({
    where: { storeSlug: parsed.data.storeSlug },
    select: { id: true, themeExperimentJson: true },
  });
  if (!sf) {
    return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
  }

  const { json: merged, snap } = runCausalDiscoveryClosedLoop(
    sf.themeExperimentJson,
    parsed.data.cells,
  );

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("causal_discovery_outcomes_webhook", {
    storeSlug: parsed.data.storeSlug,
    pendingApproval: snap.pendingApproval,
    proposedEdges: snap.proposedEdges,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id, agent: snap });
}
