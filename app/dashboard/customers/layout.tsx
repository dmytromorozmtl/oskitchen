import { CustomersSubnav } from "@/components/dashboard/customers-subnav";

export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <CustomersSubnav />
      {children}
    </div>
  );
}
