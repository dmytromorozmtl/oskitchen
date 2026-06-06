import { LaunchWizardTodayStrip } from "@/components/dashboard/launch-wizard/launch-wizard-today-strip";
import { resolveBriefingRolePack } from "@/lib/briefing/owner-daily-briefing-role-packs-era19";
import type { OperatorHomePersona } from "@/lib/navigation/operator-home-era18";
import { loadLaunchWizardModel } from "@/services/launch-wizard/launch-wizard-service";
import type { UserRole } from "@prisma/client";

type Props = {
  dataUserId: string;
  briefingActive: boolean;
  persona: OperatorHomePersona;
  workspaceRole: UserRole;
  supportAdmin: boolean;
};

export async function LaunchWizardTodayStripSection(props: Props) {
  const launchWizardModel = await loadLaunchWizardModel(props.dataUserId).catch((error) => {
    console.error("[today] launch wizard load failed (strip section)", error);
    return null;
  });

  if (!launchWizardModel) {
    return null;
  }

  const rolePack = resolveBriefingRolePack({
    workspaceRole: props.workspaceRole,
    persona: props.persona,
    supportAdmin: props.supportAdmin,
  });

  return (
    <LaunchWizardTodayStrip
      model={launchWizardModel}
      briefingActive={props.briefingActive}
      rolePack={rolePack}
    />
  );
}
