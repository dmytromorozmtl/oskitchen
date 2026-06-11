import { CoPilotAutonomousPanel } from "@/components/dashboard/ai/co-pilot-autonomous-panel";
import { canUseCopilot } from "@/lib/ai/copilot-permissions";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadCopilotPageActor } from "@/lib/ux/copilot-page-access-era20";
import { loadCoPilotAutonomousDashboard } from "@/services/ai/co-pilot-autonomous-service";

export const metadata = {
  title: "AI Co-Pilot 2.0 — Autonomous",
  description: "Daily digest, exception log, and safe autonomous restaurant operations.",
};

export const dynamic = "force-dynamic";

export default async function CoPilotAutonomousPage() {
  const { userId } = await getTenantActor();
  const { scope } = await loadCopilotPageActor();
  const dashboard = await loadCoPilotAutonomousDashboard(userId);
  const canManage = canUseCopilot(scope, "copilot.actions.approve");

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <CoPilotAutonomousPanel dashboard={dashboard} canManage={canManage} />
    </div>
  );
}
