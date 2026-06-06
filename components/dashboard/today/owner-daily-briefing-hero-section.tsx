import { OwnerDailyBriefingBreakthroughEra25Panel } from "@/components/dashboard/owner-daily-briefing-breakthrough-era25-panel";
import { OwnerDailyBriefingHero } from "@/components/dashboard/owner-daily-briefing-hero";
import { PilotIntegrationHealthStrip } from "@/components/dashboard/pilot-integration-health-strip";
import { buildOwnerDailyBriefingBreakthroughEra25UiSlice } from "@/lib/commercial/owner-daily-briefing-breakthrough-ui-era25";
import type { PilotIntegrationHealthStripModel } from "@/lib/integrations/pilot-integration-health-strip-era18";
import type { OperatorHomePersona } from "@/lib/navigation/operator-home-era18";
import type { PermissionKey } from "@/lib/permissions/permissions";
import type { TodayCommandCenterPayload } from "@/services/today/today-command-center-service";
import {
  loadOwnerDailyBriefing,
} from "@/services/briefing/owner-daily-briefing-service";
import { loadLaunchWizardModel } from "@/services/launch-wizard/launch-wizard-service";
import type { UserRole } from "@prisma/client";

type Props = {
  dataUserId: string;
  showIntegrationHealth: boolean;
  today: TodayCommandCenterPayload;
  persona: OperatorHomePersona;
  workspaceRole: UserRole;
  supportAdmin: boolean;
  granted: ReadonlySet<PermissionKey>;
  workspaceId: string | null;
  internalOpsUi: boolean;
  integrationHealthStripModel?: PilotIntegrationHealthStripModel | null;
};

export async function OwnerDailyBriefingHeroSection(props: Props) {
  const launchWizardModel = await loadLaunchWizardModel(props.dataUserId).catch((error) => {
    console.error("[today] launch wizard load failed (briefing section)", error);
    return null;
  });

  const ownerBriefing = await loadOwnerDailyBriefing(props.dataUserId, {
    showIntegrationHealth: props.showIntegrationHealth,
    today: props.today,
    persona: props.persona,
    workspaceRole: props.workspaceRole,
    supportAdmin: props.supportAdmin,
    granted: props.granted,
    workspaceId: props.workspaceId,
    launchWizard: launchWizardModel
      ? {
          commercialBlockers: launchWizardModel.commercialBlockers,
          commercialSetup: launchWizardModel.commercialSetup,
          nextStep: launchWizardModel.nextStep,
          progress: launchWizardModel.progress,
        }
      : undefined,
  }).catch((error) => {
    console.error("[today] owner briefing load failed", error);
    return null;
  });

  if (!ownerBriefing) {
    return null;
  }

  let breakthroughEra25 = null;
  if (props.internalOpsUi) {
    try {
      breakthroughEra25 = buildOwnerDailyBriefingBreakthroughEra25UiSlice({ blueprintVisible: true });
    } catch (error) {
      console.error("[today] breakthrough era25 slice failed", error);
    }
  }

  return (
    <>
      {props.integrationHealthStripModel && !ownerBriefing.showIntegrationHealthLane ? (
        <PilotIntegrationHealthStrip model={props.integrationHealthStripModel} />
      ) : null}
      <OwnerDailyBriefingHero briefing={ownerBriefing} />
      {breakthroughEra25 && !ownerBriefing.pureOperationalModeEra25Active ? (
        <OwnerDailyBriefingBreakthroughEra25Panel slice={breakthroughEra25} />
      ) : null}
    </>
  );
}
