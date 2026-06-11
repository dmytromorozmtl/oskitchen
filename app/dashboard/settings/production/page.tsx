import { notFound } from "next/navigation";

import { ProductionForm } from "@/components/dashboard/settings/forms/production-form";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";
import { loadSettingsCenter } from "@/services/settings/settings-center-service";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
export default async function ProductionSettingsPage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = { userId, email: profile?.email ?? session.email ?? null, role: (profile?.role ?? null) as string | null };
  if (!canUseSettings(actor, "manage_production")) {
    return <PermissionDeniedSurfaceCard surfaceId="settings_workspace" />;
  }
  const { payload } = await loadSettingsCenter(userId);
  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="production" />
      <ProductionForm initial={payload.production} />
    </div>
  );
}
