import { HomeOverview } from "@/components/dashboard/home-overview";
import { OperatorHomePanel } from "@/components/dashboard/operator-home-panel";
import { PilotIntegrationHealthStrip } from "@/components/dashboard/pilot-integration-health-strip";
import {
  listOperatorHomeActions,
  resolveOperatorHomePersona,
} from "@/lib/navigation/operator-home-era18";
import { getServerEnv } from "@/lib/env";
import { buildPilotIntegrationHealthStripModel } from "@/lib/integrations/pilot-integration-health-strip-era18";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { getCachedWebhookEventListWhere } from "@/lib/scope/cached-workspace-resource-scope";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import {
  listIntegrationHealthCards,
  summarizeIntegrationHealth,
} from "@/services/developer/integration-health-service";

export default async function DashboardHomePage() {
  const [{ dataUserId }, actor] = await Promise.all([
    getTenantActor(),
    requireWorkspacePermissionActor(),
  ]);

  const persona = resolveOperatorHomePersona({
    workspaceRole: actor.workspaceRole,
    staffRoleType: actor.staffRoleType,
    granted: actor.granted,
    platformBypass: actor.platformBypass,
  });

  if (persona === "owner") {
    return <HomeOverview userId={dataUserId} />;
  }

  const actions = listOperatorHomeActions(persona, actor.granted);

  let integrationHealthStrip = null;
  if (persona === "manager") {
    const env = getServerEnv();
    const webhookWhere = await getCachedWebhookEventListWhere();
    const [healthCards, failedWebhookCount] = await Promise.all([
      listIntegrationHealthCards(dataUserId),
      prisma.webhookEvent.count({
        where: { AND: [webhookWhere, { processed: false }] },
      }),
    ]);
    const stripeConfigured = Boolean(
      env.STRIPE_SECRET_KEY?.trim() && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim(),
    );
    const emailConfigured = Boolean(env.RESEND_API_KEY?.trim() && env.RESEND_FROM_EMAIL?.trim());
    const summary = summarizeIntegrationHealth(healthCards, {
      stripe: stripeConfigured,
      email: emailConfigured,
    });
    integrationHealthStrip = (
      <PilotIntegrationHealthStrip
        model={buildPilotIntegrationHealthStripModel({
          summary,
          cards: healthCards,
          failedWebhookCount,
        })}
      />
    );
  }

  return (
    <div className="space-y-6">
      {integrationHealthStrip}
      <OperatorHomePanel persona={persona} actions={actions} />
    </div>
  );
}
