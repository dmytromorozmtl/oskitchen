import { PurchasingSubnav } from "@/components/dashboard/purchasing-subnav";

export default function PurchasingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PurchasingSubnav />
      {children}
    </div>
  );
}
