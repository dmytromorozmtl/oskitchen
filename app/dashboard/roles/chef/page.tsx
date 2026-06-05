import Link from "next/link";

import { ChefRolePanel } from "@/components/roles/chef-role-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { canAccessChefRoleUi } from "@/lib/roles/chef-ui-access";
import { safeRequireWorkspacePermissionActor } from "@/lib/permissions/safe-workspace-permission-actor";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadChefRoleUiSnapshot } from "@/services/roles/chef-ui-service";

export const metadata = {
  title: "Chef Role UI",
  description: "Kitchen line command center — KDS pressure, production batches, and packing handoff.",
};

export default async function ChefRolePage() {
  const [{ dataUserId, workspaceId }, actor] = await Promise.all([
    getTenantActor(),
    safeRequireWorkspacePermissionActor(),
  ]);

  const allowed = canAccessChefRoleUi({
    workspaceRole: actor.workspaceRole,
    granted: actor.granted,
    platformBypass: actor.platformBypass,
  });

  if (!allowed) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Kitchen or production permissions required for this role-based view.
        </CardContent>
      </Card>
    );
  }

  const snapshot = await loadChefRoleUiSnapshot({
    userId: dataUserId,
    workspaceRole: actor.workspaceRole,
    granted: actor.granted,
    workspaceId,
  });

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Chef"
        description="Role-based UI for kitchen leads — line KPIs, KDS priorities, and production shortcuts."
        actions={
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/kitchen">Kitchen display</Link>
          </Button>
        }
      />
      <ChefRolePanel snapshot={snapshot} />
    </div>
  );
}
