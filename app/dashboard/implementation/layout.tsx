import type { ReactNode } from "react";

import { ImplementationSubnav } from "@/components/dashboard/implementation/implementation-subnav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createImplementationActorScope } from "@/lib/implementation/implementation-actor-scope";
import { canUseImplementation } from "@/lib/implementation/implementation-permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export default async function ImplementationLayout({ children }: { children: ReactNode }) {
  const actor = await requireWorkspacePermissionActor();
  const scope = createImplementationActorScope(actor);
  if (!canUseImplementation(scope, "implementation.view")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No access</CardTitle>
          <CardDescription>You do not have permission to view the Implementation Center.</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ImplementationSubnav />
      {children}
    </div>
  );
}
