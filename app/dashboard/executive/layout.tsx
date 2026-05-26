import { ExecutiveSubnav } from "@/components/dashboard/executive/executive-subnav";

export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ExecutiveSubnav />
      {children}
    </div>
  );
}
