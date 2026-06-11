import { PlaybooksSubnav } from "@/components/dashboard/playbooks/playbooks-subnav";
import { getPlaybooksPageAccess } from "@/lib/playbooks/playbook-page-access";

export default async function PlaybooksLayout({ children }: { children: React.ReactNode }) {
  const access = await getPlaybooksPageAccess();

  const links = [
    { href: "/dashboard/playbooks", label: "Recommended", match: "exact" as const, visible: access.canView },
    { href: "/dashboard/playbooks/all", label: "All Playbooks", visible: access.canView },
    { href: "/dashboard/playbooks/active", label: "Active Runs", visible: access.canView },
    { href: "/dashboard/playbooks/templates", label: "Templates", visible: access.canView },
    { href: "/dashboard/playbooks/custom", label: "Custom", visible: access.canView },
    { href: "/dashboard/playbooks/schedule", label: "Schedule", visible: access.canView },
    { href: "/dashboard/playbooks/reports", label: "Reports", visible: access.canReadReports },
    { href: "/dashboard/playbooks/settings", label: "Settings", visible: access.canEdit },
  ].filter((link) => link.visible);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PlaybooksSubnav links={links} />
      {children}
    </div>
  );
}
