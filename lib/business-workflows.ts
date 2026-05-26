import type { BusinessType } from "@prisma/client";

import { getDefaultOnboardingWorkflowId } from "@/lib/business-mode-registry";

export type WorkflowTemplateOption = {
  id: string;
  title: string;
  description: string;
  businessType: BusinessType;
};

export const WORKFLOW_TEMPLATE_OPTIONS: readonly WorkflowTemplateOption[] = [
  {
    id: "meal-prep-weekly",
    title: "Weekly preorder cycle",
    description: "Publish menu → reminders → cutoff → prep → pack → routes.",
    businessType: "MEAL_PREP",
  },
  {
    id: "restaurant-daily",
    title: "Restaurant daily service",
    description: "Orders → prep list → stations → service readiness.",
    businessType: "RESTAURANT",
  },
  {
    id: "cafe-morning",
    title: "Café morning rush",
    description: "Baking finish, coffee line, specials, pickup orders.",
    businessType: "CAFE",
  },
  {
    id: "bar-event-night",
    title: "Bar & events night",
    description: "Pars, bookings, staff assignments, close-out.",
    businessType: "BAR",
  },
  {
    id: "catering-event",
    title: "Catering quote to event",
    description: "Quotes → calendar lock → production → logistics.",
    businessType: "CATERING",
  },
  {
    id: "bakery-preorder-day",
    title: "Bakery preorder day",
    description: "Batch plan, labels, pickup slots.",
    businessType: "BAKERY",
  },
  {
    id: "ghost-kitchen-rush",
    title: "Ghost / cloud rush",
    description: "Channel triage, brand mix, packing, sync repair.",
    businessType: "GHOST_KITCHEN",
  },
  {
    id: "manual-orders-only",
    title: "Manual orders first",
    description: "Capture orders in KitchenOS — connect channels and menus when you are ready.",
    businessType: "OTHER",
  },
];

export function defaultWorkflowForBusinessType(
  businessType: BusinessType | null | undefined,
): string {
  return getDefaultOnboardingWorkflowId(businessType);
}
