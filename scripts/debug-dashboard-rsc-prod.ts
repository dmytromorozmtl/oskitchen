#!/usr/bin/env npx tsx
/**
 * Reproduce production RSC loader failures locally against production DB.
 * Usage: npx tsx scripts/debug-dashboard-rsc-prod.ts [userId]
 */
import { loadProductionEnvLocal } from "@/scripts/lib/load-dotenv-file";
import { prisma } from "@/lib/prisma";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { resolveMarketplaceHubAccess } from "@/lib/marketplace/marketplace-page-access";
import { generateDailyBriefing } from "@/services/ai/ai-restaurant-brain";
import { loadDigitalTwinDashboard } from "@/services/ai/digital-twin";
import { loadKitchenCameraDashboard } from "@/services/ai/kitchen-camera-dashboard";
import { loadMarketplaceDashboard } from "@/services/marketplace/marketplace-dashboard-service";
import { loadTodayCommandCenter } from "@/services/today/today-command-center-service";
import {
  loadOwnerDailyBriefing,
  resolveOwnerDailyBriefingVisibility,
} from "@/services/briefing/owner-daily-briefing-service";
import { loadLaunchWizardModel } from "@/services/launch-wizard/launch-wizard-service";
import { loadCommercialPilotOpsStatusModel } from "@/services/commercial/commercial-pilot-ops-status-service";
import { loadPilotIntegrationHealthStripModelForWorkspace } from "@/lib/integrations/pilot-integration-health-strip-era18";
import { loadGettingStartedStatus } from "@/services/onboarding/getting-started-status";
import { resolveOperatorHomePersona } from "@/lib/navigation/operator-home-era18";
import { canUseFullSupportInbox } from "@/lib/support/support-permissions";

loadProductionEnvLocal();

async function step<T>(name: string, fn: () => Promise<T>): Promise<T | undefined> {
  try {
    const result = await fn();
    console.log(`✓ ${name}`);
    return result;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(error);
    return undefined;
  }
}

async function main() {
  let userId = process.argv[2];
  const email = process.env.E2E_LOGIN_EMAIL?.trim();
  if (!userId && email) {
    const row = await prisma.userProfile.findFirst({
      where: { email },
      select: { id: true, email: true },
    });
    if (row) {
      userId = row.id;
      console.log("Using E2E user:", row.email ?? row.id);
    }
  }
  if (!userId) {
    const owner = await prisma.userProfile.findFirst({
      where: { role: "OWNER" },
      select: { id: true, email: true },
    });
    if (!owner) throw new Error("No user found");
    userId = owner.id;
    console.log("Using owner:", owner.email ?? owner.id);
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { createdAt: true, role: true, email: true },
  });
  if (!profile) throw new Error(`User not found: ${userId}`);

  const workspace = await prisma.workspace.findFirst({
    where: { ownerUserId: userId },
    select: { id: true },
  });
  const workspaceId = workspace?.id ?? null;
  console.log("workspaceId:", workspaceId);

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { businessType: true },
  });

  if (workspaceId) {
    await step("loadMarketplaceDashboard", () =>
      loadMarketplaceDashboard(workspaceId, kitchen?.businessType ?? null),
    );
    await step("loadDigitalTwinDashboard", () => loadDigitalTwinDashboard(workspaceId));
    await step("loadKitchenCameraDashboard", () => loadKitchenCameraDashboard(workspaceId));
    await step("generateDailyBriefing", () => generateDailyBriefing(workspaceId));
  }

  const today = await step("loadTodayCommandCenter", () => loadTodayCommandCenter(userId!));
  const actor = {
    workspaceRole: profile.role ?? "OWNER",
    staffRoleType: null as string | null,
    granted: new Set<string>(),
    platformBypass: false,
    sessionUserId: userId!,
    email: profile.email,
  };
  const persona = resolveOperatorHomePersona({
    workspaceRole: actor.workspaceRole,
    staffRoleType: actor.staffRoleType,
    granted: actor.granted,
    platformBypass: actor.platformBypass,
  });
  const supportAdmin = await canUseFullSupportInbox(
    actor.sessionUserId,
    actor.email,
    actor.workspaceRole,
  );
  const showOwnerBriefing = resolveOwnerDailyBriefingVisibility({
    workspaceRole: actor.workspaceRole,
    persona,
    granted: actor.granted,
    supportAdmin,
  });
  if (showOwnerBriefing) {
    const launchWizard = await step("loadLaunchWizardModel", () => loadLaunchWizardModel(userId!));
    await step("loadOwnerDailyBriefing", () =>
      loadOwnerDailyBriefing(userId!, {
        showIntegrationHealth: true,
        today,
        persona,
        workspaceRole: actor.workspaceRole,
        supportAdmin,
        granted: actor.granted,
        workspaceId,
        launchWizard: launchWizard
          ? {
              commercialBlockers: launchWizard.commercialBlockers,
              commercialSetup: launchWizard.commercialSetup,
              nextStep: launchWizard.nextStep,
              progress: launchWizard.progress,
            }
          : undefined,
      }),
    );
  }
  await step("loadCommercialPilotOpsStatusModel", () => loadCommercialPilotOpsStatusModel());
  await step("loadPilotIntegrationHealthStripModelForWorkspace", () =>
    loadPilotIntegrationHealthStripModelForWorkspace(userId!),
  );
  await step("loadGettingStartedStatus", () =>
    loadGettingStartedStatus(userId!, profile.createdAt ?? new Date()),
  );

  console.log("\nDone — see ✓/✗ above for", userId);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
