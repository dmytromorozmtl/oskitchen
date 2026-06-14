import type { FulfillmentRequirementContext } from "@/lib/fulfillment/fulfillment-requirements";
import {
  inferFulfillmentIntent,
  pickupDateDisplayLabel,
  requiresScheduledServiceDate,
} from "@/lib/fulfillment/fulfillment-requirements";

export type FulfillmentEvaluation = {
  requiresServiceDate: boolean;
  serviceDateSatisfied: boolean;
  intent: ReturnType<typeof inferFulfillmentIntent>;
  pickupLabel: string;
};

export function evaluateFulfillmentForOrder(row: FulfillmentRequirementContext): FulfillmentEvaluation {
  const requiresServiceDate = requiresScheduledServiceDate(row);
  const serviceDateSatisfied = !requiresServiceDate || row.pickupDate != null;
  return {
    requiresServiceDate,
    serviceDateSatisfied,
    intent: inferFulfillmentIntent(row),
    pickupLabel: pickupDateDisplayLabel(row),
  };
}
