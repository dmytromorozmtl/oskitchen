"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { prisma } from "@/lib/prisma";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { safeError } from "@/lib/security";
import { auditStorefrontExperimentApplyWinner, auditStorefrontExperimentConcluded, auditStorefrontExperimentEdgeRetry } from "@/lib/storefront/storefront-experiment-audit";
import { evaluateExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";
import { parseThemeExperimentStored } from "@/lib/storefront/theme-experiment-version";
import type { ThemeExperimentConcludeOutcome } from "@/lib/storefront/theme-experiment-version";
import { requireStorefrontPublishActor } from "@/lib/storefront/require-storefront-actor";
import { countBlockingEdgeSyncJobs, reenqueueThemeExperimentEdgeSync } from "@/services/storefront/storefront-edge-sync-job-service";
import { getThemeExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";
import { concludeThemeExperimentLifecycle } from "@/services/storefront/theme-experiment-lifecycle-service";
import { publishStorefrontThemeSnapshot } from "@/services/storefront/storefront-theme-publish-service";

const themeExperimentConcludeSchema = z.object({
  storefrontId: z.string().min(1),
  outcome: z.enum(["publish_draft", "keep_published"]),
});

const themeExperimentApplySchema = z.object({
  storefrontId: z.string().min(1),
  days: z.number().int().min(1).max(90).default(7),
});

async function requireOwnerStorefront(userId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (profile?.role !== "OWNER") {
    return { error: "Only the workspace owner can manage theme experiments." as const };
  }
  const { sf: row } = await requireAdminStorefrontRow("storefront.theme", { id: true, storeSlug: true, themeExperimentJson: true });
  if (!row) return { error: "Save the storefront overview once first." as const };
  return { row };
}

/** Retry Edge Config sync without bumping experiment version. */
export async function retryThemeExperimentEdgeSyncAction() {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const gate = await requireOwnerStorefront(user.id);
    if ("error" in gate) return gate;

    const stored = parseThemeExperimentStored(gate.row.themeExperimentJson);
    if (!stored?.enabled) {
      return { error: "Enable the experiment or save settings before retrying edge sync." };
    }

    const job = await reenqueueThemeExperimentEdgeSync({
      storefrontId: gate.row.id,
      storeSlug: gate.row.storeSlug,
      themeExperimentJson: gate.row.themeExperimentJson,
    });

    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { email: true },
    });
    await auditStorefrontExperimentEdgeRetry({
      userId,
      email: profile?.email,
      storefrontId: gate.row.id,
      storeSlug: gate.row.storeSlug,
      jobId: job.jobId,
    });

    revalidatePath("/dashboard/storefront/advanced");
    return {
      ok: true as const,
      synced: job.synced,
      jobId: job.jobId,
      error: job.error,
    };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function retryThemeExperimentEdgeSyncFormAction(): Promise<void> {
  void (await retryThemeExperimentEdgeSyncAction());
}

/**
 * Conclude experiment lifecycle: disable, bump version, enqueue edge delete sync.
 * Call after publishing draft theme (publish_draft) or when keeping published arm.
 */
export async function concludeThemeExperimentAction(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const gate = await requireOwnerStorefront(user.id);
    if ("error" in gate) return gate;

    const parsed = themeExperimentConcludeSchema.safeParse({
      storefrontId: gate.row.id,
      outcome: formData.get("outcome")?.toString() === "keep_published" ? "keep_published" : "publish_draft",
    });
    if (!parsed.success) return { error: "Invalid experiment outcome." };
    const outcome: ThemeExperimentConcludeOutcome = parsed.data.outcome;

    const { concluded, themeExperimentJson } = await concludeThemeExperimentLifecycle({
      storefrontId: gate.row.id,
      storeSlug: gate.row.storeSlug,
      themeExperimentJson: gate.row.themeExperimentJson,
      outcome,
    });

    if (!concluded) {
      return { error: "Experiment is already disabled." };
    }

    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { email: true },
    });
    await auditStorefrontExperimentConcluded({
      userId,
      email: profile?.email,
      storefrontId: gate.row.id,
      storeSlug: gate.row.storeSlug,
      outcome,
    });

    revalidateStorefrontDashboardAndPublic(gate.row.storeSlug);
    revalidatePath("/dashboard/storefront/advanced");

    return {
      ok: true as const,
      outcome,
    };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function concludeThemeExperimentFormAction(formData: FormData): Promise<void> {
  void (await concludeThemeExperimentAction(formData));
}

/** Publish draft theme + end experiment (one click). Gated on publish_draft decision and no blocking edge jobs. */
export async function applyExperimentWinnerAction(days = 7) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const gate = await requireOwnerStorefront(user.id);
    if ("error" in gate) return gate;

    const daysParsed = themeExperimentApplySchema.safeParse({
      storefrontId: gate.row.id,
      days,
    });
    if (!daysParsed.success) return { error: "Invalid experiment parameters." };
    const metricDays = daysParsed.data.days;

    const publishAccess = await requireStorefrontPublishActor({
      operation: "storefront.experiment_apply_winner",
    });
    if (!publishAccess.ok) {
      return { error: publishAccess.error };
    }

    const stored = parseThemeExperimentStored(gate.row.themeExperimentJson);
    if (!stored?.enabled) {
      return { error: "Enable the experiment before applying the winner." };
    }

    const blocking = await countBlockingEdgeSyncJobs(gate.row.id);
    if (blocking > 0) {
      return {
        error: "Edge sync in progress. Wait about a minute, then try Apply winner again.",
      };
    }

    const armMetrics = await getThemeExperimentArmMetrics(gate.row.id, metricDays);
    const decision = evaluateExperimentProdDecision(armMetrics);
    if (decision.recommendation !== "publish_draft") {
      return {
        error: `Apply winner requires publish_draft recommendation (current: ${decision.recommendation}).`,
      };
    }

    const publish = await publishStorefrontThemeSnapshot({
      userId,
      storefrontId: gate.row.id,
    });
    if (!publish.ok) return { error: publish.error };

    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { email: true },
    });
    await auditStorefrontExperimentApplyWinner({
      userId,
      email: profile?.email,
      storefrontId: gate.row.id,
      storeSlug: gate.row.storeSlug,
    });

    revalidateStorefrontDashboardAndPublic(gate.row.storeSlug);
    revalidatePath("/dashboard/storefront/advanced");
    revalidatePath("/dashboard/storefront/theme");

    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
