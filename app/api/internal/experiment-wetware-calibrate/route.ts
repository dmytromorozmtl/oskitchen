import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  isWetwareCalibrationEnabled,
  recordWetwareOutcome,
} from "@/lib/storefront/theme-experiment-wetware-calibration";
import { readLinUcbSnapshot } from "@/lib/storefront/theme-experiment-linucb";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  armId: z.string().min(1).max(64),
  converted: z.boolean(),
  liftSignal: z.number().optional(),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isWetwareCalibrationEnabled()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const secret = process.env.STOREFRONT_MIDDLEWARE_SECRET?.trim();
  if (!secret || request.headers.get("x-kos-mw-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const snapshot = readLinUcbSnapshot(sf.themeExperimentJson);
  const { json: merged, snap } = recordWetwareOutcome(sf.themeExperimentJson, {
    armId: parsed.data.armId,
    converted: parsed.data.converted,
    liftSignal: parsed.data.liftSignal,
    snapshot: snapshot ?? undefined,
  });

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  return NextResponse.json({
    ok: true,
    calibrated: snap.calibrated,
    totalOutcomes: snap.totalOutcomes,
  });
}
