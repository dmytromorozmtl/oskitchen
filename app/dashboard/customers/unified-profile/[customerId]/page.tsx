import Link from "next/link";
import { notFound } from "next/navigation";

import { UnifiedCustomerProfilePanel } from "@/components/crm/unified-customer-profile-panel";
import { requireCustomersHubPageAccess } from "@/lib/crm/crm-page-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { loadUnifiedCustomerProfileSnapshot } from "@/services/crm/unified-profile-service";

export const metadata = {
  title: "Unified profile",
  description: "Single view of orders, preferences, history, and loyalty for one customer.",
};

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
      <div>
        <Link
          href="/dashboard/customers/unified-profile"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Unified profiles
        </Link>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Unified profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">{snapshot.identity.displayName}</p>
      </div>
      <UnifiedCustomerProfilePanel snapshot={snapshot} />
    </div>
  );
}
