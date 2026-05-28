import Link from "next/link";

import { CommercialPilotOpsAttentionStrip } from "@/components/platform/commercial-pilot-ops-attention-strip";
import { CommercialPilotOpsStatusPanel } from "@/components/platform/commercial-pilot-ops-status-panel";
import { Button } from "@/components/ui/button";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { loadCommercialPilotOpsStatusModel } from "@/services/commercial/commercial-pilot-ops-status-service";

export default async function PlatformImplementationsPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:workspaces:read");

  const model = await loadCommercialPilotOpsStatusModel();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Implementations</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Paid pilot execution evidence — honest GO/NO-GO and P0 staging proof from smoke summary
            artifacts. Tenant checklist progress lives in workspace Implementation; this view is for
            platform ops and GTM leads.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full border-zinc-700">
            <Link href="/dashboard/implementation">Workspace implementation</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full border-zinc-700">
            <Link href="/platform/go-live">Platform go-live</Link>
          </Button>
        </div>
      </div>

      <CommercialPilotOpsAttentionStrip model={model} />

      <CommercialPilotOpsStatusPanel model={model} />
    </div>
  );
}
