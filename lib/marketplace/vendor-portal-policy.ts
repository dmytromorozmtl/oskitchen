export const VENDOR_PORTAL_POLICY_ID = "vendor-portal-v2" as const;

export const VENDOR_PORTAL_BASE_PATH = "/vendor" as const;

export const VENDOR_PORTAL_SERVICE = "services/marketplace/vendor-portal-service.ts" as const;

export const VENDOR_PORTAL_MODULES = ["orders", "invoices", "analytics"] as const;

export type VendorPortalModuleId = (typeof VENDOR_PORTAL_MODULES)[number];
