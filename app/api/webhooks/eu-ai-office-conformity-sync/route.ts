import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import {
  isEuAiOfficeContinuousConformityEnabled,
  syncConformityDeltaFromNotifiedBody,
} from "@/lib/compliance/eu-ai-office-continuous-conformity";
import { recordEuAiOfficeAssessment } from "@/lib/compliance/eu-ai-office-notified-body";
import { coalesceThemeExperimentJson, toInputJsonValue } from "@/lib/prisma/json";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  notifiedBodyId: z.string().min(1).max(64),
  notifiedBodyName: z.string().min(1).max(120),
  conformityStatus: z.enum(["conformity", "refusal", "conditional"]),
  highRiskAiSystem: z.boolean(),
  certBodyCrossRef: z.string().optional().nullable(),
  validUntil: z.string().datetime(),
  euDatabaseUrl: z.string().url().optional().nullable(),
});

export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.EU_AI_OFFICE_CONFORMITY_WEBHOOK_SECRET,
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

  let mergedJson = coalesceThemeExperimentJson(sf.themeExperimentJson);
  const { json: merged, pack } = recordEuAiOfficeAssessment(mergedJson, {
    notifiedBodyId: parsed.data.notifiedBodyId,
    notifiedBodyName: parsed.data.notifiedBodyName,
    conformityStatus: parsed.data.conformityStatus,
    highRiskAiSystem: parsed.data.highRiskAiSystem,
    certBodyCrossRef: parsed.data.certBodyCrossRef ?? null,
    validUntil: parsed.data.validUntil,
    euDatabaseUrl: parsed.data.euDatabaseUrl ?? null,
  });
  mergedJson = coalesceThemeExperimentJson(merged);

  let continuousReady = false;
  if (isEuAiOfficeContinuousConformityEnabled()) {
    const delta = syncConformityDeltaFromNotifiedBody(mergedJson);
    mergedJson = coalesceThemeExperimentJson(delta.json);
    continuousReady = delta.pack?.continuousConformityReady ?? false;
  }

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: toInputJsonValue(mergedJson) },
  });

  logger.info("eu_ai_office_conformity_webhook", {
    storeSlug: parsed.data.storeSlug,
    status: parsed.data.conformityStatus,
    ready: pack.notifiedBodyReady,
  });

  return NextResponse.json({ ok: true, pack, continuousReady });
}
