import { NextResponse } from "next/server";
import { z } from "zod";

import { notifyGrowthInbound } from "@/lib/growth/growth-notify";
import { prisma } from "@/lib/prisma";
import { AppFeedbackType } from "@prisma/client";

const bodySchema = z.object({
  score: z.number().int().min(0).max(10),
  feedback: z.string().max(4000).optional(),
  operatorId: z.string().uuid().optional(),
  email: z.string().email().optional(),
});

/**
 * Day-30 NPS capture — persists to AppFeedback and alerts founder when score < 7.
 */
export async function POST(req: Request) {
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

  const { score, feedback, operatorId, email } = parsed.data;

  await prisma.appFeedback.create({
    data: {
      userId: operatorId,
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
      `Operator: ${operatorId ?? email ?? "anonymous"}\nScore: ${score}\n\n${feedback ?? ""}`,
    );
  }

  return NextResponse.json({ ok: true });
}
