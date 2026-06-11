import { notFound } from "next/navigation";

import { BridgeCard } from "@/components/dashboard/settings/bridge-card";
import { DeveloperForm } from "@/components/dashboard/settings/forms/developer-form";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { webhookEventListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";
import { loadSettingsCenter } from "@/services/settings/settings-center-service";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
export default async function DeveloperSettingsPage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = {
    userId,
    email: profile?.email ?? session.email ?? null,
    role: (profile?.role ?? null) as string | null,
  };
  if (!canUseSettings(actor, "manage_developer")) {
    return <PermissionDeniedSurfaceCard surfaceId="settings_workspace" />;
  }
  const { payload } = await loadSettingsCenter(userId);

  const webhookWhere = await webhookEventListWhereForOwner(userId);
  const [apiKeyCount, webhookEventCount, recentNotifFailures] = await Promise.all([
    prisma.apiKey.count({ where: { userId, active: true } }).catch(() => 0),
    prisma.webhookEvent.count({ where: webhookWhere }).catch(() => 0),
    prisma.notificationLog.count({ where: { userId, status: "FAILED" } }).catch(() => 0),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="developer" />
      <BridgeCard
        title="Developer console"
        description="API keys, webhook inspector, queue health, and feature flags."
        href="/dashboard/developer"
        ctaLabel="Open Developer Center"
        stats={[
          { label: "Active API keys", value: apiKeyCount.toString(), tone: apiKeyCount > 0 ? "ok" : "warn" },
          { label: "Webhook events on file", value: webhookEventCount.toString(), tone: "neutral" },
          { label: "Notification failures", value: recentNotifFailures.toString(), tone: recentNotifFailures > 0 ? "warn" : "ok" },
        ]}
      />
      <DeveloperForm initial={payload.developer} />
    </div>
  );
}
