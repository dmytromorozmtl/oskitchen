import Link from "next/link";

import { CrmAutomationPanel } from "@/components/crm/crm-automation-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireCustomersHubPageAccess } from "@/lib/crm/crm-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadCrmAutomationSnapshot } from "@/services/crm/automation-service";

export const metadata = {
  title: "CRM Automation",
  description: "Win-back, birthday rewards, and favorites reorder automation for customer retention.",
};

export default async function CrmAutomationPage() {
  const access = await requireCustomersHubPageAccess();
  if (!access.ok) return access.deny;

  const { userId } = await getTenantActor();
  const snapshot = await loadCrmAutomationSnapshot(userId);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="CRM Automation"
        description="Automated win-back outreach, birthday rewards, and favorites reorder nudges — consent-gated, follow-up driven."
        actions={
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/customers">Customers</Link>
          </Button>
        }
      />
      <CrmAutomationPanel snapshot={snapshot} canManage={access.canManage} />
    </div>
  );
}
