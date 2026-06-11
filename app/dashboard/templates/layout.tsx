import { TemplatesSubnav } from "@/components/dashboard/templates/templates-subnav";
import { getTemplatesPageAccess } from "@/lib/templates/template-page-access";

export default async function TemplatesLayout({ children }: { children: React.ReactNode }) {
  const access = await getTemplatesPageAccess();

  const links = [
    { href: "/dashboard/templates", label: "Recommended", match: "exact" as const, visible: access.canView },
    { href: "/dashboard/templates/all", label: "All Templates", visible: access.canView },
    { href: "/dashboard/templates/starters", label: "Business Starters", visible: access.canView },
    { href: "/dashboard/templates/module-packs", label: "Module Packs", visible: access.canView },
    { href: "/dashboard/templates/playbooks", label: "Playbooks", visible: access.canView },
    { href: "/dashboard/templates/storefront", label: "Storefront", visible: access.canView },
    { href: "/dashboard/templates/imports", label: "Import Templates", visible: access.canView },
    { href: "/dashboard/templates/history", label: "Applied History", visible: access.canViewHistory },
  ].filter((link) => link.visible);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <TemplatesSubnav links={links} />
      {children}
    </div>
  );
}
