import { RolesSubnav } from "@/components/dashboard/roles-subnav";
import { dashboardRoleShellClass } from "@/lib/design/dark-mode-everywhere-patterns";

export default function RolesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={dashboardRoleShellClass}>
      <RolesSubnav />
      {children}
    </div>
  );
}
