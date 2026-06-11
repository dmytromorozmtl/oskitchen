import { redirect } from "next/navigation";

export default async function CrmCustomerAliasPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  redirect(`/dashboard/customers/${customerId}`);
}
