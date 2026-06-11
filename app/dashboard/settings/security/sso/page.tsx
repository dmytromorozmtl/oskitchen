import { notFound } from "next/navigation";
import Link from "next/link";

import { SsoPilotAdminForm } from "@/components/dashboard/settings/forms/sso-pilot-admin-form";
import { Badge } from "@/components/ui/badge";
import { getWorkspaceSsoAdminView } from "@/lib/enterprise/workspace-sso-admin-service";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
export default async function SecuritySsoPilotPage() {
  const { sessionUser: session, userId, workspaceId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = {
    userId,
    email: profile?.email ?? session.email ?? null,
    role: (profile?.role ?? null) as string | null,
  };
  if (!canUseSettings(actor, "manage_security")) {
    return <PermissionDeniedSurfaceCard surfaceId="settings_workspace" />;
  }
  if (!workspaceId) notFound();

  const view = await getWorkspaceSsoAdminView({
    workspaceId,
    ownerUserId: userId,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Link href="/dashboard/settings" className="hover:text-foreground">
            Settings
          </Link>
          <span className="mx-2">/</span>
          <Link href="/dashboard/settings/security" className="hover:text-foreground">
            Security
          </Link>
          <span className="mx-2">/</span>
          SSO pilot
          <Badge variant="secondary" className="ml-2 text-[10px]">
            Pilot
          </Badge>
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Enterprise SSO pilot
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Configure Supabase SAML SSO for one pilot tenant. Not production SSO for all customers.
        </p>
      </div>
      <SsoPilotAdminForm initial={view} />
    </div>
  );
}
