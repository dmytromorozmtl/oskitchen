import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  ingestScientistProposal,
  mergeScientistIntoJson,
  readAutonomousScientist,
} from "@/lib/storefront/theme-experiment-autonomous-scientist";
import { hashAutoConcludeApprovalToken } from "@/lib/storefront/theme-experiment-auto-conclude-approval";
import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "node:crypto";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  hypothesis: z.string().min(1).max(2000),
  variantSummary: z.string().min(1).max(2000),
  expectedLiftPp: z.number(),
  riskTier: z.enum(["low", "medium", "high"]),
  approvalToken: z.string().optional(),
});

/**
 * LLM scientist proposal ingest.
 * Auth: Bearer EXPERIMENT_SCIENTIST_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.EXPERIMENT_SCIENTIST_WEBHOOK_SECRET,
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

  const prev = readAutonomousScientist(sf.themeExperimentJson);
  let snap = ingestScientistProposal(sf.themeExperimentJson, {
    hypothesis: parsed.data.hypothesis,
    variantSummary: parsed.data.variantSummary,
    expectedLiftPp: parsed.data.expectedLiftPp,
    riskTier: parsed.data.riskTier,
  });

  const token = parsed.data.approvalToken ?? randomBytes(24).toString("hex");
  snap = {
    ...snap,
    approvalTokenHash: hashAutoConcludeApprovalToken(token),
  };

  const merged = mergeScientistIntoJson(sf.themeExperimentJson, snap);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("experiment_scientist_proposal_webhook", {
    storeSlug: parsed.data.storeSlug,
    proposals: snap.proposals.length,
    risk: parsed.data.riskTier,
  });

  return NextResponse.json({
    ok: true,
    storefrontId: sf.id,
    proposalCount: snap.proposals.length,
    approvalTokenPreview: token.slice(0, 8),
  });
}
