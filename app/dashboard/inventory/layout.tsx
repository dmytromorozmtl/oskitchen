import type { ReactNode } from "react";

import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import {
  hasInventoryOperationsPageAccess,
  loadWorkspacePermissionPageActor,
} from "@/lib/ux/permission-denied-page-access-era19";

export default async function InventorySectionLayout(props: { children: ReactNode }) {
  const actor = await loadWorkspacePermissionPageActor();

  if (!hasInventoryOperationsPageAccess(actor)) {
    return <PermissionDeniedSurfaceCard surfaceId="inventory_operations" />;
  }

  return props.children;
}
