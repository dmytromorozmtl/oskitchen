import { notFound } from "next/navigation";

import { AdvancedForm } from "@/components/dashboard/settings/forms/advanced-form";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";
import { loadSettingsCenter } from "@/services/settings/settings-center-service";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
export default async function AdvancedSettingsPage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = { userId, email: profile?.email ?? session.email ?? null, role: (profile?.role ?? null) as string | null };
  if (!canUseSettings(actor, "manage_advanced")) {
    return <PermissionDeniedSurfaceCard surfaceId="settings_workspace" />;
  }
  const { payload } = await loadSettingsCenter(userId);
  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="advanced" />
      <AdvancedForm initial={payload.advanced} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Multi-brand & enterprise</CardTitle>
          <CardDescription>Architectural primitives ready to expand.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <p>• Multi-brand and multi-location overrides flow through the Brand and Location centers.</p>
          <p>• Franchise / parent / child workspaces are modeled as additional `UserProfile` rows linked by integration metadata.</p>
          <p>• White-label storefronts continue to ship via the Storefront Center with the Enterprise hide-branding flag.</p>
          <p>• Workspace transfer requests use the ownership transfer contact above; coordinate with support to complete the swap.</p>
        </CardContent>
      </Card>
    </div>
  );
}
