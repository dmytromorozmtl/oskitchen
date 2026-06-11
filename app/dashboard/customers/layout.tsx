import { CustomersSubnav } from "@/components/dashboard/customers-subnav";
import {
  buildCustomersSubnavLinks,
  requireCustomersHubPageAccess,
} from "@/lib/crm/crm-page-access";

export default async function CustomersLayout({ children }: { children: React.ReactNode }) {
  const access = await requireCustomersHubPageAccess();
  if (!access.ok) return access.deny;

  const links = buildCustomersSubnavLinks(access);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <CustomersSubnav links={links} />
      {children}
    </div>
  );
}
