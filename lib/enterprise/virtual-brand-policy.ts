export const VIRTUAL_BRAND_POLICY_ID = "enterprise-virtual-brand-v1" as const;

export const VIRTUAL_BRAND_PATH = "/dashboard/enterprise/virtual-brand" as const;

export const VIRTUAL_BRAND_SERVICE = "services/enterprise/virtual-brand-service.ts" as const;

/** Target time to launch a virtual brand from template to storefront-ready. */
export const VIRTUAL_BRAND_PROVISION_TARGET_MINUTES = 5 as const;

/** Templates optimized for ghost / cloud / delivery-first virtual brands. */
export const VIRTUAL_BRAND_TEMPLATES = [
  "ghost_kitchen",
  "cloud_kitchen",
  "meal_prep",
  "catering",
] as const;

export type VirtualBrandTemplateKey = (typeof VIRTUAL_BRAND_TEMPLATES)[number];
