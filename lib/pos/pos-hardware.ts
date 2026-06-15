/**
 * Honest hardware posture — browser-first integrations only unless a native adapter ships.
 */
export const POS_HARDWARE_CATEGORIES = [
  {
    id: "barcode_keyboard",
    label: "Barcode scanner (keyboard wedge)",
    status: "supported" as const,
    detail: "Any scanner that types digits into the focused search field works today.",
  },
  {
    id: "receipt_browser_print",
    label: "Receipt printer (browser print)",
    status: "supported" as const,
    detail: "Use the browser print dialog; no direct USB driver integration yet.",
  },
  {
    id: "kitchen_browser_print",
    label: "Kitchen / chit printer",
    status: "planned" as const,
    detail: "Same browser-print path; Epson/Star native adapters are roadmap items.",
  },
  {
    id: "cash_drawer",
    label: "Cash drawer kick-out",
    status: "placeholder" as const,
    detail: "Requires supported printer pulse commands — not wired in this release.",
  },
  {
    id: "customer_display",
    label: "Customer-facing display",
    status: "supported" as const,
    detail:
      "Second monitor popup at /dashboard/pos/terminal/customer-display — F8 or toolbar toggle; live cart via BroadcastChannel.",
  },
  {
    id: "stripe_terminal",
    label: "Stripe Terminal",
    status: "supported" as const,
    detail: "Stripe Terminal SDK — connect a reader and capture card-present payments from POS.",
  },
];
