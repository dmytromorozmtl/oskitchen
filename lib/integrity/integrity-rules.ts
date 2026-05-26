export type IntegrityIssueKind =
  | "ORDER_NO_ITEMS"
  | "DELIVERY_NO_ADDRESS"
  | "ORDER_LINE_NO_PRICE"
  | "UNMAPPED_EXTERNAL_PRODUCT";

export const INTEGRITY_RULE_DESCRIPTIONS: Record<IntegrityIssueKind, string> = {
  ORDER_NO_ITEMS: "Orders should include at least one priced line before fulfillment.",
  DELIVERY_NO_ADDRESS: "Delivery commitments require structured address JSON on the order.",
  ORDER_LINE_NO_PRICE: "Order economics and margin reporting need unit + line totals.",
  UNMAPPED_EXTERNAL_PRODUCT: "Channel catalog rows must map to a KitchenOS menu item.",
};
