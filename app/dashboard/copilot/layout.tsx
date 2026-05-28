import type { ReactNode } from "react";

import { CopilotSubnav } from "@/components/dashboard/copilot/copilot-subnav";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { hasCopilotHubPageAccess, loadCopilotPageActor } from "@/lib/ux/copilot-page-access-era20";

export default async function CopilotLayout({ children }: { children: ReactNode }) {
  const { scope } = await loadCopilotPageActor();
  if (!hasCopilotHubPageAccess(scope)) {
    return <PermissionDeniedSurfaceCard surfaceId="copilot_hub" />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <CopilotSubnav />
      {children}
    </div>
  );
}
