import {
  AP_AUTOMATION_P2_104_CAPABILITY_COUNT,
  AP_AUTOMATION_P2_104_INVOICES_ROUTE,
  AP_AUTOMATION_P2_104_PAYMENTS_ROUTE,
  AP_AUTOMATION_P2_104_ROUTE,
} from "@/lib/accounting/ap-automation-p2-104-policy";

export const AP_AUTOMATION_P2_104_EYEBROW = "AP automation · invoice to payment" as const;

export const AP_AUTOMATION_P2_104_HEADLINE =
  "Invoice intake, PO matching, and payment release workflow" as const;

export const AP_AUTOMATION_P2_104_SUBLINE =
  "Three AP stages — invoice intake (OCR or manual), PO matching with variance, and payment release after approval. BETA: verify with supplier statements — typical directional workflow, not certified accounting audit." as const;

export const AP_AUTOMATION_P2_104_CAPABILITIES = [
  {
    id: "invoice-intake",
    label: "Invoice intake",
    description: "Scan or enter supplier invoice — OCR extraction or manual AP entry.",
    module: "services/ai/invoice-scanner-service.ts",
    route: AP_AUTOMATION_P2_104_INVOICES_ROUTE,
  },
  {
    id: "po-matching",
    label: "PO matching",
    description: "Match invoice lines to purchase orders — variance qty and price flags.",
    module: "services/accounting/ap-service.ts",
    route: AP_AUTOMATION_P2_104_ROUTE,
  },
  {
    id: "payment-release",
    label: "Payment release",
    description: "Approve invoice → vendor payment queue → mark paid.",
    module: "actions/accounting/ap.ts",
    route: AP_AUTOMATION_P2_104_PAYMENTS_ROUTE,
  },
] as const;

export const AP_AUTOMATION_P2_104_OPERATOR_LINKS = [
  { label: "Supplier invoices", href: AP_AUTOMATION_P2_104_INVOICES_ROUTE },
  { label: "Vendor payments", href: AP_AUTOMATION_P2_104_PAYMENTS_ROUTE },
  { label: "Invoice scanner", href: "/dashboard/inventory/invoice-scanner" },
] as const;

export { AP_AUTOMATION_P2_104_CAPABILITY_COUNT, AP_AUTOMATION_P2_104_ROUTE };
