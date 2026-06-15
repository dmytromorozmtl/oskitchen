import Link from "next/link";

import { ApAutomationPanel } from "@/components/accounting/ap-automation-panel";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  AP_AUTOMATION_P2_104_INVOICES_ROUTE,
  AP_AUTOMATION_P2_104_POLICY_ID,
} from "@/lib/accounting/ap-automation-p2-104-policy";
import { loadApAutomationSnapshot } from "@/services/accounting/ap-automation-p2-104-service";

/** Blueprint P2-104 — AP automation workflow hub. */
export default async function ApAutomationPage() {
  const { dataUserId } = await getTenantActor();
  const snapshot = await loadApAutomationSnapshot(dataUserId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AP automation</h1>
          <p className="text-sm text-muted-foreground">
            Invoice → PO → payment workflow — policy {AP_AUTOMATION_P2_104_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={AP_AUTOMATION_P2_104_INVOICES_ROUTE}>Supplier invoices</Link>
        </Button>
      </div>
      <ApAutomationPanel snapshot={snapshot} />
    </div>
  );
}
