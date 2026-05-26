import type { CateringEventType, CateringServiceStyle } from "@prisma/client";

/**
 * Pure helpers that describe what operational workflows a quote is likely
 * to need. Used to recommend follow-ups and pre-fill conversion previews.
 */

export type EventWorkflowFlags = {
  delivery: boolean;
  setup: boolean;
  staffing: boolean;
  packing: boolean;
  production: boolean;
};

export function workflowsForEvent(eventType: CateringEventType, serviceStyle: CateringServiceStyle): EventWorkflowFlags {
  const delivery =
    serviceStyle === "DROP_OFF" ||
    serviceStyle === "BUFFET" ||
    serviceStyle === "FAMILY_STYLE" ||
    serviceStyle === "PLATED" ||
    serviceStyle === "BOXED_MEALS" ||
    serviceStyle === "TRAYS" ||
    eventType === "DROP_OFF_CATERING" ||
    eventType === "FULL_SERVICE_CATERING";

  const setup =
    serviceStyle === "BUFFET" ||
    serviceStyle === "FAMILY_STYLE" ||
    serviceStyle === "PLATED" ||
    eventType === "FULL_SERVICE_CATERING" ||
    eventType === "WEDDING" ||
    eventType === "BAR_EVENT";

  const staffing =
    serviceStyle === "BUFFET" ||
    serviceStyle === "FAMILY_STYLE" ||
    serviceStyle === "PLATED" ||
    serviceStyle === "BAR_SERVICE_PLACEHOLDER" ||
    eventType === "FULL_SERVICE_CATERING" ||
    eventType === "WEDDING" ||
    eventType === "BAR_EVENT";

  const packing = true; // every event produces something packable
  const production = true; // every event produces food to prep

  return { delivery, setup, staffing, packing, production };
}

/**
 * Suggested follow-up cadence (in days from now). UI surfaces these as
 * defaults; operators can override the due date.
 */
export const FOLLOWUP_DEFAULT_DAYS: Record<string, number> = {
  draft_not_sent: 1,
  sent_not_viewed: 3,
  viewed_no_decision: 5,
  expiring_soon: 2,
  accepted_kickoff: 3,
  event_in_two_weeks: -14,
  post_event: -1,
};
