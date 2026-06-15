import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import { recordCertBodyAttestation } from "@/lib/compliance/iso-42001-cert-body";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  certBodyId: z.string().min(1).max(64),
  certBodyName: z.string().min(1).max(120),
  stage: z.enum(["stage1", "stage2", "surveillance"]),
  verdict: z.enum(["conformant", "minor_nc", "major_nc"]),
  validUntil: z.string().datetime(),
  auditorPortalUrl: z.string().url().optional().nullable(),
});

/**
 * ISO 42001 certification body attestation webhook.
 * Auth: Bearer ISO_42001_CERT_BODY_WEBHOOK_SECRET
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.ISO_42001_CERT_BODY_WEBHOOK_SECRET,
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

  const { json: merged, pack } = recordCertBodyAttestation(sf.themeExperimentJson, {
    certBodyId: parsed.data.certBodyId,
    certBodyName: parsed.data.certBodyName,
    scope: "ISO/IEC 42001:2023",
    stage: parsed.data.stage,
    verdict: parsed.data.verdict,
    validUntil: parsed.data.validUntil,
    auditorPortalUrl: parsed.data.auditorPortalUrl ?? null,
  });

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  logger.info("iso_42001_cert_body_webhook", {
    storeSlug: parsed.data.storeSlug,
    verdict: parsed.data.verdict,
    ready: pack.externalAuditorReady,
  });

  return NextResponse.json({ ok: true, pack });
}
