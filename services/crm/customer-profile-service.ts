import { getCustomerForUser, listOrdersForCustomer } from "@/services/crm/customer-service";

export async function loadCustomerProfileBundle(userId: string, customerId: string) {
  const scope = { userId };
  const customer = await getCustomerForUser(scope, customerId);
  if (!customer) return null;
  const recentOrders = await listOrdersForCustomer(scope, customer.email, 30);
  return { customer, recentOrders };
}
