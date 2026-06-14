import type { BeoQuoteInput } from "@/lib/catering/catering-beo-p2-64-types";

export type CateringBeoFormatScenario = {
  id: string;
  label: string;
  input: BeoQuoteInput;
  expectedMenuSections: number;
  minTimelineEntries: number;
  expectsLayoutGuestCount: boolean;
};

const EVENT_DATE = new Date("2026-07-15T00:00:00.000Z");
const EVENT_START = new Date("2026-07-15T18:00:00.000Z");
const EVENT_END = new Date("2026-07-15T21:00:00.000Z");

function baseQuote(overrides: Partial<BeoQuoteInput> = {}): BeoQuoteInput {
  return {
    quoteNumber: "CQ-1001",
    eventName: "Acme Corp Summer Party",
    customerName: "Jane Smith",
    companyName: "Acme Corp",
    customerEmail: "jane@acme.com",
    customerPhone: "555-0100",
    eventDate: EVENT_DATE,
    eventStartTime: EVENT_START,
    eventEndTime: EVENT_END,
    guestCount: 80,
    eventType: "CORPORATE_LUNCH",
    serviceStyle: "BUFFET",
    deliveryRequired: true,
    setupRequired: true,
    staffingRequired: true,
    dietaryNotes: "Vegetarian options required",
    allergyNotes: "Nut-free prep area",
    clientNotes: "Load-in via service elevator",
    internalNotes: null,
    eventAddressJson: {
      line1: "100 Market St",
      city: "San Francisco",
      region: "CA",
      postalCode: "94105",
    },
    items: [
      { title: "Grilled chicken", quantity: 80, unitPrice: 18, lineType: "FOOD" },
      { title: "Seasonal salad", quantity: 80, unitPrice: 8, lineType: "FOOD" },
      { title: "Iced tea", quantity: 80, unitPrice: 3, lineType: "BEVERAGE" },
    ],
    locationName: "Main kitchen",
    brandName: "Acme Catering",
    ...overrides,
  };
}

