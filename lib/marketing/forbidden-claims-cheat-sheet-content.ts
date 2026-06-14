/**
 * Blueprint P1-26 — Forbidden claims team cheat-sheet (SAFE / CAVEAT / не говорить).
 *
 * @see docs/forbidden-claims-team-cheat-sheet.md
 */

import { AI_MESSAGING_P1_34_APPROVED_LINE } from "@/lib/marketing/ai-messaging-p1-34-policy";

export const FORBIDDEN_CLAIMS_CHEAT_SHEET_P1_26_POLICY_ID =
  "forbidden-claims-cheat-sheet-p1-26-v1" as const;

export const FORBIDDEN_CLAIMS_CHEAT_SHEET_DOC =
  "docs/forbidden-claims-team-cheat-sheet.md" as const;

export const FORBIDDEN_CLAIMS_CHEAT_SHEET_CONTENT_PATH =
  "lib/marketing/forbidden-claims-cheat-sheet-content.ts" as const;

export const FORBIDDEN_CLAIMS_CHEAT_SHEET_CHECK_NPM_SCRIPT =
  "check:forbidden-claims-training" as const;

export const FORBIDDEN_CLAIMS_CHEAT_SHEET_COLUMN_LABELS = [
  "SAFE",
  "CAVEAT",
  "NEVER",
] as const;

export type ForbiddenClaimsCheatSheetVerdict = "SAFE" | "CAVEAT" | "NEVER";

export type ForbiddenClaimsCheatSheetEntry = {
  id: string;
  category: string;
  topic: string;
  verdict: ForbiddenClaimsCheatSheetVerdict;
  sayThis: string;
  neverSay?: string;
};

export const FORBIDDEN_CLAIMS_CHEAT_SHEET_HEADLINE =
  "Forbidden claims cheat-sheet — SAFE · CAVEAT · не говорить" as const;

export const FORBIDDEN_CLAIMS_CHEAT_SHEET_RULE =
  "PASS > SKIPPED > FAIL — SKIPPED ≠ PASS. Leave Integration Health rows visible in demos." as const;

