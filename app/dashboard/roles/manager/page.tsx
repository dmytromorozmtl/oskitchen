import Link from "next/link";

import { ManagerRolePanel } from "@/components/roles/manager-role-panel";
import { rolePageActionClass } from "@/lib/design/dark-mode-everywhere-patterns";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { canAccessManagerRoleUi } from "@/lib/roles/manager-ui-access";
import { safeRequireWorkspacePermissionActor } from "@/lib/permissions/safe-workspace-permission-actor";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadManagerRoleUiSnapshot } from "@/services/roles/manager-ui-service";

export const metadata = {
  title: "Manager Role UI",
  description: "Shift command center — labor, kitchen pressure, packing, and today's orders.",
};

export default async function ManagerRolePage() {
  const [{ dataUserId, workspaceId }, actor] = await Promise.all([
    getTenantActor(),
    safeRequireWorkspacePermissionActor(),
  ]);

  const allowed = canAccessManagerRoleUi({
    workspaceRole: actor.workspaceRole,
    granted: actor.granted,
    platformBypass: actor.platformBypass,
  });

  if (!allowed) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Manager or operational permissions required for this role-based view.
        </CardContent>
      </Card>
    );
  }

  const snapshot = await loadManagerRoleUiSnapshot({
    userId: dataUserId,
    workspaceRole: actor.workspaceRole,
    granted: actor.granted,
    workspaceId,
  });

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Manager"
        description="Role-based UI for shift managers — operational KPIs, briefing priorities, and floor shortcuts."
        actions={
          <Button asChild variant="outline" size="sm" className={rolePageActionClass}>
            <Link href="/dashboard/today">Today overview</Link>
          </Button>
        }
      />
      <ManagerRolePanel snapshot={snapshot} />
    </div>
  );
}
