import type { ReactNode } from "react";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { ImplementationSubnav } from "@/components/dashboard/implementation/implementation-subnav";
import { createImplementationActorScope } from "@/lib/implementation/implementation-actor-scope";
import {
  hasImplementationHubPageAccess,
  loadWorkspacePermissionPageActor,
} from "@/lib/ux/permission-denied-page-access-era19";

export default async function ImplementationLayout({ children }: { children: ReactNode }) {
  const actor = await loadWorkspacePermissionPageActor();
  const scope = createImplementationActorScope(actor);
  if (!hasImplementationHubPageAccess(scope)) {
    return <PermissionDeniedSurfaceCard surfaceId="implementation_hub" />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ImplementationSubnav />
      {children}
    </div>
  );
}
