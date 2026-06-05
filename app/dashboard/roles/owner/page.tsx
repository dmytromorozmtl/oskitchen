import Link from "next/link";

import { OwnerRolePanel } from "@/components/roles/owner-role-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { canAccessOwnerOnlySurfaces } from "@/lib/platform-admin";
import { safeRequireWorkspacePermissionActor } from "@/lib/permissions/safe-workspace-permission-actor";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadOwnerRoleUiSnapshot } from "@/services/roles/owner-ui-service";

export const metadata = {
  title: "Owner Role UI",
  description: "Leadership command center — revenue, pilot readiness, integrations, and strategic shortcuts.",
};

export default async function OwnerRolePage() {
  const [{ dataUserId, workspaceId }, actor] = await Promise.all([
    getTenantActor(),
    safeRequireWorkspacePermissionActor(),
  ]);

  const allowed = await canAccessOwnerOnlySurfaces(
    actor.sessionUserId,
    actor.email,
    actor.workspaceRole,
  );

  if (!allowed) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Owner access required for this role-based view.
        </CardContent>
      </Card>
    );
  }

  const snapshot = await loadOwnerRoleUiSnapshot({
    userId: dataUserId,
    workspaceRole: actor.workspaceRole,
    granted: actor.granted,
    workspaceId,
  });

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Owner"
        description="Role-based UI for restaurant owners — leadership KPIs, briefing priorities, and strategic shortcuts."
        actions={
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/today">Today overview</Link>
          </Button>
        }
      />
      <OwnerRolePanel snapshot={snapshot} />
    </div>
  );
}
