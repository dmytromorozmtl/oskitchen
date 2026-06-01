import type { MarketplaceCartItem } from "@/services/marketplace/cart-service";

export type VendorCartGroup = {
  vendorId: string;
  vendorName: string;
  items: MarketplaceCartItem[];
  subtotal: number;
};

export function splitByVendor(items: readonly MarketplaceCartItem[]): VendorCartGroup[] {
  const groups = new Map<string, VendorCartGroup>();
  for (const item of items) {
    const existing = groups.get(item.vendorId);
    if (existing) {
      existing.items.push(item);
      existing.subtotal += item.unitPrice * item.quantity;
      continue;
    }
    groups.set(item.vendorId, {
      vendorId: item.vendorId,
      vendorName: item.vendorName,
      items: [item],
      subtotal: item.unitPrice * item.quantity,
    });
  }
  return [...groups.values()];
}
