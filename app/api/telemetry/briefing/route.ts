import { NextResponse } from "next/server";
import { z } from "zod";

import { getClientIpFromRequest } from "@/lib/rate-limit/client-ip";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";

export const runtime = "nodejs";

const briefingSurfaceSchema = z.enum([
  "next_action",
  "ranked_action",
  "hero_tile",
  "risk_signal",
  "production_lane",
  "pilot_lane",
  "integration_lane",
  "operational_empty",
]);

const bodySchema = z.object({
  eventName: z.literal("briefing_click").default("briefing_click"),
  surface: briefingSurfaceSchema,
  entityId: z.string().min(1).max(255),
  hrefPath: z.string().max(512).optional(),
  rolePack: z.string().max(64).optional(),
  linkState: z.string().max(64).optional(),
  category: z.string().max(64).optional(),
  severity: z.string().max(64).optional(),
  rank: z.number().int().min(0).max(100).optional(),
});

/** Persist Owner Daily Briefing click telemetry (server-side complement to PostHog). */
export async function POST(req: Request) {
  let actor;
  try {
    actor = await requireTenantActor();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIpFromRequest(req);
  const rl = await consumeRateLimitToken(
    `briefing_telemetry:${actor.userId}:${ip}`,
    "support_authed",
  );
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

  const row = await prisma.briefingTelemetry.create({
    data: {
      userId: actor.userId,
      workspaceId: actor.workspaceId,
      eventName: parsed.data.eventName,
      surface: parsed.data.surface,
      entityId: parsed.data.entityId,
      hrefPath: parsed.data.hrefPath,
      rolePack: parsed.data.rolePack,
      linkState: parsed.data.linkState,
      category: parsed.data.category,
      severity: parsed.data.severity,
      rank: parsed.data.rank,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: row.id });
}
