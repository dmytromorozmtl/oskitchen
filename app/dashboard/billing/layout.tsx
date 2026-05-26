import { BillingSubnav } from "@/components/dashboard/billing/subnav";

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <BillingSubnav />
      {children}
    </div>
  );
}
