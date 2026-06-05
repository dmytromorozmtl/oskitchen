import Link from "next/link";

import { CashierRolePanel } from "@/components/roles/cashier-role-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { canAccessCashierRoleUi } from "@/lib/roles/cashier-ui-access";
import { safeRequireWorkspacePermissionActor } from "@/lib/permissions/safe-workspace-permission-actor";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadCashierRoleUiSnapshot } from "@/services/roles/cashier-ui-service";

export const metadata = {
  title: "Cashier Role UI",
  description: "Register command center — POS terminal, open shifts, transactions, and order lookups.",
};

export default async function CashierRolePage() {
  const [{ dataUserId, workspaceId }, actor] = await Promise.all([
    getTenantActor(),
    safeRequireWorkspacePermissionActor(),
  ]);

  const allowed = canAccessCashierRoleUi({
    workspaceRole: actor.workspaceRole,
    granted: actor.granted,
    platformBypass: actor.platformBypass,
  });

  if (!allowed) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          POS or order permissions required for this role-based view.
        </CardContent>
      </Card>
    );
  }

  const snapshot = await loadCashierRoleUiSnapshot({
    userId: dataUserId,
    workspaceRole: actor.workspaceRole,
    granted: actor.granted,
    workspaceId,
  });

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Cashier"
        description="Role-based UI for front-of-house — register KPIs, POS priorities, and checkout shortcuts."
        actions={
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/pos/terminal">POS Terminal</Link>
          </Button>
        }
      />
      <CashierRolePanel snapshot={snapshot} />
    </div>
  );
}
