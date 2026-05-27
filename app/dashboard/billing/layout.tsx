import { BillingSubnav } from "@/components/dashboard/billing/subnav";
import { requireBillingPageAccess } from "@/lib/billing/billing-page-access";

export default async function BillingLayout({ children }: { children: React.ReactNode }) {
  const access = await requireBillingPageAccess("billing.view");
  if (!access.ok) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        {access.deny}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <BillingSubnav
        canOpenPortal={access.canOpenPortal}
        canCancel={access.canCancel}
        canViewSettings={access.canViewDiagnostics}
      />
      {children}
    </div>
  );
}
