import { ForecastSubnav } from "@/components/dashboard/forecast-subnav";

export default function ForecastLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ForecastSubnav />
      {children}
    </div>
  );
}
