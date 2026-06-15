#!/usr/bin/env npx tsx
import { loadProductionEnvLocal } from "@/scripts/lib/load-dotenv-file";
import { prisma } from "@/lib/prisma";
import { loadTodayCommandCenter } from "@/services/today/today-command-center-service";
import {
  loadOwnerDailyBriefing,
  resolveOwnerDailyBriefingVisibility,
} from "@/services/briefing/owner-daily-briefing-service";
import { loadLaunchWizardModel } from "@/services/launch-wizard/launch-wizard-service";
import { loadCommercialPilotOpsStatusModel } from "@/services/commercial/commercial-pilot-ops-status-service";
import { buildOwnerDailyBriefingBreakthroughEra25UiSlice } from "@/lib/commercial/owner-daily-briefing-breakthrough-ui-era25";
import { resolveTodayCommercialInflectionUiSlice } from "@/lib/commercial/commercial-pilot-ops-inflection-era28";
import { loadPilotIntegrationHealthStripModelForWorkspace } from "@/lib/integrations/pilot-integration-health-strip-era18";
import { loadGettingStartedStatus } from "@/services/onboarding/getting-started-status";

loadProductionEnvLocal();

async function step<T>(name: string, fn: () => Promise<T>): Promise<T> {
  try {
    const result = await fn();
    console.log(`✓ ${name}`);
    return result;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(error);
    throw error;
  }
}

async function main() {
  let userId = process.argv[2];
  if (!userId) {
    const owner = await prisma.userProfile.findFirst({
      where: { role: "OWNER" },
      select: { id: true, email: true },
    });
    if (!owner) throw new Error("No OWNER user found");
    userId = owner.id;
    console.log("Using owner:", owner.email ?? owner.id);
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { createdAt: true, role: true },
  });
  if (!profile) throw new Error(`User not found: ${userId}`);

  const today = await step("loadTodayCommandCenter", () => loadTodayCommandCenter(userId!));
  const commercialOps = await step("loadCommercialPilotOpsStatusModel", () =>
    loadCommercialPilotOpsStatusModel(),
  );
  await step("resolveTodayCommercialInflectionUiSlice", async () => {
    resolveTodayCommercialInflectionUiSlice(commercialOps);
  });
  await step("buildOwnerDailyBriefingBreakthroughEra25UiSlice", async () => {
    buildOwnerDailyBriefingBreakthroughEra25UiSlice({ blueprintVisible: true });
  });
  const launchWizard = await step("loadLaunchWizardModel", () => loadLaunchWizardModel(userId!));
  await step("loadPilotIntegrationHealthStripModelForWorkspace", () =>
    loadPilotIntegrationHealthStripModelForWorkspace(userId!),
  );
  await step("loadGettingStartedStatus", () =>
    loadGettingStartedStatus(userId!, profile.createdAt ?? new Date()),
  );

  const showOwnerBriefing = resolveOwnerDailyBriefingVisibility({
    workspaceRole: profile.role ?? "OWNER",
    persona: "owner",
    granted: new Set(),
    supportAdmin: false,
  });

  if (showOwnerBriefing) {
    await step("loadOwnerDailyBriefing", () =>
      loadOwnerDailyBriefing(userId!, {
        showIntegrationHealth: true,
        today,
        persona: "owner",
        workspaceRole: profile.role ?? "OWNER",
        supportAdmin: false,
        granted: new Set(),
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

  console.log("\nAll Today page loaders OK");
}

main()
  .catch(() => process.exit(1))
  .finally(() => prisma.$disconnect());
