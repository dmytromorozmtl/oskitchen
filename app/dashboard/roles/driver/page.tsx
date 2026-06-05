import Link from "next/link";

import { DriverRolePanel } from "@/components/roles/driver-role-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { canAccessDriverRoleUi } from "@/lib/roles/driver-ui-access";
import { safeRequireWorkspacePermissionActor } from "@/lib/permissions/safe-workspace-permission-actor";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadDriverRoleUiSnapshot } from "@/services/roles/driver-ui-service";

export const metadata = {
  title: "Driver Role UI",
  description: "Delivery command center — today's routes, stop progress, and packing handoff.",
};

export default async function DriverRolePage() {
  const [{ dataUserId }, actor] = await Promise.all([
    getTenantActor(),
    safeRequireWorkspacePermissionActor(),
  ]);

  const allowed = canAccessDriverRoleUi({
    workspaceRole: actor.workspaceRole,
    granted: actor.granted,
    platformBypass: actor.platformBypass,
  });

  if (!allowed) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Route or delivery permissions required for this role-based view.
        </CardContent>
      </Card>
    );
  }

  const snapshot = await loadDriverRoleUiSnapshot(dataUserId);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Driver"
        description="Role-based UI for delivery drivers — route KPIs, stop priorities, and dispatch shortcuts."
        actions={
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/routes/driver">Today&apos;s route</Link>
          </Button>
        }
      />
      <DriverRolePanel snapshot={snapshot} />
    </div>
  );
}
