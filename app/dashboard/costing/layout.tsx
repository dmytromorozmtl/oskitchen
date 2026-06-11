import { CostingSubnav } from "@/components/dashboard/costing-subnav";

export default function CostingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <CostingSubnav />
      {children}
    </div>
  );
}
