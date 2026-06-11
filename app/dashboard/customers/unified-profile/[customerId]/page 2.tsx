import Link from "next/link";
import { notFound } from "next/navigation";

import { UnifiedCustomerProfilePanel } from "@/components/crm/unified-customer-profile-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireCustomersHubPageAccess } from "@/lib/crm/crm-page-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { loadUnifiedCustomerProfileSnapshot } from "@/services/crm/unified-profile-service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  return {
    title: `Unified Profile · ${customerId.slice(0, 8)}`,
    description: "Orders, preferences, history, and loyalty in one customer view.",
  };
}

export default async function UnifiedCustomerProfilePage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const access = await requireCustomersHubPageAccess();
  if (!access.ok) return access.deny;

  const { userId } = await requireTenantActor();
  const { customerId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(customerId)) notFound();

  const snapshot = await loadUnifiedCustomerProfileSnapshot(userId, customerId);
  if (!snapshot) notFound();

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title={snapshot.identity.displayName}
        description={`Unified profile · ${snapshot.identity.email}`}
        actions={
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href={snapshot.basePath}>All profiles</Link>
          </Button>
        }
      />
      <UnifiedCustomerProfilePanel snapshot={snapshot} />
    </div>
  );
}
