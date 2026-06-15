import {
  VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITY_COUNT,
  VENDOR_PAYOUT_WEBHOOK_P2_121_ROUTE,
  VENDOR_PAYOUT_WEBHOOK_P2_121_VENDOR_FINANCE_ROUTE,
  VENDOR_PAYOUT_WEBHOOK_P2_121_WEBHOOK_ROUTE,
} from "@/lib/marketplace/vendor-payout-webhook-p2-121-policy";

export const VENDOR_PAYOUT_WEBHOOK_P2_121_EYEBROW = "Vendor payouts · Stripe Connect" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_HEADLINE =
  "Connect onboarding, payment capture, transfers, and payout webhooks" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_SUBLINE =
  "Four steps in the marketplace Stripe Connect flow — Express onboarding, payment capture with application fee, transfer to connected account, and payout.paid webhook dispatch. BETA: verify Connect readiness in vendor finance — typical directional payout flow, not certified settlement audit." as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITIES = [
  {
    id: "connect-onboarding",
    label: "Connect onboarding",
    description:
      "Express account creation and onboarding link — account.updated sets verifiedAt when payouts_enabled.",
    module: "services/marketplace/stripe-connect-service.ts",
    route: VENDOR_PAYOUT_WEBHOOK_P2_121_VENDOR_FINANCE_ROUTE,
  },
  {
    id: "payment-capture",
    label: "Payment capture",
    description:
      "Checkout payment_intent with application_fee — releaseFunds on payment_intent.succeeded webhook.",
    module: "services/marketplace/stripe-connect-service.ts",
    route: VENDOR_PAYOUT_WEBHOOK_P2_121_VENDOR_FINANCE_ROUTE,
  },
  {
    id: "payout-transfer",
    label: "Payout transfer",
    description:
      "processPayout creates Stripe transfer with idempotency key — transfer.created confirms PAID_OUT status.",
    module: "services/marketplace/vendor-finance-service.ts",
    route: VENDOR_PAYOUT_WEBHOOK_P2_121_VENDOR_FINANCE_ROUTE,
  },
  {
    id: "payout-webhook",
    label: "Payout webhook",
    description:
      "payout.paid dispatches payout_processed to vendor webhooks — payout.failed logs and alerts ops.",
    module: "app/api/marketplace/stripe-connect/webhook/route.ts",
    route: VENDOR_PAYOUT_WEBHOOK_P2_121_WEBHOOK_ROUTE,
  },
] as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_OPERATOR_LINKS = [
  { label: "Vendor finance", href: VENDOR_PAYOUT_WEBHOOK_P2_121_VENDOR_FINANCE_ROUTE },
  { label: "Instant payouts", href: "/vendor/finance/instant-payouts" },
  { label: "Marketplace hub", href: "/dashboard/marketplace" },
] as const;

export { VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITY_COUNT, VENDOR_PAYOUT_WEBHOOK_P2_121_ROUTE };
