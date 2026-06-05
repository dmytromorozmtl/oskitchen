import { RolesSubnav } from "@/components/dashboard/roles-subnav";

export default function RolesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <RolesSubnav />
      {children}
    </div>
  );
}
