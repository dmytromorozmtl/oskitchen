import type { ChannelCapability } from "@/lib/channels/channel-types";

const LABELS: Record<ChannelCapability, string> = {
  orders: "Orders",
  products: "Products",
  menus: "Menus",
  webhooks: "Webhooks",
  delivery: "Delivery dispatch",
  status_sync: "Status sync",
  payments: "Payments",
  customer_sync: "Customers",
  inventory_sync: "Inventory",
  markets_sync: "Markets",
  menu_sync: "Menu sync",
};

export function channelCapabilityLabel(cap: ChannelCapability): string {
  return LABELS[cap] ?? cap;
}

export function channelHasCapability(
  caps: readonly ChannelCapability[],
  cap: ChannelCapability,
): boolean {
  return caps.includes(cap);
}
