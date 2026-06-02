import { NextResponse } from "next/server";
import { z } from "zod";

import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";

export const runtime = "nodejs";

const bodySchema = z.object({
  sectionId: z.string().min(1).max(64),
  helpful: z.boolean(),
});

/** Persist AI briefing section feedback (thumbs up/down). */
export async function POST(req: Request) {
  let actor;
  try {
    actor = await requireTenantActor();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIpFromRequest(req);
  const rl = await consumeRateLimitToken(
    `ai_briefing_feedback:${actor.userId}:${ip}`,
    "support_authed",
  );
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
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

  const row = await prisma.briefingTelemetry.create({
    data: {
      userId: actor.userId,
      workspaceId: actor.workspaceId,
      eventName: "ai_briefing_feedback",
      surface: "ai_briefing_section",
      entityId: parsed.data.sectionId,
      category: parsed.data.helpful ? "helpful" : "not_helpful",
      metadataJson: { helpful: parsed.data.helpful },
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: row.id });
}
