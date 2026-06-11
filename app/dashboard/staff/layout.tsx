import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { StaffSubnav } from "@/components/dashboard/staff/subnav";
import { requireUserProfile } from "@/lib/auth";
import { resolveStaffActorScope } from "@/lib/staff/resolve-staff-actor-scope";
import {
  hasStaffHubPageAccess,
  loadWorkspacePermissionPageActor,
} from "@/lib/ux/permission-denied-page-access-era19";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const actor = await loadWorkspacePermissionPageActor();
  const profile = await requireUserProfile();
  const scope = resolveStaffActorScope({
    workspaceRole: actor.workspaceRole,
    email: actor.email,
    profileRole: profile.role ?? null,
    profileEmail: profile.email ?? null,
    platformBypass: actor.platformBypass,
  });

  if (!hasStaffHubPageAccess(actor, scope)) {
    return <PermissionDeniedSurfaceCard surfaceId="staff_hub" />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <StaffSubnav />
      {children}
    </div>
  );
}
