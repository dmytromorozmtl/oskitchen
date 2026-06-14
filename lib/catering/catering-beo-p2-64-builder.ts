import { CATERING_BEO_FORMAT_P2_64_POLICY_ID } from "@/lib/catering/catering-beo-p2-64-policy";
import {
  CATERING_BEO_LINE_TYPE_SECTION,
  type BeoQuoteInput,
  type CateringBeoDocument,
  type BeoMenuSection,
  type BeoTimelineEntry,
} from "@/lib/catering/catering-beo-p2-64-types";

const EVENT_TYPE_LABEL: Record<BeoQuoteInput["eventType"], string> = {
  CORPORATE_LUNCH: "Corporate lunch",
  WEDDING: "Wedding",
  PRIVATE_PARTY: "Private party",
  OFFICE_EVENT: "Office event",
  BAR_EVENT: "Bar event",
  HOLIDAY_EVENT: "Holiday event",
  DROP_OFF_CATERING: "Drop-off catering",
  FULL_SERVICE_CATERING: "Full-service catering",
  PICKUP_CATERING: "Pickup catering",
  CUSTOM: "Custom",
};

const SERVICE_STYLE_LABEL: Record<BeoQuoteInput["serviceStyle"], string> = {
  DROP_OFF: "Drop-off",
  PICKUP: "Pickup",
  BUFFET: "Buffet",
  FAMILY_STYLE: "Family style",
  PLATED: "Plated",
  BOXED_MEALS: "Boxed meals",
  TRAYS: "Trays",
  BAR_SERVICE_PLACEHOLDER: "Bar service (placeholder)",
  CUSTOM: "Custom",
};

function formatVenueAddress(eventAddressJson: Record<string, unknown> | null): string | null {
  if (!eventAddressJson) return null;
  const parts = [
    eventAddressJson.line1,
    eventAddressJson.line2,
    eventAddressJson.city,
    eventAddressJson.region,
    eventAddressJson.postalCode,
  ]
    .filter((part) => typeof part === "string" && part.trim())
    .map((part) => String(part).trim());
  return parts.length > 0 ? parts.join(", ") : null;
}

function tableConfiguration(serviceStyle: BeoQuoteInput["serviceStyle"], guestCount: number | null): string {
  const guests = guestCount ?? 0;
  switch (serviceStyle) {
    case "BUFFET":
      return guests > 0 ? `Buffet stations for ${guests} guests — chafers + serving utensils` : "Buffet station setup";
    case "PLATED":
      return guests > 0 ? `Plated service — ${Math.ceil(guests / 8)} tables of 8` : "Plated table setup";
    case "FAMILY_STYLE":
      return guests > 0 ? `Family-style rounds — ${Math.ceil(guests / 10)} tables of 10` : "Family-style table setup";
    case "BOXED_MEALS":
      return guests > 0 ? `Individual boxed meals — ${guests} placements` : "Boxed meal staging area";
    case "TRAYS":
      return "Tray pass / display tables";
    case "BAR_SERVICE_PLACEHOLDER":
      return "Bar service layout — high-top + cocktail tables";
    default:
      return guests > 0 ? `Drop-off staging for ${guests} guests` : "Standard delivery staging";
  }
}

function buildMenuSections(input: BeoQuoteInput): BeoMenuSection[] {
  const grouped = new Map<string, BeoMenuSection["items"]>();

  for (const line of input.items) {
    if (line.lineType === "DISCOUNT" || line.lineType === "TAX") continue;
    const category = CATERING_BEO_LINE_TYPE_SECTION[line.lineType] ?? "Other";
    const bucket = grouped.get(category) ?? [];
    bucket.push({
      title: line.title,
      quantity: line.quantity,
      notes: line.notes ?? null,
    });
    grouped.set(category, bucket);
  }

  return [...grouped.entries()].map(([category, items]) => ({ category, items }));
}