/** 10 catering quote scenarios for BEO format validation (P2-64). */
export const CATERING_BEO_FORMAT_P2_64_SCENARIOS: readonly CateringBeoFormatScenario[] = [
  {
    id: "corporate-buffet",
    label: "Corporate buffet — full service",
    input: baseQuote(),
    expectedMenuSections: 2,
    minTimelineEntries: 6,
    expectsLayoutGuestCount: true,
  },
  {
    id: "wedding-plated",
    label: "Wedding plated dinner",
    input: baseQuote({
      quoteNumber: "CQ-1002",
      eventName: "Rivera Wedding Reception",
      eventType: "WEDDING",
      serviceStyle: "PLATED",
      guestCount: 120,
      items: [
        { title: "Filet mignon", quantity: 120, unitPrice: 42, lineType: "FOOD" },
        { title: "Champagne toast", quantity: 120, unitPrice: 12, lineType: "BEVERAGE" },
        { title: "Service staff", quantity: 6, unitPrice: 250, lineType: "STAFFING" },
      ],
    }),
    expectedMenuSections: 3,
    minTimelineEntries: 6,
    expectsLayoutGuestCount: true,
  },
  {
    id: "drop-off-office",
    label: "Office drop-off — no staffing",
    input: baseQuote({
      quoteNumber: "CQ-1003",
      eventName: "Q3 All-hands Lunch",
      eventType: "OFFICE_EVENT",
      serviceStyle: "DROP_OFF",
      setupRequired: false,
      staffingRequired: false,
      guestCount: 45,
      items: [{ title: "Sandwich platters", quantity: 5, unitPrice: 85, lineType: "FOOD" }],
    }),
    expectedMenuSections: 1,
    minTimelineEntries: 6,
    expectsLayoutGuestCount: true,
  },
  {
    id: "bar-event",
    label: "Bar event — cocktail service",
    input: baseQuote({
      quoteNumber: "CQ-1004",
      eventName: "Investor Happy Hour",
      eventType: "BAR_EVENT",
      serviceStyle: "BAR_SERVICE_PLACEHOLDER",
      guestCount: 60,
      items: [
        { title: "Charcuterie boards", quantity: 6, unitPrice: 95, lineType: "FOOD" },
        { title: "Craft cocktails", quantity: 60, unitPrice: 14, lineType: "BEVERAGE" },
      ],
    }),
    expectedMenuSections: 2,
    minTimelineEntries: 6,
    expectsLayoutGuestCount: true,
  },
  {
    id: "family-style",
    label: "Family-style private party",
    input: baseQuote({
      quoteNumber: "CQ-1005",
      eventName: "Martinez Anniversary",
      eventType: "PRIVATE_PARTY",
      serviceStyle: "FAMILY_STYLE",
      guestCount: 30,
    }),
    expectedMenuSections: 2,
    minTimelineEntries: 6,
    expectsLayoutGuestCount: true,
  },
  {
    id: "boxed-meals",
    label: "Boxed meals pickup",
    input: baseQuote({
      quoteNumber: "CQ-1006",
      eventName: "Field team lunch",
      eventType: "PICKUP_CATERING",
      serviceStyle: "BOXED_MEALS",
      deliveryRequired: false,
      setupRequired: false,
      staffingRequired: false,
      guestCount: 25,
      items: [{ title: "Boxed lunch", quantity: 25, unitPrice: 16, lineType: "FOOD" }],
    }),
    expectedMenuSections: 1,
    minTimelineEntries: 6,
    expectsLayoutGuestCount: true,
  },
  {
    id: "holiday-trays",
    label: "Holiday tray pass",
    input: baseQuote({
      quoteNumber: "CQ-1007",
      eventName: "Holiday Open House",
      eventType: "HOLIDAY_EVENT",
      serviceStyle: "TRAYS",
      guestCount: 100,
      items: [
        { title: "Appetizer trays", quantity: 10, unitPrice: 65, lineType: "FOOD" },
        { title: "Hot cider", quantity: 100, unitPrice: 4, lineType: "BEVERAGE" },
      ],
    }),
    expectedMenuSections: 2,
    minTimelineEntries: 6,
    expectsLayoutGuestCount: true,
  },
  {
    id: "full-service-catering",
    label: "Full-service with rentals",
    input: baseQuote({
      quoteNumber: "CQ-1008",
      eventName: "Charity Gala",
      eventType: "FULL_SERVICE_CATERING",
      serviceStyle: "PLATED",
      guestCount: 200,
      items: [
        { title: "Dinner service", quantity: 200, unitPrice: 55, lineType: "FOOD" },
        { title: "Linens & china", quantity: 1, unitPrice: 1200, lineType: "RENTAL" },
        { title: "Setup labor", quantity: 1, unitPrice: 800, lineType: "SETUP" },
      ],
    }),
    expectedMenuSections: 3,
    minTimelineEntries: 6,
    expectsLayoutGuestCount: true,
  },
  {
    id: "no-event-times",
    label: "Relative timeline — no start/end times",
    input: baseQuote({
      quoteNumber: "CQ-1009",
      eventName: "TBD timing event",
      eventStartTime: null,
      eventEndTime: null,
      guestCount: 50,
    }),
    expectedMenuSections: 2,
    minTimelineEntries: 5,
    expectsLayoutGuestCount: true,
  },
  {
    id: "minimal-guest-data",
    label: "Minimal quote — menu + layout only",
    input: baseQuote({
      quoteNumber: null,
      eventName: null,
      guestCount: null,
      eventDate: null,
      eventStartTime: null,
      eventEndTime: null,
      dietaryNotes: null,
      allergyNotes: null,
      clientNotes: null,
      items: [{ title: "Custom menu tasting", quantity: 1, unitPrice: 500, lineType: "FOOD" }],
    }),
    expectedMenuSections: 1,
    minTimelineEntries: 5,
    expectsLayoutGuestCount: false,
  },
] as const;

export function buildCateringBeoFormatCorpusP264(): CateringBeoFormatScenario[] {
  return [...CATERING_BEO_FORMAT_P2_64_SCENARIOS];
}
