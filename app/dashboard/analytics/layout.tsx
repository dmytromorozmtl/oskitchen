import { AnalyticsSubnav } from "@/components/dashboard/analytics-subnav";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AnalyticsSubnav />
      {children}
    </div>
  );
}
