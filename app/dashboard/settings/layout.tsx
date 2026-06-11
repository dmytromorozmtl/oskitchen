import { SettingsMobileDrawer } from "@/components/dashboard/settings/settings-mobile-drawer";
import { SettingsSidebar } from "@/components/dashboard/settings/settings-sidebar";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { createSettingsActorScope } from "@/lib/settings/settings-actor-scope";
import {
  canUseSettings,
  settingsCapabilitiesFor,
} from "@/lib/settings/settings-permissions";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { sessionUser: session } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = await createSettingsActorScope({
    sessionUserId: session.id,
    email: profile?.email ?? session.email ?? null,
    role: (profile?.role ?? null) as string | null,
  });
  const capabilities = Array.from(settingsCapabilitiesFor(actor));
  const hasSettingsAccess = canUseSettings(actor, "view_settings");

  if (!hasSettingsAccess) {
    return <PermissionDeniedSurfaceCard surfaceId="settings_workspace" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <SettingsMobileDrawer capabilities={capabilities} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <SettingsSidebar capabilities={capabilities} collapsedDefault />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}