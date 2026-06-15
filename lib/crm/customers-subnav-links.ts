export type CustomersSubnavLink = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
  requiresManage?: boolean;
};

export const CUSTOMERS_SUBNAV_LINKS: CustomersSubnavLink[] = [
  { href: "/dashboard/customers", label: "Overview", match: "exact" },
  { href: "/dashboard/customers/list", label: "Customers" },
  { href: "/dashboard/customers/unified-profile", label: "Unified profiles" },
  { href: "/dashboard/customers/segments", label: "Segments" },
  { href: "/dashboard/customers/vip", label: "VIPs" },
  { href: "/dashboard/customers/at-risk", label: "At risk" },
  { href: "/dashboard/customers/companies", label: "Companies" },
  { href: "/dashboard/customers/follow-ups", label: "Follow-ups" },
  { href: "/dashboard/crm/automation", label: "Automation" },
  { href: "/dashboard/customers/allergies", label: "Allergies" },
  { href: "/dashboard/customers/dedupe", label: "Dedupe", requiresManage: true },
  { href: "/dashboard/customers/reports", label: "Reports" },
  { href: "/dashboard/customers/loyalty", label: "Loyalty" },
];

export function buildCustomersSubnavLinks(input: {
  canView: boolean;
  canManage: boolean;
}): CustomersSubnavLink[] {
  if (!input.canView) return [];
  return CUSTOMERS_SUBNAV_LINKS.filter((link) => !link.requiresManage || input.canManage);
}
