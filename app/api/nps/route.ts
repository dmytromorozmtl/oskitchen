import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSessionOrIngestBearer } from "@/lib/api/public-post-guard";
import { notifyGrowthInbound } from "@/lib/growth/growth-notify";
import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";
import { prisma } from "@/lib/prisma";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";
import { AppFeedbackType } from "@prisma/client";

const bodySchema = z.object({
  score: z.number().int().min(0).max(10),
  feedback: z.string().max(4000).optional(),
  operatorId: z.string().uuid().optional(),
  email: z.string().email().optional(),
});

/**
 * Day-30 NPS capture — persists to AppFeedback and alerts founder when score < 7.
 * Requires authenticated session or `NPS_INGEST_SECRET` bearer (automation).
 */
export async function POST(req: Request) {
  const auth = await requireSessionOrIngestBearer(req, {
    secretEnv: process.env.NPS_INGEST_SECRET,
    missingMessage: "NPS feedback ingest not configured",
  });
  if (!auth.ok) {
    return auth.response;
  }

  const ip = getClientIpFromRequest(req);
  const rl = await consumeRateLimitToken(`nps_feedback:${auth.userId}:${ip}`, "support_authed");
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const { score, feedback, email } = parsed.data;
  const userId = auth.userId === "ingest" ? parsed.data.operatorId : auth.userId;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "operatorId required" }, { status: 400 });
  }

  await prisma.appFeedback.create({
    data: {
      userId,
      email,
      type: AppFeedbackType.GENERAL,
      title: `NPS ${score}/10`,
      message: feedback?.trim() || "(no written feedback)",
      route: "/dashboard/today",
      featureArea: "nps_day30",
    },
  });

  if (score < 7) {
    await notifyGrowthInbound(
      `Low NPS ${score}/10`,
      `Operator: ${userId ?? email ?? "anonymous"}\nScore: ${score}\n\n${feedback ?? ""}`,
    );
  }

  return NextResponse.json({ ok: true });
}