function formatTimeLabel(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatEventDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildTimeline(input: BeoQuoteInput): BeoTimelineEntry[] {
  const entries: BeoTimelineEntry[] = [];
  const start = input.eventStartTime;
  const end = input.eventEndTime;

  if (start) {
    const loadOut = new Date(start.getTime() - 2 * 60 * 60 * 1000);
    const arrive = new Date(start.getTime() - 90 * 60 * 1000);
    const setup = new Date(start.getTime() - 60 * 60 * 1000);
    const walkthrough = new Date(start.getTime() - 30 * 60 * 1000);

    entries.push(
      { timeLabel: formatTimeLabel(loadOut), activity: "Kitchen load-out", owner: "Production" },
      { timeLabel: formatTimeLabel(arrive), activity: "Arrive on-site", owner: "Delivery / setup crew" },
    );

    if (input.setupRequired) {
      entries.push({
        timeLabel: formatTimeLabel(setup),
        activity: "Room setup — tables, linens, buffet/plated staging",
        owner: "Setup team",
      });
    }

    entries.push({
      timeLabel: formatTimeLabel(walkthrough),
      activity: "Final walkthrough with client / venue",
      owner: "Event captain",
    });

    entries.push({
      timeLabel: formatTimeLabel(start),
      activity: "Service begins",
      owner: input.staffingRequired ? "Service staff" : "Drop-off complete",
    });

    if (end) {
      entries.push({
        timeLabel: formatTimeLabel(end),
        activity: "Service concludes",
        owner: "Event captain",
      });
      const breakdown = new Date(end.getTime() + 45 * 60 * 1000);
      entries.push({
        timeLabel: formatTimeLabel(breakdown),
        activity: "Breakdown and load-out",
        owner: "Setup team",
      });
    }
  } else {
    entries.push(
      { timeLabel: "T-120 min", activity: "Kitchen load-out", owner: "Production" },
      { timeLabel: "T-90 min", activity: "Arrive on-site", owner: "Delivery crew" },
      { timeLabel: "T-60 min", activity: "Setup (if required)", owner: "Setup team" },
      { timeLabel: "T-0", activity: "Service start", owner: "Service staff" },
      { timeLabel: "T+45 min", activity: "Breakdown", owner: "Setup team" },
    );
  }

  return entries;
}

export function buildCateringBeoFromQuote(
  input: BeoQuoteInput,
  generatedAt: Date = new Date(),
): CateringBeoDocument {
  const eventTitle = input.eventName?.trim() || input.quoteNumber || "Catering event";
  const beoNumber = input.quoteNumber ? `BEO-${input.quoteNumber}` : `BEO-${eventTitle.slice(0, 12)}`;

  const specialInstructions = [
    input.dietaryNotes ? `Dietary: ${input.dietaryNotes}` : null,
    input.allergyNotes ? `Allergies: ${input.allergyNotes}` : null,
    input.clientNotes ? `Client notes: ${input.clientNotes}` : null,
    input.internalNotes ? `Internal: ${input.internalNotes}` : null,
  ].filter((note): note is string => Boolean(note));

  return {
    policyId: CATERING_BEO_FORMAT_P2_64_POLICY_ID,
    beoNumber,
    eventTitle,
    client: {
      name: input.customerName,
      company: input.companyName,
      email: input.customerEmail,
      phone: input.customerPhone,
    },
    eventDateLabel: input.eventDate ? formatEventDate(input.eventDate) : null,
    layout: {
      roomSetup: `${EVENT_TYPE_LABEL[input.eventType]} — ${SERVICE_STYLE_LABEL[input.serviceStyle]}`,
      serviceStyle: SERVICE_STYLE_LABEL[input.serviceStyle],
      guestCount: input.guestCount,
      tableConfiguration: tableConfiguration(input.serviceStyle, input.guestCount),
      deliveryNotes: input.deliveryRequired ? "Delivery to venue — confirm load-in access" : null,
      setupNotes: input.setupRequired ? "On-site setup required before service" : null,
      staffingNotes: input.staffingRequired ? "Service staff on-site for duration" : null,
      venueAddress: formatVenueAddress(input.eventAddressJson),
    },
    menu: buildMenuSections(input),
    timeline: buildTimeline(input),
    specialInstructions,
    generatedAtIso: generatedAt.toISOString(),
  };
}