export const FORBIDDEN_CLAIMS_CHEAT_SHEET_ENTRIES: ForbiddenClaimsCheatSheetEntry[] = [
  {
    id: "integrations-health-ui",
    category: "Integrations",
    topic: "Integration Health Center",
    verdict: "SAFE",
    sayThis: "We show PASS, SKIPPED, or FAILED per channel — not fake green tiles.",
  },
  {
    id: "doordash-live",
    category: "Integrations",
    topic: "DoorDash / Uber Eats ingest",
    verdict: "CAVEAT",
    sayThis:
      "Marketplace channels are BETA or partner-gated — live ingest only after staging smoke PASS with your credentials.",
    neverSay: "DoorDash orders flow live today / same as Toast delivery",
  },
  {
    id: "woo-shopify-smoke",
    category: "Integrations",
    topic: "Shopify / WooCommerce",
    verdict: "CAVEAT",
    sayThis:
      "Engineering certification path — show smoke artifact PASS or SKIPPED reason in Integration Health.",
    neverSay: "WooCommerce is certified / Shopify is LIVE for everyone",
  },
  {
    id: "webhook-uptime",
    category: "Integrations",
    topic: "Webhook monitoring",
    verdict: "CAVEAT",
    sayThis:
      "Health scores and alerts are operational signals — not guaranteed uptime or SLA.",
    neverSay: "Guaranteed webhook uptime / 99.9% integration SLA",
  },
  {
    id: "kds-bump",
    category: "Kitchen",
    topic: "KDS bump + expo",
    verdict: "SAFE",
    sayThis: "Native KDS — bump tickets from every configured channel into one kitchen screen.",
  },
  {
    id: "kds-realtime-slo",
    category: "Kitchen",
    topic: "KDS realtime",
    verdict: "NEVER",
    sayThis: "KDS refreshes on interval; show connection bar honestly.",
    neverSay: "Rush-hour KDS certified / production realtime SLO / sub-second guaranteed",
  },
  {
    id: "pos-software",
    category: "POS",
    topic: "Software-first POS",
    verdict: "SAFE",
    sayThis: "Browser and tablet POS — runs on hardware you already own.",
  },
  {
    id: "offline-pos",
    category: "POS",
    topic: "Offline payments",
    verdict: "NEVER",
    sayThis: "Offline queue is engineering preview — not rush-hour certified.",
    neverSay: "Production-ready offline card payments / works like Square offline",
  },
  {
    id: "hardware-roadmap-deferred",
    category: "Hardware",
    topic: "Native terminals & hardware ecosystem",
    verdict: "NEVER",
    sayThis:
      "Browser-first POS on BYOD tablets — optional Stripe Terminal (BETA). Native proprietary hardware ecosystem is deferred.",
    neverSay:
      "Native terminals launch next quarter / proprietary hardware program shipping soon / Toast Go equivalent on the way",
  },
  {
    id: "unified-inventory",
    category: "Inventory",
    topic: "Cross-channel inventory",
    verdict: "NEVER",
    sayThis: "POS inventory depletion when recipes configured; storefront ledger separate.",
    neverSay: "Unified inventory across POS and storefront / single ledger everywhere",
  },
  {
    id: "ai-modules",
    category: "AI",
    topic: "AI differentiation",
    verdict: "SAFE",
    sayThis:
      "AI-assisted operations — seven proprietary modules in production at qualified maturity.",
  },
  {
    id: "ai-assisted-messaging",
    category: "AI",
    topic: "AI-assisted vs unqualified autonomy",
    verdict: "CAVEAT",
    sayThis: AI_MESSAGING_P1_34_APPROVED_LINE,
    neverSay: "Full AI autonomy / magic AI that runs your kitchen without operator review",
  },
  {
    id: "ai-perfect",
    category: "AI",
    topic: "Predictions & OCR",
    verdict: "NEVER",
    sayThis: "Directional signals — confirm in your trial workspace.",
    neverSay: "Perfect predictions / 100% accurate invoice OCR / always correct co-pilot",
  },
  {
    id: "soc2-scim",
    category: "Compliance",
    topic: "SOC 2 / SCIM / SSO",
    verdict: "CAVEAT",
    sayThis:
      "SOC 2 in progress — Type I target Q4 2026 (not certified). SSO/SCIM roadmap unless enabled in writing.",
    neverSay: "Type II SOC 2 attestation claims / enterprise SSO included / SCIM production-ready",
  },
  {
    id: "marketplace-beta",
    category: "Marketplace",
    topic: "B2B supplier marketplace",
    verdict: "CAVEAT",
    sayThis: "Marketplace is BETA — design-partner vendors onboarding on staging.",
    neverSay: "Live national supplier network / thousands of vendors",
  },
  {
    id: "design-partner",
    category: "Customers",
    topic: "Founding customers",
    verdict: "SAFE",
    sayThis: "Design partner program open — 0 signed founding customers today; honest pilot scope.",
  },
  {
    id: "case-studies",
    category: "Customers",
    topic: "Logos & KPI proof",
    verdict: "NEVER",
    sayThis: "Pilot conversations in progress — no investor-grade KPI claims without signed LOI.",
    neverSay: "Thousands of operators / published case study ROI / named customer logos we do not have",
  },
  {
    id: "platform-ga",
    category: "Platform",
    topic: "Production-ready (blanket)",
    verdict: "NEVER",
    sayThis: "Pilot-ready modules per capability matrix and signed scope.",
    neverSay: "Production-ready for every module / GA across all 801 routes",
  },
  {
    id: "public-api-sla",
    category: "Platform",
    topic: "Public / partner API",
    verdict: "CAVEAT",
    sayThis: "Partner API preview — scope per contract; no public SLA until proof artifact.",
    neverSay: "Enterprise API SLA / 99.99% API uptime guarantee",
  },
  {
    id: "profit-engine",
    category: "Finance",
    topic: "P&L / profit engine",
    verdict: "CAVEAT",
    sayThis: "Directional margin signals tied to today's orders — not audited financial statements.",
    neverSay: "GAAP-certified P&L / investor-grade financial reporting",
  },
  {
    id: "live-integrations-count",
    category: "Integrations",
    topic: "18 LIVE integrations scaffold",
    verdict: "CAVEAT",
    sayThis:
      "18 integration adapters in scaffold — verify PASS per workspace in Integration Health during trial.",
    neverSay: "All 18 integrations are LIVE for every tenant / certified channel pack",
  },
  {
    id: "hype-moat",
    category: "Platform",
    topic: "Competitive moat language",
    verdict: "NEVER",
    sayThis: "Honest integration ops + unified order-to-kitchen depth — prove in your pilot.",
    neverSay: "Untouchable moat / unbreakable / destroys Toast / guaranteed market leader",
  },
] as const;

export const FORBIDDEN_CLAIMS_CHEAT_SHEET_VERDICT_COUNTS = {
  SAFE: FORBIDDEN_CLAIMS_CHEAT_SHEET_ENTRIES.filter((e) => e.verdict === "SAFE").length,
  CAVEAT: FORBIDDEN_CLAIMS_CHEAT_SHEET_ENTRIES.filter((e) => e.verdict === "CAVEAT").length,
  NEVER: FORBIDDEN_CLAIMS_CHEAT_SHEET_ENTRIES.filter((e) => e.verdict === "NEVER").length,
} as const;

export const FORBIDDEN_CLAIMS_CHEAT_SHEET_MIN_ENTRIES = 18 as const;
