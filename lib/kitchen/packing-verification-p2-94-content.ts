import {
  PACKING_VERIFICATION_P2_94_CAPABILITY_COUNT,
  PACKING_VERIFICATION_P2_94_ROUTE,
  PACKING_VERIFICATION_P2_94_SCANNER_ROUTE,
} from "@/lib/kitchen/packing-verification-p2-94-policy";

export const PACKING_VERIFICATION_P2_94_EYEBROW = "Packing verification · KDS handoff" as const;

export const PACKING_VERIFICATION_P2_94_HEADLINE =
  "QR/label scan, allergen checks, and delivery bag checklist" as const;

export const PACKING_VERIFICATION_P2_94_SUBLINE =
  "Three packing gates before delivery handoff — wired to packing scanner, allergen focus, and bag seal checklist. BETA: verify label scanner hardware — not certified regulatory compliance audit." as const;

export const PACKING_VERIFICATION_P2_94_CAPABILITIES = [
  {
    id: "packing-qr-label-scan",
    label: "QR / label scan",
    description:
      "Lookup pack token via packing-verify action — scanner route at /dashboard/packing/scanner.",
    module: "actions/packing-verify.ts",
    route: PACKING_VERIFICATION_P2_94_SCANNER_ROUTE,
  },
  {
    id: "packing-allergens",
    label: "Allergens",
    description:
      "Open allergen checks from packing-focus-era18 — blocks verify until allergen gaps cleared.",
    module: "lib/packing/packing-focus-era18.ts",
  },
  {
    id: "packing-delivery-bag-checklist",
    label: "Delivery bag checklist",
    description:
      "Six-step delivery bag checklist — scan, allergens, item count, seal, label, utensils.",
    module: "lib/kitchen/packing-verification-p2-94-operations.ts",
  },
] as const;

export const PACKING_VERIFICATION_P2_94_OPERATOR_LINKS = [
  { label: "Packing scanner", href: PACKING_VERIFICATION_P2_94_SCANNER_ROUTE },
  { label: "Packing verify", href: "/dashboard/packing/verify" },
  { label: "Expo mode", href: "/dashboard/kitchen/expo" },
] as const;

export { PACKING_VERIFICATION_P2_94_CAPABILITY_COUNT, PACKING_VERIFICATION_P2_94_ROUTE };
