import type { BusinessType, CustomerSource, CustomerType } from "@prisma/client";

export const CUSTOMER_TYPE_VALUES = [
  "INDIVIDUAL",
  "HOUSEHOLD",
  "COMPANY",
  "CATERING_CLIENT",
  "EVENT_CLIENT",
  "WHOLESALE_CLIENT",
  "OFFICE_CLIENT",
  "VIP_CLIENT",
  "INTERNAL_TEST",
] as const satisfies readonly CustomerType[];

export const CUSTOMER_TYPE_LABEL: Record<CustomerType, string> = {
  INDIVIDUAL: "Individual",
  HOUSEHOLD: "Household",
  COMPANY: "Company contact",
  CATERING_CLIENT: "Catering client",
  EVENT_CLIENT: "Event client",
  WHOLESALE_CLIENT: "Wholesale",
  OFFICE_CLIENT: "Office client",
  VIP_CLIENT: "VIP",
  INTERNAL_TEST: "Internal / test",
};

export const CUSTOMER_SOURCE_VALUES = [
  "MANUAL",
  "STOREFRONT",
  "WOO_COMMERCE",
  "SHOPIFY",
  "UBER_EATS",
  "IMPORT",
  "CATERING_QUOTE",
  "EVENT_INQUIRY",
  "PHONE_ORDER",
  "EMAIL_ORDER",
  "BAR_EVENT_INQUIRY",
  "BAKERY_PREORDER",
  "MEAL_PLAN",
  "CHANNEL_OTHER",
] as const satisfies readonly CustomerSource[];

export const CUSTOMER_SOURCE_LABEL: Record<CustomerSource, string> = {
  MANUAL: "Manual",
  STOREFRONT: "Storefront",
  WOO_COMMERCE: "WooCommerce",
  SHOPIFY: "Shopify",
  UBER_EATS: "Uber Eats",
  IMPORT: "CSV import",
  CATERING_QUOTE: "Catering quote",
  EVENT_INQUIRY: "Event inquiry",
  PHONE_ORDER: "Phone order",
  EMAIL_ORDER: "Email order",
  BAR_EVENT_INQUIRY: "Bar event inquiry",
  BAKERY_PREORDER: "Bakery preorder",
  MEAL_PLAN: "Meal plan",
  CHANNEL_OTHER: "Other channel",
};

export function isCustomerType(v: unknown): v is CustomerType {
  return typeof v === "string" && (CUSTOMER_TYPE_VALUES as readonly string[]).includes(v);
}

export function isCustomerSource(v: unknown): v is CustomerSource {
  return typeof v === "string" && (CUSTOMER_SOURCE_VALUES as readonly string[]).includes(v);
}

export type CrmTerminology = {
  pageTitle: string;
  pageSubtitle: string;
  customersHeading: string;
  vipHeading: string;
  followUpHeading: string;
  newCtaLabel: string;
};

export function crmTerminologyForMode(mode: BusinessType | null | undefined): CrmTerminology {
  switch (mode) {
    case "RESTAURANT":
      return {
        pageTitle: "Customer CRM",
        pageSubtitle: "Diners, takeout, delivery, repeat visits.",
        customersHeading: "Customers",
        vipHeading: "VIP diners",
        followUpHeading: "Follow-ups",
        newCtaLabel: "Add customer",
      };
    case "CAFE":
      return {
        pageTitle: "Guest CRM",
        pageSubtitle: "Regulars, pickup customers, and office clients.",
        customersHeading: "Guests",
        vipHeading: "VIP regulars",
        followUpHeading: "Follow-ups",
        newCtaLabel: "Add guest",
      };
    case "BAR":
      return {
        pageTitle: "Guests & event clients",
        pageSubtitle: "Bar guests, private event leads, and VIPs.",
        customersHeading: "Guests",
        vipHeading: "Event VIPs",
        followUpHeading: "Event follow-ups",
        newCtaLabel: "Add guest",
      };
    case "BAKERY":
      return {
        pageTitle: "Customers & preorder clients",
        pageSubtitle: "Preorder customers and custom-cake clients.",
        customersHeading: "Customers",
        vipHeading: "Preorder VIPs",
        followUpHeading: "Order follow-ups",
        newCtaLabel: "Add customer",
      };
    case "CATERING":
      return {
        pageTitle: "Clients & event contacts",
        pageSubtitle: "Catering clients, companies, and event leads.",
        customersHeading: "Clients",
        vipHeading: "Top clients",
        followUpHeading: "Quote follow-ups",
        newCtaLabel: "Add client",
      };
    case "MEAL_PREP":
      return {
        pageTitle: "Customers & subscribers",
        pageSubtitle: "Repeat customers, meal-plan subscribers, dietary profiles.",
        customersHeading: "Customers",
        vipHeading: "VIP subscribers",
        followUpHeading: "Renewal follow-ups",
        newCtaLabel: "Add customer",
      };
    case "GHOST_KITCHEN":
    case "CLOUD_KITCHEN":
    case "MULTI_BRAND":
      return {
        pageTitle: "Cross-brand customers",
        pageSubtitle: "Customers across brands and channels.",
        customersHeading: "Customers",
        vipHeading: "VIPs",
        followUpHeading: "Follow-ups",
        newCtaLabel: "Add customer",
      };
    case "OTHER":
    case null:
    case undefined:
    default:
      return {
        pageTitle: "Customer CRM",
        pageSubtitle: "Lifetime value, repeat visits, and channel mix.",
        customersHeading: "Customers",
        vipHeading: "VIPs",
        followUpHeading: "Follow-ups",
        newCtaLabel: "Add customer",
      };
  }
}
