import type {
  CateringEventType,
  CateringPricingMode,
  CateringServiceStyle,
} from "@prisma/client";

export type BuiltInCateringTemplate = {
  key: string;
  name: string;
  description: string;
  eventType: CateringEventType;
  serviceStyle: CateringServiceStyle;
  pricingMode: CateringPricingMode;
  defaultLines: Array<{ title: string; quantity: number; unitPrice: number; lineType: string }>;
  defaultFees: { serviceFee?: number; deliveryFee?: number; setupFee?: number; staffingFee?: number };
  clientCopy: string;
  internalChecklist: string;
};

export const BUILT_IN_CATERING_TEMPLATES: readonly BuiltInCateringTemplate[] = [
  {
    key: "corporate-lunch-drop",
    name: "Corporate Lunch Drop-off",
    description: "Drop-off lunch for office, salad + entrée + side + dessert per person.",
    eventType: "CORPORATE_LUNCH",
    serviceStyle: "DROP_OFF",
    pricingMode: "PER_PERSON",
    defaultLines: [
      { title: "Lunch entrée", quantity: 10, unitPrice: 14, lineType: "FOOD" },
      { title: "Mixed salad", quantity: 10, unitPrice: 5, lineType: "FOOD" },
      { title: "Dessert", quantity: 10, unitPrice: 4, lineType: "FOOD" },
    ],
    defaultFees: { deliveryFee: 25 },
    clientCopy: "Drop-off lunch delivered ready-to-serve in disposable trays.",
    internalChecklist: "Confirm delivery window with reception; confirm dietary count 24h ahead.",
  },
  {
    key: "boxed-lunch",
    name: "Boxed Lunch Package",
    description: "Individually packed boxed meals — great for events with allergies or contact-free pickup.",
    eventType: "OFFICE_EVENT",
    serviceStyle: "BOXED_MEALS",
    pricingMode: "PER_PERSON",
    defaultLines: [
      { title: "Boxed lunch (sandwich + side + dessert)", quantity: 10, unitPrice: 17, lineType: "FOOD" },
      { title: "Bottled drink", quantity: 10, unitPrice: 3, lineType: "BEVERAGE" },
    ],
    defaultFees: { deliveryFee: 20 },
    clientCopy: "Each guest receives their own labeled box with sandwich, side, dessert, and drink.",
    internalChecklist: "Label every box with allergens; load coolers; verify count by box.",
  },
  {
    key: "buffet",
    name: "Buffet Catering",
    description: "Setup + replenish + breakdown buffet service.",
    eventType: "FULL_SERVICE_CATERING",
    serviceStyle: "BUFFET",
    pricingMode: "PER_PERSON",
    defaultLines: [
      { title: "Buffet entrée package", quantity: 25, unitPrice: 28, lineType: "FOOD" },
      { title: "Sides (2 selections)", quantity: 25, unitPrice: 8, lineType: "FOOD" },
      { title: "Dessert station", quantity: 25, unitPrice: 6, lineType: "FOOD" },
    ],
    defaultFees: { serviceFee: 75, deliveryFee: 40, setupFee: 100, staffingFee: 200 },
    clientCopy: "Full buffet setup with chafing dishes and serving utensils — staffed for 3 hours.",
    internalChecklist: "Lock staffing 7 days out; confirm chafer rentals; verify allergy plates.",
  },
  {
    key: "family-style",
    name: "Family-Style Catering",
    description: "Shared platters served to the table — warmer service feel, less staffing than plated.",
    eventType: "PRIVATE_PARTY",
    serviceStyle: "FAMILY_STYLE",
    pricingMode: "PER_PERSON",
    defaultLines: [
      { title: "Family-style platter package", quantity: 20, unitPrice: 32, lineType: "FOOD" },
      { title: "Bread & spreads", quantity: 20, unitPrice: 4, lineType: "FOOD" },
    ],
    defaultFees: { serviceFee: 50, deliveryFee: 35, staffingFee: 150 },
    clientCopy: "Shared platters served family-style. We deliver, set, and clear.",
    internalChecklist: "Confirm table count and platter share ratio.",
  },
  {
    key: "breakfast-meeting",
    name: "Breakfast Meeting",
    description: "Morning meeting drop — pastries, fruit, coffee.",
    eventType: "OFFICE_EVENT",
    serviceStyle: "DROP_OFF",
    pricingMode: "PER_PERSON",
    defaultLines: [
      { title: "Pastry assortment", quantity: 12, unitPrice: 4, lineType: "FOOD" },
      { title: "Fresh fruit platter", quantity: 1, unitPrice: 35, lineType: "FOOD" },
      { title: "Coffee carafe (12 cups)", quantity: 2, unitPrice: 28, lineType: "BEVERAGE" },
    ],
    defaultFees: { deliveryFee: 15 },
    clientCopy: "Morning pastry assortment, fruit, and coffee.",
    internalChecklist: "Deliver before 8am; bring cups, cream, sugar.",
  },
  {
    key: "bakery-event",
    name: "Bakery Event Order",
    description: "Cake + pastries for a private event.",
    eventType: "PRIVATE_PARTY",
    serviceStyle: "PICKUP",
    pricingMode: "FIXED",
    defaultLines: [
      { title: "Custom cake (8-inch)", quantity: 1, unitPrice: 65, lineType: "FOOD" },
      { title: "Cupcake dozen", quantity: 2, unitPrice: 36, lineType: "FOOD" },
    ],
    defaultFees: {},
    clientCopy: "Custom cake decorated to your theme + 2 dozen cupcakes.",
    internalChecklist: "Confirm allergens; pickup time; design specs.",
  },
  {
    key: "bar-private-event",
    name: "Bar Private Event",
    description: "Private booking with bar service placeholder — confirm local alcohol compliance before sending.",
    eventType: "BAR_EVENT",
    serviceStyle: "BAR_SERVICE_PLACEHOLDER",
    pricingMode: "HOURLY_SERVICE",
    defaultLines: [
      { title: "Bartender (per hour)", quantity: 4, unitPrice: 65, lineType: "STAFFING" },
      { title: "Bar setup (non-alcoholic placeholder)", quantity: 1, unitPrice: 150, lineType: "SERVICE" },
    ],
    defaultFees: { staffingFee: 0 },
    clientCopy: "Private bar setup. Alcohol service depends on local licensing and is confirmed separately.",
    internalChecklist: "VERIFY alcohol licensing before confirming. Do not promise pour service.",
  },
  {
    key: "meal-prep-corporate",
    name: "Meal Prep Corporate Rotation",
    description: "One-off corporate meal proposal — convert to a recurring meal plan after acceptance.",
    eventType: "CORPORATE_LUNCH",
    serviceStyle: "BOXED_MEALS",
    pricingMode: "PER_PERSON",
    defaultLines: [
      { title: "Boxed meal", quantity: 15, unitPrice: 16, lineType: "FOOD" },
      { title: "Salad add-on", quantity: 15, unitPrice: 4, lineType: "FOOD" },
    ],
    defaultFees: { deliveryFee: 25 },
    clientCopy: "Weekly boxed meal package — convert into a recurring plan after the first delivery if you'd like.",
    internalChecklist: "After delivery, hand off to Meal Plans for recurring schedule.",
  },
  {
    key: "custom-event",
    name: "Custom Event Proposal",
    description: "Blank slate — pick everything from the wizard.",
    eventType: "CUSTOM",
    serviceStyle: "CUSTOM",
    pricingMode: "CUSTOM_QUOTE",
    defaultLines: [],
    defaultFees: {},
    clientCopy: "Tailored proposal — details to follow.",
    internalChecklist: "Document every assumption.",
  },
];
