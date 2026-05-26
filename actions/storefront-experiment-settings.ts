"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { type ThemeExperimentJson } from "@/lib/prisma/json";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { setWorkspaceFeatureOverride } from "@/lib/feature-flags";
import { prisma } from "@/lib/prisma";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { safeError } from "@/lib/security";
import { STOREFRONT_THEME_EXPERIMENT_FEATURE_KEY } from "@/lib/storefront/theme-experiment-pipeline";
import { buildThemeExperimentJsonForSave } from "@/lib/storefront/theme-experiment-version";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import { enqueueThemeExperimentEdgeSync } from "@/services/storefront/storefront-edge-sync-job-service";

async function requireOwnerStorefront(userId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (profile?.role !== "OWNER") {
    return { error: "Only the workspace owner can change experiment settings." as const };
  }
  const { sf: row } = await requireAdminStorefrontRow("storefront.settings", {
    id: true,
    storeSlug: true,
    workspaceId: true,
    themeExperimentJson: true,
  });
  if (!row) return { error: "Save the storefront overview once first." as const };
  return { row };
}

export async function updateStorefrontExperimentOpsSettings(formData: FormData) {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const gate = await requireOwnerStorefront(user.id);
    if ("error" in gate) return gate;

    const pipelineEnabled = formData.getAll("pipelineEnabled").includes("on");
    const autoConcludeEnabled = formData.getAll("autoConcludeEnabled").includes("on");
    const holdoutRaw = formData.get("postWinnerHoldoutPercent")?.toString();
    const postWinnerHoldoutPercent = holdoutRaw ? Number(holdoutRaw) : 0;
    const legalHoldOn = formData.getAll("experimentLegalHold").includes("on");
    const exp = parseThemeExperimentConfig(gate.row.themeExperimentJson);

    const themeExperimentJson = buildThemeExperimentJsonForSave({
      enabled: exp?.enabled === true,
      trafficPercent: exp?.trafficPercent ?? 50,
      draftPresetId: exp?.draftPresetId,
      pipelineEnabled,
      autoConcludeEnabled,
      postWinnerHoldoutPercent,
      previousRaw: gate.row.themeExperimentJson,
    });

    await prisma.storefrontSettings.update({
      where: { id: gate.row.id },
      data: {
        themeExperimentJson,
        experimentLegalHoldAt: legalHoldOn ? new Date() : null,
      },
    });

    await enqueueThemeExperimentEdgeSync({
      storefrontId: gate.row.id,
      storeSlug: gate.row.storeSlug,
      themeExperimentJson,
    });

    if (gate.row.workspaceId) {
      const workspacePipeline = formData.get("workspacePipelineEnabled");
      if (workspacePipeline === "on" || workspacePipeline === "off") {
        await setWorkspaceFeatureOverride(
          gate.row.workspaceId,
          STOREFRONT_THEME_EXPERIMENT_FEATURE_KEY,
          workspacePipeline === "on",
        );
      }

      const policyAutoConclude = formData.get("workspaceAutoConcludeDefault");
      const policyRequireApproval = formData.get("workspaceRequireApproval");
      const policyMinLift = formData.get("workspaceMinLiftPp")?.toString();
      if (
        policyAutoConclude !== null ||
        policyRequireApproval !== null ||
        policyMinLift
      ) {
        await prisma.workspace.update({
          where: { id: gate.row.workspaceId },
          data: {
            experimentPolicyJson: {
              autoConcludeDefault: policyAutoConclude === "on",
              requireApproval: policyRequireApproval !== "off",
              ...(policyMinLift ? { minLiftPp: Number(policyMinLift) } : {}),
            },
          },
        });
      }
    }

    revalidateStorefrontDashboardAndPublic(gate.row.storeSlug);
    revalidatePath("/dashboard/storefront/settings/experiments");
    revalidatePath("/dashboard/storefront/advanced");
    revalidatePath("/dashboard/workspace/experiments");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontExperimentOpsSettingsFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontExperimentOpsSettings(formData));
}
