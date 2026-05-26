import { StaffSubnav } from "@/components/dashboard/staff/subnav";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <StaffSubnav />
      {children}
    </div>
  );
}
