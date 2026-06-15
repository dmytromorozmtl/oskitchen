import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  isQuantumSafeAssignmentEnabled,
  proveAssignmentFairness,
  recordZkAssignmentProof,
} from "@/lib/storefront/theme-experiment-zk-assignment-fairness";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  visitorId: z.string().min(8).max(128),
  armId: z.string().min(1).max(64),
});

export const dynamic = "force-dynamic";

/**
 * Middleware fire-and-forget — persist Groth16-sim assignment fairness proof.
 */
export async function POST(request: Request) {
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

  const proof = proveAssignmentFairness({
    visitorId: parsed.data.visitorId,
    armId: parsed.data.armId,
    useQuantumHybrid: isQuantumSafeAssignmentEnabled(),
  });

  const merged = recordZkAssignmentProof(sf.themeExperimentJson, proof);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: merged as object },
  });

  return NextResponse.json({ ok: true, verified: proof.verified });
}
