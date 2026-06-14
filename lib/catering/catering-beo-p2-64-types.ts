export type BeoEventType =
  | "CORPORATE_LUNCH"
  | "WEDDING"
  | "PRIVATE_PARTY"
  | "OFFICE_EVENT"
  | "BAR_EVENT"
  | "HOLIDAY_EVENT"
  | "DROP_OFF_CATERING"
  | "FULL_SERVICE_CATERING"
  | "PICKUP_CATERING"
  | "CUSTOM";

export type BeoServiceStyle =
  | "DROP_OFF"
  | "PICKUP"
  | "BUFFET"
  | "FAMILY_STYLE"
  | "PLATED"
  | "BOXED_MEALS"
  | "TRAYS"
  | "BAR_SERVICE_PLACEHOLDER"
  | "CUSTOM";

export type BeoLineType =
  | "FOOD"
  | "BEVERAGE"
  | "SERVICE"
  | "RENTAL"
  | "STAFFING"
  | "DELIVERY"
  | "SETUP"
  | "DISCOUNT"
  | "TAX"
  | "OTHER";

export type BeoQuoteLineInput = {
  title: string;
  quantity: number;
  unitPrice: number;
  lineType: BeoLineType;
  notes?: string | null;
};

export type BeoQuoteInput = {
  quoteNumber: string | null;
  eventName: string | null;
  customerName: string;
  companyName: string | null;
  customerEmail: string;
  customerPhone: string | null;
  eventDate: Date | null;
  eventStartTime: Date | null;
  eventEndTime: Date | null;
  guestCount: number | null;
  eventType: BeoEventType;
  serviceStyle: BeoServiceStyle;
  deliveryRequired: boolean;
  setupRequired: boolean;
  staffingRequired: boolean;
  dietaryNotes: string | null;
  allergyNotes: string | null;
  clientNotes: string | null;
  internalNotes: string | null;
  eventAddressJson: Record<string, unknown> | null;
  items: BeoQuoteLineInput[];
  locationName?: string | null;
  brandName?: string | null;
};

export type BeoLayoutSection = {
  roomSetup: string;
  serviceStyle: string;
  guestCount: number | null;
  tableConfiguration: string;
  deliveryNotes: string | null;
  setupNotes: string | null;
  staffingNotes: string | null;
  venueAddress: string | null;
};

export type BeoMenuSection = {
  category: string;
  items: Array<{
    title: string;
    quantity: number;
    notes: string | null;
  }>;
};

export type BeoTimelineEntry = {
  timeLabel: string;
  activity: string;
  owner: string;
};

export type CateringBeoDocument = {
  policyId: string;
  beoNumber: string;
  eventTitle: string;
  client: {
    name: string;
    company: string | null;
    email: string;
    phone: string | null;
  };
  eventDateLabel: string | null;
  layout: BeoLayoutSection;
  menu: BeoMenuSection[];
  timeline: BeoTimelineEntry[];
  specialInstructions: string[];
  generatedAtIso: string;
};

export const CATERING_BEO_LINE_TYPE_SECTION: Record<BeoLineType, string> = {
  FOOD: "Food",
  BEVERAGE: "Beverage",
  SERVICE: "Service",
  RENTAL: "Rentals",
  STAFFING: "Staffing",
  DELIVERY: "Delivery",
  SETUP: "Setup",
  DISCOUNT: "Discounts",
  TAX: "Tax",
  OTHER: "Other",
};
