import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  ingestGlobalMeshOutcomes,
  type GlobalMeshCloud,
} from "@/lib/storefront/theme-experiment-global-mesh";
import { prisma } from "@/lib/prisma";

const cellSchema = z.object({
  cloud: z.enum(["aws", "gcp", "azure"]),
  region: z.string().min(1).max(32),
  armId: z.string().min(1).max(64),
  conversions: z.number().int().nonnegative(),
  checkouts: z.number().int().nonnegative(),
  liftPp: z.number(),
});

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  cells: z.array(cellSchema).min(1),
});

/**
 * BQ cross-cloud outcomes → global experiment mesh CRDT merge.
 * Auth: Bearer BIGQUERY_GLOBAL_MESH_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.BIGQUERY_GLOBAL_MESH_WEBHOOK_SECRET,
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

  const cells = parsed.data.cells.map((c) => ({
    cloud: c.cloud as GlobalMeshCloud,
    region: c.region,
    armId: c.armId,
    conversions: c.conversions,
    checkouts: c.checkouts,
    liftPp: c.liftPp,
  }));

  const { json: merged, snap } = ingestGlobalMeshOutcomes(sf.themeExperimentJson, cells);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("global_mesh_outcomes_webhook", {
    storeSlug: parsed.data.storeSlug,
    quorumReached: snap.quorumReached,
    clouds: snap.cloudsReporting,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id, snap });
}
