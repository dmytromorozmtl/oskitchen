import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBearerWebhookSecret } from "@/lib/api/webhook-guard";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const armSchema = z.object({
  armId: z.string().min(1).max(64),
  impressions: z.number().int().nonnegative(),
  conversions: z.number().int().nonnegative(),
  propensity: z.number().min(0.01).max(1),
});

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  policy: z.string().optional(),
  ipsLiftPp: z.number(),
  dmLiftPp: z.number(),
  estimatedRegretPp: z.number(),
  arms: z.array(armSchema).min(1),
  asOf: z.string().datetime().optional(),
});

/**
 * BQ off-policy evaluation for contextual bandit regret.
 * Auth: `Authorization: Bearer ${BIGQUERY_OFF_POLICY_WEBHOOK_SECRET}`
 */
export async function POST(request: Request) {
  const authError = requireBearerWebhookSecret(request, {
    secret: process.env.BIGQUERY_OFF_POLICY_WEBHOOK_SECRET,
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

  const base =
    sf.themeExperimentJson && typeof sf.themeExperimentJson === "object" && !Array.isArray(sf.themeExperimentJson)
      ? { ...(sf.themeExperimentJson as Record<string, unknown>) }
      : {};

  base.offPolicyEvaluation = {
    at: parsed.data.asOf ?? new Date().toISOString(),
    policy: parsed.data.policy ?? "contextual_thompson",
    ipsLiftPp: parsed.data.ipsLiftPp,
    dmLiftPp: parsed.data.dmLiftPp,
    estimatedRegretPp: parsed.data.estimatedRegretPp,
    arms: parsed.data.arms,
  };

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: base as object },
  });

  logger.info("bigquery_off_policy_webhook", {
    storeSlug: parsed.data.storeSlug,
    regretPp: parsed.data.estimatedRegretPp,
  });

  return NextResponse.json({ ok: true, storefrontId: sf.id });
}
