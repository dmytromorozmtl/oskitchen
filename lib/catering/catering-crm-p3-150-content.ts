import {
  CATERING_CRM_P3_150_CAPABILITY_COUNT,
  CATERING_CRM_P3_150_ROUTE,
  type CateringCrmCapabilityId,
} from "@/lib/catering/catering-crm-p3-150-policy";

export const CATERING_CRM_P3_150_EYEBROW = "Tripleseat parity · catering CRM" as const;

export const CATERING_CRM_P3_150_SUBLINE =
  "Six CRM surfaces — quote builder, pipeline, Stripe deposits, event sheets, public proposals, and quote-to-order conversion. BETA baseline — verify live catering smokes before Tripleseat parity claims." as const;

export type CateringCrmCapability = {
  id: CateringCrmCapabilityId;
  label: string;
  route: string;
  testId: string;
  tripleseatTypical: string;
  osKitchenStatus: string;
};

export const CATERING_CRM_P3_150_CAPABILITIES: readonly CateringCrmCapability[] = [
  {
    id: "catering_quotes",
    label: "Catering quotes",
    route: "/dashboard/catering-quotes/new",
    testId: "catering-crm-quotes",
    tripleseatTypical: "Event quote builder with menu packages",
    osKitchenStatus: "shipped",
  },
  {
    id: "quote_pipeline",
    label: "Quote pipeline",
    route: "/dashboard/catering-quotes/pipeline",
    testId: "catering-crm-pipeline",
    tripleseatTypical: "Sales pipeline and follow-up cadence",
    osKitchenStatus: "shipped",
  },
  {
    id: "deposit_checkout",
    label: "Deposit checkout",
    route: "/dashboard/catering-quotes/accepted",
    testId: "catering-crm-deposits",
    tripleseatTypical: "Card deposit capture on acceptance",
    osKitchenStatus: "shipped",
  },
  {
    id: "event_sheets",
    label: "Event sheets",
    route: "/dashboard/catering-quotes/quotes",
    testId: "catering-crm-event-sheets",
    tripleseatTypical: "Event detail sheet with staffing/setup flags",
    osKitchenStatus: "shipped",
  },
  {
    id: "public_proposals",
    label: "Public proposals",
    route: "/dashboard/catering-quotes/public-proposals",
    testId: "catering-crm-proposals",
    tripleseatTypical: "Shareable client-facing proposal links",
    osKitchenStatus: "BETA",
  },
  {
    id: "quote_conversion",
    label: "Quote conversion",
    route: "/dashboard/catering",
    testId: "catering-crm-conversion",
    tripleseatTypical: "Accepted quote → production order handoff",
    osKitchenStatus: "BETA",
  },
] as const;

export function assertCateringCrmCapabilityCount(): boolean {
  return CATERING_CRM_P3_150_CAPABILITIES.length === CATERING_CRM_P3_150_CAPABILITY_COUNT;
}

export const CATERING_CRM_P3_150_OPERATOR_LINKS = [
  { label: "Catering CRM hub", href: CATERING_CRM_P3_150_ROUTE },
  { label: "Catering OS", href: "/dashboard/catering" },
  { label: "Quote center", href: "/dashboard/catering-quotes" },
] as const;
