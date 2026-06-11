import { RoutesSubnav } from "@/components/dashboard/routes-subnav";

export default function RoutesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <RoutesSubnav />
      {children}
    </div>
  );
}
