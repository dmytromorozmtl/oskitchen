/**
 * Canonical first-party storefront analytics event names (Shopify-aligned funnel).
 */
export const STOREFRONT_ANALYTICS_EVENTS = {
  viewMenu: "view_menu",
  viewItem: "view_item",
  addToCart: "add_to_cart",
  cartView: "cart_view",
  beginCheckout: "begin_checkout",
  checkoutStart: "checkout_start",
  checkoutSubmit: "checkout_submit",
  purchase: "purchase",
  orderStatusView: "order_status_view",
} as const;

export type StorefrontAnalyticsEventName =
  (typeof STOREFRONT_ANALYTICS_EVENTS)[keyof typeof STOREFRONT_ANALYTICS_EVENTS];
