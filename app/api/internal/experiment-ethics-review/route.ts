import { NextResponse } from "next/server";
import { z } from "zod";

import {
  enqueueEthicsReview,
  isPrefrontalEthicsBoardEnabled,
  readPrefrontalEthicsBoard,
} from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";
import { syncCerebellarFromEthicsBoard } from "@/lib/storefront/theme-experiment-cerebellar-motor-organoid";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(120),
  reviewId: z.string().min(1).max(128).optional(),
  status: z.enum(["approved", "vetoed"]),
  reviewerId: z.string().min(1).max(120),
  rationale: z.string().min(1).max(500),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isPrefrontalEthicsBoardEnabled()) {
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

  const board = readPrefrontalEthicsBoard(sf.themeExperimentJson);
  const pending = board?.queue.find((q) => q.status === "pending");
  const targetId = parsed.data.reviewId ?? pending?.reviewId;

  const { json: withEthics, snap } = enqueueEthicsReview(sf.themeExperimentJson, {
    reviewId: targetId,
    status: parsed.data.status,
    reviewerId: parsed.data.reviewerId,
    rationale: parsed.data.rationale,
    armId: pending?.armId ?? null,
  });

  const { json: finalJson } = syncCerebellarFromEthicsBoard(withEthics);

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { themeExperimentJson: finalJson as object },
  });

  return NextResponse.json({
    ok: true,
    ethicsBoardReady: snap.ethicsBoardReady,
    publishVetoActive: snap.publishVetoActive,
    pendingCount: snap.pendingCount,
  });
}
