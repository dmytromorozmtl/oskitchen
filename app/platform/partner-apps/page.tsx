import Link from "next/link";

import { PartnerAppsReviewPanel } from "@/components/platform/partner-apps-review-panel";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import {
  listPartnerAppReviewChecklist,
  listPartnerOAuthAppRegistryRows,
} from "@/services/platform/partner-oauth-app-registry-service";

export const metadata = { title: "Partner apps — Platform" };

export default async function PlatformPartnerAppsPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:integrations:read");

  const canReview = hasPlatformPermission(ctx.permissions, "platform:integrations:repair");
  const [queue, checklist] = await Promise.all([
    listPartnerOAuthAppRegistryRows(),
    Promise.resolve(listPartnerAppReviewChecklist()),
  ]);

  return (
    <div className="space-y-6 text-zinc-200">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          App marketplace · Phase 4
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Partner OAuth app review</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Registry submissions from{" "}
          <Link href="/developers/apps/register" className="text-amber-200/90 hover:underline">
            /developers/apps/register
          </Link>
          . Approve to SANDBOX or PUBLISHED after checklist sign-off. Suspended apps block OAuth install
          and embedded admin.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <Link href="/dashboard/integrations/oauth-apps" className="text-amber-200/90 hover:underline">
            Workspace OAuth hub
          </Link>
          <Link href="/platform/integrations" className="text-amber-200/90 hover:underline">
            Platform integrations
          </Link>
        </div>
      </div>

      {!canReview ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Read-only — approve/reject requires platform integrations repair permission.
        </p>
      ) : null}

      <PartnerAppsReviewPanel queue={queue} checklist={checklist} canReview={canReview} />
    </div>
  );
}
