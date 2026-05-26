"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import type { Prisma } from "@prisma/client";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import {
  enqueueEthicsReview,
  isPrefrontalEthicsBoardEnabled,
  readPrefrontalEthicsBoard,
} from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";
import { syncCerebellarFromEthicsBoard } from "@/lib/storefront/theme-experiment-cerebellar-motor-organoid";
import { syncBrainstemFromCerebellar } from "@/lib/storefront/theme-experiment-brainstem-autonomic-guard";
import { syncSpinalThrottleFromBrainstem } from "@/lib/storefront/theme-experiment-spinal-cord-publish-throttle";
import { syncMedullaFromSpinalAndEthics } from "@/lib/storefront/theme-experiment-medulla-oblongata-emergency-halt";
import { syncPonsFromMedullaAndSpinal } from "@/lib/storefront/theme-experiment-pons-autonomic-bridge-failover";
import { syncMidbrainFromPonsAndSpinal } from "@/lib/storefront/theme-experiment-midbrain-arousal-publish-pacing";
import { syncThalamusFromMidbrainAndSpinal } from "@/lib/storefront/theme-experiment-thalamus-sensory-gating-publish";
import { syncBasalGangliaFromThalamusAndMidbrain } from "@/lib/storefront/theme-experiment-basal-ganglia-action-selection-publish";
import { syncCerebellumFromBasalGangliaAndMidbrain } from "@/lib/storefront/theme-experiment-cerebellum-motor-refinement-publish";
import { syncMotorCortexFromCerebellumAndMidbrain } from "@/lib/storefront/theme-experiment-motor-cortex-execution-publish";
import { syncPremotorSmaFromMotorCortexAndEthics } from "@/lib/storefront/theme-experiment-premotor-sma-planning-publish";

export async function submitEthicsReviewAction(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean } | null> {
  try {
    if (!isPrefrontalEthicsBoardEnabled()) {
      return { error: "Ethics board is not enabled." };
    }

    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const status = formData.get("status")?.toString();
    if (status !== "approved" && status !== "vetoed") {
      return { error: "Invalid status." };
    }

    const reviewId = formData.get("reviewId")?.toString().trim();
    const rationale = formData.get("rationale")?.toString().trim() || `Dashboard ${status}`;

    const sf = await prisma.storefrontSettings.findFirst({ where: { userId: dataUserId  }, orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
      select: { id: true, themeExperimentJson: true },
    });
    if (!sf) return { error: "Storefront not configured." };

    const board = readPrefrontalEthicsBoard(sf.themeExperimentJson);
    const pending = board?.queue.find((q) => q.status === "pending");
    const targetId = reviewId || pending?.reviewId;

    let json = sf.themeExperimentJson as Prisma.InputJsonValue;
    const { json: withEthics } = enqueueEthicsReview(json, {
      reviewId: targetId,
      status,
      reviewerId: user.id,
      rationale,
      armId: pending?.armId ?? null,
    });
    json = withEthics as Prisma.InputJsonValue;
    json = syncCerebellarFromEthicsBoard(json).json as Prisma.InputJsonValue;
    json = syncBrainstemFromCerebellar(json).json as Prisma.InputJsonValue;
    json = syncSpinalThrottleFromBrainstem(json).json as Prisma.InputJsonValue;
    json = syncMedullaFromSpinalAndEthics(json).json as Prisma.InputJsonValue;
    json = syncPonsFromMedullaAndSpinal(json).json as Prisma.InputJsonValue;
    json = syncMidbrainFromPonsAndSpinal(json).json as Prisma.InputJsonValue;
    json = syncThalamusFromMidbrainAndSpinal(json).json as Prisma.InputJsonValue;
    json = syncBasalGangliaFromThalamusAndMidbrain(json).json as Prisma.InputJsonValue;
    json = syncCerebellumFromBasalGangliaAndMidbrain(json).json as Prisma.InputJsonValue;
    json = syncMotorCortexFromCerebellumAndMidbrain(json).json as Prisma.InputJsonValue;
    json = syncPremotorSmaFromMotorCortexAndEthics(json).json as Prisma.InputJsonValue;

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: json },
    });

    revalidatePath("/dashboard/storefront/advanced");
    revalidatePath("/dashboard/storefront/theme");
    revalidatePath("/dashboard/compliance/experiment-audit");
    return { ok: true };
  } catch (e) {
    return { error: safeError(e) };
  }
}
