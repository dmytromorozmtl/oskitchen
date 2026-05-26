import { ReportsSubnav } from "@/components/dashboard/reports/reports-subnav";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ReportsSubnav />
      {children}
    </div>
  );
}
