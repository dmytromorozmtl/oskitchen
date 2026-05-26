import type { SupportTicketCategory } from "@prisma/client";

export const SUPPORT_CATEGORY_LABEL: Record<SupportTicketCategory, string> = {
  BILLING: "Billing",
  TECHNICAL: "Technical",
  INTEGRATION: "Integration",
  ONBOARDING: "Onboarding",
  FEATURE_REQUEST: "Feature request",
  BUG: "Bug",
  OTHER: "Other",
  DATA_IMPORT: "Data import",
  PRODUCT_MAPPING: "Product mapping",
  STOREFRONT: "Storefront",
  PRODUCTION: "Production",
  PACKING: "Packing",
  ROUTES: "Routes",
  NOTIFICATIONS: "Notifications",
  ACCOUNT_ACCESS: "Account access",
  SECURITY: "Security",
};
