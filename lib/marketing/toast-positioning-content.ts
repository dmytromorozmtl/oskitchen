import {
  TOAST_POSITIONING_COMPARE_PATH,
  TOAST_POSITIONING_PRIMARY_LINE,
} from "@/lib/marketing/toast-positioning-policy";

export const TOAST_POSITIONING_EYEBROW = "OS Kitchen vs Toast" as const;

export const TOAST_POSITIONING_SUBLINE =
  "Toast bundles proprietary terminals and multi-year hardware leases. OS Kitchen is browser-first — run POS on the iPad you already own, print on Epson/Star, add Stripe Terminal only if you want card-present." as const;

export const TOAST_POSITIONING_TOAST_WINS =
  "Toast wins on certified field hardware, mature floor plans, and payments-first rollout for full-service restaurants — say that aloud in competitive deals." as const;

export const TOAST_POSITIONING_WEDGES = [
  {
    id: "byo_hardware",
    title: "Bring your own tablet",
    body: "Browser POS on iPad, Android, or Surface — no Toast Go / Flex required for core workflows.",
  },
  {
    id: "no_lease",
    title: "No terminal lease bundle",
    body: "Month-to-month software — cancel anytime. Optional Stripe M2 (~$59) instead of ~$799 proprietary terminal.",
  },
  {
    id: "ops_truth",
    title: "Honest integration status",
    body: "Integration Health shows SKIPPED and BETA — not fake green tiles that fail at rush hour.",
  },
] as const;

export const TOAST_POSITIONING_CTA = {
  label: "Compare OS Kitchen vs Toast",
  href: TOAST_POSITIONING_COMPARE_PATH,
} as const;

export { TOAST_POSITIONING_PRIMARY_LINE, TOAST_POSITIONING_COMPARE_PATH };
