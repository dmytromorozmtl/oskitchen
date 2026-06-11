import { ExecutiveSubnav } from "@/components/dashboard/executive/executive-subnav";
import { getExecutivePageAccess } from "@/lib/executive/executive-page-access";

export default async function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  const access = await getExecutivePageAccess();

  const links = [
    { href: "/dashboard/executive", label: "Overview", match: "exact" as const, visible: access.canView },
    { href: "/dashboard/executive/revenue", label: "Revenue & orders", visible: access.canReadFinancial },
    { href: "/dashboard/executive/operations", label: "Operations", visible: access.canReadOperations },
    { href: "/dashboard/executive/customers", label: "Customers", visible: access.canView },
    { href: "/dashboard/executive/profitability", label: "Profitability", visible: access.canReadFinancial },
    {
      href: "/dashboard/executive/brands-locations",
      label: "Brands & locations",
      visible: access.canReadBrandLocation,
    },
    { href: "/dashboard/executive/risks", label: "Risks", visible: access.canView },
    { href: "/dashboard/executive/report", label: "Report", visible: access.canExport },
  ].filter((link) => link.visible);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ExecutiveSubnav links={links} />
      {children}
    </div>
  );
}
